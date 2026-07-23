import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIdentity } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const validationSchema = z.object({
  status: z.enum(["CONFIRMED", "REJECTED"]),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const identity = await getRequestIdentity();
    if (!identity || identity.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json({ error: "O pedido não contém JSON válido" }, { status: 400 });
    }

    const parsed = validationSchema.safeParse(requestBody);
    if (!parsed.success) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });

    const { id } = await context.params;
    const admin = createAdminClient();
    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .select("id,student_id,course_id,status,confirmed_by,confirmed_at")
      .eq("id", id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    const now = new Date();
    const { error: updateError } = await admin.from("payments").update({
      status: parsed.data.status,
      confirmed_by: identity.profileId,
      confirmed_at: now.toISOString(),
      updated_at: now.toISOString(),
    }).eq("id", payment.id);
    if (updateError) throw updateError;

    try {
      const { data: enrollment, error: enrollmentLookupError } = await admin
        .from("enrollments")
        .select("id,status,start_date")
        .eq("student_id", payment.student_id)
        .eq("course_id", payment.course_id)
        .maybeSingle();
      if (enrollmentLookupError) throw enrollmentLookupError;

      const enrollmentValues = parsed.data.status === "CONFIRMED"
        ? {
            status: "ACTIVE",
            payment_status: "CONFIRMED",
            start_date: enrollment?.start_date || now.toISOString().slice(0, 10),
            updated_at: now.toISOString(),
          }
        : {
            status: enrollment?.status === "ACTIVE" ? "ACTIVE" : "PENDING",
            payment_status: "REJECTED",
            updated_at: now.toISOString(),
          };

      const enrollmentResult = enrollment
        ? await admin.from("enrollments").update(enrollmentValues).eq("id", enrollment.id)
        : await admin.from("enrollments").insert({
            student_id: payment.student_id,
            course_id: payment.course_id,
            ...enrollmentValues,
          });
      if (enrollmentResult.error) throw enrollmentResult.error;
    } catch (enrollmentError) {
      await admin.from("payments").update({
        status: payment.status,
        confirmed_by: payment.confirmed_by,
        confirmed_at: payment.confirmed_at,
        updated_at: now.toISOString(),
      }).eq("id", payment.id);
      throw enrollmentError;
    }

    const { error: notificationError } = await admin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", identity.profileId)
      .contains("metadata", { payment_id: payment.id });
    if (notificationError) console.error("Error marking payment notification as read:", notificationError);

    return NextResponse.json({ ok: true, status: parsed.data.status });
  } catch (error) {
    console.error("Error validating payment:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível validar o pagamento",
    }, { status: 500 });
  }
}
