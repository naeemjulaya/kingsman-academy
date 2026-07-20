import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, requireAdmin } from "@/lib/supabase/admin";

const socialSchema = z.object({
  facebook_url: z.string().url().or(z.literal("")),
  instagram_url: z.string().url().or(z.literal("")),
  youtube_url: z.string().url().or(z.literal("")),
  linkedin_url: z.string().url().or(z.literal("")),
  whatsapp_url: z.string().url().or(z.literal("")),
});

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.from("platform_settings").select("facebook_url,instagram_url,youtube_url,linkedin_url,whatsapp_url").eq("id", true).single();
    if (error) throw error;
    return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    return NextResponse.json({ facebook_url: "", instagram_url: "", youtube_url: "", linkedin_url: "", whatsapp_url: "" });
  }
}

export async function PUT(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = socialSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Os links devem ser URLs completas e válidas" }, { status: 400 });
  const values = Object.fromEntries(Object.entries(parsed.data).map(([key, value]) => [key, value || null]));
  const { error } = await createAdminClient().from("platform_settings").update({ ...values, updated_by: user.id, updated_at: new Date().toISOString() }).eq("id", true);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
