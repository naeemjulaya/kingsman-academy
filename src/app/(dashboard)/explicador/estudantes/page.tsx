"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { useTutorScope } from "@/hooks/use-tutor-scope";

type Enrollment = { id: string; status: string; created_at: string; student: { full_name: string; email: string } | { full_name: string; email: string }[] | null; course: { name: string } | { name: string }[] | null };

export default function TutorStudentsPage() {
  const { courseIds, loading: scopeLoading, error: scopeError } = useTutorScope();
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (scopeLoading) return;
    if (!courseIds.length) { setRows([]); setLoading(false); return; }
    const supabase = createClient();
    async function load() {
      const { data, error: queryError } = await supabase.from("enrollments")
        .select("id,status,created_at,student:student_id(full_name,email),course:course_id(name)")
        .in("course_id", courseIds).order("created_at", { ascending: false });
      setRows((data || []) as Enrollment[]); setError(queryError?.message || ""); setLoading(false);
    }
    void load();
  }, [courseIds.join(","), scopeLoading]);
  const one = <T,>(value: T | T[] | null) => Array.isArray(value) ? value[0] : value;
  return <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}><div className="mx-auto max-w-[1440px] space-y-6"><div><h1 className="text-3xl font-bold">Estudantes</h1><p className="mt-1 text-sm text-on-surface-variant/70">Inscrições reais nas suas cadeiras.</p></div>{scopeError || error ? <Card className="p-6 text-sm text-red-300">{scopeError || error}</Card> : scopeLoading || loading ? <p className="text-sm text-on-surface-variant">A carregar...</p> : rows.length === 0 ? <Card className="p-8 text-center text-sm text-on-surface-variant">Ainda não há estudantes inscritos.</Card> : <Card className="overflow-hidden p-0"><Table><TableHeader><TableRow><TableHead>Estudante</TableHead><TableHead>Email</TableHead><TableHead>Cadeira</TableHead><TableHead>Inscrição</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow key={row.id}><TableCell className="font-semibold">{one(row.student)?.full_name || "Desconhecido"}</TableCell><TableCell>{one(row.student)?.email || "N/D"}</TableCell><TableCell>{one(row.course)?.name || "N/D"}</TableCell><TableCell>{new Date(row.created_at).toLocaleDateString("pt-PT")}</TableCell><TableCell><Badge variant={row.status === "ACTIVE" ? "success" : row.status === "PENDING" ? "warning" : "danger"}>{row.status}</Badge></TableCell></TableRow>)}</TableBody></Table></Card>}</div></RouteGuard>;
}
