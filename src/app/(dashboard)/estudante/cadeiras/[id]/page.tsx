"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mockCourses, mockTutors, mockLessons, mockMaterials } from "@/lib/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetail({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("aulas");

  // Video overlay state
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  // Retrieve course
  const course = mockCourses.find((c) => c.id === id) || mockCourses[0];
  const tutor = mockTutors.find((t) => t.id === course.tutorId) || mockTutors[0];
  const lessons = mockLessons.filter((l) => l.courseId === course.id);
  const materials = mockMaterials.filter((m) => m.courseId === course.id);

  // Handle enrolling
  const handleEnroll = () => {
    router.push(`/estudante/pagamento?courseId=${course.id}`);
  };

  const handleLessonClick = (lesson: any) => {
    setSelectedLesson(lesson);
  };

  const closeVideoPlayer = () => {
    setSelectedLesson(null);
  };

  const handlePrevLesson = () => {
    if (!selectedLesson) return;
    const prev = lessons.find((l) => l.order_index === selectedLesson.order_index - 1);
    if (prev) setSelectedLesson(prev);
  };

  const handleNextLesson = () => {
    if (!selectedLesson) return;
    const next = lessons.find((l) => l.order_index === selectedLesson.order_index + 1);
    if (next) setSelectedLesson(next);
  };

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto relative">
      {/* Course Banner */}
      <div className="relative rounded-2xl overflow-hidden min-h-[260px] flex items-end p-6 md:p-10 border border-primary/10 bg-gradient-to-tr from-[#1b1019] via-[#0A0A0A] to-[#1b1019]">
        <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuAlB4TkdOSWFpUJovq4ZgdZQrGE2fiac3oTzWWdV4CZZsrPHFiKx-ucMoR2y7wXQ3HKQde_msY-zvXC_ngD3f6PGl1lzIc-EBkgp7SrBnIAnm0xluxp5N78HE54oLku8P6k8uuGSVgnXuxC4UrthDdcKZ5jxiDBCHjWckqWipgG8bji9JEeU8FicyafDPghc5kTJscsXL7mrtA68OUy1eNis3qBsKjFw07TRMZba5MkpX8KIHbsmOPDGmkIDedJHg-nB3OH5vgN70Qb')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 space-y-4 max-w-3xl">
          <Badge variant="primary">{course.department}</Badge>
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-on-surface uppercase leading-tight">
            {course.name}
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">payments</span> {course.price_monthly} MT/mês
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">school</span> {course.department}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">group</span> {tutor.full_name}
            </span>
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
              <TabsTrigger value="explicadores">Explicador</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            </TabsList>

            {/* Aulas Tab */}
            <TabsContent value="aulas" className="space-y-4 mt-6">
              <Card className="p-6">
                <h3 className="font-playfair text-lg font-bold mb-4">Cronograma de Aulas</h3>
                <div className="space-y-3">
                  {lessons.map((lesson) => {
                    const isLocked = lesson.status === "locked";
                    const isCompleted = lesson.status === "completed";
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => !isLocked && handleLessonClick(lesson)}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          isLocked
                            ? "border-border/5 bg-surface-container-low/20 opacity-50 cursor-not-allowed"
                            : "border-border/10 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                        }`}
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
                              Duração: {lesson.duration}
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
                          {mat.file_size ? (mat.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Desconhecido'} • {mat.file_type?.toUpperCase()}
                        </span>
                      </div>
                      <button className="text-primary hover:text-[#FF48FF] cursor-pointer">
                        <span className="material-symbols-outlined text-lg">download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Explicador Tab */}
            <TabsContent value="explicadores" className="mt-6">
              <Card className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-primary/20 shrink-0 mx-auto sm:mx-0">
                  <img className="w-full h-full object-cover" src={tutor.avatar_url || ''} alt={tutor.full_name} />
                </div>
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <div>
                    <h4 className="font-playfair text-xl font-bold text-on-surface">{tutor.full_name}</h4>
                    <p className="text-primary text-xs font-bold uppercase tracking-widest mt-0.5">
                      {tutor.course} • {tutor.university}
                    </p>
                  </div>
                  <p className="text-sm text-on-surface-variant/90 leading-relaxed">
                    Explicador certificado da Kingsman Academy.
                  </p>
                  <div className="flex justify-center sm:justify-start gap-6 text-xs text-[#808080] font-semibold pt-2">
                    <span>👤 Explicador Oficial</span>
                    <span>📚 {course.department}</span>
                  </div>
                </div>
              </Card>
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
                      Excelente explicador. Consegui entender regressão linear na primeira aula, algo que o professor da faculdade não conseguiu em duas semanas.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-surface-container-low/20 border border-border/10 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold">João Pedro</span>
                      <span className="text-primary font-bold">⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="text-sm text-on-surface-variant/90 leading-relaxed">
                      Os apontamentos disponibilizados em PDF ajudam imenso nas revisões de véspera de exames. Recomendo vivamente.
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
          </Card>
        </div>
      </div>

      {/* VIDEO PLAYER FULLSCREEN OVERLAY MODAL */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-primary/10 flex items-center justify-between px-6 bg-[#150b14]">
            <button
              onClick={closeVideoPlayer}
              className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors cursor-pointer text-sm font-bold"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              <span>Voltar</span>
            </button>
            <span className="font-playfair text-on-surface text-base md:text-lg font-bold">
              {course.name} — {selectedLesson.title}
            </span>
            <button
              onClick={closeVideoPlayer}
              className="text-on-surface hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Player Screen */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Player Container */}
            <div className="flex-[3] bg-black flex items-center justify-center relative group">
              {/* Aspect Ratio 16:9 Black Screen */}
              <div className="w-full max-w-5xl aspect-video bg-zinc-950 flex flex-col items-center justify-center p-6 relative border border-white/5 rounded-xl shadow-2xl">
                <span className="material-symbols-outlined text-5xl text-primary/40 mb-4">
                  video_camera_back
                </span>
                <p className="font-playfair text-lg text-on-surface font-bold text-center">
                  Player de vídeo — aula disponível após pagamento
                </p>
                <p className="text-xs text-on-surface-variant/80 text-center mt-2 max-w-sm">
                  Esta é uma demonstração mock. O streaming e player real do vídeo serão ativados na fase do backend.
                </p>

                {/* Watermark in bottom right */}
                <div className="absolute bottom-4 right-4 text-[10px] text-white/10 font-mono tracking-widest pointer-events-none select-none uppercase font-bold">
                  KINGSMAN ACADEMY • {selectedLesson.id}
                </div>
              </div>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 border-t lg:border-t-0 lg:border-l border-primary/10 bg-[#150b14]/50 p-6 overflow-y-auto space-y-6 max-h-[40vh] lg:max-h-none">
              <div>
                <h4 className="font-playfair text-lg font-bold text-on-surface">{selectedLesson.title}</h4>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  {selectedLesson.description}
                </p>
              </div>

              {/* Attachments */}
              <div className="border-t border-border/10 pt-4">
                <h5 className="text-xs text-primary font-bold uppercase tracking-wider mb-3">Material desta Aula</h5>
                <div className="space-y-2">
                  {materials.slice(0, 2).map((m) => (
                    <div key={m.id} className="p-3 rounded bg-[#0a0a0a] border border-border/10 flex items-center justify-between text-xs">
                      <span className="truncate font-semibold max-w-[150px]">{m.title}</span>
                      <button className="text-primary hover:underline cursor-pointer"><span className="material-symbols-outlined text-sm">download</span></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-4 border-t border-border/10 pt-6">
                <Button onClick={handlePrevLesson} variant="secondary" size="sm" className="flex-1 flex gap-2">
                  <span className="material-symbols-outlined text-xs">chevron_left</span> Anterior
                </Button>
                <Button onClick={handleNextLesson} variant="secondary" size="sm" className="flex-1 flex gap-2">
                  Seguinte <span className="material-symbols-outlined text-xs">chevron_right</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
