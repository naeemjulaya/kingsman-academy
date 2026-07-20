import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";

const fields = "platform_name,contact_email,contact_phone,logo_url,mpesa_number,emola_number,bank_details,payment_review_hours,facebook_url,instagram_url,youtube_url,linkedin_url,whatsapp_url";
const optionalUrl = z.string().trim().url().or(z.literal(""));
const settingsSchema = z.object({
  platform_name: z.string().trim().min(2).max(80),
  contact_email: z.string().trim().email(),
  contact_phone: z.string().trim().max(30),
  logo_url: optionalUrl,
  mpesa_number: z.string().trim().max(50),
  emola_number: z.string().trim().max(50),
  bank_details: z.string().trim().max(1000),
  payment_review_hours: z.number().int().min(1).max(168),
  facebook_url: optionalUrl,
  instagram_url: optionalUrl,
  youtube_url: optionalUrl,
  linkedin_url: optionalUrl,
  whatsapp_url: optionalUrl,
});

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from("platform_settings").select(fields).eq("id", true).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Existem configurações inválidas", details: parsed.error.flatten() }, { status: 400 });

  const cleanValues = Object.fromEntries(Object.entries(parsed.data).map(([key, value]) => [key, value === "" ? null : value]));
  const supabase = createClient();
  const { error } = await supabase.from("platform_settings").update({ ...cleanValues, updated_at: new Date().toISOString(), updated_by: admin.id }).eq("id", true);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
