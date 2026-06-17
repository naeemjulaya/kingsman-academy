import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rotas públicas (sem auth)
const PUBLIC_ROUTES = ["/", "/login", "/register", "/reset-password"];

// Mapeamento de roles para rotas permitidas
const ROLE_ROUTES: Record<string, string[]> = {
  ESTUDANTE: ["/estudante", "/estudante/perfil", "/estudante/cadeiras", "/estudante/aulas", "/estudante/pagamentos", "/estudante/mensagens"],
  EXPLICADOR: ["/explicador", "/explicador/perfil", "/explicador/cadeiras", "/explicador/aulas", "/explicador/estudantes", "/explicador/materiais", "/explicador/ganhos", "/explicador/mensagens"],
  COORDENADOR: ["/coordenador", "/coordenador/perfil", "/coordenador/cadeiras", "/coordenador/explicadores", "/coordenador/estudantes", "/coordenador/pagamentos", "/coordenador/inscricoes", "/coordenador/mensagens"],
  ADMIN: ["/admin", "/estudante", "/explicador", "/coordenador"],
};

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // 1. Rotas públicas — sempre permitidas
  if (PUBLIC_ROUTES.includes(pathname)) {
    // Se já autenticado e tenta aceder login/register, redireciona para dashboard
    if (user && (pathname === "/login" || pathname === "/register")) {
      const role = await getUserRole(user.id);
      return NextResponse.redirect(new URL(getDashboardByRole(role), request.url));
    }
    return supabaseResponse;
  }

  // 2. Se não autenticado → redireciona para login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Busca role do user na BD
  const role = await getUserRole(user.id);

  // 4. Verifica se a rota atual é permitida para este role
  const allowedRoutes = ROLE_ROUTES[role] || [];
  const isAllowed = allowedRoutes.some(route => pathname.startsWith(route));

  if (!isAllowed) {
    // Redireciona para o dashboard do seu role
    return NextResponse.redirect(new URL(getDashboardByRole(role), request.url));
  }

  // 5. Adiciona headers com role para uso no frontend (opcional)
  supabaseResponse.headers.set("x-user-role", role);

  return supabaseResponse;
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

    if (error || !data) return "ESTUDANTE"; // fallback
    return data.role;
  } catch (e) {
    return "ESTUDANTE";
  }
}

// Helper: dashboard baseado no role
function getDashboardByRole(role: string): string {
  const dashboards: Record<string, string> = {
    ESTUDANTE: "/estudante",
    EXPLICADOR: "/explicador",
    COORDENADOR: "/coordenador",
    ADMIN: "/admin",
  };
  return dashboards[role] || "/estudante";
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
