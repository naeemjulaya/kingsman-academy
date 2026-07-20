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

interface ExplicadorOption {
  id: string;
  full_name: string;
}

interface Cadeira {
  id: string;
  name: string;
  department: string;
  university: string;
  description: string;
  price_monthly: number;
  price_per_lesson: number;
  max_tutors: number;
  youtube_playlist_id: string;
  is_active: boolean;
  lessons_count?: number;
  tutor_names?: string[];
  tutor_ids?: string[];
}

export default function CadeirasPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Cadeira[]>([]);
  const [tutors, setTutors] = useState<ExplicadorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal de Criação / Edição
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCadeira, setSelectedCadeira] = useState<Partial<Cadeira>>({
    name: "",
    department: "",
    university: "UEM",
    description: "",
    price_monthly: 750,
    price_per_lesson: 150,
    max_tutors: 2,
    youtube_playlist_id: "",
    is_active: true,
    tutor_ids: []
  });

  // Modal de Eliminação
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cadeiraToDelete, setCadeiraToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Courses
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("name", { ascending: true });
      if (coursesError) throw coursesError;

      // 2. Fetch Tutors
      const { data: tutorsData, error: tutorsError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("role", ["EXPLICADOR", "ADMIN"])
        .eq("status", "active");
      if (tutorsError) throw tutorsError;
      setTutors(tutorsData as ExplicadorOption[] || []);

      // 3. For each course, fetch active tutor and count of lessons
      const extendedCourses = await Promise.all(
        (coursesData || []).map(async (c: any) => {
          // Count lessons
          const { count: lessonsCount } = await supabase
            .from("lessons")
            .select("id", { count: "exact", head: true })
            .eq("course_id", c.id);

          // Get every active tutor assigned to this course.
          const { data: tutorRel } = await supabase
            .from("course_tutors")
            .select(`
              tutor_id,
              profiles:tutor_id(full_name)
            `)
            .eq("course_id", c.id)
            .eq("is_active", true);

          const activeTutors = (tutorRel || []).map((relation) => {
            const profile = Array.isArray(relation.profiles) ? relation.profiles[0] : relation.profiles;
            return { id: relation.tutor_id, name: profile?.full_name || "Explicador sem nome" };
          });

          return {
            ...c,
            lessons_count: lessonsCount || 0,
            tutor_names: activeTutors.map((tutor) => tutor.name),
            tutor_ids: activeTutors.map((tutor) => tutor.id),
          };
        })
      );

      setCourses(extendedCourses);
    } catch (error) {
      console.error("Erro ao carregar dados das cadeiras:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedCadeira({
      name: "",
      department: "",
      university: "UEM",
      description: "",
      price_monthly: 750,
      price_per_lesson: 150,
      max_tutors: 2,
      youtube_playlist_id: "",
      is_active: true,
      tutor_ids: []
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (cadeira: Cadeira) => {
    setSelectedCadeira(cadeira);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.rpc("admin_save_course_v2", {
        p_id: isEdit ? selectedCadeira.id : null,
        p_name: selectedCadeira.name?.trim(),
        p_department: selectedCadeira.department?.trim() ?? "",
        p_university: selectedCadeira.university?.trim() || "UEM",
        p_description: selectedCadeira.description ?? "",
        p_price_monthly: Number(selectedCadeira.price_monthly ?? 750),
        p_price_per_lesson: Number(selectedCadeira.price_per_lesson ?? 150),
        p_max_tutors: Math.max(Number(selectedCadeira.max_tutors ?? 1), selectedCadeira.tutor_ids?.length ?? 0),
        p_youtube_playlist_id: selectedCadeira.youtube_playlist_id ?? "",
        p_is_active: selectedCadeira.is_active ?? true,
        p_tutor_ids: selectedCadeira.tutor_ids ?? [],
      });
      if (error) throw error;

      setIsOpen(false);
      fetchData();
    } catch (error: unknown) {
      alert("Erro ao gravar dados: " + getErrorMessage(error));
    }
  };

  const handleConfirmDelete = async () => {
    if (!cadeiraToDelete) return;
    try {
      // 1. Delete course tutors rels
      await supabase.from("course_tutors").delete().eq("course_id", cadeiraToDelete);
      // 2. Delete course
      const { error } = await supabase.from("courses").delete().eq("id", cadeiraToDelete);
      if (error) throw error;

      setCourses(prev => prev.filter(c => c.id !== cadeiraToDelete));
      setIsDeleteOpen(false);
      setCadeiraToDelete(null);
    } catch (error: unknown) {
      alert("Erro ao eliminar a cadeira (certifique-se de que não tem inscrições/pagamentos associados): " + getErrorMessage(error));
    }
  };

  const filteredCadeiras = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1440px] mx-auto p-4 md:p-6">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Gestão de Cadeiras</h1>
            <p className="text-sm text-on-surface-variant/70 mt-1">
              Gira as cadeiras académicas e explicadores associados na plataforma Kingsman.
            </p>
          </div>
          <Button variant="primary" onClick={handleOpenCreate} className="w-full md:w-auto font-bold uppercase tracking-wider">
            + Adicionar Cadeira
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Filtrar por Cadeira ou Faculdade</label>
            <Input
              placeholder="Pesquise por nome ou departamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>

        {/* Tabela de Cadeiras */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Carregando cadeiras da base de dados...
            </div>
          ) : filteredCadeiras.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Cadeira</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Nº Aulas</TableHead>
                    <TableHead>Explicador Responsável</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCadeiras.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-on-surface flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-primary inline-block" />
                        {c.name}
                      </TableCell>
                      <TableCell>{c.department}</TableCell>
                      <TableCell className="font-medium text-primary">{c.lessons_count} aulas</TableCell>
                      <TableCell className="font-medium text-on-surface">
                        {c.tutor_names?.length ? c.tutor_names.join(", ") : "Sem Explicador"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? "success" : "danger"}>
                          {c.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => { setCadeiraToDelete(c.id); setIsDeleteOpen(true); }}
                            className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Eliminar
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
              Nenhuma cadeira registada.
            </div>
          )}
        </Card>

        {/* Modal de Criação / Edição */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent onClose={() => setIsOpen(false)}>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Editar Cadeira" : "Criar Nova Cadeira"}</DialogTitle>
              <DialogDescription>Preencha os dados da disciplina/módulo curricular.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Nome da Cadeira</label>
                <Input
                  required
                  placeholder="Ex: Bioestatística"
                  value={selectedCadeira.name}
                  onChange={(e) => setSelectedCadeira({ ...selectedCadeira, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Faculdade / Departamento</label>
                <Input
                  required
                  placeholder="Ex: Engenharia"
                  value={selectedCadeira.department}
                  onChange={(e) => setSelectedCadeira({ ...selectedCadeira, department: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Preço Mensal (MT)</label>
                  <Input
                    type="number"
                    required
                    value={selectedCadeira.price_monthly}
                    onChange={(e) => setSelectedCadeira({ ...selectedCadeira, price_monthly: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Universidade</label>
                  <Input
                    required
                    value={selectedCadeira.university}
                    onChange={(e) => setSelectedCadeira({ ...selectedCadeira, university: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Explicadores Responsáveis</label>
                <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg bg-surface-container p-3">
                  {tutors.length ? tutors.map((tutor) => {
                    const checked = selectedCadeira.tutor_ids?.includes(tutor.id) ?? false;
                    return (
                      <label key={tutor.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-primary/5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setSelectedCadeira((current) => ({
                            ...current,
                            tutor_ids: checked
                              ? (current.tutor_ids ?? []).filter((id) => id !== tutor.id)
                              : [...(current.tutor_ids ?? []), tutor.id],
                          }))}
                          className="h-4 w-4 accent-[#FF48FF]"
                        />
                        <span className="text-sm text-on-surface">{tutor.full_name}</span>
                      </label>
                    );
                  }) : <p className="text-xs text-on-surface-variant">Nenhum explicador ativo encontrado.</p>}
                </div>
                <p className="text-[10px] text-on-surface-variant">Pode selecionar mais de um explicador para a mesma cadeira.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Estado de Atividade</label>
                <Select
                  value={selectedCadeira.is_active ? "ativo" : "inativo"}
                  onChange={(e) => setSelectedCadeira({ ...selectedCadeira, is_active: e.target.value === "ativo" })}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Select>
              </div>

              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {isEdit ? "Guardar Alterações" : "Criar Cadeira"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Alerta de Confirmação de Eliminação */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent onClose={() => setIsDeleteOpen(false)}>
            <DialogHeader>
              <DialogTitle className="text-red-500">Confirmar Eliminação</DialogTitle>
              <DialogDescription>
                Tem a certeza de que deseja eliminar esta cadeira? Esta ação é irreversível e afetará os materiais associados.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Eliminar Definitivamente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
