import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageCourseMaterial, getRequestIdentity, hasPaidCourseAccess } from "@/lib/material-access";
import { createMaterialDownloadUrl, deleteMaterialObject } from "@/lib/r2";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const identity = await getRequestIdentity();
  if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await context.params;
  const { data: material } = await createAdminClient().from("materials")
    .select("id,course_id,file_url,storage_provider,object_key,access_level,original_name,title")
    .eq("id", id)
    .single();
  if (!material) return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });

  if (material.access_level === "PREMIUM" && !(await hasPaidCourseAccess(identity, material.course_id))) {
    return NextResponse.json({ error: "Este material requer pagamento confirmado" }, { status: 403 });
  }

  if (material.storage_provider !== "R2") {
    if (!material.file_url) return NextResponse.json({ error: "Ficheiro indisponível" }, { status: 404 });
    return NextResponse.redirect(material.file_url);
  }
  if (!material.object_key) return NextResponse.json({ error: "Ficheiro indisponível" }, { status: 404 });

  try {
    const url = await createMaterialDownloadUrl(material.object_key, material.original_name || material.title);
    return NextResponse.redirect(url, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível abrir o material" }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const identity = await getRequestIdentity();
  if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { id } = await context.params;
  const admin = createAdminClient();
  const { data: material } = await admin.from("materials")
    .select("id,course_id,storage_provider,object_key")
    .eq("id", id)
    .single();
  if (!material) return NextResponse.json({ error: "Material não encontrado" }, { status: 404 });
  if (!(await canManageCourseMaterial(identity, material.course_id))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    if (material.storage_provider === "R2" && material.object_key) await deleteMaterialObject(material.object_key);
    const { error } = await admin.from("materials").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível eliminar o material" }, { status: 500 });
  }
}
