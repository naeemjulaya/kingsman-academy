"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const networkDefaults = {
  facebook_url: "https://www.facebook.com/profile.php?id=61592054880342",
  youtube_url: "https://www.youtube.com/@KINGSMANGulele",
  instagram_url: "https://www.instagram.com/kinsgman.academy.mz?igsh=MTk2MW5ueTgzZDl3ZQ==",
  tiktok_url: "",
};

const networks = [
  { key: "facebook_url", name: "Facebook", icon: "public", description: "Notícias e novidades da Kingsman Academy." },
  { key: "youtube_url", name: "YouTube", icon: "smart_display", description: "Vídeos, aulas e conteúdos académicos." },
  { key: "instagram_url", name: "Instagram", icon: "photo_camera", description: "Acompanhe atividades e conteúdos da comunidade." },
  { key: "tiktok_url", name: "TikTok", icon: "music_note", description: "Conteúdos breves e dicas de estudo." },
] as const;

type ResourceRow = {
  course_id: string;
  course_name: string;
  tutor_id: string | null;
  tutor_name: string | null;
  whatsapp_group_url: string | null;
  has_paid_access: boolean;
};

type CourseResources = {
  id: string;
  name: string;
  hasPaidAccess: boolean;
  tutors: Array<{ id: string; name: string; whatsappUrl: string | null }>;
};

export default function StudentSocialResourcesPage() {
  const [socials, setSocials] = useState<Record<string, string>>(networkDefaults);
  const [rows, setRows] = useState<ResourceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [settingsResponse, resourcesResult] = await Promise.all([
          fetch("/api/settings", { cache: "no-store" }),
          createClient().rpc("get_student_course_resources"),
        ]);

        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setSocials({ ...networkDefaults, ...settings });
        }
        if (resourcesResult.error) throw resourcesResult.error;
        setRows((resourcesResult.data as ResourceRow[] | null) ?? []);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os recursos.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const courses = useMemo(() => {
    const grouped = new Map<string, CourseResources>();
    for (const row of rows) {
      const current = grouped.get(row.course_id) ?? {
        id: row.course_id,
        name: row.course_name,
        hasPaidAccess: row.has_paid_access,
        tutors: [],
      };
      if (row.tutor_id && !current.tutors.some((tutor) => tutor.id === row.tutor_id)) {
        current.tutors.push({
          id: row.tutor_id,
          name: row.tutor_name || "Explicador",
          whatsappUrl: row.whatsapp_group_url,
        });
      }
      grouped.set(row.course_id, current);
    }
    return [...grouped.values()];
  }, [rows]);

  return (
    <RouteGuard allowedRoles={["ESTUDANTE"]}>
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Comunidade Kingsman</span>
          <h1 className="mt-1 font-playfair text-3xl font-bold uppercase">Redes Sociais e Recursos</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Acompanhe a Kingsman e aceda aos grupos e materiais das suas cadeiras.</p>
        </div>

        <section className="space-y-4">
          <h2 className="font-playfair text-xl font-bold">Redes oficiais</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {networks.map((network) => {
              const url = socials[network.key];
              return (
                <Card key={network.key} className="flex min-h-48 flex-col justify-between p-5">
                  <div>
                    <span className="material-symbols-outlined text-3xl text-primary">{network.icon}</span>
                    <h3 className="mt-3 font-playfair text-lg font-bold">{network.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{network.description}</p>
                  </div>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-5 rounded-lg bg-primary/10 px-4 py-2 text-center text-xs font-bold text-primary hover:bg-primary/20">
                      Visitar página
                    </a>
                  ) : (
                    <span className="mt-5 rounded-lg bg-surface-container px-4 py-2 text-center text-xs font-semibold text-on-surface-variant">Em breve</span>
                  )}
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-playfair text-xl font-bold">Grupos e materiais por cadeira</h2>
            <p className="mt-1 text-xs text-on-surface-variant">Os materiais ficam disponíveis na página de cada cadeira. Os conteúdos premium e os grupos de WhatsApp são desbloqueados após a confirmação do pagamento.</p>
          </div>

          {loading ? (
            <Card className="p-8 text-center text-sm text-on-surface-variant">A carregar recursos…</Card>
          ) : error ? (
            <Card className="p-6 text-sm text-red-300">{error}</Card>
          ) : courses.length === 0 ? (
            <Card className="p-8 text-center text-sm text-on-surface-variant">Ainda não existem recursos configurados.</Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {courses.map((course) => (
                <Card key={course.id} className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-playfair text-xl font-bold">{course.name}</h3>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${course.hasPaidAccess ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
                      {course.hasPaidAccess ? "Acesso completo" : "Acesso gratuito"}
                    </span>
                  </div>

                  <Link href={`/estudante/cadeiras/${course.id}`} className="flex items-center justify-between rounded-lg bg-primary/10 p-4 text-sm font-bold text-primary hover:bg-primary/20">
                    <span className="flex items-center gap-2"><span className="material-symbols-outlined">folder_open</span> Ver materiais da cadeira</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>

                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Grupos de WhatsApp</h4>
                    <div className="mt-3 space-y-2">
                      {course.tutors.length ? course.tutors.map((tutor) => (
                        <div key={tutor.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-container-low p-3">
                          <span className="text-sm font-semibold">{tutor.name}</span>
                          {tutor.whatsappUrl ? (
                            <a href={tutor.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-emerald-300 hover:underline">Entrar no grupo</a>
                          ) : (
                            <span className="text-[10px] text-on-surface-variant">{course.hasPaidAccess ? "Ainda não configurado" : "Bloqueado"}</span>
                          )}
                        </div>
                      )) : <p className="text-xs text-on-surface-variant">Nenhum explicador associado.</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </RouteGuard>
  );
}
