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

interface Inscricao {
  id: string;
  student_name: string;
  student_email: string;
  enrolled_at: string;
  course_name: string;
  status: "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED";
}

export default function InscricoesPage() {
  const supabase = createClient();
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  // Detalhes Modal State
  const [selectedInscricao, setSelectedInscricao] = useState<Inscricao | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          id,
          status,
          created_at,
          profiles:student_id(full_name, email),
          courses:course_id(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((e: any) => {
        const studentInfo = e.profiles || {};
        const courseInfo = e.courses || {};

        return {
          id: e.id,
          student_name: studentInfo.full_name || "Desconhecido",
          student_email: studentInfo.email || "N/D",
          enrolled_at: e.created_at || "",
          course_name: courseInfo.name || "Cadeira Académica",
          status: e.status as "ACTIVE" | "PENDING" | "CANCELLED" | "EXPIRED"
        };
      });

      setInscricoes(mapped);
    } catch (error) {
      console.error("Erro ao buscar inscrições:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "ACTIVE" | "CANCELLED") => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setInscricoes(prev => prev.map(ins => ins.id === id ? { ...ins, status: newStatus } : ins));
      alert(`Matrícula atualizada para ${newStatus === "ACTIVE" ? "Ativa" : "Cancelada"} com sucesso!`);
    } catch (error: any) {
      alert("Erro ao atualizar matrícula: " + error.message);
    }
  };

  // Filtragem
  const filteredInscricoes = inscricoes.filter(ins => {
    const matchesSearch = ins.student_name.toLowerCase().includes(search.toLowerCase()) ||
      ins.student_email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === "TODOS" || ins.course_name.toLowerCase().includes(courseFilter.toLowerCase());
    const matchesStatus = statusFilter === "TODOS" || ins.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1440px] mx-auto p-4 md:p-6">

        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Gestão de Inscrições</h1>
          <p className="text-sm text-on-surface-variant/70 mt-1">
            Aprove ou cancele matrículas de estudantes nas cadeiras ativas da Kingsman Academy diretamente da base de dados.
          </p>
        </div>

        {/* Filtros */}
        <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Pesquisar Estudante</label>
            <Input
              placeholder="Nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Cadeira / Curso</label>
            <Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="TODOS">Todas as Cadeiras</option>
              <option value="Bioestatística">Bioestatística</option>
              <option value="Química">Química Orgânica</option>
              <option value="Matemática">Análise Matemática II</option>
              <option value="Física">Física II</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Estado da Matrícula</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="TODOS">Todos os Estados</option>
              <option value="ACTIVE">Ativa</option>
              <option value="PENDING">Pendente</option>
              <option value="CANCELLED">Cancelada</option>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="secondary" onClick={() => { setSearch(""); setCourseFilter("TODOS"); setStatusFilter("TODOS"); }} className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </Card>

        {/* Tabela de Inscrições */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Carregando matrículas da base de dados...
            </div>
          ) : filteredInscricoes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Matrícula</TableHead>
                    <TableHead>Cadeira Selecionada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInscricoes.map((ins) => (
                    <TableRow key={ins.id}>
                      <TableCell className="font-semibold text-on-surface">{ins.student_name}</TableCell>
                      <TableCell>{ins.student_email}</TableCell>
                      <TableCell>{ins.enrolled_at ? new Date(ins.enrolled_at).toLocaleDateString("pt-PT") : "N/D"}</TableCell>
                      <TableCell className="font-semibold text-primary">{ins.course_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ins.status === "ACTIVE"
                              ? "success"
                              : ins.status === "PENDING"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {ins.status === "ACTIVE" ? "Ativa" : ins.status === "PENDING" ? "Pendente" : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedInscricao(ins); setIsDetailsOpen(true); }}
                            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Detalhes
                          </button>

                          {ins.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(ins.id, "ACTIVE")}
                                className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded text-xs font-bold transition-colors cursor-pointer"
                              >
                                Aprovar
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ins.id, "CANCELLED")}
                                className="px-2.5 py-1 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded text-xs font-bold transition-colors cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          {ins.status === "ACTIVE" && (
                            <button
                              onClick={() => handleUpdateStatus(ins.id, "CANCELLED")}
                              className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold cursor-pointer transition-colors"
                            >
                              Suspender
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Nenhuma matrícula correspondente encontrada.
            </div>
          )}
        </Card>

        {/* Modal de Detalhes da Inscrição */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent onClose={() => setIsDetailsOpen(false)}>
            <DialogHeader>
              <DialogTitle>Ficha de Matrícula</DialogTitle>
              <DialogDescription>Detalhes do plano contratado e estado de frequência.</DialogDescription>
            </DialogHeader>
            {selectedInscricao && (
              <div className="space-y-4 text-sm mt-2">
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">ID de Inscrição:</span>
                  <span className="text-on-surface font-semibold uppercase">{selectedInscricao.id}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Estudante:</span>
                  <span className="text-on-surface font-semibold">{selectedInscricao.student_name}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Email Institucional:</span>
                  <span className="text-on-surface font-semibold">{selectedInscricao.student_email}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Cadeira Frequentada:</span>
                  <span className="text-on-surface font-semibold text-primary">{selectedInscricao.course_name}</span>
                </div>
                <div className="flex justify-between border-b border-primary/5 pb-2">
                  <span className="text-on-surface-variant">Data da Inscrição:</span>
                  <span className="text-on-surface font-semibold">
                    {selectedInscricao.enrolled_at ? new Date(selectedInscricao.enrolled_at).toLocaleDateString("pt-PT") : "N/D"}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-on-surface-variant">Estado da Matrícula:</span>
                  <span className="text-on-surface font-semibold">
                    <Badge
                      variant={
                        selectedInscricao.status === "ACTIVE"
                          ? "success"
                          : selectedInscricao.status === "PENDING"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {selectedInscricao.status === "ACTIVE" ? "Ativa" : selectedInscricao.status === "PENDING" ? "Pendente" : "Cancelada"}
                    </Badge>
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDetailsOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RouteGuard>
  );
}
