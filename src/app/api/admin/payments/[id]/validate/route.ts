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
      .select("id,student_id,course_id,status,confirmed_by,confirmed_at,proof_url")
      .eq("id", id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    const { data: orderPayments, error: orderError } = payment.proof_url
      ? await admin
          .from("payments")
          .select("id,student_id,course_id,status,confirmed_by,confirmed_at")
          .eq("student_id", payment.student_id)
          .eq("proof_url", payment.proof_url)
      : { data: [payment], error: null };
    if (orderError || !orderPayments?.length) {
      throw orderError ?? new Error("Não foi possível carregar o pedido");
    }

    const now = new Date();
    const { error: updateError } = await admin.from("payments").update({
      status: parsed.data.status,
      confirmed_by: identity.profileId,
      confirmed_at: now.toISOString(),
      updated_at: now.toISOString(),
    }).in("id", orderPayments.map((item) => item.id));
    if (updateError) throw updateError;

    const createdEnrollmentIds: string[] = [];
    const enrollmentRollbacks: Array<{
      id: string;
      status: string;
      payment_status: string;
      start_date: string | null;
    }> = [];

    try {
      for (const orderPayment of orderPayments) {
        const { data: enrollment, error: enrollmentLookupError } = await admin
          .from("enrollments")
          .select("id,status,payment_status,start_date")
          .eq("student_id", orderPayment.student_id)
          .eq("course_id", orderPayment.course_id)
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

        if (enrollment) {
          enrollmentRollbacks.push({
            id: enrollment.id,
            status: enrollment.status,
            payment_status: enrollment.payment_status,
            start_date: enrollment.start_date,
          });
          const { error: enrollmentError } = await admin
            .from("enrollments")
            .update(enrollmentValues)
            .eq("id", enrollment.id);
          if (enrollmentError) throw enrollmentError;
        } else {
          const { data: createdEnrollment, error: enrollmentError } = await admin
            .from("enrollments")
            .insert({
              student_id: orderPayment.student_id,
              course_id: orderPayment.course_id,
              ...enrollmentValues,
            })
            .select("id")
            .single();
          if (enrollmentError || !createdEnrollment) {
            throw enrollmentError ?? new Error("Inscrição não criada");
          }
          createdEnrollmentIds.push(createdEnrollment.id);
        }
      }
    } catch (enrollmentError) {
      if (createdEnrollmentIds.length) {
        await admin.from("enrollments").delete().in("id", createdEnrollmentIds);
      }
      for (const originalEnrollment of enrollmentRollbacks) {
        await admin.from("enrollments").update({
          status: originalEnrollment.status,
          payment_status: originalEnrollment.payment_status,
          start_date: originalEnrollment.start_date,
          updated_at: now.toISOString(),
        }).eq("id", originalEnrollment.id);
      }
      for (const originalPayment of orderPayments) {
        await admin.from("payments").update({
          status: originalPayment.status,
          confirmed_by: originalPayment.confirmed_by,
          confirmed_at: originalPayment.confirmed_at,
          updated_at: now.toISOString(),
        }).eq("id", originalPayment.id);
      }
      throw enrollmentError;
    }

    for (const orderPayment of orderPayments) {
      const { error: notificationError } = await admin
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", identity.profileId)
        .contains("metadata", { payment_id: orderPayment.id });
      if (notificationError) {
        console.error("Error marking payment notification as read:", notificationError);
      }
    }

    return NextResponse.json({
      ok: true,
      status: parsed.data.status,
      paymentIds: orderPayments.map((item) => item.id),
    });
  } catch (error) {
    console.error("Error validating payment:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível validar o pagamento",
    }, { status: 500 });
  }
}
