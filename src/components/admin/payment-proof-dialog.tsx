"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type PaymentProofDetails = {
  id: string;
  studentName: string;
  courseName: string;
  proofUrl: string;
  submittedAt?: string;
};

export function PaymentProofDialog({
  payment,
  onClose,
}: {
  payment: PaymentProofDetails | null;
  onClose: () => void;
}) {
  const [loadError, setLoadError] = useState(false);
  const endpoint = payment ? `/api/admin/payments/${payment.id}/proof` : "";
  const isPdf = payment?.proofUrl.toLowerCase().endsWith(".pdf");

  const close = () => {
    setLoadError(false);
    onClose();
  };

  return (
    <Dialog open={Boolean(payment)} onOpenChange={(open) => !open && close()}>
      <DialogContent onClose={close} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Comprovativo de pagamento</DialogTitle>
          <DialogDescription>
            {payment ? `${payment.studentName} — ${payment.courseName}` : "Documento submetido pelo estudante"}
          </DialogDescription>
        </DialogHeader>

        {payment && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-xs">
              <span className="min-w-0 truncate text-on-surface-variant">
                Documento submetido {payment.submittedAt ? `em ${new Date(payment.submittedAt).toLocaleString("pt-PT")}` : "pelo estudante"}
              </span>
              <a href={endpoint} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 font-bold text-primary hover:underline">
                Abrir em nova aba
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>
            </div>

            <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-primary/15 bg-black/40">
              {loadError ? (
                <div className="max-w-sm p-8 text-center">
                  <span className="material-symbols-outlined text-4xl text-red-300">broken_image</span>
                  <p className="mt-3 text-sm font-bold text-on-surface">Não foi possível mostrar o comprovativo.</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Tente abrir o documento numa nova aba ou confirme as variáveis de produção.</p>
                </div>
              ) : isPdf ? (
                <iframe src={endpoint} title={`Comprovativo de ${payment.studentName}`} className="h-[70vh] w-full bg-white" />
              ) : (
                // The protected, same-origin API URL is dynamic and cannot use Next Image optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={endpoint}
                  alt={`Comprovativo de pagamento de ${payment.studentName}`}
                  className="max-h-[70vh] w-full object-contain"
                  onError={() => setLoadError(true)}
                />
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
