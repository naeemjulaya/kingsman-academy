"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { mockPayments, mockCourses, mockTutors, mockUsers } from "@/lib/mockData";

import { RouteGuard } from "@/components/auth/route-guard";

export default function AdminDashboard() {
  // Pending payments from mock data
  const [payments, setPayments] = useState(mockPayments.filter((p) => p.status === "PENDING"));

  const handleAction = (id: string, newStatus: "CONFIRMED" | "REJECTED") => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
    alert(`Pagamento ${id} foi ${newStatus === "CONFIRMED" ? "confirmado" : "rejeitado"} com sucesso!`);
  };

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* KPI Cards (5) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-primary">
          <p className="text-[9px] text-[#808080] uppercase tracking-wider font-bold">Receita Mensal</p>
          <h3 className="font-playfair text-xl md:text-2xl text-primary font-bold mt-1">55.250 MT</h3>
        </Card>

        <Card className="p-4">
          <p className="text-[9px] text-[#808080] uppercase tracking-wider font-bold">Total Estudantes</p>
          <h3 className="font-playfair text-xl md:text-2xl text-on-surface font-bold mt-1">74 Alunos</h3>
        </Card>

        <Card className="p-4">
          <p className="text-[9px] text-[#808080] uppercase tracking-wider font-bold">Total Explicadores</p>
          <h3 className="font-playfair text-xl md:text-2xl text-on-surface font-bold mt-1">12 Tutores</h3>
        </Card>

        <Card className="p-4">
          <p className="text-[9px] text-[#808080] uppercase tracking-wider font-bold">Cadeiras Ativas</p>
          <h3 className="font-playfair text-xl md:text-2xl text-on-surface font-bold mt-1">15 Cadeiras</h3>
        </Card>

        <Card className="p-4">
          <p className="text-[9px] text-[#808080] uppercase tracking-wider font-bold">Conversão (Landing)</p>
          <h3 className="font-playfair text-xl md:text-2xl text-emerald-400 font-bold mt-1">68.2%</h3>
        </Card>
      </div>

      {/* Graphs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Bar Chart */}
        <Card className="p-6">
          <h4 className="font-playfair text-base font-bold mb-6">Receita Semestral (MT)</h4>
          <div className="h-48 flex items-end justify-between gap-3 px-2">
            {[
              { month: "Jan", height: "30%", value: "24K" },
              { month: "Fev", height: "45%", value: "32K" },
              { month: "Mar", height: "55%", value: "38K" },
              { month: "Abr", height: "70%", value: "48K" },
              { month: "Mai", height: "85%", value: "52K" },
              { month: "Jun", height: "92%", value: "55K" },
            ].map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  {b.value}
                </span>
                <div style={{ height: b.height }} className="w-full bg-primary/20 hover:bg-primary rounded-t transition-all cursor-pointer"></div>
                <span className="text-[9px] text-[#808080] uppercase font-bold mt-1">{b.month}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Faculty distribution pie/doughnut simulation */}
        <Card className="p-6">
          <h4 className="font-playfair text-base font-bold mb-6">Distribuição por Faculdade</h4>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-48">
            {/* Visual HTML/CSS donut indicator */}
            <div className="relative w-32 h-32 rounded-full border-8 border-surface-container-high flex items-center justify-center shadow-[0_0_15px_rgba(255,72,255,0.1)]">
              <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary border-r-primary"></div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-primary">68%</span>
                <span className="text-[8px] text-[#808080] uppercase tracking-wider font-bold">Ciências/Eng</span>
              </div>
            </div>

            {/* Labels */}
            <div className="space-y-2 text-xs font-semibold text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#FF48FF]"></span>
                <span>Engenharia & Tecnologias (42%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#ffaaf5]"></span>
                <span>Ciências Médicas (26%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-surface-container-highest"></span>
                <span>Biologia e Agronomia (32%)</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending payments & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Pending Payments Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-playfair text-lg md:text-xl font-bold">Validação de Pagamentos</h3>
            <Link href="/admin/pagamentos" className="text-xs text-primary font-bold hover:underline">
              Ver todos
            </Link>
          </div>

          <Card className="p-0 overflow-hidden">
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead>Cadeira</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => {
                    const student = mockUsers.find(u => u.user_id === p.student_id);
                    const studentName = student ? student.full_name : p.student_id;
                    const courseName = mockCourses.find(c => c.id === p.course_id)?.name || p.course_id;

                    return (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold text-on-surface">{studentName}</TableCell>
                      <TableCell>{courseName}</TableCell>
                      <TableCell className="font-semibold text-primary">{p.amount} MT</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell>{p.created_at || "Hoje"}</TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8 text-center text-on-surface-variant font-medium text-xs">
                <span className="material-symbols-outlined text-3xl mb-2 block">task_alt</span>
                Não há pagamentos pendentes de validação.
              </div>
            )}
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-playfair text-lg md:text-xl font-bold">Actividade Recente</h3>
          <Card className="p-4">
            <div className="relative border-l border-primary/10 pl-4 space-y-4 text-xs font-medium">
              {[
                { message: "Utilizador João Pedro registou-se no sistema", date: "Há 10 min" },
                { message: "Pagamento confirmado de Keven Gulele (Bioestatística)", date: "Há 1 hora" },
                { message: "Explicador Nilzam Bakali carregou a Aula 5 de Química", date: "Há 4 horas" },
                { message: "Nova cadeira de Fisiologia Vegetal criada", date: "Ontem" },
              ].map((act, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#0A0A0A] border-2 border-primary"></div>
                  <div>
                    <p className="text-on-surface leading-snug">{act.message}</p>
                    <p className="text-[9px] text-[#808080] font-bold uppercase tracking-wider mt-0.5">{act.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  </RouteGuard>
);
}
