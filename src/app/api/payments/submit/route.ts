import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { deletePaymentProofObject, paymentProofExists } from "@/lib/r2";
import { calculateCourseCart } from "@/lib/course-cart";

export const runtime = "nodejs";

const submissionSchema = z.object({
  courseIds: z.array(z.string().uuid()).min(1).max(20)
    .refine((ids) => new Set(ids).size === ids.length, "As cadeiras não podem estar repetidas"),
  method: z.enum(["EMOLA", "TRANSFERENCIA"]),
  proofPath: z.string().trim().min(3).max(500),
});

export async function POST(request: Request) {
  let admin: ReturnType<typeof createAdminClient> | null = null;
  let paymentIds: string[] = [];
  let proofPath: string | null = null;
  const createdEnrollmentIds: string[] = [];
  const enrollmentRollbacks: Array<{ id: string; status: string; payment_status: string }> = [];

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json({ error: "O pedido de pagamento não contém JSON válido" }, { status: 400 });
    }

    const parsed = submissionSchema.safeParse(requestBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados do pagamento inválidos" }, { status: 400 });
    }

    const { courseIds, method } = parsed.data;
    proofPath = parsed.data.proofPath;
    if (!proofPath.startsWith(`payment-proofs/${user.id}/`) || proofPath.includes("..")) {
      return NextResponse.json({ error: "Comprovativo inválido" }, { status: 403 });
    }

    admin = createAdminClient();
    const [{ data: profile, error: profileError }, { data: courseRows, error: courseError }] = await Promise.all([
      admin.from("profiles").select("id,status,full_name").eq("user_id", user.id).single(),
      admin.from("courses").select("id,name,price_monthly,is_active").in("id", courseIds),
    ]);

    if (profileError || !profile || profile.status !== "active") {
      return NextResponse.json({ error: "Perfil de estudante não encontrado ou inativo" }, { status: 400 });
    }
    if (courseError || !courseRows || courseRows.length !== courseIds.length || courseRows.some((course) => !course.is_active)) {
      return NextResponse.json({ error: "Uma ou mais cadeiras não foram encontradas ou estão inativas" }, { status: 404 });
    }

    if (!(await paymentProofExists(proofPath))) {
      return NextResponse.json({ error: "O comprovativo enviado não foi encontrado" }, { status: 400 });
    }

    const { count: reusedProofCount, error: reusedProofError } = await admin
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("proof_url", proofPath);
    if (reusedProofError) throw reusedProofError;
    if (reusedProofCount) {
      return NextResponse.json({
        error: "Este comprovativo já está associado a outro pedido",
      }, { status: 409 });
    }

    const orderedCourses = courseIds.map((id) => courseRows.find((course) => course.id === id)!);
    const { data: existingEnrollments, error: enrollmentLookupError } = await admin
      .from("enrollments")
      .select("id,course_id,status,payment_status,end_date")
      .eq("student_id", profile.id)
      .in("course_id", courseIds);
    if (enrollmentLookupError) throw enrollmentLookupError;

    const now = new Date();
    const blockedEnrollment = (existingEnrollments || []).find((enrollment) =>
      (enrollment.status === "ACTIVE" &&
        enrollment.payment_status === "CONFIRMED" &&
        (!enrollment.end_date || new Date(enrollment.end_date) > now)) ||
      (enrollment.status === "PENDING" && enrollment.payment_status === "PENDING")
    );
    if (blockedEnrollment) {
      return NextResponse.json({
        error: "Uma das cadeiras já possui acesso ativo ou um pagamento pendente",
      }, { status: 409 });
    }

    const pricing = calculateCourseCart(orderedCourses);
    const { data: payments, error: paymentError } = await admin.from("payments").insert(
      pricing.items.map((course) => ({
        student_id: profile.id,
        course_id: course.id,
        amount: course.chargedPrice,
        method,
        status: "PENDING",
        proof_url: proofPath,
      }))
    ).select("id");
    if (paymentError || !payments?.length) throw paymentError ?? new Error("Pagamento não criado");
    paymentIds = payments.map((payment) => payment.id);

    for (const course of orderedCourses) {
      const existingEnrollment = (existingEnrollments || []).find(
        (enrollment) => enrollment.course_id === course.id
      );
      if (existingEnrollment) {
        enrollmentRollbacks.push({
          id: existingEnrollment.id,
          status: existingEnrollment.status,
          payment_status: existingEnrollment.payment_status,
        });
        const { error: enrollmentError } = await admin.from("enrollments").update({
            status: "PENDING",
            payment_status: "PENDING",
            updated_at: now.toISOString(),
          }).eq("id", existingEnrollment.id);
        if (enrollmentError) throw enrollmentError;
      } else {
        const { data: createdEnrollment, error: enrollmentError } = await admin.from("enrollments").insert({
            student_id: profile.id,
            course_id: course.id,
            status: "PENDING",
            payment_status: "PENDING",
          }).select("id").single();
        if (enrollmentError || !createdEnrollment) {
          throw enrollmentError ?? new Error("Inscrição não criada");
        }
        createdEnrollmentIds.push(createdEnrollment.id);
      }
    }

    const { data: administrators, error: administratorsError } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "ADMIN")
      .eq("status", "active");
    if (administratorsError) {
      console.error("Error finding administrators for payment notification:", administratorsError);
    } else if (administrators?.length) {
      const { error: notificationError } = await admin.from("notifications").insert(
        administrators.map((administrator) => ({
          user_id: administrator.id,
          type: "PAYMENT_SUBMITTED",
          title: "Novo pagamento para validar",
          content: `${profile.full_name || "Um estudante"} submeteu ${pricing.total} MT para ${orderedCourses.length} ${orderedCourses.length === 1 ? "cadeira" : "cadeiras"}.`,
          metadata: {
            payment_id: paymentIds[0],
            payment_ids: paymentIds,
            course_ids: courseIds,
            href: "/admin/pagamentos",
          },
        }))
      );
      if (notificationError) {
        console.error("Error creating payment notification:", notificationError);
      }
    }

    return NextResponse.json({
      paymentId: paymentIds[0],
      paymentIds,
      total: pricing.total,
    }, { status: 201 });
  } catch (error) {
    if (paymentIds.length && admin) {
      try {
        await admin.from("payments").delete().in("id", paymentIds);
      } catch {
        // Preserve the original submission error.
      }
    }
    if (admin && createdEnrollmentIds.length) {
      try {
        await admin.from("enrollments").delete().in("id", createdEnrollmentIds);
      } catch {
        // Preserve the original submission error.
      }
    }
    if (admin) {
      for (const enrollment of enrollmentRollbacks) {
        try {
          await admin.from("enrollments").update({
            status: enrollment.status,
            payment_status: enrollment.payment_status,
            updated_at: new Date().toISOString(),
          }).eq("id", enrollment.id);
        } catch {
          // Preserve the original submission error.
        }
      }
    }
    if (proofPath) await deletePaymentProofObject(proofPath).catch(() => undefined);
    console.error("Error submitting payment:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível submeter o pagamento",
    }, { status: 500 });
  }
}
