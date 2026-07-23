"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const oauthError = new URLSearchParams(window.location.search).get("error");
    if (oauthError) setError(oauthError);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email ou palavra-passe incorretos"
          : authError.message
      );
      setLoading(false);
      return;
    }

    // Busca role para redirecionar
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .single();

    const role = profile?.role || "ESTUDANTE";
    const dashboards: Record<string, string> = {
      ESTUDANTE: "/estudante",
      EXPLICADOR: "/explicador",
      COORDENADOR: "/coordenador",
      ADMIN: "/admin",
    };

    router.push(dashboards[role]);
    router.refresh();
  };

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl border border-primary/10 p-7 shadow-2xl shadow-black/30 sm:p-8">
      {/* Interactive scanning line */}
      <div className="scanning-line opacity-25"></div>
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mb-7 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-lg shadow-primary/5">
          <span className="material-symbols-outlined" aria-hidden="true">lock</span>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Acesso seguro</p>
          <h1 className="font-playfair text-2xl font-bold uppercase leading-tight text-on-surface">Entrar na Academia</h1>
          <p className="mt-2 text-xs font-medium leading-relaxed text-on-surface-variant/70">
            Introduza as credenciais da sua conta para continuar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-5">
        <div>
          <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">
            Email
          </label>
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">
              Palavra-Passe
            </label>
            <Link href="/reset-password" className="text-xs text-primary hover:underline font-bold">
              Esqueceu palavra-passe?
            </Link>
          </div>
          <Input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3 text-xs font-semibold text-red-300" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" isLoading={loading} className="mt-2 w-full py-3 font-bold uppercase tracking-wider shadow-lg shadow-primary/10">
          Entrar
        </Button>
      </form>

      <div className="relative mt-7 border-t border-border/10 pt-5 text-center">
        <p className="text-xs text-on-surface-variant">
          Não tem uma conta?{" "}
          <Link href="/register" className="text-primary hover:underline font-bold">
            Registar-se
          </Link>
        </p>
      </div>
    </div>
  );
}
