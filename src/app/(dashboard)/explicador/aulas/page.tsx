"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useTutorScope } from "@/hooks/use-tutor-scope";

type Lesson = { id: string; title: string; topic: string; course_id: string; duration: number | null; order_index: number; is_active: boolean; created_at: string };

function TutorLessonsContent() {
  const params = useSearchParams();
  const { courses, courseIds, loading: scopeLoading, error: scopeError } = useTutorScope();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseFilter, setCourseFilter] = useState(params.get("course") || "TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (scopeLoading) return;
    if (!courseIds.length) { setLessons([]); setLoading(false); return; }
    const supabase = createClient();
    async function load() {
      setLoading(true);
      const { data, error: queryError } = await supabase.from("lessons")
        .select("id,title,topic,course_id,duration,order_index,is_active,created_at")
        .in("course_id", courseIds).order("course_id").order("order_index");
      setError(queryError?.message || "");
      setLessons((data || []) as Lesson[]);
      setLoading(false);
    }
    void load();
  }, [courseIds.join(","), scopeLoading]);

  const visible = lessons.filter((lesson) => courseFilter === "TODOS" || lesson.course_id === courseFilter);
  const courseName = (id: string) => courses.find((course) => course.id === id)?.name || "Cadeira";

  return <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
    <div className="mx-auto max-w-[1440px] space-y-6">
      <div><h1 className="text-3xl font-bold">Aulas</h1><p className="mt-1 text-sm text-on-surface-variant/70">Aulas registadas nas suas cadeiras.</p></div>
      <Card className="max-w-md p-4"><label className="mb-1.5 block text-xs font-bold uppercase text-on-surface-variant">Cadeira</label><Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}><option value="TODOS">Todas</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select></Card>
      {scopeError || error ? <Card className="p-6 text-sm text-red-300">{scopeError || error}</Card> : scopeLoading || loading ? <p className="text-sm text-on-surface-variant">A carregar...</p> : visible.length === 0 ? <Card className="p-8 text-center text-sm text-on-surface-variant">Nenhuma aula registada.</Card> : <div className="space-y-3">{visible.map((lesson) => <Card key={lesson.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase text-primary">{courseName(lesson.course_id)}</p><h2 className="mt-1 font-semibold">{lesson.order_index}. {lesson.title}</h2><p className="text-xs text-on-surface-variant">{lesson.topic || "Aula"} · {lesson.duration || 0} min</p></div><Badge variant={lesson.is_active ? "success" : "danger"}>{lesson.is_active ? "Publicada" : "Inativa"}</Badge></Card>)}</div>}
    </div>
  </RouteGuard>;
}

export default function TutorLessonsPage() {
  return <Suspense fallback={<p className="text-sm text-on-surface-variant">A carregar...</p>}><TutorLessonsContent /></Suspense>;
}
