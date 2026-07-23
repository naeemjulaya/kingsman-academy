"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { RouteGuard } from "@/components/auth/route-guard";

interface EnrolledCourse {
  id: string;
  name: string;
  department: string;
  tutor: string;
  progress: number;
}

interface Activity {
  message: string;
  date: string;
}

interface UpcomingLesson {
  id: string;
  title: string;
  course_name: string;
  time_label: string;
}

interface StudentProgress {
  lessonId: string;
  courseId: string | null;
  progressPercent: number;
}

interface EnrollmentCourse {
  id: string;
  name: string;
  department: string | null;
  price_monthly: number;
}

interface StudentEnrollment {
  course_id: string;
  end_date: string | null;
  status: string;
  payment_status: string;
  courses: EnrollmentCourse | EnrollmentCourse[] | null;
}

interface DashboardNotification {
  content: string;
  created_at: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    watchedLessons: 0,
    nextPayment: { amount: 0, date: "N/A" }
  });
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [upcomingLessons, setUpcomingLessons] = useState<UpcomingLesson[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!user) return;

      // 1. Cadeiras Inscritas
      const enrollmentResponse = await fetch("/api/student/enrollments", { cache: "no-store" });
      const enrollmentResult = await enrollmentResponse.json();
      if (!enrollmentResponse.ok) throw new Error(enrollmentResult.error || "Não foi possível carregar as inscrições");
      const activeEnrollments = ((enrollmentResult.enrollments || []) as StudentEnrollment[]).filter(
        (enrollment) => enrollment.status === "ACTIVE" && enrollment.payment_status === "CONFIRMED"
      );

      const progressResponse = await fetch("/api/student/progress", { cache: "no-store" });
      const progressResult = await progressResponse.json();
      const studentProgress: StudentProgress[] = progressResponse.ok ? progressResult.progress || [] : [];
      
      // Calculate Next Payment
      let nextPaymentAmount = 0;
      let nextPaymentDate = "N/A";
      
      if (activeEnrollments.length > 0) {
        // Sort by end_date
        const sorted = [...activeEnrollments].sort((a, b) => {
          if (!a.end_date) return 1;
          if (!b.end_date) return -1;
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        });
        
        const nextDue = sorted[0];
        if (nextDue && nextDue.end_date) {
          const courseData = Array.isArray(nextDue.courses) ? nextDue.courses[0] : nextDue.courses;
          if (courseData) {
            nextPaymentAmount = (courseData as any).price_monthly || 650;
            nextPaymentDate = new Date(nextDue.end_date).toLocaleDateString('pt-PT');
          }
        }
      }

      // 2. Fetch Progress for enrolled courses
      const coursePromises = activeEnrollments.map(async (enc) => {
        const cId = enc.course_id;
        const cData = Array.isArray(enc.courses) ? enc.courses[0] : enc.courses;
        
        // Fetch total lessons
        const { count: totalLessons } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', cId);
          
        const completedLessons = studentProgress.filter(
          (progress) => progress.courseId === cId && progress.progressPercent >= 100
        ).length;
          
        // Fetch tutor (simplified, just get one)
        const { data: tutorProfiles } = await supabase.rpc("get_course_tutors", { p_course_id: cId });
        const tutorName = tutorProfiles?.[0]?.full_name || "Explicador";

        const progress = totalLessons && totalLessons > 0 
          ? Math.round(((completedLessons || 0) / totalLessons) * 100) 
          : 0;

        return {
          id: cId,
          name: (cData as any)?.name || "Cadeira",
          department: (cData as any)?.department || "Geral",
          tutor: tutorName,
          progress
        } as EnrolledCourse;
      });

      const coursesResult = await Promise.all(coursePromises);
      setEnrolledCourses(coursesResult);

      // 3. Aulas Assistidas (Total of unique lessons started)
      setStats({
        enrolledCourses: activeEnrollments.length,
        watchedLessons: studentProgress.length,
        nextPayment: { amount: nextPaymentAmount, date: nextPaymentDate }
      });

      // 4. Atividade Recente (Notifications)
      const notificationResponse = await fetch("/api/notifications", { cache: "no-store" });
      const notificationResult = notificationResponse.ok ? await notificationResponse.json() : { notifications: [] };
      const notifs = ((notificationResult.notifications || []) as DashboardNotification[]).slice(0, 3);

      if (notifs) {
        setRecentActivity(notifs.map(n => ({
          message: n.content,
          date: new Date(n.created_at).toLocaleDateString('pt-PT', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })
        })));
      }

      // 5. Próximas Aulas (Lessons not completed from enrolled courses)
      const enrolledCourseIds = activeEnrollments.map(e => e.course_id);
      
      if (enrolledCourseIds.length > 0) {
        // Fetch all lessons for these courses
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, title, course_id, created_at')
          .in('course_id', enrolledCourseIds)
          .order('order_index')
          .limit(10);
          
        // Fetch completions to filter them out
        const completedIds = new Set(
          studentProgress.filter((progress) => progress.progressPercent >= 100).map((progress) => progress.lessonId)
        );
        
        if (lessons) {
          const upcoming = lessons
            .filter(l => !completedIds.has(l.id))
            .slice(0, 3)
            .map(l => {
              const cName = coursesResult.find(c => c.id === l.course_id)?.name || "Cadeira";
              return {
                id: l.id,
                title: l.title,
                course_name: cName,
                time_label: "Disponível"
              };
            });
          setUpcomingLessons(upcoming);
        }
      }

    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <RouteGuard allowedRoles={["ESTUDANTE", "ADMIN"]}>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </RouteGuard>
    );
  }

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

          {enrolledCourses.length === 0 ? (
            <Card className="p-8 text-center bg-surface-container-low border-dashed">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">school</span>
              <p className="text-sm font-semibold text-on-surface">Não tens inscrições activas.</p>
              <p className="text-xs text-on-surface-variant mt-1 mb-4">Inscreve-te numa cadeira para começar a estudar.</p>
              <Link href="/estudante/cadeiras" className="text-xs font-bold bg-primary text-black px-4 py-2 rounded-lg uppercase tracking-wider">
                Explorar Cadeiras
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => (
                <Link key={course.id} href={`/estudante/cadeiras/${course.id}`}>
                  <Card className="p-6 group hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-primary/5 rounded-lg text-primary">
                          <span className="material-symbols-outlined text-xl">
                            science
                          </span>
                        </div>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                          {course.department}
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
          )}

          {/* Actividade Recente */}
          <div className="pt-4">
            <h3 className="font-playfair text-xl md:text-2xl font-bold mb-6">Actividade Recente</h3>
            <Card className="p-6">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Nenhuma actividade recente.</p>
              ) : (
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
              )}
            </Card>
          </div>
        </div>

        {/* Próximas Aulas (Right column) */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="font-playfair text-xl md:text-2xl font-bold">Próximas Aulas</h3>
          <div className="space-y-4">
            {upcomingLessons.length === 0 ? (
              <p className="text-sm text-on-surface-variant">Sem aulas pendentes.</p>
            ) : (
              upcomingLessons.map((lesson) => (
                <Link href={`/estudante/aulas/${lesson.id}`} key={lesson.id}>
                  <Card className="p-4 flex items-center gap-4 hover:bg-surface-container-low/20 transition-all cursor-pointer border-border/10 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary border border-primary/10 shrink-0">
                      <span className="material-symbols-outlined text-2xl">play_arrow</span>
                    </div>
                    <div className="overflow-hidden">
                      <h5 className="text-sm font-bold text-on-surface truncate">{lesson.title}</h5>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-0.5">{lesson.course_name} • {lesson.time_label}</p>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>

          {/* Weekly Goal Progress Panel */}
          <div className="bg-gradient-to-br from-primary to-surface-container-highest p-6 rounded-xl text-black relative overflow-hidden shadow-2xl">
            <div className="relative z-10 text-black">
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-black/80 mb-1">Missão Semanal</p>
              <h4 className="font-playfair text-lg font-bold mb-4 leading-snug">Complete 4 aulas para bónus</h4>
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>1 de 4 concluídas</span>
                <span>25%</span>
              </div>
              <div className="h-1.5 w-full bg-black/15 rounded-full">
                <div className="h-full bg-black rounded-full" style={{ width: "25%" }}></div>
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
