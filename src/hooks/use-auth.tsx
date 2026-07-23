"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "ESTUDANTE" | "EXPLICADOR" | "COORDENADOR" | "ADMIN";

interface User {
  id: string;
  profileId: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
  reload: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const validRoles: UserRole[] = ["ESTUDANTE", "EXPLICADOR", "COORDENADOR", "ADMIN"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const loadProfile = useCallback(async (authUser?: SupabaseUser | null) => {
    setLoading(true);
    setError(null);
    try {
      let currentUser = authUser;
      if (currentUser === undefined) {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        currentUser = data.user;
      }

      if (!currentUser) {
        setUser(null);
        return;
      }

      const { data: existingProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role, full_name, avatar_url")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (profileError) throw profileError;
      let profile = existingProfile;
      if (!profile) {
        const fallbackName = currentUser.user_metadata?.full_name
          || currentUser.email?.split("@")[0]
          || "Utilizador";
        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .upsert({
            user_id: currentUser.id,
            full_name: fallbackName,
            email: currentUser.email ?? "",
            role: "ESTUDANTE",
            status: "active",
          }, { onConflict: "user_id" })
          .select("id, role, full_name, avatar_url")
          .single();
        if (createError) {
          throw new Error(`A conta existe, mas não foi possível criar o perfil: ${createError.message}`);
        }
        profile = createdProfile;
      }

      const role = validRoles.includes(profile.role as UserRole)
        ? profile.role as UserRole
        : "ESTUDANTE";
      setUser({
        id: currentUser.id,
        profileId: profile.id,
        email: currentUser.email ?? "",
        role,
        fullName: profile.full_name || currentUser.user_metadata?.full_name || "Utilizador",
        avatarUrl: profile.avatar_url || undefined,
      });
    } catch (cause) {
      setUser(null);
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar o perfil");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const restoreSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        await loadProfile();
        return;
      }
      await loadProfile(data.session?.user ?? null);
    };
    void restoreSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
        router.replace("/login");
        return;
      }
      // Run outside the auth callback to avoid locking subsequent Supabase calls.
      if (session?.user) window.setTimeout(() => void loadProfile(session.user), 0);
    });
    return () => subscription.unsubscribe();
  }, [loadProfile, router, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/login");
  }, [router, supabase]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    error,
    signOut,
    hasRole: (roles) => Boolean(user && roles.includes(user.role)),
    reload: () => loadProfile(),
  }), [error, loadProfile, loading, signOut, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}
