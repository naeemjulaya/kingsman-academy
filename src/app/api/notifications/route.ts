import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIdentity } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const updateSchema = z.object({
  id: z.string().uuid().optional(),
  all: z.boolean().optional(),
}).refine((value) => value.id || value.all, {
  message: "Indique a notificação ou selecione todas",
});

export async function GET() {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data, error } = await createAdminClient()
      .from("notifications")
      .select("id,type,title,content,is_read,metadata,created_at")
      .eq("user_id", identity.profileId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json({ notifications: data || [] }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error loading notifications:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível carregar as notificações",
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });

    let query = createAdminClient()
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", identity.profileId);
    if (parsed.data.id) query = query.eq("id", parsed.data.id);

    const { error } = await query;
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível atualizar as notificações",
    }, { status: 500 });
  }
}
