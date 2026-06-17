"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { mockCourses, mockTutors, mockCourseTutors } from "@/lib/mockData";

import { RouteGuard } from "@/components/auth/route-guard";

export default function TutorDashboard() {
  // Using Keven Gulele as the default tutor (id: t1)
  const tutor = mockTutors[0];
  const tutorCourses = mockCourseTutors.filter(ct => ct.tutor_id === tutor.user_id).map(ct => ct.course_id);
  const courses = mockCourses.filter((c) => tutorCourses.includes(c.id));

  const mockRecentStudents = [
    { id: "s1", name: "Artur Langa", course: "Bioestatística", progress: "60%", lastActive: "Há 10 min", grade: "16.4 Valor" },
    { id: "s2", name: "Sara Mondlane", course: "Bioestatística", progress: "90%", lastActive: "Há 1 hora", grade: "18.5 Valor" },
    { id: "s3", name: "Dércio Tembe", course: "Física II", progress: "15%", lastActive: "Há 1 dia", grade: "11.2 Valor" },
    { id: "s4", name: "Milena Sitoe", course: "Física II", progress: "45%", lastActive: "Há 2 dias", grade: "14.0 Valor" },
  ];

  return (
    <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
      <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Ganhos Semestrais</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">45.750 MT</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">⭐ +12% em relação ao mês anterior</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Total Estudantes</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">124</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">👥 24 novos este mês</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Aulas Ministradas</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">36</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">🎥 8 transmissões agendadas</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Taxa de Conclusão</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">94%</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">📈 Desempenho acadêmico de elite</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Earnings Chart & Students */}
        <div className="lg:col-span-8 space-y-8">
          {/* Earnings Graph Placeholder */}
          <Card className="p-6">
            <h3 className="font-playfair text-lg font-bold mb-6">Evolução Mensal de Ganhos</h3>
            <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2">
              {[
                { month: "Jan", amount: "15K", height: "30%" },
                { month: "Fev", amount: "22K", height: "45%" },
                { month: "Mar", amount: "28K", height: "55%" },
                { month: "Abr", amount: "35K", height: "70%" },
                { month: "Mai", amount: "42K", height: "85%" },
                { month: "Jun", amount: "45K", height: "92%" },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.amount}
                  </span>
                  <div
                    style={{ height: bar.height }}
                    className="w-full bg-primary/20 hover:bg-primary rounded-t-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(255,72,255,0.1)] hover:shadow-[0_0_20px_rgba(255,72,255,0.4)]"
                  ></div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                    {bar.month}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Students table */}
          <div>
            <h3 className="font-playfair text-xl font-bold mb-4">Estudantes Recentes</h3>
            <Card className="p-0 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudante</TableHead>
                    <TableHead>Cadeira</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Nota Média</TableHead>
                    <TableHead>Último Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentStudents.map((stud) => (
                    <TableRow key={stud.id}>
                      <TableCell className="font-bold text-on-surface">{stud.name}</TableCell>
                      <TableCell>{stud.course}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-surface-container-high rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-primary" style={{ width: stud.progress }}></div>
                          </div>
                          <span className="text-xs font-bold text-primary">{stud.progress}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-400">{stud.grade}</TableCell>
                      <TableCell>{stud.lastActive}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>

        {/* Right Column: Managed courses */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-playfair text-xl font-bold">Minhas Cadeiras</h3>
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id} className="p-5 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-start">
                    <Badge variant="primary">{course.department}</Badge>
                    <span className="text-[10px] text-[#808080] font-bold uppercase tracking-wider">REF: {course.id}</span>
                  </div>
                  <h4 className="font-playfair text-lg text-on-surface font-bold mt-3">{course.name}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">Preço: {course.price_monthly} MT/mês</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-bold border border-border/10 transition-colors cursor-pointer">
                    Ver Aulas
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs text-primary font-bold border border-primary/25 transition-colors cursor-pointer">
                    Materiais
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  </RouteGuard>
);
}
