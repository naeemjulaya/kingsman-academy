"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailMagicLinkForm } from "@/components/auth/email-magic-link-form";

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
    <div className="glass-panel p-8 rounded-xl shadow-2xl relative overflow-hidden">
      {/* Interactive scanning line */}
      <div className="scanning-line opacity-25"></div>

      <h3 className="font-playfair text-2xl text-on-surface mb-2 font-bold uppercase">Entrar na Academia</h3>
      <p className="text-xs text-on-surface-variant/70 mb-6 font-semibold">Entre ou crie a sua conta através de um link seguro enviado por email.</p>

      <EmailMagicLinkForm onError={setError} />

      <div className="flex items-center justify-between my-5">
        <hr className="w-[35%] border-border/10" />
        <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase">ou usar palavra-passe</span>
        <hr className="w-[35%] border-border/10" />
      </div>

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
