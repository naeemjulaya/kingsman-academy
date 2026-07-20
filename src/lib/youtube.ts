export function extractYouTubeId(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let candidate: string | null = null;
    if (host === "youtu.be") candidate = url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      candidate = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ?? null;
    }
    return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}
