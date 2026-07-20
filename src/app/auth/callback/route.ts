import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const dashboards: Record<string, string> = {
  ESTUDANTE: "/estudante",
  EXPLICADOR: "/explicador",
  COORDENADOR: "/coordenador",
  ADMIN: "/admin",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next");
  const safeNext = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : null;

  if (!code) return redirectWithError(request, "O Google não devolveu um código de autenticação");

  const supabase = createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return redirectWithError(request, exchangeError.message);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirectWithError(request, "Não foi possível recuperar a conta Google");

  let { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const metadata = user.user_metadata ?? {};
    const { data: createdProfile, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        full_name: metadata.full_name || metadata.name || user.email?.split("@")[0] || "Utilizador",
        email: user.email ?? "",
        avatar_url: metadata.avatar_url || metadata.picture || null,
        role: "ESTUDANTE",
        status: "active",
      }, { onConflict: "user_id" })
      .select("role")
      .single();
    if (profileError) return redirectWithError(request, `Conta criada, mas o perfil falhou: ${profileError.message}`);
    profile = createdProfile;
  }

  const destination = safeNext ?? dashboards[profile?.role ?? "ESTUDANTE"] ?? "/estudante";
  return NextResponse.redirect(publicUrl(request, destination));
}

function redirectWithError(request: Request, message: string) {
  const target = publicUrl(request, "/login");
  target.searchParams.set("error", message);
  return NextResponse.redirect(target);
}

function publicUrl(request: Request, pathname: string) {
  const requestUrl = new URL(request.url);
  return new URL(pathname, requestUrl.origin);
}
