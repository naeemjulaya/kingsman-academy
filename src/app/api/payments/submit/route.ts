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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = submissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados do pagamento inválidos" }, { status: 400 });
  }

  const { courseId, method, proofPath } = parsed.data;
  if (!proofPath.startsWith(`payment-proofs/${user.id}/`) || proofPath.includes("..")) {
    return NextResponse.json({ error: "Comprovativo inválido" }, { status: 403 });
  }

  const admin = createAdminClient();
  let paymentId: string | null = null;

  try {
    const [{ data: profile, error: profileError }, { data: course, error: courseError }] = await Promise.all([
      admin.from("profiles").select("id,status").eq("user_id", user.id).single(),
      admin.from("courses").select("id,price_monthly,is_active").eq("id", courseId).single(),
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

    return NextResponse.json({ paymentId }, { status: 201 });
  } catch (error) {
    if (paymentId) await admin.from("payments").delete().eq("id", paymentId);
    await deletePaymentProofObject(proofPath).catch(() => undefined);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível submeter o pagamento",
    }, { status: 500 });
  }
}
