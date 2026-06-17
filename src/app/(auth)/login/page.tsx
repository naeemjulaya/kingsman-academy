"use client";

import React, { useState } from "react";
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
    <div className="glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
      {/* Interactive scanning line */}
      <div className="scanning-line opacity-25"></div>

      <h3 className="font-playfair text-2xl text-on-surface mb-2 font-bold uppercase">Entrar na Academia</h3>
      <p className="text-xs text-on-surface-variant/70 mb-6 font-semibold">Introduza as suas credenciais para continuar.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">
            Email Institucional
          </label>
          <Input
            type="email"
            required
            placeholder="nome.sobrenome@uem.ac.mz"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        )}

        <Button type="submit" variant="primary" isLoading={loading} className="w-full py-3 mt-2 font-bold uppercase tracking-wider">
          Entrar
        </Button>

        <div className="flex items-center justify-between my-4">
          <hr className="w-[40%] border-border/10" />
          <span className="text-xs text-on-surface-variant/60 font-semibold uppercase">ou</span>
          <hr className="w-[40%] border-border/10" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full py-3 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.472 0-6.29-2.818-6.29-6.29 0-3.472 2.818-6.29 6.29-6.29 1.506 0 2.88.535 3.96 1.427l3.13-3.13C18.915 2.139 15.82 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-11.012 0-.746-.067-1.433-.194-2.183H12.24z" />
          </svg>
          Continuar com Google
        </Button>
      </form>

      <div className="mt-6 text-center">
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
