"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useTutorScope } from "@/hooks/use-tutor-scope";

type Material = {
  id: string;
  title: string;
  file_type: string | null;
  file_size: number | null;
  course_id: string;
  access_level: "FREE" | "PREMIUM";
  original_name: string | null;
};

type ApiResult = {
  error?: string;
  material?: Material;
  uploadUrl?: string;
  ok?: boolean;
};

async function readApiResult(response: Response): Promise<ApiResult> {
  const body = await response.text();
  if (!body.trim()) {
    throw new Error(`O servidor respondeu sem dados (HTTP ${response.status}). Reinicie o servidor e tente novamente.`);
  }

  try {
    return JSON.parse(body) as ApiResult;
  } catch {
    throw new Error(`O servidor devolveu uma resposta inválida (HTTP ${response.status}).`);
  }
}

const contentTypes: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
};

function TutorMaterialsContent() {
  const params = useSearchParams();
  const { courses, loading: scopeLoading, error: scopeError } = useTutorScope();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter] = useState(params.get("course") || "TODOS");
  const [courseId, setCourseId] = useState(params.get("course") || "");
  const [title, setTitle] = useState("");
  const [accessLevel, setAccessLevel] = useState<"FREE" | "PREMIUM">("FREE");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!courseId && courses[0]?.id) setCourseId(courses[0].id);
  }, [courseId, courses]);

  const load = useCallback(async () => {
    const courseIds = courses.map((course) => course.id);
    if (!courseIds.length) { setMaterials([]); setLoading(false); return; }
    setLoading(true);
    const { data, error: queryError } = await createClient().from("materials")
      .select("id,title,file_type,file_size,course_id,access_level,original_name")
      .in("course_id", courseIds)
      .order("title");
    setMaterials((data || []) as Material[]);
    setError(queryError?.message || "");
    setLoading(false);
  }, [courses]);

  useEffect(() => {
    if (!scopeLoading) void load();
  }, [load, scopeLoading]);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !courseId) return;
    setUploading(true);
    setError("");
    setMessage("");
    let materialId: string | undefined;
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "";
      const contentType = file.type || contentTypes[extension] || "";
      const response = await fetch("/api/materials/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: title.trim(),
          fileName: file.name,
          contentType,
          fileSize: file.size,
          accessLevel,
        }),
      });
      const result = await readApiResult(response);
      if (!response.ok) throw new Error(result.error || "Não foi possível preparar o upload");
      if (!result.material?.id || !result.uploadUrl) {
        throw new Error("A resposta de preparação do upload está incompleta.");
      }
      materialId = result.material.id;

      const uploadResponse = await fetch(result.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("O Cloudflare R2 recusou o upload. Confirme a configuração CORS do bucket.");

      setTitle("");
      setFile(null);
      setAccessLevel("FREE");
      setMessage("Material enviado com sucesso.");
      const fileInput = document.getElementById("material-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      await load();
    } catch (uploadError) {
      if (materialId) await fetch(`/api/materials/${materialId}`, { method: "DELETE" }).catch(() => undefined);
      setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar o material.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (material: Material) => {
    if (!window.confirm(`Eliminar “${material.title}”?`)) return;
    try {
      const response = await fetch(`/api/materials/${material.id}`, { method: "DELETE" });
      const result = await readApiResult(response);
      if (!response.ok) { setError(result.error || "Não foi possível eliminar o material."); return; }
      setMaterials((current) => current.filter((item) => item.id !== material.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível eliminar o material.");
    }
  };

  const visible = materials.filter((material) => filter === "TODOS" || material.course_id === filter);

  return (
    <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Materiais</h1>
          <p className="mt-1 text-sm text-on-surface-variant/70">Envie PDFs, e-books e fichas para o armazenamento privado da Kingsman.</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <h2 className="font-playfair text-lg font-bold text-primary">Adicionar material</h2>
              <p className="mt-1 text-xs text-on-surface-variant">Formatos: PDF, EPUB, DOCX, PPTX, XLSX ou ZIP. Limite de 50 MB por ficheiro.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Cadeira">
                <Select required value={courseId} onChange={(event) => setCourseId(event.target.value)}>
                  <option value="">Selecione</option>
                  {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
                </Select>
              </Field>
              <Field label="Título">
                <Input required minLength={3} placeholder="Ex.: Ficha de exercícios 1" value={title} onChange={(event) => setTitle(event.target.value)} />
              </Field>
              <Field label="Nível de acesso">
                <Select value={accessLevel} onChange={(event) => setAccessLevel(event.target.value as "FREE" | "PREMIUM")}>
                  <option value="FREE">Gratuito — todos os estudantes</option>
                  <option value="PREMIUM">Premium — pagamento confirmado</option>
                </Select>
              </Field>
              <Field label="Ficheiro">
                <Input id="material-file" required type="file" accept=".pdf,.epub,.docx,.pptx,.xlsx,.zip" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              </Field>
            </div>
            {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
            {message && <p className="text-sm text-emerald-300" role="status">{message}</p>}
            <Button type="submit" variant="primary" isLoading={uploading} disabled={!file || !courseId} className="font-bold uppercase">Enviar para o R2</Button>
          </form>
        </Card>

        <Card className="max-w-md p-4">
          <label className="mb-1.5 block text-xs font-bold uppercase text-on-surface-variant">Filtrar por cadeira</label>
          <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="TODOS">Todas</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
          </Select>
        </Card>

        {scopeError ? <Card className="p-6 text-sm text-red-300">{scopeError}</Card> : scopeLoading || loading ? (
          <p className="text-sm text-on-surface-variant">A carregar...</p>
        ) : visible.length === 0 ? (
          <Card className="p-8 text-center text-sm text-on-surface-variant">Nenhum material registado.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((material) => (
              <Card key={material.id} className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-semibold">{material.title}</h2>
                    <Badge variant={material.access_level === "PREMIUM" ? "warning" : "success"}>{material.access_level === "PREMIUM" ? "Premium" : "Gratuito"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant">{material.file_type || "Ficheiro"}{material.file_size ? ` · ${(material.file_size / 1024 / 1024).toFixed(1)} MB` : ""}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a href={`/api/materials/${material.id}`} target="_blank" rel="noreferrer" className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20">Abrir</a>
                  <button type="button" onClick={() => void handleDelete(material)} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20">Eliminar</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5"><span className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>{children}</label>;
}

export default function TutorMaterialsPage() {
  return <Suspense fallback={<p className="text-sm text-on-surface-variant">A carregar...</p>}><TutorMaterialsContent /></Suspense>;
}
