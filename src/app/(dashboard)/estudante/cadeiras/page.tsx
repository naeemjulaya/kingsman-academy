"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SelectInput } from "@/components/ui/select_input";
import { createClient } from "@/lib/supabase/client";
import {
  calculateCourseCart,
  readCourseCart,
  writeCourseCart,
} from "@/lib/course-cart";

interface Tutor {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface Course {
  id: string;
  name: string;
  department: string | null;
  description: string;
  price_monthly: number;
  tutors: Tutor[];
}

interface StudentEnrollment {
  course_id: string;
  end_date: string | null;
  status: string;
  payment_status: string;
}

interface ResourceRow {
  course_id: string;
  tutor_id: string | null;
  tutor_name: string | null;
  whatsapp_group_url: string | null;
  has_paid_access: boolean;
}

interface CourseResource {
  tutorId: string;
  tutorName: string;
  whatsappUrl: string | null;
}

function hasCurrentAccess(enrollment: StudentEnrollment) {
  return (
    enrollment.status === "ACTIVE" &&
    enrollment.payment_status === "CONFIRMED" &&
    (!enrollment.end_date || new Date(enrollment.end_date) > new Date())
  );
}

function isVisibleRegistration(enrollment: StudentEnrollment) {
  return enrollment.status !== "CANCELLED" && enrollment.payment_status !== "REJECTED";
}

function getEnrollmentLabel(enrollment: StudentEnrollment) {
  if (hasCurrentAccess(enrollment)) return { label: "Acesso ativo", variant: "success" as const };
  if (enrollment.end_date && new Date(enrollment.end_date) <= new Date()) {
    return { label: "Acesso expirado", variant: "warning" as const };
  }
  return { label: "Aguarda validação", variant: "warning" as const };
}

export default function StudentCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [showExplore, setShowExplore] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [cartIds, setCartIds] = useState<string[]>([]);
  const itemsPerPage = 6;

  useEffect(() => {
    const savedCart = readCourseCart();
    setCartIds(savedCart);
    if (savedCart.length) setShowExplore(true);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const [catalogResponse, enrollmentResponse, resourceResult] = await Promise.all([
          fetch("/api/catalog", { cache: "no-store" }),
          fetch("/api/student/enrollments", { cache: "no-store" }),
          createClient().rpc("get_student_course_resources"),
        ]);

        const catalogResult = await catalogResponse.json();
        const enrollmentResult = await enrollmentResponse.json();
        if (!catalogResponse.ok) throw new Error(catalogResult.error || "Não foi possível carregar as cadeiras");
        if (!enrollmentResponse.ok) {
          throw new Error(enrollmentResult.error || "Não foi possível carregar as inscrições");
        }
        if (resourceResult.error) throw resourceResult.error;

        setCourses((catalogResult.courses || []) as Course[]);
        setEnrollments((enrollmentResult.enrollments || []) as StudentEnrollment[]);
        setResources((resourceResult.data || []) as ResourceRow[]);
      } catch (loadError) {
        console.error("Erro ao carregar as cadeiras:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar as cadeiras");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const registrationByCourse = useMemo(() => {
    const map = new Map<string, StudentEnrollment>();
    for (const enrollment of enrollments) {
      if (isVisibleRegistration(enrollment) && !map.has(enrollment.course_id)) {
        map.set(enrollment.course_id, enrollment);
      }
    }
    return map;
  }, [enrollments]);

  const myCourses = useMemo(
    () => courses.filter((course) => registrationByCourse.has(course.id)),
    [courses, registrationByCourse]
  );

  const resourcesByCourse = useMemo(() => {
    const map = new Map<string, CourseResource[]>();
    for (const row of resources) {
      if (!row.tutor_id) continue;
      const current = map.get(row.course_id) || [];
      if (!current.some((item) => item.tutorId === row.tutor_id)) {
        current.push({
          tutorId: row.tutor_id,
          tutorName: row.tutor_name || "Explicador",
          whatsappUrl: row.whatsapp_group_url,
        });
      }
      map.set(row.course_id, current);
    }
    return map;
  }, [resources]);

  const departments = useMemo(
    () => Array.from(new Set(courses.map((course) => course.department || "Geral"))).sort(),
    [courses]
  );

  const availableCourses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt");
    return courses.filter((course) => {
      if (registrationByCourse.has(course.id)) return false;
      const matchesSearch =
        !query ||
        course.name.toLocaleLowerCase("pt").includes(query) ||
        course.description?.toLocaleLowerCase("pt").includes(query);
      const matchesDepartment = department === "all" || (course.department || "Geral") === department;
      return matchesSearch && matchesDepartment;
    });
  }, [courses, registrationByCourse, search, department]);

  const catalogueCourses = myCourses.length === 0
    ? courses.filter((course) => {
        const query = search.trim().toLocaleLowerCase("pt");
        const matchesSearch =
          !query ||
          course.name.toLocaleLowerCase("pt").includes(query) ||
          course.description?.toLocaleLowerCase("pt").includes(query);
        return matchesSearch && (department === "all" || (course.department || "Geral") === department);
      })
    : availableCourses;

  const totalPages = Math.ceil(catalogueCourses.length / itemsPerPage);
  const paginatedCourses = catalogueCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const catalogueIsVisible = myCourses.length === 0 || showExplore;
  const cartCourses = useMemo(
    () => cartIds.map((id) => courses.find((course) => course.id === id)).filter(Boolean) as Course[],
    [cartIds, courses],
  );
  const cartPricing = useMemo(() => calculateCourseCart(cartCourses), [cartCourses]);

  useEffect(() => {
    if (!courses.length) return;
    const validIds = cartIds.filter(
      (id) => courses.some((course) => course.id === id) && !registrationByCourse.has(id),
    );
    if (validIds.length !== cartIds.length) {
      setCartIds(validIds);
      writeCourseCart(validIds);
    }
  }, [cartIds, courses, registrationByCourse]);

  const toggleCartCourse = (courseId: string) => {
    setCartIds((current) => {
      const next = current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];
      writeCourseCart(next);
      return next;
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, department, showExplore]);

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
      <div className="mx-auto max-w-[1440px] space-y-9">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {myCourses.length ? "A sua área académica" : "Comece a aprender"}
            </span>
            <h1 className="mt-1 font-playfair text-3xl font-bold uppercase text-on-surface">
              Minhas Cadeiras
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant/70">
              {myCourses.length
                ? "Aceda às aulas, materiais e grupos de cada cadeira em que está inscrito."
                : "Ainda não está inscrito em nenhuma cadeira. Explore as opções disponíveis e escolha por onde começar."}
            </p>
          </div>

          {myCourses.length > 0 && (
            <Button
              variant={showExplore ? "secondary" : "primary"}
              onClick={() => setShowExplore((current) => !current)}
              className="gap-2"
            >
              <span className="material-symbols-outlined text-[19px]">
                {showExplore ? "arrow_back" : "add_circle"}
              </span>
              {showExplore ? "Voltar às minhas cadeiras" : "Explorar outras cadeiras"}
            </Button>
          )}
        </div>

        {error ? (
          <Card className="border-red-500/20 p-6 text-sm text-red-300">{error}</Card>
        ) : (
          <>
            {myCourses.length > 0 && !showExplore && (
              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-playfair text-xl font-bold text-on-surface">Cadeiras em que está inscrito</h2>
                    <p className="mt-1 text-xs text-on-surface-variant/60">
                      {myCourses.length} {myCourses.length === 1 ? "cadeira encontrada" : "cadeiras encontradas"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {myCourses.map((course) => {
                    const enrollment = registrationByCourse.get(course.id)!;
                    const access = hasCurrentAccess(enrollment);
                    const status = getEnrollmentLabel(enrollment);
                    const courseResources = resourcesByCourse.get(course.id) || [];
                    const whatsappLinks = courseResources.filter((resource) => resource.whatsappUrl);
                    const tutor = course.tutors?.[0];

                    return (
                      <Card
                        key={course.id}
                        className="group overflow-hidden border-primary/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
                                {tutor?.avatar_url ? (
                                  <img
                                    src={tutor.avatar_url}
                                    alt={tutor.full_name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-primary">auto_stories</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <Badge variant="primary">{course.department || "Geral"}</Badge>
                                <h3 className="mt-2 truncate font-playfair text-xl font-bold text-on-surface">
                                  {course.name}
                                </h3>
                              </div>
                            </div>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>

                          <p className="mt-5 line-clamp-2 text-sm leading-relaxed text-on-surface-variant/75">
                            {course.description}
                          </p>

                          {access ? (
                            <div className="mt-5 grid grid-cols-2 gap-3">
                              <Link
                                href={`/estudante/cadeiras/${course.id}#aulas`}
                                className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-container-low p-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                              >
                                <span className="material-symbols-outlined text-primary">play_circle</span>
                                Aulas
                              </Link>
                              <Link
                                href={`/estudante/cadeiras/${course.id}#materiais`}
                                className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-container-low p-3 text-sm font-semibold text-on-surface transition-colors hover:border-primary/30 hover:text-primary"
                              >
                                <span className="material-symbols-outlined text-primary">folder_open</span>
                                Materiais
                              </Link>
                            </div>
                          ) : (
                            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4">
                              <span className="material-symbols-outlined text-amber-400">hourglass_top</span>
                              <p className="text-xs leading-relaxed text-on-surface-variant">
                                Os materiais, aulas e grupos serão desbloqueados assim que o pagamento for validado.
                              </p>
                            </div>
                          )}

                          <div className="mt-5 border-t border-white/5 pt-5">
                            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                              Grupo de WhatsApp
                            </p>
                            {access && whatsappLinks.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {whatsappLinks.map((resource) => (
                                  <a
                                    key={resource.tutorId}
                                    href={resource.whatsappUrl!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                                  >
                                    <span className="material-symbols-outlined text-[17px]">chat</span>
                                    {whatsappLinks.length > 1 ? resource.tutorName : "Entrar no grupo"}
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="flex items-center gap-2 text-xs text-on-surface-variant/60">
                                <span className="material-symbols-outlined text-[17px]">
                                  {access ? "schedule" : "lock"}
                                </span>
                                {access ? "O link do grupo ainda não foi configurado." : "Disponível após a validação do pagamento."}
                              </p>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/estudante/cadeiras/${course.id}`}
                          className="flex items-center justify-between border-t border-white/5 bg-primary/[0.04] px-6 py-4 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                        >
                          <span>Ver tudo da cadeira</span>
                          <span className="material-symbols-outlined text-[19px]">arrow_forward</span>
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {catalogueIsVisible && (
              <section className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Catálogo</span>
                  <h2 className="mt-1 font-playfair text-2xl font-bold text-on-surface">
                    {myCourses.length ? "Outras cadeiras disponíveis" : "Todas as cadeiras disponíveis"}
                  </h2>
                  <p className="mt-1 text-sm text-on-surface-variant/70">
                    Consulte os detalhes, conheça os explicadores e faça uma nova inscrição.
                  </p>
                </div>

                <Card className="overflow-hidden border-primary/20 p-0">
                  <div className="flex flex-col gap-4 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-black">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {cartIds.length > 0 && (
                          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#120b12] bg-white px-1 text-[10px] font-black text-black">
                            {cartIds.length}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-playfair text-lg font-bold text-on-surface">
                          {cartIds.length ? "O seu carrinho" : "Pacote promocional"}
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          {cartIds.length
                            ? `${cartIds.length} ${cartIds.length === 1 ? "cadeira selecionada" : "cadeiras selecionadas"}`
                            : "Escolha duas cadeiras e pague apenas 1.000 MT no total."}
                        </p>
                        {cartPricing.discount > 0 && (
                          <p className="mt-1 text-xs font-bold text-emerald-300">
                            Promoção aplicada · poupa {cartPricing.discount} MT
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {cartIds.length > 0 && (
                        <div className="text-left sm:text-right">
                          {cartPricing.discount > 0 && (
                            <p className="text-xs text-on-surface-variant line-through">
                              {cartPricing.regularTotal} MT
                            </p>
                          )}
                          <p className="text-2xl font-black text-primary">{cartPricing.total} MT</p>
                        </div>
                      )}
                      <Link
                        href={cartIds.length
                          ? `/estudante/pagamento?courseIds=${encodeURIComponent(cartIds.join(","))}`
                          : "#catalogo-cadeiras"}
                        className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold transition-colors ${
                          cartIds.length
                            ? "bg-primary text-black hover:bg-primary/90"
                            : "pointer-events-none bg-surface-container text-on-surface-variant opacity-50"
                        }`}
                      >
                        Finalizar compra
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </Card>

                <Card className="flex flex-col items-center gap-4 p-4 md:flex-row">
                  <div className="relative w-full flex-1">
                    <Input
                      type="text"
                      placeholder="Pesquisar cadeira..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="pl-10"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant/40">
                      search
                    </span>
                  </div>
                  <SelectInput
                    value={department}
                    onChange={(event) => setDepartment(event.target.value)}
                    className="w-full font-semibold md:w-56"
                  >
                    <option value="all">Todos os departamentos</option>
                    {departments.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </SelectInput>
                </Card>

                {paginatedCourses.length > 0 ? (
                  <div id="catalogo-cadeiras" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedCourses.map((course) => {
                      const tutor = course.tutors?.[0];
                      return (
                        <Card
                          key={course.id}
                          className="group flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40"
                        >
                          <div>
                            <div className="mb-5 flex items-start justify-between gap-3">
                              <Badge variant="primary">{course.department || "Geral"}</Badge>
                              <span className="text-sm font-bold text-on-surface-variant">
                                {course.price_monthly || 650} MT/mês
                              </span>
                            </div>
                            <h3 className="font-playfair text-xl font-bold text-on-surface transition-colors group-hover:text-primary">
                              {course.name}
                            </h3>
                            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-on-surface-variant/75">
                              {course.description}
                            </p>
                          </div>

                          <div className="mt-6 border-t border-white/5 pt-4">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10">
                                {tutor?.avatar_url ? (
                                  <img src={tutor.avatar_url} alt={tutor.full_name} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                                )}
                              </div>
                              <span className="text-xs font-semibold text-on-surface">
                                {tutor?.full_name || "Explicador por anunciar"}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              <button
                                type="button"
                                onClick={() => toggleCartCourse(course.id)}
                                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors ${
                                  cartIds.includes(course.id)
                                    ? "border border-primary bg-primary/10 text-primary"
                                    : "bg-primary text-black hover:bg-primary/90"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {cartIds.includes(course.id) ? "remove_shopping_cart" : "add_shopping_cart"}
                                </span>
                                {cartIds.includes(course.id) ? "Remover do carrinho" : "Adicionar ao carrinho"}
                              </button>
                              <Link
                                href={`/estudante/cadeiras/${course.id}`}
                                className="flex items-center justify-center gap-2 rounded-lg border border-white/5 px-4 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:border-primary/30 hover:text-primary"
                              >
                                Ver detalhes
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="py-14 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined mb-3 block text-4xl">search_off</span>
                    <p className="text-sm font-semibold">
                      {myCourses.length && availableCourses.length === 0 && !search && department === "all"
                        ? "Já está inscrito em todas as cadeiras disponíveis."
                        : "Nenhuma cadeira corresponde à pesquisa."}
                    </p>
                  </Card>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg bg-surface-container p-2 text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <span className="text-xs font-semibold text-on-surface">
                      Página <span className="text-primary">{currentPage}</span> de {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg bg-surface-container p-2 text-on-surface transition-colors hover:bg-surface-container-high disabled:pointer-events-none disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </RouteGuard>
  );
}
