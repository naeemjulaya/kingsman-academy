import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageCourseMaterial, getRequestIdentity } from "@/lib/material-access";
import { createMaterialObjectKey, createMaterialUploadUrl } from "@/lib/r2";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "application/epub+zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
]);

const uploadSchema = z.object({
  courseId: z.string().uuid(),
  lessonId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(3).max(180),
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(150),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE),
  accessLevel: z.enum(["FREE", "PREMIUM"]),
});

export async function POST(request: Request) {
  const identity = await getRequestIdentity();
  if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = uploadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Dados do material inválidos ou ficheiro acima de 50 MB" }, { status: 400 });
  if (!allowedTypes.has(parsed.data.contentType)) {
    return NextResponse.json({ error: "Formato não permitido. Use PDF, EPUB, DOCX, PPTX, XLSX ou ZIP" }, { status: 400 });
  }
  if (!(await canManageCourseMaterial(identity, parsed.data.courseId))) {
    return NextResponse.json({ error: "Não autorizado para esta cadeira" }, { status: 403 });
  }

  try {
    const payload = parsed.data;
    const objectKey = createMaterialObjectKey(payload.courseId, payload.fileName);
    const uploadUrl = await createMaterialUploadUrl(objectKey, payload.contentType, payload.fileSize);
    const extension = payload.fileName.split(".").pop()?.toUpperCase() || "FICHEIRO";
    const admin = createAdminClient();
    const { data: material, error } = await admin.from("materials").insert({
      title: payload.title,
      course_id: payload.courseId,
      lesson_id: payload.lessonId || null,
      file_url: "",
      file_type: extension,
      file_size: payload.fileSize,
      uploaded_by: identity.profileId,
      storage_provider: "R2",
      object_key: objectKey,
      access_level: payload.accessLevel,
      mime_type: payload.contentType,
      original_name: payload.fileName,
    }).select("id,title,course_id,file_type,file_size,access_level,original_name").single();
    if (error) throw error;

    return NextResponse.json({ material, uploadUrl }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível preparar o upload" }, { status: 500 });
  }
}
