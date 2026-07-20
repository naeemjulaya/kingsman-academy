"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RouteGuard } from "@/components/auth/route-guard";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type Period = "7_DIAS" | "30_DIAS" | "90_DIAS" | "1_ANO";
interface EnrollmentRow { id: string; created_at: string; status: string; course: { name: string } | { name: string }[] | null }
interface CompletionRow { lesson_id: string; completed_at: string; lesson: { title: string } | { title: string }[] | null }
interface PaymentRow { amount: number; created_at: string }
interface TimelinePoint { label: string; value: number }
interface RankedItem { name: string; value: number }

const periodDays: Record<Period, number> = { "7_DIAS": 7, "30_DIAS": 30, "90_DIAS": 90, "1_ANO": 365 };

export default function MetricasPage() {
  const supabase = useMemo(() => createClient(), []);
  const [period, setPeriod] = useState<Period>("30_DIAS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ newStudents: 0, enrollments: 0, lessonsCompleted: 0, revenue: 0 });
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [mostCompleted, setMostCompleted] = useState<RankedItem[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<RankedItem[]>([]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const since = new Date();
    since.setDate(since.getDate() - periodDays[period] + 1);
    since.setHours(0, 0, 0, 0);
    const sinceIso = since.toISOString();

    try {
      const [studentsResult, enrollmentsResult, completionsResult, paymentsResult] = await Promise.all([
        supabase.from("profiles").select("id,created_at").eq("role", "ESTUDANTE").gte("created_at", sinceIso),
        supabase.from("enrollments").select("id,created_at,status,course:course_id(name)").gte("created_at", sinceIso),
        supabase.from("lesson_completions").select("lesson_id,completed_at,lesson:lesson_id(title)").not("completed_at", "is", null).gte("completed_at", sinceIso),
        supabase.from("payments").select("amount,created_at").eq("status", "CONFIRMED").gte("created_at", sinceIso),
      ]);

      const firstError = [studentsResult.error, enrollmentsResult.error, completionsResult.error, paymentsResult.error].find(Boolean);
      if (firstError) throw firstError;

      const students = studentsResult.data ?? [];
      const enrollments = (enrollmentsResult.data ?? []) as unknown as EnrollmentRow[];
      const completions = (completionsResult.data ?? []) as unknown as CompletionRow[];
      const payments = (paymentsResult.data ?? []) as PaymentRow[];

      setStats({
        newStudents: students.length,
        enrollments: enrollments.length,
        lessonsCompleted: completions.length,
        revenue: payments.reduce((total, payment) => total + Number(payment.amount || 0), 0),
      });
      setTimeline(buildTimeline(enrollments, period, since));
      setMostCompleted(rankBy(completions.map((item) => relationName(item.lesson, "title", "Aula sem título"))).slice(0, 6));
      setCourseDistribution(rankBy(
        enrollments
          .filter((item) => item.status === "ACTIVE")
          .map((item) => relationName(item.course, "name", "Cadeira sem nome")),
      ).slice(0, 8));
    } catch (cause) {
      setStats({ newStudents: 0, enrollments: 0, lessonsCompleted: 0, revenue: 0 });
      setTimeline([]);
      setMostCompleted([]);
      setCourseDistribution([]);
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar as métricas reais");
    } finally {
      setLoading(false);
    }
  }, [period, supabase]);

  useEffect(() => { void fetchMetrics(); }, [fetchMetrics]);

  const maxTimeline = Math.max(1, ...timeline.map((point) => point.value));
  const maxCompleted = Math.max(1, ...mostCompleted.map((item) => item.value));
  const totalActiveDistribution = courseDistribution.reduce((total, item) => total + item.value, 0);

  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-6 max-w-[1440px] mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Métricas Reais</h1>
            <p className="text-sm text-on-surface-variant/70 mt-1">Dados obtidos diretamente da atividade registada no Supabase.</p>
          </div>
          <div className="w-full md:w-52 space-y-1">
            <span className="text-[10px] text-[#808080] font-bold uppercase tracking-wider">Período analisado</span>
            <Select value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
              <option value="7_DIAS">Últimos 7 dias</option>
              <option value="30_DIAS">Últimos 30 dias</option>
              <option value="90_DIAS">Últimos 90 dias</option>
              <option value="1_ANO">Último ano</option>
            </Select>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Novos estudantes" value={stats.newStudents.toLocaleString("pt-MZ")} detail="contas criadas no período" loading={loading} />
          <MetricCard label="Novas inscrições" value={stats.enrollments.toLocaleString("pt-MZ")} detail="todos os estados" loading={loading} />
          <MetricCard label="Aulas concluídas" value={stats.lessonsCompleted.toLocaleString("pt-MZ")} detail="conclusões registadas" loading={loading} />
          <MetricCard label="Receita confirmada" value={`${stats.revenue.toLocaleString("pt-MZ")} MT`} detail="pagamentos confirmados" loading={loading} accent />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="font-playfair text-base font-bold">Novas inscrições ao longo do período</h2>
            <p className="mb-6 mt-1 text-xs text-on-surface-variant">Inclui inscrições pendentes, ativas, expiradas e canceladas.</p>
            {timeline.some((point) => point.value > 0) ? (
              <div className="h-64 flex items-end justify-between gap-2 border-b border-white/5 pb-2">
                {timeline.map((point) => (
                  <div key={point.label} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group min-w-0">
                    <span className="text-[10px] font-bold text-primary">{point.value}</span>
                    <div style={{ height: `${Math.max(3, (point.value / maxTimeline) * 82)}%` }} className="w-full max-w-12 rounded-t bg-gradient-to-t from-primary/10 to-primary" />
                    <span className="w-full truncate text-center text-[9px] text-[#808080] font-bold">{point.label}</span>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="Não existem inscrições neste período." />}
          </Card>

          <Card className="p-6">
            <h2 className="font-playfair text-base font-bold">Aulas mais concluídas</h2>
            <p className="mb-6 mt-1 text-xs text-on-surface-variant">Baseado em registos com data de conclusão.</p>
            {mostCompleted.length ? (
              <div className="space-y-4">
                {mostCompleted.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between gap-4 text-xs font-semibold">
                      <span className="truncate text-on-surface">{item.name}</span>
                      <span className="shrink-0 text-primary">{item.value}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                      <div className="h-full bg-primary" style={{ width: `${(item.value / maxCompleted) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState text="Ainda não existem aulas concluídas neste período." />}
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h2 className="font-playfair text-base font-bold">Inscrições ativas por cadeira</h2>
            <p className="mb-6 mt-1 text-xs text-on-surface-variant">Mostra apenas inscrições criadas no período e atualmente ativas.</p>
            {courseDistribution.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {courseDistribution.map((item) => {
                  const percentage = totalActiveDistribution ? (item.value / totalActiveDistribution) * 100 : 0;
                  return (
                    <div key={item.name} className="rounded-lg border border-primary/5 bg-surface-container/50 p-4">
                      <p className="truncate text-xs font-bold uppercase tracking-wider text-[#808080]">{item.name}</p>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <span className="text-2xl font-bold text-on-surface">{item.value}</span>
                        <span className="text-xs font-bold text-primary">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState text="Não existem inscrições ativas criadas neste período." />}
          </Card>
        </div>
      </div>
    </RouteGuard>
  );
}

function MetricCard({ label, value, detail, loading, accent = false }: { label: string; value: string; detail: string; loading: boolean; accent?: boolean }) {
  return (
    <Card className={`p-4 ${accent ? "border-l-4 border-emerald-500" : ""}`}>
      <p className="text-[10px] text-[#808080] uppercase tracking-wider font-bold">{label}</p>
      <h3 className={`font-playfair text-2xl font-bold mt-1 ${accent ? "text-primary" : "text-on-surface"}`}>{loading ? "…" : value}</h3>
      <p className="mt-1 text-[10px] text-on-surface-variant">{detail}</p>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-white/10 text-center text-sm text-on-surface-variant">{text}</div>;
}

function rankBy(values: string[]): RankedItem[] {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function relationName<T extends string>(relation: Record<T, string> | Record<T, string>[] | null, key: T, fallback: string) {
  const value = Array.isArray(relation) ? relation[0]?.[key] : relation?.[key];
  return value || fallback;
}

function buildTimeline(enrollments: EnrollmentRow[], period: Period, since: Date): TimelinePoint[] {
  const days = periodDays[period];
  const bucketCount = period === "7_DIAS" ? 7 : period === "30_DIAS" ? 6 : period === "90_DIAS" ? 9 : 12;
  const bucketDays = Math.ceil(days / bucketCount);
  const points = Array.from({ length: bucketCount }, (_, index) => {
    const start = new Date(since);
    start.setDate(start.getDate() + index * bucketDays);
    const label = period === "1_ANO"
      ? start.toLocaleDateString("pt-PT", { month: "short" })
      : start.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
    return { label, value: 0 };
  });

  enrollments.forEach((item) => {
    const elapsedDays = Math.floor((new Date(item.created_at).getTime() - since.getTime()) / 86_400_000);
    const index = Math.min(points.length - 1, Math.max(0, Math.floor(elapsedDays / bucketDays)));
    points[index].value += 1;
  });
  return points;
}
