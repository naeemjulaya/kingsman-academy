"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { getCourseDescription } from "@/lib/course-descriptions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTutorScope } from "@/hooks/use-tutor-scope";
import { createClient } from "@/lib/supabase/client";

type ResourceLinks = {
  whatsapp: string;
};

export default function TutorCoursesPage() {
  const { profileId, courses, loading, error } = useTutorScope();
  const [links, setLinks] = useState<Record<string, ResourceLinks>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});

  useEffect(() => {
    createClient().rpc("get_tutor_resource_links").then(({ data }) => {
      const values: Record<string, ResourceLinks> = {};
      for (const row of (data ?? []) as Array<{ course_id: string; whatsapp_group_url: string | null }>) {
        values[row.course_id] = {
          whatsapp: row.whatsapp_group_url || "",
        };
      }
      setLinks(values);
    });
  }, []);

  const updateLink = (courseId: string, field: keyof ResourceLinks, value: string) => {
    setLinks((current) => {
      const previous = current[courseId] ?? { whatsapp: "" };
      return { ...current, [courseId]: { ...previous, [field]: value } };
    });
    setMessage((current) => ({ ...current, [courseId]: "" }));
  };

  const saveLinks = async (courseId: string) => {
    if (!profileId) return;
    setSaving(courseId);
    const values = links[courseId] ?? { whatsapp: "" };
    try {
      const supabase = createClient();
      const whatsappResult = await supabase.rpc("save_course_whatsapp_link", {
        p_course_id: courseId,
        p_tutor_id: profileId,
        p_whatsapp_group_url: values.whatsapp.trim(),
      });
      if (whatsappResult.error) throw whatsappResult.error;
      setMessage((current) => ({ ...current, [courseId]: "Links guardados com sucesso." }));
    } catch (saveError) {
      setMessage((current) => ({ ...current, [courseId]: saveError instanceof Error ? saveError.message : "Não foi possível guardar os links." }));
    } finally {
      setSaving(null);
    }
  };

  return (
    <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Minhas Cadeiras</h1>
          <p className="mt-1 text-sm text-on-surface-variant/70">Cadeiras que lhe foram atribuídas pelo administrador.</p>
        </div>
        {loading ? <p className="text-sm text-on-surface-variant">A carregar...</p> : error ? (
          <Card className="p-6 text-sm text-red-300">{error}</Card>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center text-sm text-on-surface-variant">Ainda não tem cadeiras atribuídas.</Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant={course.is_active ? "success" : "danger"}>{course.is_active ? "Ativa" : "Inativa"}</Badge>
                  <span className="text-xs text-on-surface-variant">{course.department || "Sem departamento"}</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-playfair text-xl font-bold">{course.name}</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">{getCourseDescription(course.name, course.description)}</p>
                  <p className="mt-3 text-xs text-on-surface-variant">{course.university || "Instituição não definida"}</p>
                </div>
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <ResourceField label="Grupo de WhatsApp" placeholder="https://chat.whatsapp.com/..." value={links[course.id]?.whatsapp ?? ""} onChange={(value) => updateLink(course.id, "whatsapp", value)} />
                  {message[course.id] && <p className="text-xs text-on-surface-variant" role="status">{message[course.id]}</p>}
                  <Button type="button" variant="primary" isLoading={saving === course.id} onClick={() => void saveLinks(course.id)} className="w-full text-xs font-bold uppercase">
                    Guardar links
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/explicador/aulas?course=${course.id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-bold text-primary hover:bg-primary/20">Aulas</Link>
                  <Link href={`/explicador/materiais?course=${course.id}`} className="rounded-lg bg-surface-container px-3 py-2 text-center text-xs font-bold hover:bg-surface-container-high">Materiais</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}

function ResourceField({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
      <Input type="url" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
