"use client";

import { Suspense, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, type UserRole } from "@/hooks/use-auth";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

// Componente interno que contém a lógica de autenticação- Qwen
function RouteGuardContent({ children, allowedRoles, fallback }: RouteGuardProps) {
  const { user, loading, error, hasRole, reload } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (error) return;
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }

    if (!loading && user && !hasRole(allowedRoles)) {
      // Redireciona para dashboard do seu role
      const dashboards: Record<UserRole, string> = {
        ESTUDANTE: "/estudante",
        EXPLICADOR: "/explicador",
        COORDENADOR: "/coordenador",
        ADMIN: "/admin",
      };
      router.push(dashboards[user.role]);
    }
  }, [user, loading, error, hasRole, allowedRoles, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF48FF] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <h2 className="font-playfair text-xl font-bold text-red-300">Não foi possível carregar a conta</h2>
        <p className="mt-2 text-sm text-on-surface-variant">{error}</p>
        <button onClick={() => void reload()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!user || !hasRole(allowedRoles)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Componente exportado com Suspense boundary
export function RouteGuard({ children, allowedRoles, fallback }: RouteGuardProps) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF48FF] border-t-transparent" />
      </div>
    }>
      <RouteGuardContent allowedRoles={allowedRoles} fallback={fallback}>
        {children}
      </RouteGuardContent>
    </Suspense>
  );
}
