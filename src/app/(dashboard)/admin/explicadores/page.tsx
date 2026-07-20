"use client";

import React, { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/errors";

interface Explicador {
  id: string;
  name: string;
  email: string;
  speciality: string;
  courses_count: number;
  videos_count: number;
  avatar_url: string;
  bio: string;
  is_active: boolean;
  account_role: "EXPLICADOR" | "ADMIN";
  password?: string;
}

export default function ExplicadoresPage() {
  const supabase = createClient();
  const [explicadores, setExplicadores] = useState<Explicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialityFilter, setSpecialityFilter] = useState("TODOS");

  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedExplicador, setSelectedExplicador] = useState<Partial<Explicador>>({
    name: "",
    email: "",
    speciality: "",
    bio: "",
    avatar_url: "",
    courses_count: 0,
    videos_count: 0,
    is_active: true
  });

  useEffect(() => {
    fetchExplicadores();
  }, []);

  const fetchExplicadores = async () => {
    setLoading(true);
    try {
      // Administrators may also teach without losing their administrative role.
      const { data: tutorsData, error: tutorsError } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["EXPLICADOR", "ADMIN"])
        .order("full_name", { ascending: true });

      if (tutorsError) throw tutorsError;

      const extendedTutors = await Promise.all(
        (tutorsData || []).map(async (t: any) => {
          // Count assigned courses
          const { count: coursesCount } = await supabase
            .from("course_tutors")
            .select("id", { count: "exact", head: true })
            .eq("tutor_id", t.id)
            .eq("is_active", true);

          // Get the course ids assigned to this tutor
          const { data: tutorCourses } = await supabase
            .from("course_tutors")
            .select("course_id")
            .eq("tutor_id", t.id)
            .eq("is_active", true);

          const courseIds = (tutorCourses || []).map(tc => tc.course_id);

          let videosCount = 0;
          if (courseIds.length > 0) {
            // Count lessons for these courses
            const { count: lessonsCount } = await supabase
              .from("lessons")
              .select("id", { count: "exact", head: true })
              .in("course_id", courseIds);
            videosCount = lessonsCount || 0;
          }

          return {
            id: t.id,
            name: t.full_name,
            email: t.email,
            speciality: t.university || "Docência Geral",
            courses_count: coursesCount || 0,
            videos_count: videosCount,
            avatar_url: t.avatar_url || "",
            bio: t.phone || "", // Storing phone in bio placeholder if nothing else, or keeping static bio
            is_active: t.status === "active",
            account_role: t.role,
          };
        })
      );

      // An administrator is listed here only when they actually teach a course.
      // This keeps ordinary administrative accounts out of the tutor directory.
      setExplicadores(extendedTutors.filter(
        (t) => t.account_role === "EXPLICADOR" || t.courses_count > 0
      ));
    } catch (error) {
      console.error("Erro ao carregar explicadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedExplicador({
      name: "",
      email: "",
      speciality: "",
      bio: "",
      avatar_url: "",
      courses_count: 0,
      videos_count: 0,
      is_active: true
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (tutor: Explicador) => {
    setSelectedExplicador(tutor);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/tutors", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedExplicador),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível guardar o explicador");

      setIsOpen(false);
      fetchExplicadores();
    } catch (error: unknown) {
      alert("Erro ao gravar explicador: " + getErrorMessage(error));
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const newStatus = currentActive ? "inactive" : "active";
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setExplicadores(prev => prev.map(t => t.id === id ? { ...t, is_active: !currentActive } : t));
    } catch (error: unknown) {
      alert("Erro ao alterar o estado do explicador: " + getErrorMessage(error));
    }
  };

  const filteredExplicadores = explicadores.filter(t => {
    const nameStr = t.name || "";
    const emailStr = t.email || "";
    const matchesSearch = nameStr.toLowerCase().includes(search.toLowerCase()) ||
      emailStr.toLowerCase().includes(search.toLowerCase());
    const matchesSpeciality = specialityFilter === "TODOS" || t.speciality.toLowerCase().includes(specialityFilter.toLowerCase());
    return matchesSearch && matchesSpeciality;
  });

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1440px] mx-auto p-4 md:p-6">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Gestão de Explicadores</h1>
            <p className="text-sm text-on-surface-variant/70 mt-1">
              Registe e controle as contas e especialidades dos professores na plataforma.
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} className="w-full md:w-auto font-bold uppercase tracking-wider">
            + Adicionar Explicador
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Pesquisar Explicador</label>
            <Input
              placeholder="Nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Filtrar Faculdade / Especialidade</label>
            <Select value={specialityFilter} onChange={(e) => setSpecialityFilter(e.target.value)}>
              <option value="TODOS">Todas as Especialidades</option>
              <option value="UEM">UEM</option>
              <option value="UP">Universidade Pedagógica</option>
              <option value="ISCTEM">ISCTEM</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => { setSearch(""); setSpecialityFilter("TODOS"); }} className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </Card>

        {/* Tabela de Explicadores */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Carregando explicadores da base de dados...
            </div>
          ) : filteredExplicadores.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Explicador</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Cadeiras</TableHead>
                    <TableHead>Nº Aulas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExplicadores.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-semibold text-on-surface flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-primary/20 shrink-0 bg-surface-container flex items-center justify-center">
                          {t.avatar_url ? (
                            <img alt={t.name} className="w-full h-full object-cover" src={t.avatar_url} />
                          ) : (
                            <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                          )}
                        </div>
                        <span>{t.name}</span>
                        {t.account_role === "ADMIN" && <Badge variant="primary">Admin</Badge>}
                      </TableCell>
                      <TableCell>{t.email}</TableCell>
                      <TableCell className="font-medium">{t.speciality}</TableCell>
                      <TableCell className="font-semibold text-primary">{t.courses_count} cadeiras</TableCell>
                      <TableCell>{t.videos_count} aulas</TableCell>
                      <TableCell>
                        <Badge variant={t.is_active ? "success" : "danger"}>
                          {t.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActive(t.id, t.is_active)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${t.is_active
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                          >
                            {t.is_active ? "Desativar" : "Ativar"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Nenhum explicador encontrado.
            </div>
          )}
        </Card>

        {/* Modal de Criação / Edição */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent onClose={() => setIsOpen(false)}>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Editar Ficha de Explicador" : "Adicionar Explicador"}</DialogTitle>
              <DialogDescription>Preencha as informações do docente responsável.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Nome Completo</label>
                <Input
                  required
                  placeholder="Ex: Prof. Keven Gulele"
                  value={selectedExplicador.name}
                  onChange={(e) => setSelectedExplicador({ ...selectedExplicador, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                  {isEdit ? "Nova palavra-passe (opcional)" : "Palavra-passe temporária (opcional)"}
                </label>
                <Input
                  type="password"
                  minLength={8}
                  placeholder={isEdit ? "Deixe vazio para não alterar" : "Gerada automaticamente se ficar vazio"}
                  value={selectedExplicador.password ?? ""}
                  onChange={(e) => setSelectedExplicador({ ...selectedExplicador, password: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Email de Contacto</label>
                <Input
                  type="email"
                  required
                  placeholder="Ex: keven@kingsman.academy"
                  value={selectedExplicador.email}
                  onChange={(e) => setSelectedExplicador({ ...selectedExplicador, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Instituição / Especialidade</label>
                <Input
                  required
                  placeholder="Ex: UEM - Ciências Médicas"
                  value={selectedExplicador.speciality}
                  onChange={(e) => setSelectedExplicador({ ...selectedExplicador, speciality: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Foto de Perfil (URL)</label>
                <Input
                  placeholder="Link para a imagem..."
                  value={selectedExplicador.avatar_url}
                  onChange={(e) => setSelectedExplicador({ ...selectedExplicador, avatar_url: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {isEdit ? "Guardar Alterações" : "Adicionar Explicador"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
