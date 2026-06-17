"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { RouteGuard } from "@/components/auth/route-guard";

export default function TutorDashboard() {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    lessonsGiven: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTutorData();
    }
  }, [user]);

  const fetchTutorData = async () => {
    setLoading(true);
    try {
      if (!user) return;

      // Minhas Cadeiras
      const { data: ctData } = await supabase
        .from('course_tutors')
        .select(`
          course_id,
          courses (id, name, department, price_monthly)
        `)
        .eq('tutor_id', user.id);

      const tutorCourses = (ctData || []).map(ct => {
        const c = Array.isArray(ct.courses) ? ct.courses[0] : ct.courses;
        return c;
      }).filter(c => c);

      setCourses(tutorCourses);

      const courseIds = tutorCourses.map(c => c.id);

      if (courseIds.length > 0) {
        // Total Estudantes nestas cadeiras
        const { count: studentCount } = await supabase
          .from('enrollments')
          .select('id', { count: 'exact', head: true })
          .in('course_id', courseIds)
          .eq('status', 'ACTIVE');
          
        setStats(prev => ({ ...prev, totalStudents: studentCount || 0 }));

        // Aulas ministradas
        const { count: lessonsCount } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .in('course_id', courseIds);

        setStats(prev => ({ ...prev, lessonsGiven: lessonsCount || 0, completionRate: 85 }));

        // Estudantes Recentes
        const { data: recentEnrollments } = await supabase
          .from('enrollments')
          .select(`
            student_id, course_id, created_at,
            student:student_id(full_name),
            course:course_id(name)
          `)
          .in('course_id', courseIds)
          .eq('status', 'ACTIVE')
          .order('created_at', { ascending: false })
          .limit(4);

        if (recentEnrollments) {
          const formattedStudents = recentEnrollments.map((enr: any, idx) => {
            const studentObj = Array.isArray(enr.student) ? enr.student[0] : enr.student;
            const courseObj = Array.isArray(enr.course) ? enr.course[0] : enr.course;
            return {
              id: `s${idx}`,
              name: studentObj?.full_name || "Desconhecido",
              course: courseObj?.name || "Desconhecida",
              progress: "Em progresso",
              grade: "N/A",
              lastActive: new Date(enr.created_at).toLocaleDateString('pt-PT')
            };
          });
          setStudents(formattedStudents);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do explicador:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
      <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Ganhos Semestrais (Simulado)</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">45.750 MT</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">⭐ +12% em relação ao mês anterior</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Total Estudantes</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">{stats.totalStudents}</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">👥 Estudantes activos</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Aulas Ministradas</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">{stats.lessonsGiven}</h3>
          <p className="text-[10px] text-[#808080] font-semibold mt-1">🎥 Aulas nas suas cadeiras</p>
        </Card>

        <Card className="p-6">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Taxa de Conclusão</p>
          <h3 className="font-playfair text-2xl md:text-3xl text-primary font-bold mt-1">{stats.completionRate}%</h3>
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
              {loading ? (
                <p className="p-6 text-sm text-center text-on-surface-variant">Carregando estudantes...</p>
              ) : students.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudante</TableHead>
                      <TableHead>Cadeira</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Nota Média</TableHead>
                      <TableHead>Data Inscrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((stud) => (
                      <TableRow key={stud.id}>
                        <TableCell className="font-bold text-on-surface">{stud.name}</TableCell>
                        <TableCell>{stud.course}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary">{stud.progress}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-400">{stud.grade}</TableCell>
                        <TableCell>{stud.lastActive}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-6 text-sm text-center text-on-surface-variant">Não há estudantes inscritos nas suas cadeiras.</p>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: Managed courses */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-playfair text-xl font-bold">Minhas Cadeiras</h3>
          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-on-surface-variant">Carregando...</p>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course.id} className="p-5 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-start">
                      <Badge variant="primary">{course.department}</Badge>
                      <span className="text-[10px] text-[#808080] font-bold uppercase tracking-wider">REF: {course.id.substring(0, 8)}</span>
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
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">Não tens cadeiras atribuídas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </RouteGuard>
);
}
