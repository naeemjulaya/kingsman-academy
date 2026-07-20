"use client";

import Link from "next/link";
import { RouteGuard } from "@/components/auth/route-guard";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTutorScope } from "@/hooks/use-tutor-scope";

export default function TutorCoursesPage() {
  const { courses, loading, error } = useTutorScope();

  return (
    <RouteGuard allowedRoles={["EXPLICADOR", "ADMIN"]}>
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Minhas Cadeiras</h1>
          <p className="mt-1 text-sm text-on-surface-variant/70">Cadeiras que lhe foram atribuídas pelo administrador.</p>
        </div>
        {loading ? <p className="text-sm text-on-surface-variant">A carregar...</p> : error ? (
          <Card className="p-6 text-sm text-red-300">{error}</Card>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center text-sm text-on-surface-variant">Ainda não tem cadeiras atribuídas.</Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant={course.is_active ? "success" : "danger"}>{course.is_active ? "Ativa" : "Inativa"}</Badge>
                  <span className="text-xs text-on-surface-variant">{course.department || "Sem departamento"}</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-playfair text-xl font-bold">{course.name}</h2>
                  <p className="mt-2 text-sm text-on-surface-variant">{course.description || "Sem descrição."}</p>
                  <p className="mt-3 text-xs text-on-surface-variant">{course.university || "Instituição não definida"}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/explicador/aulas?course=${course.id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-bold text-primary hover:bg-primary/20">Aulas</Link>
                  <Link href={`/explicador/materiais?course=${course.id}`} className="rounded-lg bg-surface-container px-3 py-2 text-center text-xs font-bold hover:bg-surface-container-high">Materiais</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
