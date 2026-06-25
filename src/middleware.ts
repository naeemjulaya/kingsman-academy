import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rotas públicas (sem auth)
const PUBLIC_ROUTES = ["/", "/login", "/register", "/reset-password"];

// Mapeamento de roles para dashboards
const ROLE_DASHBOARDS: Record<string, string> = {
  ESTUDANTE: "/estudante",
  EXPLICADOR: "/explicador",
  COORDENADOR: "/coordenador",
  ADMIN: "/admin",
};

// Rotas permitidas por role (ADMIN tem acesso a tudo)
const ROLE_ROUTES: Record<string, string[]> = {
  ESTUDANTE: ["/estudante"],
  EXPLICADOR: ["/explicador"],
  COORDENADOR: ["/coordenador"],
  ADMIN: ["/admin", "/estudante", "/explicador", "/coordenador"], // ADMIN pode aceder a tudo
};

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Path: ${pathname}, User: ${user?.email || 'none'}`);

  // 1. Rotas públicas — sempre permitidas
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Se já autenticado e tenta aceder login/register, redireciona para dashboard
    if (user && (pathname === "/login" || pathname === "/register")) {
      const role = await getUserRole(user.id);
      console.log(`[Middleware] Authenticated user on ${pathname}, redirecting to ${ROLE_DASHBOARDS[role]}`);
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role], request.url));
    }
    return supabaseResponse;
  }

  // 2. Se não autenticado → redireciona para login
  if (!user) {
    console.log(`[Middleware] Not authenticated, redirecting to /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Busca role do user na BD
  const role = await getUserRole(user.id);
  console.log(`[Middleware] User role: ${role}`);

  // 4. Verifica se a rota atual é permitida para este role
  const allowedRoutes = ROLE_ROUTES[role] || [];
  const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));

  console.log(`[Middleware] Allowed routes: ${allowedRoutes.join(', ')}, Is allowed: ${isAllowed}`);

  if (!isAllowed) {
    // Redireciona para o dashboard do seu role
    console.log(`[Middleware] Route not allowed, redirecting to ${ROLE_DASHBOARDS[role]}`);
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[role], request.url));
  }

  // 5. Adiciona headers com role para uso no frontend
  const response = NextResponse.next();
  response.headers.set("x-user-role", role);

  return response;
}

// Helper: busca role do user no Supabase
async function getUserRole(userId: string): Promise<string> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      console.error(`[Middleware] Error fetching role:`, error);
      return "ESTUDANTE"; // fallback
    }

    console.log(`[Middleware] Fetched role from DB: ${data.role}`);
    return data.role;
  } catch (e) {
    console.error(`[Middleware] Exception fetching role:`, e);
    return "ESTUDANTE";
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};