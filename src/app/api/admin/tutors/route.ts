import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient, requireAdmin } from "@/lib/supabase/admin";

const tutorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().email(),
  speciality: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(2000).default(""),
  avatar_url: z.string().trim().url().or(z.literal("")),
  is_active: z.boolean(),
  password: z.string().min(8).optional(),
});

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = tutorSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados do explicador inválidos" }, { status: 400 });

  const admin = createAdminClient();
  const payload = parsed.data;
  const { data: existing } = await admin.from("profiles").select("id").ilike("email", payload.email).maybeSingle();
  if (existing) return NextResponse.json({ error: "Já existe um utilizador com este email" }, { status: 409 });

  const temporaryPassword = payload.password ?? crypto.randomUUID() + "Aa1!";
  const { data, error } = await admin.auth.admin.createUser({
    email: payload.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { full_name: payload.name },
  });
  if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Não foi possível criar a conta" }, { status: 400 });

  const { error: profileError } = await admin.from("profiles").upsert({
    user_id: data.user.id,
    full_name: payload.name,
    email: payload.email,
    role: "EXPLICADOR",
    university: payload.speciality,
    bio: payload.bio || null,
    avatar_url: payload.avatar_url || null,
    status: payload.is_active ? "active" : "inactive",
  }, { onConflict: "user_id" });

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }
  return NextResponse.json({ id: data.user.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  const parsed = tutorSchema.safeParse(await request.json());
  if (!parsed.success || !parsed.data.id) return NextResponse.json({ error: "Dados do explicador inválidos" }, { status: 400 });

  const admin = createAdminClient();
  const payload = parsed.data;
  const { data: profile } = await admin.from("profiles").select("user_id").eq("id", payload.id).in("role", ["EXPLICADOR", "ADMIN"]).single();
  if (!profile) return NextResponse.json({ error: "Explicador não encontrado" }, { status: 404 });

  const { error: authError } = await admin.auth.admin.updateUserById(profile.user_id, {
    email: payload.email,
    ...(payload.password ? { password: payload.password } : {}),
    user_metadata: { full_name: payload.name },
  });
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const { error } = await admin.from("profiles").update({
    full_name: payload.name,
    email: payload.email,
    university: payload.speciality,
    bio: payload.bio || null,
    avatar_url: payload.avatar_url || null,
    status: payload.is_active ? "active" : "inactive",
  }).eq("id", payload.id).in("role", ["EXPLICADOR", "ADMIN"]);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
