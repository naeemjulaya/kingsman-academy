"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RouteGuard } from "@/components/auth/route-guard";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "info";
  const { user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setProfile(profileData);

      // Fetch Notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (notifs) {
        setNotifications(notifs);
        // We use notifications as activity log for now
        setActivity(notifs.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("A nova palavra-passe e a confirmação não coincidem.");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert("Palavra-passe alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      alert("Erro ao alterar a palavra-passe: " + error.message);
    }
  };

  if (loading || !profile) {
    return (
      <RouteGuard allowedRoles={["ESTUDANTE", "EXPLICADOR", "COORDENADOR", "ADMIN"]}>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["ESTUDANTE", "EXPLICADOR", "COORDENADOR", "ADMIN"]}>
      <div className="space-y-8 max-w-[1000px] mx-auto">
      {/* Profile Header Card */}
      <Card className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left border-primary/10">
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-surface-container-low flex items-center justify-center">
          {profile.avatar_url ? (
            <img
              alt="Profile Avatar"
              className="w-full h-full object-cover"
              src={profile.avatar_url}
            />
          ) : (
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
          )}
        </div>
        <div className="space-y-3 flex-1">
          <div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h2 className="font-playfair text-2xl font-bold text-on-surface">{profile.full_name}</h2>
              <Badge variant="primary">{profile.role}</Badge>
            </div>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              {profile.university || "Instituição não informada"}
            </p>
          </div>
          <p className="text-xs text-[#808080] font-bold uppercase tracking-wider">ID Académico: {profile.id.split('-')[0].toUpperCase()}</p>
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
                  <span className="text-on-surface font-semibold">{profile.full_name}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant">Email Institucional:</span>
                  <span className="text-on-surface font-semibold">{profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Contacto Móvel:</span>
                  <span className="text-on-surface font-semibold">{profile.phone || "Não informado"}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-playfair text-lg font-bold text-primary">Dados Académicos</h3>
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant">Instituição:</span>
                  <span className="text-on-surface font-semibold">{profile.university || "Não informada"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-on-surface-variant">Curso:</span>
                  <span className="text-on-surface font-semibold">{profile.course || "Não informado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ano de Estudo:</span>
                  <span className="text-on-surface font-semibold">{profile.year_of_study ? `${profile.year_of_study}º Ano` : "Não informado"}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card className="p-6">
            <h3 className="font-playfair text-lg font-bold mb-6 text-primary">Registo de Actividade Recente</h3>
            <div className="relative border-l border-primary/10 pl-6 space-y-6">
              {activity.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Nenhuma actividade registada.</p>
              ) : (
                activity.map((act) => (
                  <div key={act.id} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0A0A0A] border border-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <span className="text-sm text-on-surface font-semibold">{act.content}</span>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mt-1">
                        {new Date(act.created_at).toLocaleString("pt-PT")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-playfair text-lg font-bold text-primary mb-4">Central de Notificações</h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4">Não tens notificações.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-4 rounded-lg bg-[#1b1019]/40 border border-primary/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${!n.is_read ? "bg-primary" : "bg-[#808080]"}`}></span>
                        <span className="text-sm font-bold text-on-surface">{n.title}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant/95 pl-4 leading-relaxed">{n.content}</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                      {new Date(n.created_at).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card className="p-6">
            <h3 className="font-playfair text-lg font-bold text-primary mb-6">Alterar Palavra-Passe</h3>
            <form onSubmit={handlePasswordReset} className="max-w-md space-y-4">
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
                  <p className="text-on-surface font-bold">Sessão Atualizada</p>
                  <p className="text-[#808080]">Activa agora neste dispositivo</p>
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
