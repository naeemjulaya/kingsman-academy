"use client";

import { useEffect, useState } from "react";

const labels: Record<string, string> = {
  facebook_url: "Facebook",
  instagram_url: "Instagram",
  youtube_url: "YouTube",
  linkedin_url: "LinkedIn",
  whatsapp_url: "WhatsApp",
  tiktok_url: "TikTok",
};

export function SocialLinks() {
  const [links, setLinks] = useState<Record<string, string>>({});
  useEffect(() => {
    fetch("/api/settings").then((response) => response.json()).then(setLinks).catch(() => undefined);
  }, []);

  const visible = Object.entries(links).filter(([key, url]) => key in labels && Boolean(url));
  if (!visible.length) return <span className="text-xs text-on-surface-variant">Redes sociais em breve</span>;

  return (
    <div className="flex flex-wrap gap-3 pt-2" aria-label="Redes sociais">
      {visible.map(([network, url]) => (
        <a key={network} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
          {labels[network] ?? network}
        </a>
      ))}
    </div>
  );
}
