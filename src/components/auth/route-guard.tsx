"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, type UserRole } from "@/hooks/use-auth";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RouteGuard({ children, allowedRoles, fallback }: RouteGuardProps) {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
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
  }, [user, loading, hasRole, allowedRoles, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF48FF] border-t-transparent" />
      </div>
    );
  }

  if (!user || !hasRole(allowedRoles)) {
    return fallback || null;
  }

  return <>{children}</>;
}
