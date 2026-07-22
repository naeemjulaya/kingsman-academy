import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const fileTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione um comprovativo" }, { status: 400 });
  }

  const extension = fileTypes[file.type];
  if (!extension) {
    return NextResponse.json({ error: "O comprovativo deve ser PDF, JPG ou PNG" }, { status: 415 });
  }
  if (file.size <= 0 || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "O comprovativo deve ter no máximo 5 MB" }, { status: 413 });
  }

  const path = `${user.id}/${randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from("payment-proofs").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: "Não foi possível guardar o comprovativo" }, { status: 500 });
  }
  return NextResponse.json({ path });
}
