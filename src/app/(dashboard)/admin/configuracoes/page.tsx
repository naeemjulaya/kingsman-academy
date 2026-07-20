"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Settings {
  platform_name: string;
  contact_email: string;
  contact_phone: string;
  logo_url: string;
  mpesa_number: string;
  emola_number: string;
  bank_details: string;
  payment_review_hours: number;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  linkedin_url: string;
  whatsapp_url: string;
}

const defaults: Settings = {
  platform_name: "Kingsman Academy",
  contact_email: "suporte@kingsman.academy",
  contact_phone: "",
  logo_url: "",
  mpesa_number: "",
  emola_number: "",
  bank_details: "",
  payment_review_hours: 24,
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  linkedin_url: "",
  whatsapp_url: "",
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("geral");
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Erro ao carregar configurações");
        setSettings({ ...defaults, ...result });
      })
      .catch((error) => setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao carregar configurações" }))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Erro ao guardar configurações");
      setMessage({ type: "success", text: "Configurações guardadas e disponíveis para toda a plataforma." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao guardar configurações" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1000px] mx-auto p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Configurações da Plataforma</h1>
          <p className="text-sm text-on-surface-variant/70 mt-1">
            Defina contactos públicos, instruções dos pagamentos manuais e redes sociais.
          </p>
        </div>

        {message && (
          <div className={`rounded-lg border p-4 text-sm ${message.type === "success" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <Card className="p-10 text-center text-sm text-on-surface-variant">A carregar configurações…</Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="geral">Identidade e Contactos</TabsTrigger>
              <TabsTrigger value="pagamentos">Pagamentos Manuais</TabsTrigger>
              <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSave} className="mt-6 space-y-6">
              <TabsContent value="geral" className="space-y-6">
                <Card className="p-6 space-y-5">
                  <div>
                    <h2 className="font-playfair text-lg font-bold text-primary">Identidade pública</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Informações apresentadas aos estudantes nos pontos de contacto da plataforma.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nome da plataforma">
                      <Input required value={settings.platform_name} onChange={(e) => update("platform_name", e.target.value)} />
                    </Field>
                    <Field label="Email de suporte">
                      <Input required type="email" value={settings.contact_email} onChange={(e) => update("contact_email", e.target.value)} />
                    </Field>
                    <Field label="Telefone de suporte">
                      <Input type="tel" placeholder="+258 84 000 0000" value={settings.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} />
                    </Field>
                    <Field label="URL do logótipo">
                      <Input type="url" placeholder="https://..." value={settings.logo_url} onChange={(e) => update("logo_url", e.target.value)} />
                    </Field>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="pagamentos" className="space-y-6">
                <Card className="p-6 space-y-5">
                  <div>
                    <h2 className="font-playfair text-lg font-bold text-primary">Dados para pagamento manual</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Estes dados são mostrados ao estudante no checkout. Não são chaves de API.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Número ou código M-Pesa">
                      <Input placeholder="Ex.: 84 000 0000" value={settings.mpesa_number} onChange={(e) => update("mpesa_number", e.target.value)} />
                    </Field>
                    <Field label="Número ou código e-Mola">
                      <Input placeholder="Ex.: 86 000 0000" value={settings.emola_number} onChange={(e) => update("emola_number", e.target.value)} />
                    </Field>
                    <Field label="Prazo de validação (horas)">
                      <Input required type="number" min={1} max={168} value={settings.payment_review_hours} onChange={(e) => update("payment_review_hours", Number(e.target.value))} />
                    </Field>
                  </div>
                  <Field label="Dados bancários e instruções adicionais">
                    <Textarea rows={5} placeholder="Banco, NIB/IBAN, nome do titular e referência a utilizar..." value={settings.bank_details} onChange={(e) => update("bank_details", e.target.value)} />
                  </Field>
                </Card>
              </TabsContent>

              <TabsContent value="redes" className="space-y-6">
                <Card className="p-6 space-y-5">
                  <div>
                    <h2 className="font-playfair text-lg font-bold text-primary">Redes sociais</h2>
                    <p className="text-xs text-on-surface-variant mt-1">Apenas links preenchidos serão exibidos no rodapé público.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries({ facebook_url: "Facebook", instagram_url: "Instagram", youtube_url: "YouTube", linkedin_url: "LinkedIn", whatsapp_url: "WhatsApp" }).map(([key, label]) => (
                      <Field label={label} key={key}>
                        <Input type="url" placeholder="https://..." value={settings[key as keyof Settings] as string} onChange={(e) => update(key as keyof Settings, e.target.value)} />
                      </Field>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" isLoading={saving} className="px-8 font-bold uppercase tracking-wider">
                  Guardar Alterações
                </Button>
              </div>
            </form>
          </Tabs>
        )}
      </div>
    </RouteGuard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
