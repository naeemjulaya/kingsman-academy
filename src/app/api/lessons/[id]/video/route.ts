import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { extractYouTubeId } from "@/lib/youtube";

// Atualizadoo: Definindo params como uma Promise para satisfazer o Next.js
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient(); // Adicionado await caso seu criador de cliente seja assíncrono no servidor

    // Atualizado: Aguardando a Promise dos parâmetros se resolver
    const { id } = await context.params;
    const lessonId = id;

    // 1. Verifica autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // 2. Busca a aula
    const { data: lesson, error: lessonError } = await supabase
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

    // 3. VERIFICAÇÃO CRÍTICA: enrollment ativo e pago
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("status, payment_status, end_date")
      .eq("student_id", user.id)
      .eq("course_id", lesson.course_id)
      .single();

    const hasAccess = enrollment &&
      enrollment.status === "ACTIVE" &&
      enrollment.payment_status === "CONFIRMED" &&
      (!enrollment.end_date || new Date(enrollment.end_date) > new Date());

    if (!hasAccess) {
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
