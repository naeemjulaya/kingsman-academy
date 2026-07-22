"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LessonData {
  id: string;
  title: string;
  topic: string;
  description: string | null;
  youtube_link: string;
  duration: number | null;
  order_index: number;
  course_id: string;
  course_name: string;
}

interface Material {
  id: string;
  title: string;
  file_type: string;
  file_size: number | null;
}

export default function LessonPlayerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const lessonId = params.id as string;

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [adjacentLessons, setAdjacentLessons] = useState<{
    prev: { id: string; title: string } | null;
    next: { id: string; title: string } | null;
  }>({ prev: null, next: null });
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && lessonId) {
      checkAccessAndLoadLesson();
    }
  }, [user, authLoading, lessonId]);

  async function checkAccessAndLoadLesson() {
    try {
      // VERIFICAÇÃO CRÍTICA DE ACESSO (client-side, mas API faz verificação server-side)

      // 1. Busca a aula
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select(`
          id, title, topic, description, duration, order_index, course_id,
          courses:course_id (name)
        `)
        .eq("id", lessonId)
        .single();

      if (lessonError || !lessonData) {
        router.push("/estudante/aulas");
        return;
      }

      // 2. Verifica enrollment
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("status, payment_status, end_date")
        .eq("student_id", user?.id)
        .eq("course_id", lessonData.course_id)
        .single();

      const accessGranted = enrollment && 
        enrollment.status === "ACTIVE" && 
        enrollment.payment_status === "CONFIRMED" &&
        (!enrollment.end_date || new Date(enrollment.end_date) > new Date());

      if (!accessGranted) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setHasAccess(true);

      // 3. Formata dados da aula
      let courseName = "";
      if (lessonData.courses) {
        if (Array.isArray(lessonData.courses)) {
          courseName = lessonData.courses[0]?.name || "";
        } else {
          courseName = (lessonData.courses as any).name || "";
        }
      }

      const formattedLesson: LessonData = {
        id: lessonData.id,
        title: lessonData.title,
        topic: lessonData.topic,
        description: lessonData.description,
        youtube_link: "",
        duration: lessonData.duration,
        order_index: lessonData.order_index,
        course_id: lessonData.course_id,
        course_name: courseName,
      };

      setLesson(formattedLesson);

      // 4. O link original nunca é lido pelo browser; a API volta a validar a matrícula.
      const videoResponse = await fetch(`/api/lessons/${lessonId}/video`, { cache: "no-store" });
      if (!videoResponse.ok) throw new Error("Não foi possível autorizar este vídeo");
      const videoPayload: { videoUrl: string } = await videoResponse.json();
      setVideoUrl(`${videoPayload.videoUrl}&origin=${encodeURIComponent(window.location.origin)}`);

      // 5. Busca materiais
      const { data: materialsData } = await supabase
        .rpc("get_course_materials", { p_course_id: lessonData.course_id });

      setMaterials(((materialsData || []) as Array<Material & { lesson_id: string | null }>).filter((material) => material.lesson_id === lessonId));

      // 6. Busca aulas adjacentes (anterior e próxima)
      const { data: adjacent } = await supabase
        .from("lessons")
        .select("id, title, order_index")
        .eq("course_id", lessonData.course_id)
        .eq("is_active", true)
        .order("order_index");

      if (adjacent) {
        const currentIndex = adjacent.findIndex(l => l.id === lessonId);
        setAdjacentLessons({
          prev: currentIndex > 0 ? { 
            id: adjacent[currentIndex - 1].id, 
            title: adjacent[currentIndex - 1].title 
          } : null,
          next: currentIndex < adjacent.length - 1 ? { 
            id: adjacent[currentIndex + 1].id, 
            title: adjacent[currentIndex + 1].title 
          } : null,
        });
      }

      // 7. Registra progresso (início de visualização)
      await trackLessonProgress(lessonId, 0);

    } catch (error) {
      console.error("Erro ao carregar aula:", error);
    } finally {
      setLoading(false);
    }
  }

  async function trackLessonProgress(lessonId: string, progress: number) {
    try {
      const { data: existing } = await supabase
        .from("lesson_completions")
        .select("id")
        .eq("student_id", user?.id)
        .eq("lesson_id", lessonId)
        .single();

      if (existing) {
        await supabase
          .from("lesson_completions")
          .update({ 
            progress_percent: Math.max(progress, 0),
            updated_at: new Date().toISOString(),
            completed_at: progress >= 100 ? new Date().toISOString() : null
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("lesson_completions")
          .insert({
            student_id: user?.id,
            lesson_id: lessonId,
            progress_percent: Math.max(progress, 0),
            watched_duration: 0,
          });
      }
    } catch (error) {
      console.error("Erro ao registrar progresso:", error);
    }
  }

  // Marca como concluída ao sair da página
  useEffect(() => {
    return () => {
      if (lessonId && user) {
        trackLessonProgress(lessonId, 100);
      }
    };
  }, [lessonId, user]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF48FF] border-t-transparent" />
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#0A0A0A] p-8">
        <span className="material-symbols-outlined text-[64px] text-[#FFB800] mb-4">lock</span>
        <h1 className="font-serif text-2xl text-[#E8E8E8]">Acesso Negado</h1>
        <p className="text-[#808080] mt-2 text-center max-w-md">
          Você não tem acesso a esta aula. Inscreva-se na cadeira e realize o pagamento para continuar.
        </p>
        <div className="flex gap-4 mt-6">
          <Button 
            variant="outline" 
            onClick={() => router.push("/estudante/aulas")}
            className="border-[#808080] text-[#808080]"
          >
            <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span> Voltar às Aulas
          </Button>
          <Button 
            onClick={() => router.push("/estudante/cadeiras")}
            className="bg-gradient-to-r from-[#FF48FF] to-[#BF35BE] text-white"
          >
            Ver Cadeiras
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Header do Player */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[rgba(255,72,255,0.08)] bg-[rgba(10,10,10,0.95)] backdrop-blur-md px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/estudante/aulas")}
            className="flex items-center gap-2 text-[#808080] hover:text-[#E8E8E8] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="text-sm hidden sm:inline">Voltar</span>
          </button>
          <div className="h-6 w-px bg-[rgba(255,72,255,0.1)]" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#808080]">{lesson.course_name}</span>
            <span className="text-[#4A4A4A]">/</span>
            <span className="text-[#E8E8E8] truncate max-w-[200px] sm:max-w-md">
              {lesson.title}
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push("/estudante/aulas")}
          className="text-[#808080] hover:text-[#FF48FF] transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
      </header>

      {/* Container Principal */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Área do Vídeo */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-[rgba(255,72,255,0.08)]">
          {videoUrl ? (
            <>
              <iframe
                src={videoUrl}
                title={lesson.title}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                loading="eager"
              />
              {/* Watermark */}
              <div className="absolute bottom-4 right-4 pointer-events-none z-10">
                <div className="bg-[rgba(0,0,0,0.5)] px-3 py-1.5 rounded-md">
                  <p className="text-white text-xs font-medium opacity-60">
                    KINGSMAN • {user?.fullName || user?.email}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-[#808080]">Vídeo não disponível</p>
            </div>
          )}
        </div>

        {/* Informações da Aula */}
        <div className="mt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl text-[#E8E8E8]">{lesson.title}</h1>
              <p className="text-[#808080] mt-1">{lesson.topic}</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-[rgba(255,72,255,0.1)] text-[#FF48FF] border-none">
                  {lesson.course_name}
                </Badge>
                {lesson.duration && (
                  <span className="text-[#808080] text-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {Math.floor(lesson.duration / 60)} minutos
                  </span>
                )}
              </div>
            </div>
          </div>

          {lesson.description && (
            <p className="text-[#808080] mt-4 leading-relaxed">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Materiais */}
        {materials.length > 0 && (
          <div className="mt-8">
            <h2 className="text-[#E8E8E8] font-medium text-lg mb-4">
              Materiais desta aula
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map((material) => (
                <Card
                  key={material.id}
                  className="bg-[rgba(26,10,26,0.5)] border-[rgba(255,72,255,0.08)] p-4 hover:border-[rgba(255,72,255,0.2)] transition-all cursor-pointer"
                  onClick={() => window.open(`/api/materials/${material.id}`, "_blank", "noopener,noreferrer")}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(255,45,85,0.1)]">
                      <span className="material-symbols-outlined text-[20px] text-[#FF2D55]">description</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#E8E8E8] text-sm truncate">{material.title}</p>
                      {material.file_size && (
                        <p className="text-[#808080] text-xs">
                          {(material.file_size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#FF48FF]">download</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navegação entre aulas */}
        <div className="mt-10 flex items-center justify-between gap-4">
          {adjacentLessons.prev ? (
            <Link href={`/estudante/aulas/${adjacentLessons.prev.id}`}>
              <Button
                variant="outline"
                className="border-[#808080] text-[#808080] hover:text-[#E8E8E8] hover:border-[#E8E8E8]"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">chevron_left</span>
                <span className="hidden sm:inline">Aula Anterior</span>
                <span className="sm:hidden">Anterior</span>
              </Button>
            </Link>
          ) : (
            <div /> // Spacer
          )}

          {adjacentLessons.next ? (
            <Link href={`/estudante/aulas/${adjacentLessons.next.id}`}>
              <Button
                variant="outline"
                className="border-[#FF48FF] text-[#FF48FF] hover:bg-[rgba(255,72,255,0.05)]"
              >
                <span className="hidden sm:inline">Próxima Aula</span>
                <span className="sm:hidden">Próxima</span>
                <span className="material-symbols-outlined text-[18px] ml-2">chevron_right</span>
              </Button>
            </Link>
          ) : (
            <div /> // Spacer
          )}
        </div>
      </main>
    </div>
  );
}
