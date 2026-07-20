"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";

export default function TutorRevenuePage() {
  return (
    <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Remuneração</h1>
          <p className="mt-1 text-sm text-on-surface-variant/70">Informação financeira pessoal do explicador.</p>
        </div>
        <Card className="p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">account_balance_wallet</span>
          <h2 className="mt-3 font-playfair text-xl font-bold">Ainda não configurada</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant">
            A plataforma ainda não regista comissões, salários ou pagamentos aos explicadores. Nenhum valor será apresentado até existir uma fonte real de remuneração.
          </p>
        </Card>
      </div>
    </RouteGuard>
  );
}
