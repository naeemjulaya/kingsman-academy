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

async function proxyPrivateProof(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok || !response.body) {
    throw new Error(`O armazenamento recusou o comprovativo (HTTP ${response.status})`);
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": "inline",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
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
      const url = await createPaymentProofDownloadUrl(proofPath);
      return proxyPrivateProof(url);
    }

    // Compatibility for proofs uploaded to Supabase before the R2 migration.
    const { data, error } = await admin.storage.from("payment-proofs").createSignedUrl(proofPath, 300);
    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: "Não foi possível abrir o comprovativo" }, { status: 500 });
    }

    return proxyPrivateProof(data.signedUrl);
  } catch (error) {
    console.error("Error opening payment proof:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível abrir o comprovativo",
    }, { status: 500 });
  }
}
