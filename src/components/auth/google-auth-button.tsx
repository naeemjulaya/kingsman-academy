"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface GoogleAuthButtonProps {
  className?: string;
  label?: string;
  onError?: (message: string) => void;
}

export function GoogleAuthButton({
  className,
  label = "Continuar com Google",
  onError,
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    onError?.("");
    try {
      const currentUrl = new URL(window.location.href);
      const requestedPath = currentUrl.searchParams.get("redirect");
      const safePath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "";
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (safePath) callbackUrl.searchParams.set("next", safePath);

      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      setLoading(false);
      onError?.(error instanceof Error ? error.message : "Não foi possível iniciar a autenticação Google");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      isLoading={loading}
      onClick={handleGoogleAuth}
      className={`w-full py-3 font-semibold text-sm flex items-center justify-center gap-2 ${className ?? ""}`}
    >
      {!loading && (
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.61A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.92A6.02 6.02 0 0 1 6.07 12c0-.67.11-1.32.32-1.92V7.47H3.04A10 10 0 0 0 2 12c0 1.63.39 3.17 1.04 4.53l3.35-2.61Z" />
          <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.82 1.49l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.47l3.35 2.61C7.18 7.71 9.39 5.95 12 5.95Z" />
        </svg>
      )}
      {label}
    </Button>
  );
}
