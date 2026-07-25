import { NextResponse } from "next/server";
import { z } from "zod";
import { canManageCourseMaterial, getRequestIdentity } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { extractYouTubeId } from "@/lib/youtube";

export const runtime = "nodejs";

const lessonSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(3).max(180),
  topic: z.string().trim().min(2).max(180),
  description: z.string().trim().max(3000).optional().default(""),
  youtubeLink: z.string().trim().url().refine(
    (value) => Boolean(extractYouTubeId(value)),
    "Introduza um link válido do YouTube"
  ),
  duration: z.number().int().min(1).max(600),
  orderIndex: z.number().int().min(1).max(10000),
  isActive: z.boolean().default(true),
  accessLevel: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
});

async function manageableCourseIds(identity: NonNullable<Awaited<ReturnType<typeof getRequestIdentity>>>) {
  const admin = createAdminClient();
  if (identity.role === "ADMIN") {
    const { data, error } = await admin.from("courses").select("id").eq("is_active", true);
    if (error) throw error;
    return (data || []).map((course) => course.id);
  }
  if (identity.role !== "EXPLICADOR") return [];

  const { data, error } = await admin
    .from("course_tutors")
    .select("course_id,courses:course_id!inner(is_active)")
    .eq("tutor_id", identity.profileId)
    .eq("is_active", true)
    .eq("courses.is_active", true);
  if (error) throw error;
  return (data || []).map((assignment) => assignment.course_id);
}

export async function GET() {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (!["EXPLICADOR", "ADMIN"].includes(identity.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const courseIds = await manageableCourseIds(identity);
    if (!courseIds.length) {
      return NextResponse.json({ lessons: [] }, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    const { data, error } = await createAdminClient()
      .from("lessons")
      .select("id,title,topic,description,course_id,duration,order_index,is_active,access_level,created_at,youtube_link")
      .in("course_id", courseIds)
      .order("course_id")
      .order("order_index");
    if (error) throw error;

    return NextResponse.json({ lessons: data || [] }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error loading tutor lessons:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível carregar as aulas",
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    if (!["EXPLICADOR", "ADMIN"].includes(identity.role)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "O pedido não contém JSON válido" }, { status: 400 });
    }

    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({
        error: parsed.error.issues[0]?.message || "Dados da aula inválidos",
      }, { status: 400 });
    }

    const payload = parsed.data;
    if (!(await canManageCourseMaterial(identity, payload.courseId))) {
      return NextResponse.json({
        error: "Só pode publicar aulas nas cadeiras que lhe foram atribuídas",
      }, { status: 403 });
    }

    const { data: course, error: courseError } = await createAdminClient()
      .from("courses")
      .select("id,is_active")
      .eq("id", payload.courseId)
      .single();
    if (courseError || !course?.is_active) {
      return NextResponse.json({ error: "A cadeira selecionada não está ativa" }, { status: 400 });
    }

    const { data, error } = await createAdminClient()
      .from("lessons")
      .insert({
        course_id: payload.courseId,
        title: payload.title,
        topic: payload.topic,
        description: payload.description || null,
        youtube_link: payload.youtubeLink,
        duration: payload.duration,
        order_index: payload.orderIndex,
        is_active: payload.isActive,
        access_level: payload.accessLevel,
      })
      .select("id,title,topic,description,course_id,duration,order_index,is_active,access_level,created_at,youtube_link")
      .single();
    if (error) throw error;

    return NextResponse.json({ lesson: data }, { status: 201 });
  } catch (error) {
    console.error("Error creating tutor lesson:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível criar a aula",
    }, { status: 500 });
  }
}
