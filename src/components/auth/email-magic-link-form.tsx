"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface EmailMagicLinkFormProps {
  onError?: (message: string) => void;
}

export function EmailMagicLinkForm({ onError }: EmailMagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const sendLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setSent(false);
    onError?.("");
    try {
      const currentUrl = new URL(window.location.href);
      const requestedPath = currentUrl.searchParams.get("redirect");
      const safePath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "";
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (safePath) callbackUrl.searchParams.set("next", safePath);

      const { error } = await createClient().auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: callbackUrl.toString(),
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Não foi possível enviar o link de acesso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={sendLink} className="space-y-3">
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
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>
      <Button type="submit" variant="primary" isLoading={loading} className="w-full py-3 font-bold uppercase tracking-wider">
        Receber link de acesso
      </Button>
      {sent && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
          Enviámos um link para {email}. Abra-o neste navegador para entrar ou criar a conta.
        </p>
      )}
    </form>
  );
}
