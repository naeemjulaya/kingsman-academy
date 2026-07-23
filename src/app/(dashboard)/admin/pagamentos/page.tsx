"use client";

import React, { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/errors";
import { PaymentProofDialog } from "@/components/admin/payment-proof-dialog";

interface Pagamento {
  id: string;
  student_name: string;
  student_email: string;
  plan: string;
  amount: number;
  date: string;
  method: string;
  proof_url: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
}

export default function PagamentosPage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [search, setSearch] = useState("");
  const [proofPayment, setProofPayment] = useState<Pagamento | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          method,
          proof_url,
          status,
          created_at,
          profiles:student_id(full_name, email),
          courses:course_id(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((p: any) => {
        const studentInfo = p.profiles || {};
        const courseInfo = p.courses || {};

        return {
          id: p.id,
          student_name: studentInfo.full_name || "Desconhecido",
          student_email: studentInfo.email || "N/D",
          plan: courseInfo.name || "Mensalidade Cadeira",
          amount: p.amount,
          date: p.created_at || "",
          method: p.method || "M-Pesa",
          proof_url: p.proof_url || "",
          status: p.status as "PENDING" | "CONFIRMED" | "REJECTED"
        };
      });

      setPayments(mapped);
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, newStatus: "CONFIRMED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/admin/payments/${id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível validar o pagamento");

      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      alert(`Pagamento foi ${newStatus === "CONFIRMED" ? "confirmado" : "rejeitado"} com sucesso!`);
    } catch (error: unknown) {
      alert("Erro ao validar pagamento: " + getErrorMessage(error));
    }
  };

  // Métricas financeiras baseadas nos dados reais da BD
  const totalArrecadado = payments
    .filter(p => p.status === "CONFIRMED")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendentesCount = payments.filter(p => p.status === "PENDING").length;
  const totalInscricoes = payments.length;

  // Filtragem
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.student_name.toLowerCase().includes(search.toLowerCase()) ||
      p.student_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "TODOS" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openProof = (payment: Pagamento) => {
    setProofPayment(payment);
  };

  // Exportar para CSV (Mock)
  const handleExportCSV = () => {
    const headers = "Estudante,Email,Plano,Valor,Data,Metodo,Estado\n";
    const rows = filteredPayments.map(p =>
      `"${p.student_name}","${p.student_email}","${p.plan}",${p.amount},"${p.date}","${p.method}","${p.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_pagamentos_kingsman_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1440px] mx-auto p-4 md:p-6">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Gestão de Pagamentos</h1>
            <p className="text-sm text-on-surface-variant/70 mt-1">
              Valide as transferências e submissões M-Pesa/E-Mola de mensalidades e inscrições diretamente da base de dados.
            </p>
          </div>
          <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto font-bold uppercase tracking-wider">
            Exportar para CSV
          </Button>
        </div>

        {/* Resumos Financeiros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-emerald-500">
            <p className="text-[10px] text-[#808080] uppercase tracking-wider font-bold">Total Arrecadado (Confirmado)</p>
            <h3 className="font-playfair text-2xl text-emerald-400 font-bold mt-1">
              {totalArrecadado.toLocaleString("pt-MZ")} MT
            </h3>
          </Card>

          <Card className="p-4 border-l-4 border-amber-500">
            <p className="text-[10px] text-[#808080] uppercase tracking-wider font-bold">Validações Pendentes</p>
            <h3 className="font-playfair text-2xl text-amber-400 font-bold mt-1">
              {pendentesCount} Pagamentos
            </h3>
          </Card>

          <Card className="p-4 border-l-4 border-primary">
            <p className="text-[10px] text-[#808080] uppercase tracking-wider font-bold">Total Transações</p>
            <h3 className="font-playfair text-2xl text-primary font-bold mt-1">
              {totalInscricoes} Submissões
            </h3>
          </Card>
        </div>

        {pendentesCount > 0 && (
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className="flex w-full items-center justify-between gap-4 rounded-2xl border border-amber-400/25 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-4 text-left shadow-lg shadow-amber-950/10 transition-all hover:border-amber-400/40 hover:bg-amber-500/10"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                <span className="material-symbols-outlined">notifications_active</span>
                <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-[#150b14] bg-amber-400" />
              </span>
              <span>
                <span className="block text-sm font-bold text-amber-200">
                  {pendentesCount === 1 ? "1 compra aguarda validação" : `${pendentesCount} compras aguardam validação`}
                </span>
                <span className="mt-0.5 block text-xs text-on-surface-variant">
                  Abra o comprovativo antes de aprovar ou rejeitar o pagamento.
                </span>
              </span>
            </span>
            <span className="material-symbols-outlined shrink-0 text-amber-300">arrow_forward</span>
          </button>
        )}

        {/* Filtros */}
        <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Procurar Aluno</label>
            <Input
              placeholder="Nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Filtrar Estado</label>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="TODOS">Todos os Estados</option>
              <option value="CONFIRMED">Pago / Confirmado</option>
              <option value="PENDING">Pendente</option>
              <option value="REJECTED">Cancelado / Rejeitado</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => { setSearch(""); setStatusFilter("TODOS"); }} className="w-full">
              Limpar Filtros
            </Button>
          </div>
        </Card>

        {/* Tabela de Pagamentos */}
        <Card className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Carregando transações da base de dados...
            </div>
          ) : filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data de Pagamento</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Comprovativo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações de Validação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-on-surface">
                        <div>
                          <p className="font-bold">{p.student_name}</p>
                          <p className="text-xs text-[#808080] font-medium">{p.student_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.plan}</TableCell>
                      <TableCell className="font-bold text-primary">{p.amount} MT</TableCell>
                      <TableCell>{p.date ? new Date(p.date).toLocaleDateString("pt-PT") : "N/D"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.method}</Badge>
                      </TableCell>
                      <TableCell>
                        {p.proof_url ? (
                          <button
                            type="button"
                            onClick={() => openProof(p)}
                            className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                          >
                            <span className="material-symbols-outlined text-base">receipt_long</span>
                            Ver comprovativo
                          </button>
                        ) : (
                          <span className="text-xs text-[#808080]">Não enviado</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            p.status === "CONFIRMED"
                              ? "success"
                              : p.status === "PENDING"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {p.status === "CONFIRMED" ? "Confirmado" : p.status === "PENDING" ? "Pendente" : "Rejeitado"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleAction(p.id, "CONFIRMED")}
                              className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 rounded text-xs font-bold transition-colors cursor-pointer"
                            >
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleAction(p.id, "REJECTED")}
                              className="px-2.5 py-1 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded text-xs font-bold transition-colors cursor-pointer"
                            >
                              Rejeitar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#808080] font-medium">Validado</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-8 text-center text-on-surface-variant font-medium text-sm">
              Nenhuma transação financeira correspondente.
            </div>
          )}
        </Card>

        <PaymentProofDialog
          payment={proofPayment ? {
            id: proofPayment.id,
            studentName: proofPayment.student_name,
            courseName: proofPayment.plan,
            proofUrl: proofPayment.proof_url,
            submittedAt: proofPayment.date,
          } : null}
          onClose={() => setProofPayment(null)}
        />
      </div>
    </RouteGuard>
  );
}
