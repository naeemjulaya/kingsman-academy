"use client";

import React from "react";
import Link from "next/link";
import { mockStudentData } from "@/lib/mockData";
import { Card } from "@/components/ui/card";

import { RouteGuard } from "@/components/auth/route-guard";

export default function StudentDashboard() {
  const { name, enrolledCourses, stats, recentActivity } = mockStudentData;

  return (
    <RouteGuard allowedRoles={["ESTUDANTE", "ADMIN"]}>
      <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Resumo Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-4 border-l-4 border-primary">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">menu_book</span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Cadeiras Inscritas</p>
            <p className="font-playfair text-2xl md:text-3xl text-primary font-bold">{stats.enrolledCourses}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">visibility</span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Aulas Assistidas</p>
            <p className="font-playfair text-2xl md:text-3xl text-primary font-bold">{stats.watchedLessons}</p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Próximo Pagamento</p>
            <p className="font-playfair text-2xl md:text-3xl text-primary font-bold">
              {stats.nextPayment.amount} MT
              <span className="text-[10px] text-on-surface-variant/80 font-semibold lowercase block">vence em {stats.nextPayment.date}</span>
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Minhas Cadeiras (Left column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-playfair text-xl md:text-2xl font-bold">Minhas Cadeiras</h3>
            <Link href="/estudante/cadeiras" className="text-xs text-primary font-bold hover:underline">
              Ver todas
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Link key={course.id} href={`/estudante/cadeiras/${course.id}`}>
                <Card className="p-6 group hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2.5 bg-primary/5 rounded-lg text-primary">
                        <span className="material-symbols-outlined text-xl">
                          {course.id === "c1" ? "biotech" : "science"}
                        </span>
                      </div>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        {course.id === "c1" ? "Ciências" : "Química"}
                      </span>
                    </div>
                    <h4 className="font-playfair text-lg text-on-surface font-bold mb-2 group-hover:text-primary transition-colors">
                      {course.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-6 font-semibold">Tutor: {course.tutor}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-on-surface-variant font-bold">
                      <span>Progresso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full shadow-[0_0_8px_#FF48FF]"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Actividade Recente */}
          <div className="pt-4">
            <h3 className="font-playfair text-xl md:text-2xl font-bold mb-6">Actividade Recente</h3>
            <Card className="p-6">
              <div className="relative border-l border-primary/10 pl-6 space-y-6">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle icon marker on the line */}
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#0A0A0A] border-2 border-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{activity.message}</p>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">
                        {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Próximas Aulas (Right column) */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-playfair text-xl md:text-2xl font-bold">Próximas Aulas</h3>
          <div className="space-y-4">
            {/* Class 1 */}
            <Card className="p-4 flex items-center gap-4 hover:bg-surface-container-low/20 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary relative border border-primary/10 shrink-0">
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Novo</span>
              </div>
              <div className="overflow-hidden">
                <h5 className="text-sm font-bold text-on-surface truncate">Reacções Orgânicas</h5>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">Química • 14:00 PM</p>
              </div>
            </Card>

            {/* Class 2 */}
            <Card className="p-4 flex items-center gap-4 hover:bg-surface-container-low/20 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-primary/10 shrink-0">
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
              </div>
              <div className="overflow-hidden">
                <h5 className="text-sm font-bold text-on-surface truncate">Inferência Estatística</h5>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">Bioestatística • Amanhã</p>
              </div>
            </Card>

            {/* Class 3 */}
            <Card className="p-4 flex items-center gap-4 hover:bg-surface-container-low/20 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-primary/10 shrink-0">
                <span className="material-symbols-outlined text-2xl">play_arrow</span>
              </div>
              <div className="overflow-hidden">
                <h5 className="text-sm font-bold text-on-surface truncate">Prática de Laboratório II</h5>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">Química • Sexta</p>
              </div>
            </Card>
          </div>

          {/* Weekly Goal Progress Panel */}
          <div className="bg-gradient-to-br from-primary to-surface-container-highest p-6 rounded-xl text-black relative overflow-hidden shadow-2xl">
            <div className="relative z-10 text-black">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/80 mb-1">Missão Semanal</p>
              <h4 className="font-playfair text-lg font-bold mb-4 leading-snug">Complete 4 aulas para bónus</h4>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>3 de 4 concluídas</span>
                <span>75%</span>
              </div>
              <div className="h-1.5 w-full bg-black/15 rounded-full">
                <div className="h-full bg-black rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 text-black opacity-10">
              <span className="material-symbols-outlined text-[120px] font-bold">workspace_premium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </RouteGuard>
);
}
