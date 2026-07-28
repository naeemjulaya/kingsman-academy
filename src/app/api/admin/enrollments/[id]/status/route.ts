import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIdentity } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "CANCELLED", "EXPIRED"]),
});

export async function POST(request: Request, context: RouteContext) {
  try {
    const identity = await getRequestIdentity();
    if (!identity || identity.role !== "ADMIN") {
      return NextResponse.json({
        error: "A sessão administrativa expirou. Entre novamente e tente outra vez.",
      }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "O pedido não contém JSON válido" }, { status: 400 });
    }

    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Estado da matrícula inválido" }, { status: 400 });
    }

    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Identificador da matrícula inválido" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: enrollment, error: lookupError } = await admin
      .from("enrollments")
      .select("id,status,payment_status,start_date")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!enrollment) {
      return NextResponse.json({ error: "Matrícula não encontrada" }, { status: 404 });
    }

    const now = new Date();
    const nextValues = parsed.data.status === "ACTIVE"
      ? {
          status: "ACTIVE",
          payment_status: "CONFIRMED",
          start_date: enrollment.start_date || now.toISOString().slice(0, 10),
          updated_at: now.toISOString(),
        }
      : {
          status: parsed.data.status,
          updated_at: now.toISOString(),
        };

    const { error: updateError } = await admin
      .from("enrollments")
      .update(nextValues)
      .eq("id", enrollment.id);
    if (updateError) throw updateError;

    return NextResponse.json({
      ok: true,
      status: parsed.data.status,
    }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json({
      error: error instanceof Error
        ? error.message
        : "Não foi possível atualizar a matrícula",
    }, { status: 500 });
  }
}
