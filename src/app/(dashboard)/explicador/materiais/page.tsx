"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useTutorScope } from "@/hooks/use-tutor-scope";

type Material = { id: string; title: string; file_url: string; file_type: string | null; file_size: number | null; course_id: string };

function TutorMaterialsContent() {
  const params = useSearchParams();
  const { courses, courseIds, loading: scopeLoading, error: scopeError } = useTutorScope();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter] = useState(params.get("course") || "TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (scopeLoading) return;
    if (!courseIds.length) { setMaterials([]); setLoading(false); return; }
    const supabase = createClient();
    async function load() {
      const { data, error: queryError } = await supabase.from("materials").select("id,title,file_url,file_type,file_size,course_id").in("course_id", courseIds).order("title");
      setMaterials((data || []) as Material[]); setError(queryError?.message || ""); setLoading(false);
    }
    void load();
  }, [courseIds.join(","), scopeLoading]);
  const visible = materials.filter((material) => filter === "TODOS" || material.course_id === filter);
  return <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}><div className="mx-auto max-w-[1440px] space-y-6"><div><h1 className="text-3xl font-bold">Materiais</h1><p className="mt-1 text-sm text-on-surface-variant/70">Documentos disponíveis nas suas cadeiras.</p></div><Card className="max-w-md p-4"><label className="mb-1.5 block text-xs font-bold uppercase text-on-surface-variant">Cadeira</label><Select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="TODOS">Todas</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select></Card>{scopeError || error ? <Card className="p-6 text-sm text-red-300">{scopeError || error}</Card> : scopeLoading || loading ? <p className="text-sm text-on-surface-variant">A carregar...</p> : visible.length === 0 ? <Card className="p-8 text-center text-sm text-on-surface-variant">Nenhum material registado.</Card> : <div className="grid gap-4 md:grid-cols-2">{visible.map((material) => <Card key={material.id} className="flex items-center justify-between gap-4 p-5"><div><h2 className="font-semibold">{material.title}</h2><p className="text-xs text-on-surface-variant">{material.file_type || "Ficheiro"}{material.file_size ? ` · ${(material.file_size / 1024 / 1024).toFixed(1)} MB` : ""}</p></div><a href={material.file_url} target="_blank" rel="noreferrer" className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">Abrir</a></Card>)}</div>}</div></RouteGuard>;
}

export default function TutorMaterialsPage() {
  return <Suspense fallback={<p className="text-sm text-on-surface-variant">A carregar...</p>}><TutorMaterialsContent /></Suspense>;
}
