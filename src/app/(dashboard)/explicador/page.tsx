"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { RouteGuard } from "@/components/auth/route-guard";
import { useTutorScope } from "@/hooks/use-tutor-scope";

type RecentEnrollment = {
  id: string;
  created_at: string;
  student: { full_name: string } | { full_name: string }[] | null;
  course: { name: string } | { name: string }[] | null;
};

const related = <T,>(value: T | T[] | null): T | null => Array.isArray(value) ? value[0] ?? null : value;

export default function TutorDashboard() {
  const { courses, courseIds, loading: scopeLoading, error: scopeError } = useTutorScope();
  const [students, setStudents] = useState<RecentEnrollment[]>([]);
  const [stats, setStats] = useState({ totalStudents: 0, lessons: 0, completionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (scopeLoading) return;
    if (!courseIds.length) { setLoading(false); return; }
    const supabase = createClient();

    async function load() {
      setLoading(true);
      setError("");
      const [enrollmentsResult, lessonsResult, recentResult] = await Promise.all([
        supabase.from("enrollments").select("id", { count: "exact", head: true }).in("course_id", courseIds).eq("status", "ACTIVE"),
        supabase.from("lessons").select("id").in("course_id", courseIds).eq("is_active", true),
        supabase.from("enrollments").select("id,created_at,student:student_id(full_name),course:course_id(name)").in("course_id", courseIds).eq("status", "ACTIVE").order("created_at", { ascending: false }).limit(5),
      ]);
      const firstError = enrollmentsResult.error || lessonsResult.error || recentResult.error;
      if (firstError) { setError(firstError.message); setLoading(false); return; }

      const lessonIds = (lessonsResult.data || []).map((lesson) => lesson.id);
      let completed = 0;
      if (lessonIds.length) {
        const { count, error: completionError } = await supabase.from("lesson_completions")
          .select("id", { count: "exact", head: true }).in("lesson_id", lessonIds).gte("progress_percent", 100);
        if (completionError) { setError(completionError.message); setLoading(false); return; }
        completed = count || 0;
      }

      const activeStudents = enrollmentsResult.count || 0;
      const lessonCount = lessonIds.length;
      const possibleCompletions = activeStudents * lessonCount;
      setStats({
        totalStudents: activeStudents,
        lessons: lessonCount,
        completionRate: possibleCompletions ? Math.min(100, Math.round((completed / possibleCompletions) * 100)) : 0,
      });
      setStudents((recentResult.data || []) as RecentEnrollment[]);
      setLoading(false);
    }
    void load();
  }, [courseIds.join(","), scopeLoading]);

  return <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
    <div className="mx-auto max-w-[1440px] space-y-8">
      {(scopeError || error) && <Card className="p-5 text-sm text-red-300">{scopeError || error}</Card>}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-primary p-6"><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cadeiras atribuídas</p><h3 className="mt-1 font-playfair text-3xl font-bold text-primary">{courses.length}</h3><p className="mt-1 text-[10px] text-on-surface-variant">Associações ativas no catálogo</p></Card>
        <Card className="p-6"><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estudantes ativos</p><h3 className="mt-1 font-playfair text-3xl font-bold text-primary">{stats.totalStudents}</h3></Card>
        <Card className="p-6"><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Aulas publicadas</p><h3 className="mt-1 font-playfair text-3xl font-bold text-primary">{stats.lessons}</h3></Card>
        <Card className="p-6"><p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Conclusão global</p><h3 className="mt-1 font-playfair text-3xl font-bold text-primary">{stats.completionRate}%</h3></Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex items-center justify-between"><h2 className="font-playfair text-xl font-bold">Estudantes recentes</h2><Link href="/explicador/estudantes" className="text-xs font-bold text-primary hover:underline">Ver todos</Link></div>
          <Card className="overflow-hidden p-0">{loading || scopeLoading ? <p className="p-6 text-sm text-on-surface-variant">A carregar...</p> : students.length === 0 ? <p className="p-8 text-center text-sm text-on-surface-variant">Não há estudantes ativos nas suas cadeiras.</p> : <Table><TableHeader><TableRow><TableHead>Estudante</TableHead><TableHead>Cadeira</TableHead><TableHead>Data de inscrição</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{students.map((enrollment) => <TableRow key={enrollment.id}><TableCell className="font-semibold">{related(enrollment.student)?.full_name || "Desconhecido"}</TableCell><TableCell>{related(enrollment.course)?.name || "N/D"}</TableCell><TableCell>{new Date(enrollment.created_at).toLocaleDateString("pt-PT")}</TableCell><TableCell><Badge variant="success">Ativo</Badge></TableCell></TableRow>)}</TableBody></Table>}</Card>
        </div>
        <div className="space-y-4 lg:col-span-4"><div className="flex items-center justify-between"><h2 className="font-playfair text-xl font-bold">Minhas cadeiras</h2><Link href="/explicador/cadeiras" className="text-xs font-bold text-primary hover:underline">Ver todas</Link></div>{loading || scopeLoading ? <p className="text-sm text-on-surface-variant">A carregar...</p> : courses.length === 0 ? <Card className="p-6 text-sm text-on-surface-variant">Não tem cadeiras atribuídas.</Card> : courses.slice(0, 4).map((course) => <Card key={course.id} className="space-y-4 p-5"><div><Badge variant="primary">{course.department || "Cadeira"}</Badge><h3 className="mt-3 font-playfair text-lg font-bold">{course.name}</h3></div><div className="grid grid-cols-2 gap-2"><Link href={`/explicador/aulas?course=${course.id}`} className="rounded-lg bg-surface-container px-3 py-2 text-center text-xs font-bold hover:bg-surface-container-high">Ver aulas</Link><Link href={`/explicador/materiais?course=${course.id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-bold text-primary hover:bg-primary/20">Materiais</Link></div></Card>)}</div>
      </div>
    </div>
  </RouteGuard>;
}
