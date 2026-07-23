import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createMaterialUploadUrl, createPaymentProofObjectKey } from "@/lib/r2";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "application/pdf"]);
const proofSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(100),
  fileSize: z.number().int().positive().max(5 * 1024 * 1024),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json({ error: "O pedido do comprovativo não contém JSON válido" }, { status: 400 });
    }

    const parsed = proofSchema.safeParse(requestBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "Comprovativo inválido ou superior a 5 MB" }, { status: 400 });
    }
    if (!allowedTypes.has(parsed.data.contentType)) {
      return NextResponse.json({ error: "O comprovativo deve ser PDF, JPG ou PNG" }, { status: 415 });
    }

    const path = createPaymentProofObjectKey(user.id, parsed.data.fileName);
    const uploadUrl = await createMaterialUploadUrl(path, parsed.data.contentType, parsed.data.fileSize);
    return NextResponse.json({ path, uploadUrl });
  } catch (error) {
    console.error("Error preparing payment proof upload:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível preparar o comprovativo",
    }, { status: 500 });
  }
}
