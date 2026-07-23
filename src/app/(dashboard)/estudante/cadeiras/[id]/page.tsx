"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getCourseDescription } from "@/lib/course-descriptions";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TutorProfile {
  id: string;
  full_name: string;
  university: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export default function CourseDetail({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState("aulas");
  const [loading, setLoading] = useState(true);

  const [course, setCourse] = useState<any>(null);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isEnrolledAndPaid, setIsEnrolledAndPaid] = useState(false);

  useEffect(() => {
    if (id) fetchCourseData();
  }, [id, user]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
        
      if (courseData) {
        setCourse(courseData);
        
        // 2. Fetch every active tutor through the restricted public-profile RPC.
        const { data: tutorData, error: tutorError } = await supabase
          .rpc('get_course_tutors', { p_course_id: id });
        if (tutorError) throw tutorError;
        setTutors((tutorData as TutorProfile[] | null) ?? []);
        
        // 3. Fetch Lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .eq('is_active', true)
          .order('order_index');
        if (lessonsData) setLessons(lessonsData);
        
        // 4. Fetch Materials
        const { data: materialsData } = await supabase
          .rpc('get_course_materials', { p_course_id: id });
        if (materialsData) setMaterials(materialsData);
        
        // 5. Check Enrollment if user is logged in
        if (user) {
          const enrollmentResponse = await fetch(`/api/student/enrollments?courseId=${encodeURIComponent(id)}`, {
            cache: "no-store",
          });
          const enrollmentResult = enrollmentResponse.ok
            ? await enrollmentResponse.json()
            : { enrollments: [] };
          const enrollment = enrollmentResult.enrollments?.[0];
            
          const accessGranted = enrollment && 
            enrollment.status === "ACTIVE" && 
            enrollment.payment_status === "CONFIRMED" &&
            (!enrollment.end_date || new Date(enrollment.end_date) > new Date());
            
          setIsEnrolledAndPaid(!!accessGranted);
        }
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    router.push(`/estudante/pagamento?courseId=${course?.id}`);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return <div className="text-center py-20 text-on-surface-variant font-medium">Cadeira não encontrada.</div>;
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto relative">
      {/* Course Banner */}
      <div className="relative rounded-2xl overflow-hidden min-h-[260px] flex items-end p-6 md:p-10 border border-primary/10 bg-gradient-to-tr from-[#1b1019] via-[#0A0A0A] to-[#1b1019]">
        <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlB4TkdOSWFpUJovq4ZgdZQrGE2fiac3oTzWWdV4CZZsrPHFiKx-ucMoR2y7wXQ3HKQde_msY-zvXC_ngD3f6PGl1lzIc-EBkgp7SrBnIAnm0xluxp5N78HE54oLku8P6k8uuGSVgnXuxC4UrthDdcKZ5jxiDBCHjWckqWipgG8bji9JEeU8FicyafDPghc5kTJscsXL7mrtA68OUy1eNis3qBsKjFw07TRMZba5MkpX8KIHbsmOPDGmkIDedJHg-nB3OH5vgN70Qb')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <Badge variant="primary">{course.department || "Geral"}</Badge>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-on-surface uppercase leading-tight">
            {course.name}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant/90">
            {getCourseDescription(course.name, course.description)}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">payments</span> {course.price_monthly} MT/mês
            </span>
            {course.department && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">school</span> {course.department}
                </span>
              </>
            )}
            {tutors.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">group</span> {tutors.map((tutor) => tutor.full_name).join(", ")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Details content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Course Details Tab Area */}
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="aulas">Aulas ({lessons.length})</TabsTrigger>
              <TabsTrigger value="materiais">Materiais ({materials.length})</TabsTrigger>
              <TabsTrigger value="explicadores">Explicadores ({tutors.length})</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            </TabsList>

            {/* Aulas Tab */}
            <TabsContent value="aulas" className="space-y-4 mt-6">
              <Card className="p-6">
                <h3 className="font-playfair text-lg font-bold mb-4">Cronograma de Aulas</h3>
                <div className="space-y-3">
                  {lessons.length === 0 && (
                    <p className="text-sm text-on-surface-variant">Nenhuma aula disponível ainda.</p>
                  )}
                  {lessons.map((lesson) => {
                    const isLocked = !isEnrolledAndPaid;
                    // Mocking completion status if not available
                    const isCompleted = false; 
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => !isLocked && router.push(`/estudante/aulas/${lesson.id}`)}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          isLocked
                            ? "border-border/5 bg-surface-container-low/20 opacity-50 cursor-not-allowed"
                            : "border-border/10 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                        }`}
                        title={isLocked ? "Inscreva-se para aceder" : ""}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400"
                                : isLocked
                                ? "bg-surface-container text-[#808080]"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm font-bold">
                              {isCompleted ? "check" : isLocked ? "lock" : "play_arrow"}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-on-surface leading-tight block">
                              {lesson.title}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-medium block mt-0.5">
                              Duração: {lesson.duration || 0} min
                            </span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[#808080] text-sm">
                          chevron_right
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* Materiais Tab */}
            <TabsContent value="materiais" className="mt-6">
              <Card className="p-6">
                <h3 className="font-playfair text-lg font-bold mb-4">Materiais Didáticos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {materials.length === 0 && (
                    <p className="text-sm text-on-surface-variant">Nenhum material disponível.</p>
                  )}
                  {materials.map((mat) => (
                    <div
                      key={mat.id}
                      className="p-4 rounded-lg border border-border/10 hover:border-primary/40 bg-surface-container-low/30 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded bg-red-500/10 text-red-400 flex items-center justify-center">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div className="overflow-hidden flex-1">
                        <span className="text-xs font-bold text-on-surface truncate block">
                          {mat.title}
                        </span>
                        <span className="text-[9px] text-on-surface-variant font-bold block mt-0.5">
                          {mat.file_size ? (mat.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Desconhecido'} • {mat.file_type?.toUpperCase() || 'PDF'} • {mat.access_level === "PREMIUM" ? "PREMIUM" : "GRATUITO"}
                        </span>
                      </div>
                      {mat.access_level === "PREMIUM" && !isEnrolledAndPaid ? (
                        <span className="material-symbols-outlined text-lg text-on-surface-variant" title="Disponível após pagamento">lock</span>
                      ) : (
                        <a href={`/api/materials/${mat.id}`} target="_blank" rel="noreferrer" className="text-primary hover:text-[#FF48FF] cursor-pointer" title="Abrir material">
                          <span className="material-symbols-outlined text-lg">download</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Explicador Tab */}
            <TabsContent value="explicadores" className="mt-6 space-y-4">
              {tutors.length > 0 ? tutors.map((tutor) => (
                <Card key={tutor.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-full overflow-hidden border border-primary/20 shrink-0 mx-auto sm:mx-0 bg-surface-container-low flex items-center justify-center">
                      {tutor.avatar_url ? (
                        <img className="w-full h-full object-cover" src={tutor.avatar_url} alt={tutor.full_name} />
                      ) : (
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">person</span>
                      )}
                    </div>
                    <div className="space-y-3 text-center sm:text-left flex-1">
                      <div>
                        <h4 className="font-playfair text-xl font-bold text-on-surface">{tutor.full_name}</h4>
                        <p className="text-primary text-xs font-bold uppercase tracking-widest mt-0.5">
                          Explicador • {tutor.university || 'Kingsman Academy'}
                        </p>
                      </div>
                      <p className="text-sm text-on-surface-variant/90 leading-relaxed">
                        {tutor.bio || 'Perfil profissional em atualização.'}
                      </p>
                      <div className="flex justify-center sm:justify-start gap-6 text-xs text-[#808080] font-semibold pt-2">
                        <span>👤 Explicador Oficial</span>
                        <span>📚 {course.department || 'Geral'}</span>
                      </div>
                    </div>
                </Card>
              )) : (
                <Card className="p-6 text-sm text-on-surface-variant">Explicador não definido.</Card>
              )}
            </TabsContent>

            {/* Avaliacoes Tab */}
            <TabsContent value="avaliacoes" className="mt-6">
              <Card className="p-6 space-y-4">
                <h3 className="font-playfair text-lg font-bold mb-4">Avaliações dos Estudantes</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-surface-container-low/20 border border-border/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold">Sara Mondlane</span>
                      <span className="text-primary font-bold">⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="text-sm text-on-surface-variant/90 leading-relaxed">
                      Excelente conteúdo, recomendo vivamente!
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Pricing & Checkout Widget (Right column) */}
        <div className="lg:col-span-4">
          <Card className="p-6 space-y-6 sticky top-24 border-primary/20 magenta-glow">
            {isEnrolledAndPaid ? (
              <div className="text-center space-y-3 py-4">
                <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <h3 className="font-playfair text-xl font-bold text-on-surface">Inscrição Activa</h3>
                <p className="text-sm text-on-surface-variant">
                  Já tens acesso completo a todas as aulas e materiais desta cadeira. Bons estudos!
                </p>
                <Button onClick={() => setActiveTab("aulas")} variant="outline" className="w-full mt-4 border-primary/20 hover:border-primary/50">
                  Ver Aulas
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-[#808080] text-xs font-bold uppercase tracking-wider block">Preço de Inscrição</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-primary">{course.price_monthly} MT</span>
                    <span className="text-on-surface-variant text-xs font-semibold">/mês</span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-border/10 pt-4 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    <span>Acesso total a todas as aulas gravadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    <span>Downloads de PDFs e fichas resolvidas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">verified</span>
                    <span>Grupo exclusivo e esclarecimento de dúvidas</span>
                  </div>
                </div>

                <Button onClick={handleEnroll} variant="primary" className="w-full py-3.5 uppercase font-bold tracking-wider">
                  Inscrever-se na Cadeira
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
