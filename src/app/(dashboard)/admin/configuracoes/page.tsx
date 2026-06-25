"use client";

import React, { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Switch } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState("geral");

  // State: Geral
  const [nomePlataforma, setNomePlataforma] = useState("Kingsman Academy");
  const [emailContacto, setEmailContacto] = useState("suporte@kingsman.academy");
  const [logoUrl, setLogoUrl] = useState("https://kingsman.academy/logo.png");

  // State: Pagamentos
  const [mpesaKey, setMpesaKey] = useState("api_prod_mpesa_84920491823901");
  const [mensalidadePreco, setMensalidadePreco] = useState(750);
  const [precoAvulso, setPrecoAvulso] = useState(150);

  // State: Notificações
  const [notifInscricoes, setNotifInscricoes] = useState(true);
  const [notifPagamentos, setNotifPagamentos] = useState(true);
  const [emailTemplate, setEmailTemplate] = useState(
    "Olá {{student_name}},\n\nO teu pagamento para a cadeira de {{course_name}} foi recebido e validado com sucesso. Bons estudos!\n\nAtenciosamente,\nEquipa Kingsman Academy."
  );

  // State: Segurança
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [sessionTimeout, setSessionTimeout] = useState(60); // minutos

  // Carregar dados guardados do LocalStorage ao iniciar (visto não haver tabela de config dedicada no schema)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setNomePlataforma(localStorage.getItem("config_nomePlataforma") || "Kingsman Academy");
      setEmailContacto(localStorage.getItem("config_emailContacto") || "suporte@kingsman.academy");
      setLogoUrl(localStorage.getItem("config_logoUrl") || "https://kingsman.academy/logo.png");
      setMpesaKey(localStorage.getItem("config_mpesaKey") || "api_prod_mpesa_84920491823901");
      setMensalidadePreco(Number(localStorage.getItem("config_mensalidadePreco")) || 750);
      setPrecoAvulso(Number(localStorage.getItem("config_precoAvulso")) || 150);
      setNotifInscricoes(localStorage.getItem("config_notifInscricoes") !== "false");
      setNotifPagamentos(localStorage.getItem("config_notifPagamentos") !== "false");
      setEmailTemplate(localStorage.getItem("config_emailTemplate") || emailTemplate);
      setMinPasswordLength(Number(localStorage.getItem("config_minPasswordLength")) || 8);
      setSessionTimeout(Number(localStorage.getItem("config_sessionTimeout")) || 60);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("config_nomePlataforma", nomePlataforma);
      localStorage.setItem("config_emailContacto", emailContacto);
      localStorage.setItem("config_logoUrl", logoUrl);
      localStorage.setItem("config_mpesaKey", mpesaKey);
      localStorage.setItem("config_mensalidadePreco", mensalidadePreco.toString());
      localStorage.setItem("config_precoAvulso", precoAvulso.toString());
      localStorage.setItem("config_notifInscricoes", notifInscricoes.toString());
      localStorage.setItem("config_notifPagamentos", notifPagamentos.toString());
      localStorage.setItem("config_emailTemplate", emailTemplate);
      localStorage.setItem("config_minPasswordLength", minPasswordLength.toString());
      localStorage.setItem("config_sessionTimeout", sessionTimeout.toString());

      alert("Configurações do sistema gravadas localmente com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao gravar configurações.");
    }
  };

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1000px] mx-auto p-4 md:p-6">

        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Configurações do Sistema</h1>
          <p className="text-sm text-on-surface-variant/70 mt-1">
            Controle e edite parâmetros de funcionamento da plataforma, métodos de pagamento e segurança.
          </p>
        </div>

        {/* Layout de abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSave} className="mt-6 space-y-6">

            {/* Aba Geral */}
            <TabsContent value="geral" className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-playfair text-lg font-bold text-primary">Informações da Plataforma</h3>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Nome da Plataforma</label>
                  <Input
                    value={nomePlataforma}
                    onChange={(e) => setNomePlataforma(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Email de Contacto</label>
                  <Input
                    type="email"
                    value={emailContacto}
                    onChange={(e) => setEmailContacto(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">URL do Logótipo</label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Aba Pagamentos */}
            <TabsContent value="pagamentos" className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-playfair text-lg font-bold text-primary">Integrações & Preços</h3>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Chave de Produção M-Pesa (API)</label>
                  <Input
                    type="password"
                    value={mpesaKey}
                    onChange={(e) => setMpesaKey(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Preço Mensal (MT)</label>
                    <Input
                      type="number"
                      value={mensalidadePreco}
                      onChange={(e) => setMensalidadePreco(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Preço por Aula Avulsa (MT)</label>
                    <Input
                      type="number"
                      value={precoAvulso}
                      onChange={(e) => setPrecoAvulso(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Aba Notificações */}
            <TabsContent value="notificacoes" className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-playfair text-lg font-bold text-primary">Configurações de Alerta</h3>

                <div className="flex items-center justify-between border-b border-primary/5 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Notificar sobre Novas Inscrições</p>
                    <p className="text-xs text-on-surface-variant/70">Receber alertas de e-mail ao criar novos utilizadores.</p>
                  </div>
                  <Switch checked={notifInscricoes} onCheckedChange={setNotifInscricoes} />
                </div>

                <div className="flex items-center justify-between border-b border-primary/5 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Notificar Confirmação de Pagamento</p>
                    <p className="text-xs text-on-surface-variant/70">Disparar recibo para o aluno após validação administrativa.</p>
                  </div>
                  <Switch checked={notifPagamentos} onCheckedChange={setNotifPagamentos} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Template de Confirmação (E-mail)</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-lg bg-surface-container border-none p-3 text-sm text-on-surface focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                  />
                  <p className="text-[10px] text-[#808080]">Variáveis dinâmicas aceites: {"{{student_name}}"}, {"{{course_name}}"}</p>
                </div>
              </Card>
            </TabsContent>

            {/* Aba Segurança */}
            <TabsContent value="seguranca" className="space-y-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-playfair text-lg font-bold text-primary">Políticas de Segurança</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Comprimento Mínimo Password</label>
                    <Input
                      type="number"
                      value={minPasswordLength}
                      onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Timeout de Sessão (Minutos)</label>
                    <Input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Botão de Gravar */}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" className="px-8 font-bold uppercase tracking-wider">
                Guardar Alterações
              </Button>
            </div>

          </form>
        </Tabs>
      </div>
    </RouteGuard>
  );
}
