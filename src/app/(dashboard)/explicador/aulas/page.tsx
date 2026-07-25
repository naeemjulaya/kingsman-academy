"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useTutorScope } from "@/hooks/use-tutor-scope";

type Lesson = {
  id: string;
  title: string;
  topic: string;
  description: string | null;
  course_id: string;
  duration: number | null;
  order_index: number;
  is_active: boolean;
  access_level: "PUBLIC" | "PRIVATE";
  created_at: string;
  youtube_link: string;
};

type LessonForm = {
  courseId: string;
  title: string;
  topic: string;
  description: string;
  youtubeLink: string;
  duration: number;
  orderIndex: number;
  isActive: boolean;
  accessLevel: "PUBLIC" | "PRIVATE";
};

const emptyForm: LessonForm = {
  courseId: "",
  title: "",
  topic: "",
  description: "",
  youtubeLink: "",
  duration: 30,
  orderIndex: 1,
  isActive: true,
  accessLevel: "PUBLIC",
};

async function readResponse(response: Response) {
  const body = await response.text();
  if (!body.trim()) throw new Error(`O servidor respondeu sem dados (HTTP ${response.status})`);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`O servidor devolveu uma resposta inválida (HTTP ${response.status})`);
  }
}

function TutorLessonsContent() {
  const params = useSearchParams();
  const { courses, courseIds, loading: scopeLoading, error: scopeError } = useTutorScope();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseFilter, setCourseFilter] = useState(params.get("course") || "TODOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<LessonForm>(emptyForm);

  const loadLessons = useCallback(async () => {
    if (!courseIds.length) {
      setLessons([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/tutor/lessons", { cache: "no-store" });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar as aulas");
      setLessons((result.lessons || []) as Lesson[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as aulas");
    } finally {
      setLoading(false);
    }
  }, [courseIds.length]);

  useEffect(() => {
    if (!scopeLoading) void loadLessons();
  }, [loadLessons, scopeLoading]);

  const visible = useMemo(
    () => lessons.filter((lesson) => courseFilter === "TODOS" || lesson.course_id === courseFilter),
    [lessons, courseFilter]
  );

  const selectedCourse = courses.find((course) => course.id === form.courseId);
  const courseName = (id: string) => courses.find((course) => course.id === id)?.name || "Cadeira";

  function nextOrder(courseId: string) {
    const currentOrders = lessons
      .filter((lesson) => lesson.course_id === courseId)
      .map((lesson) => lesson.order_index);
    return currentOrders.length ? Math.max(...currentOrders) + 1 : 1;
  }

  function openCreateDialog() {
    const requestedCourse = params.get("course");
    const initialCourse = requestedCourse && courseIds.includes(requestedCourse) ? requestedCourse : "";
    setForm({
      ...emptyForm,
      courseId: initialCourse,
      orderIndex: initialCourse ? nextOrder(initialCourse) : 1,
    });
    setFormError("");
    setMessage("");
    setDialogOpen(true);
  }

  async function createLesson(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedCourse) {
      setFormError("Selecione uma das suas cadeiras.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const response = await fetch("/api/tutor/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.error || "Não foi possível publicar a aula");

      setDialogOpen(false);
      setMessage(
        form.isActive
          ? `A aula “${form.title.trim()}” foi publicada em ${selectedCourse.name}.`
          : `A aula “${form.title.trim()}” foi guardada como oculta em ${selectedCourse.name}.`
      );
      await loadLessons();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Não foi possível publicar a aula");
    } finally {
      setSaving(false);
    }
  }

  return (
    <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
      <div className="mx-auto max-w-[1440px] space-y-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Conteúdo académico</span>
            <h1 className="mt-1 text-3xl font-bold text-on-surface">Aulas</h1>
            <p className="mt-1 text-sm text-on-surface-variant/70">
              Publique links de vídeo e organize as aulas das cadeiras que lhe foram atribuídas.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={openCreateDialog}
            disabled={scopeLoading || courses.length === 0}
            className="gap-2 font-bold uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[19px]">add_circle</span>
            Adicionar aula
          </Button>
        </div>

        {message && (
          <Card className="flex items-start gap-3 border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
            <span className="material-symbols-outlined">check_circle</span>
            <p>{message}</p>
          </Card>
        )}

        <Card className="max-w-md p-4">
          <label className="mb-1.5 block text-xs font-bold uppercase text-on-surface-variant">
            Filtrar por cadeira
          </label>
          <Select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <option value="TODOS">Todas as minhas cadeiras</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </Select>
        </Card>

        {scopeError || error ? (
          <Card className="p-6 text-sm text-red-300">{scopeError || error}</Card>
        ) : scopeLoading || loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">assignment_late</span>
            <h2 className="mt-3 font-playfair text-lg font-bold">Nenhuma cadeira atribuída</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              O administrador precisa de lhe atribuir uma cadeira antes de poder publicar aulas.
            </p>
          </Card>
        ) : visible.length === 0 ? (
          <Card className="p-10 text-center">
            <span className="material-symbols-outlined text-4xl text-primary">video_library</span>
            <h2 className="mt-3 font-playfair text-lg font-bold">Nenhuma aula registada</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Use “Adicionar aula” para publicar o primeiro vídeo desta cadeira.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((lesson) => (
              <Card
                key={lesson.id}
                className="group flex flex-col justify-between gap-5 p-5 transition-all hover:border-primary/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant="primary">{courseName(lesson.course_id)}</Badge>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge variant={lesson.access_level === "PUBLIC" ? "success" : "warning"}>
                        {lesson.access_level === "PUBLIC" ? "Pública" : "Só inscritos"}
                      </Badge>
                      <Badge variant={lesson.is_active ? "success" : "danger"}>
                        {lesson.is_active ? "Publicada" : "Oculta"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                      {lesson.order_index}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-on-surface">{lesson.title}</h2>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {lesson.topic || "Aula"} · {lesson.duration || 0} min
                      </p>
                      {lesson.description && (
                        <p className="mt-3 line-clamp-2 text-sm text-on-surface-variant/70">
                          {lesson.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="text-xs text-on-surface-variant/60">
                    {new Date(lesson.created_at).toLocaleDateString("pt-PT")}
                  </span>
                  <a
                    href={lesson.youtube_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                  >
                    Ver vídeo
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent onClose={() => setDialogOpen(false)} className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar nova aula</DialogTitle>
              <DialogDescription>
                Escolha uma cadeira atribuída e indique o link do vídeo no YouTube.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={createLesson} className="space-y-5">
              <Field label="Cadeira">
                <Select
                  required
                  value={form.courseId}
                  onChange={(event) => {
                    const courseId = event.target.value;
                    setForm((current) => ({
                      ...current,
                      courseId,
                      orderIndex: courseId ? nextOrder(courseId) : 1,
                    }));
                  }}
                >
                  <option value="">Selecione explicitamente</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.name}</option>
                  ))}
                </Select>
              </Field>

              {selectedCourse && (
                <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">Publicar em</p>
                    <p className="mt-1 text-sm font-semibold">{selectedCourse.name}</p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Título da aula">
                  <Input
                    required
                    minLength={3}
                    maxLength={180}
                    placeholder="Ex.: Nitrocompostos e aminas"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </Field>
                <Field label="Tema">
                  <Input
                    required
                    minLength={2}
                    maxLength={180}
                    placeholder="Ex.: Química dos compostos nitrogenados"
                    value={form.topic}
                    onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Descrição (opcional)">
                <Textarea
                  maxLength={3000}
                  placeholder="Breve descrição do conteúdo abordado nesta aula."
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </Field>

              <Field label="Link do vídeo no YouTube">
                <Input
                  required
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtubeLink}
                  onChange={(event) => setForm((current) => ({ ...current, youtubeLink: event.target.value }))}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Duração (minutos)">
                  <Input
                    required
                    type="number"
                    min={1}
                    max={600}
                    value={form.duration}
                    onChange={(event) => setForm((current) => ({ ...current, duration: Number(event.target.value) }))}
                  />
                </Field>
                <Field label="Ordem da aula">
                  <Input
                    required
                    type="number"
                    min={1}
                    max={10000}
                    value={form.orderIndex}
                    onChange={(event) => setForm((current) => ({ ...current, orderIndex: Number(event.target.value) }))}
                  />
                </Field>
                <Field label="Estado">
                  <Select
                    value={form.isActive ? "PUBLISHED" : "HIDDEN"}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      isActive: event.target.value === "PUBLISHED",
                    }))}
                  >
                    <option value="PUBLISHED">Publicar agora</option>
                    <option value="HIDDEN">Guardar oculta</option>
                  </Select>
                </Field>
              </div>

              <Field label="Quem pode assistir">
                <Select
                  value={form.accessLevel}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    accessLevel: event.target.value as "PUBLIC" | "PRIVATE",
                  }))}
                >
                  <option value="PUBLIC">Pública — disponível mesmo sem inscrição</option>
                  <option value="PRIVATE">Privada — somente estudantes inscritos e pagos</option>
                </Select>
              </Field>

              <div className={`flex items-start gap-3 rounded-xl border p-4 ${
                form.accessLevel === "PUBLIC"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-200"
              }`}>
                <span className="material-symbols-outlined">
                  {form.accessLevel === "PUBLIC" ? "public" : "lock"}
                </span>
                <p className="text-xs leading-relaxed">
                  {form.accessLevel === "PUBLIC"
                    ? "Qualquer estudante autenticado poderá encontrar e assistir a esta aula."
                    : "O vídeo só será entregue a estudantes com inscrição ativa e pagamento confirmado nesta cadeira."}
                </p>
              </div>

              {formError && (
                <p
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={saving} disabled={!selectedCourse}>
                  {form.isActive ? "Publicar aula" : "Guardar aula"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

export default function TutorLessonsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-on-surface-variant">A carregar...</p>}>
      <TutorLessonsContent />
    </Suspense>
  );
}
