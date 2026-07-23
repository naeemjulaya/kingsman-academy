import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeId } from "@/lib/youtube";
import { getRequestIdentity, hasPaidCourseAccess } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";

// Atualizadoo: Definindo params como uma Promise para satisfazer o Next.js
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const lessonId = id;

    const identity = await getRequestIdentity();
    if (!identity) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const { data: lesson, error: lessonError } = await admin
      .from("lessons")
      .select("id, title, youtube_link, duration, course_id")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { error: "Aula não encontrada" },
        { status: 404 }
      );
    }

    if (!(await hasPaidCourseAccess(identity, lesson.course_id))) {
      return NextResponse.json(
        { error: "Acesso negado. Inscrição necessária." },
        { status: 403 }
      );
    }

    // 4. Extrai video ID e constrói URL segura
    const videoId = extractYouTubeId(lesson.youtube_link);

    if (!videoId) {
      return NextResponse.json(
        { error: "Vídeo inválido" },
        { status: 400 }
      );
    }

    const videoUrl = `https://www.youtube.com/embed/${videoId}?` +
      `modestbranding=1&` +
      `rel=0&` +
      `showinfo=0&` +
      `controls=1&` +
      `fs=1`;

    // 5. Retorna URL segura (nunca expõe o link original)
    return NextResponse.json({
      videoUrl,
      lessonTitle: lesson.title,
      duration: lesson.duration,
    });

  } catch (error) {
    console.error("Erro na API de vídeo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
