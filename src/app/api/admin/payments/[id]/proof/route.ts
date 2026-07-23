import { NextResponse } from "next/server";
import { createAdminClient, requireAdmin } from "@/lib/supabase/admin";
import { createPaymentProofDownloadUrl } from "@/lib/r2";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function getStoredProofPath(value: string) {
  const publicMarker = "/storage/v1/object/public/payment-proofs/";
  const signedMarker = "/storage/v1/object/sign/payment-proofs/";
  const marker = value.includes(publicMarker) ? publicMarker : value.includes(signedMarker) ? signedMarker : null;

  if (!marker) return value.replace(/^\/+/, "");
  return decodeURIComponent(value.split(marker)[1]?.split("?")[0] ?? "");
}

export async function GET(_request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await context.params;
  const admin = createAdminClient();
  const { data: payment, error: paymentError } = await admin
    .from("payments")
    .select("proof_url")
    .eq("id", id)
    .single();

  if (paymentError || !payment?.proof_url) {
    return NextResponse.json({ error: "Comprovativo não encontrado" }, { status: 404 });
  }

  const proofPath = getStoredProofPath(payment.proof_url);
  if (!proofPath) return NextResponse.json({ error: "Comprovativo inválido" }, { status: 400 });

  if (proofPath.startsWith("payment-proofs/")) {
    try {
      const url = await createPaymentProofDownloadUrl(proofPath);
      return NextResponse.redirect(url, { headers: { "Cache-Control": "private, no-store" } });
    } catch {
      return NextResponse.json({ error: "Não foi possível abrir o comprovativo no R2" }, { status: 500 });
    }
  }

  // Compatibility for proofs uploaded to Supabase before the R2 migration.
  const { data, error } = await admin.storage.from("payment-proofs").createSignedUrl(proofPath, 300);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Não foi possível abrir o comprovativo" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
