"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Lesson {
  id: string;
  title: string;
  topic: string;
  duration: number;
  order_index: number;
  course_name: string;
  course_id: string;
  youtube_link: string;
  completed: boolean;
  progress_percent: number;
}

export default function StudentLessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchLessons();
    }
  }, [user, authLoading]);

  async function fetchLessons() {
    try {
      // Busca enrollments ativos do estudante
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("student_id", user?.id)
        .eq("status", "ACTIVE")
        .eq("payment_status", "CONFIRMED");

      if (!enrollments || enrollments.length === 0) {
        setLessons([]);
        setLoading(false);
        return;
      }

      const courseIds = enrollments.map(e => e.course_id);

      // Busca aulas dessas cadeiras
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select(`
          id, title, topic, duration, order_index, youtube_link, course_id,
          courses:course_id (name)
        `)
        .in("course_id", courseIds)
        .eq("is_active", true)
        .order("order_index");

      // Busca progresso do estudante
      const { data: completions } = await supabase
        .from("lesson_completions")
        .select("lesson_id, progress_percent")
        .eq("student_id", user?.id);

      const completionMap = new Map();
      completions?.forEach(c => completionMap.set(c.lesson_id, c.progress_percent));

      const formattedLessons: Lesson[] = lessonsData?.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        topic: lesson.topic,
        duration: lesson.duration,
        order_index: lesson.order_index,
        course_name: lesson.courses?.name || "",
        course_id: lesson.course_id,
        youtube_link: lesson.youtube_link,
        completed: (completionMap.get(lesson.id) || 0) >= 100,
        progress_percent: completionMap.get(lesson.id) || 0,
      })) || [];

      setLessons(formattedLessons);
    } catch (error) {
      console.error("Erro ao buscar aulas:", error);
    } finally {
      setLoading(false);
    }
  }

  const courses = ["all", ...Array.from(new Set(lessons.map(l => l.course_id)))];
  const courseNames: Record<string, string> = {};
  lessons.forEach(l => { courseNames[l.course_id] = l.course_name; });

  const filteredLessons = selectedCourse === "all" 
    ? lessons 
    : lessons.filter(l => l.course_id === selectedCourse);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF48FF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#E8E8E8]">Minhas Aulas</h1>
        <p className="mt-2 text-sm text-[#808080]">
          Aceda às aulas das cadeiras em que está inscrito
        </p>
      </div>

      {/* Filtro por cadeira */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCourse("all")}
          className={`rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
            selectedCourse === "all"
              ? "bg-[#FF48FF] text-[#0A0A0A] font-medium"
              : "bg-[rgba(255,72,255,0.08)] text-[#FF48FF] border border-[rgba(255,72,255,0.2)] hover:bg-[rgba(255,72,255,0.15)]"
          }`}
        >
          Todas
        </button>
        {courses.filter(c => c !== "all").map(courseId => (
          <button
            key={courseId}
            onClick={() => setSelectedCourse(courseId)}
            className={`rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
              selectedCourse === courseId
                ? "bg-[#FF48FF] text-[#0A0A0A] font-medium"
                : "bg-[rgba(255,72,255,0.08)] text-[#FF48FF] border border-[rgba(255,72,255,0.2)] hover:bg-[rgba(255,72,255,0.15)]"
            }`}
          >
            {courseNames[courseId]}
          </button>
        ))}
      </div>

      {/* Lista de aulas */}
      {filteredLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <span className="material-symbols-outlined text-6xl text-[#2E0D2E] mb-4">menu_book</span>
          <p className="text-[#808080] text-lg">Nenhuma aula disponível</p>
          <p className="text-[#4A4A4A] text-sm mt-2">
            Inscreva-se numa cadeira para aceder às aulas
          </p>
          <Button 
            variant="outline" 
            className="mt-6 border-[#FF48FF] text-[#FF48FF]"
            onClick={() => router.push("/estudante/cadeiras")}
          >
            Ver Cadeiras
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="bg-[rgba(26,10,26,0.5)] border-[rgba(255,72,255,0.08)] p-6 hover:border-[rgba(255,72,255,0.2)] transition-all duration-200"
            >
              <div className="flex items-center gap-6">
                {/* Número da aula */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${
                  lesson.completed
                    ? "bg-[rgba(0,229,160,0.1)] text-[#00E5A0]"
                    : "bg-[rgba(255,72,255,0.1)] text-[#FF48FF]"
                }`}>
                  {lesson.completed ? (
                    <span className="material-symbols-outlined text-xl">check_circle</span>
                  ) : (
                    lesson.order_index + 1
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[#E8E8E8] font-medium truncate">
                    {lesson.title}
                  </h3>
                  <p className="text-[#808080] text-sm mt-1">
                    {lesson.topic}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-[rgba(255,72,255,0.1)] text-[#FF48FF] border-none">
                      {lesson.course_name}
                    </Badge>
                    {lesson.duration && (
                      <span className="text-[#808080] text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {Math.floor(lesson.duration / 60)} min
                      </span>
                    )}
                    {lesson.completed && (
                      <Badge className="bg-[rgba(0,229,160,0.1)] text-[#00E5A0] border-none">
                        Concluída
                      </Badge>
                    )}
                    {!lesson.completed && lesson.progress_percent > 0 && (
                      <Badge className="bg-[rgba(255,184,0,0.1)] text-[#FFB800] border-none">
                        Em progresso
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Botão Assistir */}
                <Link href={`/estudante/aulas/${lesson.id}`}>
                  <Button
                    className={`flex items-center gap-2 ${
                      lesson.completed
                        ? "border-[#808080] text-[#808080] hover:text-[#E8E8E8]"
                        : "bg-gradient-to-r from-[#FF48FF] to-[#BF35BE] text-white hover:shadow-[0_0_20px_rgba(255,72,255,0.15)]"
                    }`}
                  >
                    {lesson.completed ? (
                      <>
                        <span className="material-symbols-outlined text-[18px]">play_arrow</span> Rever
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">play_arrow</span> Assistir
                      </>
                    )}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
