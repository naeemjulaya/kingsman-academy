import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIdentity, hasPaidCourseAccess } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const progressSchema = z.object({
  lessonId: z.string().uuid(),
  progress: z.number().min(0).max(100),
});

export async function GET() {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { data, error } = await createAdminClient()
      .from("lesson_completions")
      .select("lesson_id,progress_percent,lessons:lesson_id(course_id)")
      .eq("student_id", identity.profileId);
    if (error) throw error;

    const progress = (data || []).map((item) => {
      const lesson = Array.isArray(item.lessons) ? item.lessons[0] : item.lessons;
      return {
        lessonId: item.lesson_id,
        courseId: lesson?.course_id || null,
        progressPercent: item.progress_percent || 0,
      };
    });
    return NextResponse.json({ progress }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error loading student progress:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível carregar o progresso",
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const parsed = progressSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Progresso inválido" }, { status: 400 });

    const admin = createAdminClient();
    const { data: lesson, error: lessonError } = await admin
      .from("lessons")
      .select("id,course_id")
      .eq("id", parsed.data.lessonId)
      .single();
    if (lessonError || !lesson) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
    if (!(await hasPaidCourseAccess(identity, lesson.course_id))) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const now = new Date().toISOString();
    const { data: existing, error: lookupError } = await admin
      .from("lesson_completions")
      .select("id,progress_percent")
      .eq("student_id", identity.profileId)
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const progressPercent = Math.max(existing?.progress_percent || 0, parsed.data.progress);
    const values = {
      progress_percent: progressPercent,
      completed_at: progressPercent >= 100 ? now : null,
      updated_at: now,
    };
    const result = existing
      ? await admin.from("lesson_completions").update(values).eq("id", existing.id)
      : await admin.from("lesson_completions").insert({
          student_id: identity.profileId,
          lesson_id: lesson.id,
          watched_duration: 0,
          ...values,
        });
    if (result.error) throw result.error;

    return NextResponse.json({ ok: true, progressPercent });
  } catch (error) {
    console.error("Error saving student progress:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível guardar o progresso",
    }, { status: 500 });
  }
}
