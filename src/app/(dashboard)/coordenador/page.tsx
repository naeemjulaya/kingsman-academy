"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCourses, mockTutors, mockCourseTutors } from "@/lib/mockData";

import { RouteGuard } from "@/components/auth/route-guard";

export default function CoordinatorDashboard() {
  const pendingRegistrations = [
    { id: "reg1", student: "Artur Langa", course: "Bioestatística", date: "Hoje, 09:30 AM", status: "Pendente" },
    { id: "reg2", student: "Sara Mondlane", course: "Química Orgânica", date: "Ontem, 16:15 PM", status: "Pendente" },
  ];

  return (
    <RouteGuard allowedRoles={["COORDENADOR", "ADMIN"]}>
      <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Coordinator Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Cadeiras Ativas</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">15 Cadeiras</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">📚 Monitorando 5 faculdades</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Explicadores Ativos</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">12 Tutores</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">💼 2 solicitações de adesão</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Total Estudantes</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">74 Inscritos</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">📈 Taxa de retenção: 88%</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Matrículas Pendentes</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">2 Alunos</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">🕒 Requer aprovação imediata</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active monitor feed */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-playfair text-xl font-bold">Monitor de Cadeiras Académicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockCourses.slice(0, 4).map((course) => {
              const courseTutor = mockCourseTutors.find((ct) => ct.course_id === course.id);
              const tutor = courseTutor ? mockTutors.find((t) => t.user_id === courseTutor.tutor_id) || mockTutors[0] : mockTutors[0];
              return (
                <Card key={course.id} className="p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <Badge variant="primary">{course.department}</Badge>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Ativa</span>
                    </div>
                    <h4 className="font-playfair text-lg text-on-surface font-bold mt-3">{course.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Responsável: {tutor.full_name}</p>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-2">
                    <span className="text-xs text-on-surface-variant/80 font-semibold">Semestre de Junho</span>
                    <button className="text-xs text-primary font-bold hover:underline cursor-pointer">
                      Ver Relatório
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column: Pending enrollments */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-playfair text-xl font-bold">Adesões Pendentes</h3>
          <div className="space-y-4">
            {pendingRegistrations.map((reg) => (
              <Card key={reg.id} className="p-4 space-y-4 border-amber-500/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-sm font-bold text-on-surface">{reg.student}</h5>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{reg.course}</p>
                  </div>
                  <Badge variant="warning">{reg.status}</Badge>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#808080] font-semibold border-t border-white/5 pt-3">
                  <span>{reg.date}</span>
                  <div className="flex gap-2">
                    <button className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded font-bold transition-colors cursor-pointer">
                      Aprovar
                    </button>
                    <button className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded font-bold transition-colors cursor-pointer">
                      Rejeitar
                    </button>
                  </div>
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
