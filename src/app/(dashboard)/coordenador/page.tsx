"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RouteGuard } from "@/components/auth/route-guard";

export default function CoordinatorDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    activeCourses: 0,
    activeTutors: 0,
    totalStudents: 0,
    pendingEnrollments: 0
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoordinatorData();
  }, []);

  const fetchCoordinatorData = async () => {
    setLoading(true);
    try {
      // Stats
      const { count: activeCourses } = await supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true);
      const { count: activeTutors } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'EXPLICADOR');
      const { count: totalStudents } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'ESTUDANTE');
      const { count: pendingEnrollments } = await supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'PENDING');

      setStats({
        activeCourses: activeCourses || 0,
        activeTutors: activeTutors || 0,
        totalStudents: totalStudents || 0,
        pendingEnrollments: pendingEnrollments || 0
      });

      // Recent Courses
      const { data: recentCourses } = await supabase
        .from('courses')
        .select(`
          id, name, department, is_active,
          course_tutors (
            tutor_id,
            profiles (full_name)
          )
        `)
        .eq('is_active', true)
        .limit(4);

      setCourses(recentCourses || []);

      // Pending Enrollments
      const { data: pendingData } = await supabase
        .from('enrollments')
        .select(`
          id, status, created_at,
          student:student_id(full_name),
          course:course_id(name)
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false })
        .limit(5);

      setPending(pendingData || []);

    } catch (error) {
      console.error("Erro ao carregar dados do coordenador:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      const newStatus = action === "APPROVE" ? "ACTIVE" : "CANCELLED";
      await supabase.from('enrollments').update({ status: newStatus }).eq('id', id);
      setPending(prev => prev.filter(p => p.id !== id));
      alert(`Inscrição ${action === "APPROVE" ? "aprovada" : "rejeitada"} com sucesso!`);
    } catch (error: any) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <RouteGuard allowedRoles={["COORDENADOR", "ADMIN"]}>
      <div className="space-y-8 max-w-[1440px] mx-auto">
        {/* Coordinator Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-primary">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Cadeiras Ativas</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">{stats.activeCourses} Cadeiras</h3>
          </Card>

          <Card className="p-6">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Explicadores Ativos</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">{stats.activeTutors} Tutores</h3>
          </Card>

          <Card className="p-6">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Total Estudantes</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">{stats.totalStudents} Inscritos</h3>
          </Card>

          <Card className="p-6">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Matrículas Pendentes</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">{stats.pendingEnrollments} Alunos</h3>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Active monitor feed */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="font-playfair text-xl font-bold">Monitor de Cadeiras Académicas</h3>
            {loading ? (
              <p className="text-sm text-on-surface-variant">Carregando...</p>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => {
                  let tutorName = "Não Atribuído";
                  if (course.course_tutors && course.course_tutors.length > 0) {
                    const ct = course.course_tutors[0];
                    if (ct.profiles) tutorName = Array.isArray(ct.profiles) ? ct.profiles[0]?.full_name : ct.profiles.full_name;
                  }

                  return (
                    <Card key={course.id} className="p-5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <Badge variant="primary">{course.department}</Badge>
                          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Ativa</span>
                        </div>
                        <h4 className="font-playfair text-lg text-on-surface font-bold mt-3">{course.name}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Responsável: {tutorName}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-2">
                        <span className="text-xs text-on-surface-variant/80 font-semibold">Geral</span>
                        <button className="text-xs text-primary font-bold hover:underline cursor-pointer">
                          Ver Relatório
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Não há cadeiras ativas.</p>
            )}
          </div>

          {/* Right Column: Pending enrollments */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="font-playfair text-xl font-bold">Adesões Pendentes</h3>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-on-surface-variant">Carregando...</p>
              ) : pending.length > 0 ? (
                pending.map((reg) => {
                  const studentName = reg.student?.full_name || "Desconhecido";
                  const courseName = reg.course?.name || "Desconhecida";

                  return (
                    <Card key={reg.id} className="p-4 space-y-4 border-amber-500/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="text-sm font-bold text-on-surface">{studentName}</h5>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{courseName}</p>
                        </div>
                        <Badge variant="warning">Pendente</Badge>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#808080] font-semibold border-t border-white/5 pt-3">
                        <span>{new Date(reg.created_at).toLocaleDateString('pt-PT')}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(reg.id, "APPROVE")} className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded font-bold transition-colors cursor-pointer">
                            Aprovar
                          </button>
                          <button onClick={() => handleAction(reg.id, "REJECT")} className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded font-bold transition-colors cursor-pointer">
                            Rejeitar
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <p className="text-sm text-on-surface-variant">Nenhuma adesão pendente.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
