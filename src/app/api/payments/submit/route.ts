import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { deletePaymentProofObject, paymentProofExists } from "@/lib/r2";

export const runtime = "nodejs";

const submissionSchema = z.object({
  courseId: z.string().uuid(),
  method: z.enum(["MPESA", "EMOLA", "TRANSFERENCIA"]),
  proofPath: z.string().trim().min(3).max(500),
});

export async function POST(request: Request) {
  let admin: ReturnType<typeof createAdminClient> | null = null;
  let paymentId: string | null = null;
  let proofPath: string | null = null;

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

    const { courseId, method } = parsed.data;
    proofPath = parsed.data.proofPath;
    if (!proofPath.startsWith(`payment-proofs/${user.id}/`) || proofPath.includes("..")) {
      return NextResponse.json({ error: "Comprovativo inválido" }, { status: 403 });
    }

    admin = createAdminClient();
    const [{ data: profile, error: profileError }, { data: course, error: courseError }] = await Promise.all([
      admin.from("profiles").select("id,status,full_name").eq("user_id", user.id).single(),
      admin.from("courses").select("id,name,price_monthly,is_active").eq("id", courseId).single(),
    ]);

    if (profileError || !profile || profile.status !== "active") {
      return NextResponse.json({ error: "Perfil de estudante não encontrado ou inativo" }, { status: 400 });
    }
    if (courseError || !course || !course.is_active) {
      return NextResponse.json({ error: "Cadeira não encontrada ou inativa" }, { status: 404 });
    }

    if (!(await paymentProofExists(proofPath))) {
      return NextResponse.json({ error: "O comprovativo enviado não foi encontrado" }, { status: 400 });
    }

    const { data: payment, error: paymentError } = await admin.from("payments").insert({
      student_id: profile.id,
      course_id: course.id,
      amount: course.price_monthly,
      method,
      status: "PENDING",
      proof_url: proofPath,
    }).select("id").single();
    if (paymentError || !payment) throw paymentError ?? new Error("Pagamento não criado");
    paymentId = payment.id;

    const { data: existingEnrollment, error: enrollmentLookupError } = await admin
      .from("enrollments")
      .select("id")
      .eq("student_id", profile.id)
      .eq("course_id", course.id)
      .maybeSingle();
    if (enrollmentLookupError) throw enrollmentLookupError;

    const enrollmentResult = existingEnrollment
      ? await admin.from("enrollments").update({
          status: "PENDING",
          payment_status: "PENDING",
          updated_at: new Date().toISOString(),
        }).eq("id", existingEnrollment.id)
      : await admin.from("enrollments").insert({
          student_id: profile.id,
          course_id: course.id,
          status: "PENDING",
          payment_status: "PENDING",
        });
    if (enrollmentResult.error) throw enrollmentResult.error;

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
          content: `${profile.full_name || "Um estudante"} submeteu ${course.price_monthly} MT para ${course.name}.`,
          metadata: {
            payment_id: paymentId,
            course_id: course.id,
            href: "/admin/pagamentos",
          },
        }))
      );
      if (notificationError) {
        console.error("Error creating payment notification:", notificationError);
      }
    }

    return NextResponse.json({ paymentId }, { status: 201 });
  } catch (error) {
    if (paymentId && admin) {
      try {
        await admin.from("payments").delete().eq("id", paymentId);
      } catch {
        // Preserve the original submission error.
      }
    }
    if (proofPath) await deletePaymentProofObject(proofPath).catch(() => undefined);
    console.error("Error submitting payment:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível submeter o pagamento",
    }, { status: 500 });
  }
}
