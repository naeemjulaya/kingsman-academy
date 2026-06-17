"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockStudentData, mockNotifications } from "@/lib/mockData";

import { RouteGuard } from "@/components/auth/route-guard";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "info";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("A nova palavra-passe e a confirmação não coincidem.");
      return;
    }
    alert("Palavra-passe alterada com sucesso!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <RouteGuard allowedRoles={["ESTUDANTE", "EXPLICADOR", "COORDENADOR", "ADMIN"]}>
      <div className="space-y-8 max-w-[1000px] mx-auto">
      {/* Profile Header Card */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left border-primary/10">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
          <img
            alt="Profile Big Avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2Q2-DUXyCvl9clOmukXUATsRAaZoDLQ02qyBRMKJmFbJEq8oEsyQm2syEISHXyUBv9M-k2C8eg8ktUTgL9b1R1qOcpScYiIMkIvNx6UgGXdLcpMbShLjUYEMHfssgDcIvysxzcWklGQF9Zqy0_UKnS075gizNqUYyX63PiI2tQz2POwdpfXCttMNJcQIwkydkoWqH0fdUAZvngDSX0qwk5fdRnIJxeco1qfv2swshNVeIj9PBy1cFZbskAzAimPsGd5188-5D7V0j"
          />
        </div>
        <div className="space-y-3 flex-1">
          <div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h2 className="font-playfair text-2xl font-bold text-on-surface">{mockStudentData.name}</h2>
              <Badge variant="primary">Estudante Elite</Badge>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mt-1">UEM - Univ. Eduardo Mondlane</p>
          </div>
          <p className="text-xs text-[#808080] font-bold uppercase tracking-wider">ID Académico: {mockStudentData.id}</p>
        </div>
      </Card>

      {/* Profile Tabs Layout */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="activity">Actividade</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Informacoes Tab */}
        <TabsContent value="info" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-playfair text-lg font-bold text-primary">Dados Pessoais</h3>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant">Nome Completo:</span>
                  <span className="text-on-surface font-semibold">Keven Gulele</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant">Email Institucional:</span>
                  <span className="text-on-surface font-semibold">keven.gulele@uem.ac.mz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Contacto Móvel:</span>
                  <span className="text-on-surface font-semibold">+258 84 123 4567</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-playfair text-lg font-bold text-primary">Dados Académicos</h3>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant">Instituição:</span>
                  <span className="text-on-surface font-semibold">Univ. Eduardo Mondlane</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant">Curso de Frequência:</span>
                  <span className="text-on-surface font-semibold">Medicina</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ano Curricular:</span>
                  <span className="text-on-surface font-semibold">2º Ano</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card className="p-6">
            <h3 className="font-playfair text-lg font-bold mb-6 text-primary">Registo de Actividade</h3>
            <div className="relative border-l border-primary/10 pl-6 space-y-6">
              {mockStudentData.recentActivity.map((activity, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0A0A0A] border border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <span className="text-sm text-on-surface font-semibold">{activity.message}</span>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mt-1">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-playfair text-lg font-bold text-primary mb-4">Central de Notificações</h3>
            <div className="space-y-3">
              {mockNotifications.map((n) => (
                <div key={n.id} className="p-4 rounded-lg bg-[#1b1019]/40 border border-primary/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${!n.is_read ? "bg-primary" : "bg-[#808080]"}`}></span>
                      <span className="text-sm font-bold text-on-surface">{n.title}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant/95 pl-4 leading-relaxed">{n.content}</p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{n.created_at}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="p-6">
            <h3 className="font-playfair text-lg font-bold text-primary mb-6">Alterar Palavra-Passe</h3>
            <form onSubmit={handlePasswordReset} className="max-w-md space-y-4">
              <div>
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Palavra-Passe Actual</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Nova Palavra-Passe</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Confirmar Nova Palavra-Passe</label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" className="px-6 font-bold uppercase tracking-wider">
                Atualizar Senha
              </Button>
            </form>
          </Card>

          <Card className="p-6">
            <h3 className="font-playfair text-lg font-bold text-primary mb-4">Sessões Activas</h3>
            <div className="p-4 rounded-lg bg-[#1b1019]/40 border border-primary/5 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-2xl">laptop</span>
                <div>
                  <p className="text-on-surface font-bold">Firefox em Windows 11</p>
                  <p className="text-[#808080]">IP: 196.28.42.109 • Maputo, Moçambique</p>
                </div>
              </div>
              <Badge variant="success">Sessão Atual</Badge>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </RouteGuard>
  );
}
