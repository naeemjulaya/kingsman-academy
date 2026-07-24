"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";

const networkDefaults = {
  facebook_url: "https://www.facebook.com/profile.php?id=61592054880342",
  youtube_url: "https://www.youtube.com/@KINGSMANGulele",
  instagram_url: "https://www.instagram.com/kinsgman.academy.mz?igsh=MTk2MW5ueTgzZDl3ZQ==",
  tiktok_url: "",
};

const networks = [
  { key: "facebook_url", name: "Facebook", icon: "public", description: "Notícias, comunicados e novidades da Kingsman Academy." },
  { key: "youtube_url", name: "YouTube", icon: "smart_display", description: "Vídeos, aulas abertas e conteúdos académicos." },
  { key: "instagram_url", name: "Instagram", icon: "photo_camera", description: "Atividades, dicas e momentos da nossa comunidade." },
  { key: "tiktok_url", name: "TikTok", icon: "music_note", description: "Conteúdos breves e dicas práticas de estudo." },
] as const;

export default function StudentSocialResourcesPage() {
  const [socials, setSocials] = useState<Record<string, string>>(networkDefaults);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) return;
        const settings = await response.json();
        setSocials({ ...networkDefaults, ...settings });
      } catch (error) {
        console.error("Não foi possível carregar as redes sociais:", error);
      }
    }

    void load();
  }, []);

  return (
    <RouteGuard allowedRoles={["ESTUDANTE"]}>
      <div className="mx-auto max-w-[1200px] space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Comunidade Kingsman</span>
          <h1 className="mt-1 font-playfair text-3xl font-bold uppercase">Redes Sociais</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            Acompanhe os canais oficiais da Kingsman Academy. Os materiais e grupos das disciplinas ficam em Minhas Cadeiras.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {networks.map((network) => {
            const url = socials[network.key];
            return (
              <Card
                key={network.key}
                className="group flex min-h-56 flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <span className="material-symbols-outlined text-3xl">{network.icon}</span>
                  </div>
                  <h2 className="mt-5 font-playfair text-xl font-bold">{network.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{network.description}</p>
                </div>

                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    Visitar página
                    <span className="material-symbols-outlined text-[17px]">open_in_new</span>
                  </a>
                ) : (
                  <span className="mt-6 rounded-lg bg-surface-container px-4 py-2.5 text-center text-sm font-semibold text-on-surface-variant">
                    Em breve
                  </span>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </RouteGuard>
  );
}
