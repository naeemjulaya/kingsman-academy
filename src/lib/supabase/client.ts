import { createBrowserClient } from "@supabase/ssr";

function buildClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Configuração do Supabase em falta");
  return createBrowserClient(url, key);
}

let browserClient: ReturnType<typeof buildClient> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  browserClient = buildClient();
  return browserClient;
}
