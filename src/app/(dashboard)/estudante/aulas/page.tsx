"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

interface LessonResponse {
  id: string;
  title: string;
  topic: string | null;
  description: string | null;
  duration: number | null;
  order_index: number;
  course_id: string;
  courses: { name: string } | { name: string }[] | null;
}

interface StudentProgress {
  lessonId: string;
  progressPercent: number;
}

interface Lesson extends LessonResponse {
  completed: boolean;
  progress_percent: number;
}

interface CourseGroup {
  course: EnrollmentCourse;
  lessons: Lesson[];
}

function getCourse(enrollment: StudentEnrollment) {
  return Array.isArray(enrollment.courses) ? enrollment.courses[0] : enrollment.courses;
}

function getDurationLabel(duration: number | null) {
  if (!duration) return null;
  return `${duration} min`;
}

export default function StudentLessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) void fetchLessons();
  }, [user, authLoading, router]);

  async function fetchLessons() {
    setLoading(true);
    setError("");

    try {
      const enrollmentResponse = await fetch("/api/student/enrollments", { cache: "no-store" });
      const enrollmentResult = await enrollmentResponse.json();
      if (!enrollmentResponse.ok) {
        throw new Error(enrollmentResult.error || "Não foi possível carregar as inscrições");
      }

      const now = new Date();
      const activeEnrollments = ((enrollmentResult.enrollments || []) as StudentEnrollment[]).filter(
        (enrollment) =>
          enrollment.status === "ACTIVE" &&
          enrollment.payment_status === "CONFIRMED" &&
          (!enrollment.end_date || new Date(enrollment.end_date) > now)
      );

      const uniqueEnrollments = Array.from(
        new Map(activeEnrollments.map((enrollment) => [enrollment.course_id, enrollment])).values()
      );
      setEnrollments(uniqueEnrollments);

      if (!uniqueEnrollments.length) {
        setLessons([]);
        return;
      }

      const [lessonsResponse, progressResponse] = await Promise.all([
        fetch("/api/student/lessons", { cache: "no-store" }),
        fetch("/api/student/progress", { cache: "no-store" }),
      ]);

      const lessonsResult = await lessonsResponse.json();
      if (!lessonsResponse.ok) {
        throw new Error(lessonsResult.error || "Não foi possível carregar as aulas");
      }

      const progressResult = progressResponse.ok ? await progressResponse.json() : { progress: [] };
      const progressMap = new Map(
        ((progressResult.progress || []) as StudentProgress[]).map((progress) => [
          progress.lessonId,
          progress.progressPercent,
        ])
      );

      setLessons(
        ((lessonsResult.lessons || []) as LessonResponse[]).map((lesson) => {
          const progress = progressMap.get(lesson.id) || 0;
          return {
            ...lesson,
            completed: progress >= 100,
            progress_percent: progress,
          };
        })
      );
    } catch (fetchError) {
      console.error("Erro ao buscar aulas:", fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Não foi possível carregar as aulas");
    } finally {
      setLoading(false);
    }
  }

  const courseGroups = useMemo<CourseGroup[]>(() => {
    return enrollments
      .map((enrollment) => {
        const course = getCourse(enrollment);
        if (!course) return null;

        return {
          course,
          lessons: lessons
            .filter((lesson) => lesson.course_id === enrollment.course_id)
            .sort((a, b) => a.order_index - b.order_index),
        };
      })
      .filter((group): group is CourseGroup => group !== null)
      .sort((a, b) => a.course.name.localeCompare(b.course.name, "pt"));
  }, [enrollments, lessons]);

  const visibleGroups =
    selectedCourse === "all"
      ? courseGroups
      : courseGroups.filter((group) => group.course.id === selectedCourse);

  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const nextLesson =
    lessons.find((lesson) => lesson.progress_percent > 0 && !lesson.completed) ||
    lessons.find((lesson) => !lesson.completed) ||
    lessons[0];

  if (authLoading || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Área de estudo</span>
          <h1 className="mt-1 font-playfair text-3xl font-bold uppercase text-on-surface">Aulas</h1>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant/70">
            Todas as aulas das suas cadeiras estão aqui. Escolha uma aula e comece a estudar.
          </p>
        </div>

        {nextLesson && (
          <Link
            href={`/estudante/aulas/${nextLesson.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF48FF] to-[#BF35BE] px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,72,255,0.18)]"
          >
            <span className="material-symbols-outlined text-[19px]">play_circle</span>
            {nextLesson.progress_percent > 0 && !nextLesson.completed ? "Continuar a assistir" : "Começar a estudar"}
          </Link>
        )}
      </div>

      {error ? (
        <Card className="border-red-500/20 p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-on-surface">Não foi possível carregar as aulas</p>
              <p className="mt-1 text-sm text-on-surface-variant/70">{error}</p>
            </div>
            <Button variant="outline" onClick={() => void fetchLessons()}>
              Tentar novamente
            </Button>
          </div>
        </Card>
      ) : courseGroups.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-4xl">school</span>
          </div>
          <h2 className="font-playfair text-xl font-bold text-on-surface">Ainda não tem cadeiras ativas</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant/70">
            Depois de o seu pagamento ser confirmado, as cadeiras e respetivas aulas aparecerão automaticamente aqui.
          </p>
          <Link href="/estudante/cadeiras" className="mt-6">
            <Button>Explorar cadeiras</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">video_library</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{lessons.length}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60">
                    Aulas disponíveis
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{courseGroups.length}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60">
                    Cadeiras ativas
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <span className="material-symbols-outlined">task_alt</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-on-surface">{completedLessons}</p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60">
                    Aulas concluídas
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCourse("all")}
              className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                selectedCourse === "all"
                  ? "border-primary bg-primary text-white"
                  : "border-outline/20 bg-surface-container-low text-on-surface-variant hover:border-primary/30 hover:text-on-surface"
              }`}
            >
              Todas as cadeiras
            </button>
            {courseGroups.map(({ course }) => (
              <button
                type="button"
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  selectedCourse === course.id
                    ? "border-primary bg-primary text-white"
                    : "border-outline/20 bg-surface-container-low text-on-surface-variant hover:border-primary/30 hover:text-on-surface"
                }`}
              >
                {course.name}
              </button>
            ))}
          </div>

          <div className="space-y-7">
            {visibleGroups.map(({ course, lessons: courseLessons }) => (
              <section key={course.id} aria-labelledby={`course-${course.id}`}>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <span className="material-symbols-outlined">auto_stories</span>
                    </div>
                    <div>
                      <h2 id={`course-${course.id}`} className="font-playfair text-xl font-bold text-on-surface">
                        {course.name}
                      </h2>
                      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60">
                        {course.department || "Geral"} · {courseLessons.length}{" "}
                        {courseLessons.length === 1 ? "aula disponível" : "aulas disponíveis"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/estudante/cadeiras/${course.id}`}
                    className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  >
                    Ver detalhes da cadeira
                  </Link>
                </div>

                {courseLessons.length === 0 ? (
                  <Card className="border-dashed p-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-on-surface-variant">
                        <span className="material-symbols-outlined">hourglass_top</span>
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">As aulas estão a ser preparadas</p>
                        <p className="mt-1 text-sm text-on-surface-variant/70">
                          Ainda não há aulas publicadas nesta cadeira. Assim que o explicador publicar, elas aparecerão aqui.
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {courseLessons.map((lesson, index) => {
                      const durationLabel = getDurationLabel(lesson.duration);
                      const inProgress = lesson.progress_percent > 0 && !lesson.completed;

                      return (
                        <Card
                          key={lesson.id}
                          className="group overflow-hidden border-outline/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_35px_rgba(0,0,0,0.22)]"
                        >
                          <div className="flex h-full flex-col p-5 sm:flex-row sm:items-center sm:gap-5">
                            <div
                              className={`mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl sm:mb-0 ${
                                lesson.completed
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {lesson.completed ? (
                                <span className="material-symbols-outlined text-2xl">check_circle</span>
                              ) : (
                                <span className="text-lg font-bold">{lesson.order_index || index + 1}</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                {lesson.completed ? (
                                  <Badge variant="success">Concluída</Badge>
                                ) : inProgress ? (
                                  <Badge variant="warning">Em progresso</Badge>
                                ) : (
                                  <Badge variant="primary">Nova aula</Badge>
                                )}
                                {durationLabel && (
                                  <span className="flex items-center gap-1 text-xs text-on-surface-variant/60">
                                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                                    {durationLabel}
                                  </span>
                                )}
                              </div>
                              <h3 className="truncate font-semibold text-on-surface transition-colors group-hover:text-primary">
                                {lesson.title}
                              </h3>
                              {(lesson.topic || lesson.description) && (
                                <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant/70">
                                  {lesson.topic || lesson.description}
                                </p>
                              )}

                              {inProgress && (
                                <div className="mt-3">
                                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-primary to-[#BF35BE]"
                                      style={{ width: `${Math.min(lesson.progress_percent, 100)}%` }}
                                    />
                                  </div>
                                  <p className="mt-1 text-[11px] text-on-surface-variant/60">
                                    {Math.round(lesson.progress_percent)}% assistido
                                  </p>
                                </div>
                              )}
                            </div>

                            <Link
                              href={`/estudante/aulas/${lesson.id}`}
                              aria-label={`${lesson.completed ? "Rever" : inProgress ? "Continuar" : "Assistir"} ${lesson.title}`}
                              className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white sm:mt-0"
                            >
                              <span className="material-symbols-outlined text-[19px]">play_arrow</span>
                              {lesson.completed ? "Rever" : inProgress ? "Continuar" : "Assistir"}
                            </Link>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
