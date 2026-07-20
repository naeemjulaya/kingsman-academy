import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/reset-password", "/auth/callback"];
const ROLE_DASHBOARDS: Record<string, string> = {
  ESTUDANTE: "/estudante",
  EXPLICADOR: "/explicador",
  COORDENADOR: "/coordenador",
  ADMIN: "/admin",
};
const ROLE_ROUTES: Record<string, string[]> = {
  ESTUDANTE: ["/estudante"],
  EXPLICADOR: ["/explicador"],
  COORDENADOR: ["/coordenador"],
  ADMIN: ["/admin", "/estudante", "/explicador", "/coordenador"],
};

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (user && (pathname === "/login" || pathname === "/register")) {
      const role = await getUserRole(user.id);
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role] ?? "/estudante", request.url));
    }
    return supabaseResponse;
  }

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const role = await getUserRole(user.id);
  const isAllowed = (ROLE_ROUTES[role] ?? []).some((route) => pathname.startsWith(route));
  if (!isAllowed) {
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role] ?? "/estudante", request.url));
  }

  supabaseResponse.headers.set("x-user-role", role);
  return supabaseResponse;
}

async function getUserRole(userId: string): Promise<string> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("role").eq("user_id", userId).single();
    return data?.role ?? "ESTUDANTE";
  } catch {
    return "ESTUDANTE";
  }
}

export const config = {
  // API routes authorize inside each handler and must never be redirected to HTML.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
