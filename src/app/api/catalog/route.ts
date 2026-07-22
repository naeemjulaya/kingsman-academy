import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCourseDescription } from "@/lib/course-descriptions";

export const runtime = "nodejs";

export async function GET() {
  const admin = createAdminClient();
  const [coursesResult, tutorsResult, assignmentsResult, studentsResult] = await Promise.all([
    admin.from("courses")
      .select("id,name,department,university,description,price_monthly")
      .eq("is_active", true)
      .order("name"),
    admin.from("profiles")
      .select("id,full_name,university,bio,avatar_url")
      .eq("role", "EXPLICADOR")
      .eq("status", "active")
      .order("full_name"),
    admin.from("course_tutors")
      .select("course_id,tutor_id")
      .eq("is_active", true),
    admin.from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "ESTUDANTE")
      .eq("status", "active"),
  ]);

  const error = coursesResult.error || tutorsResult.error || assignmentsResult.error || studentsResult.error;
  if (error) return NextResponse.json({ error: "Não foi possível carregar o catálogo" }, { status: 500 });

  const tutors = tutorsResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const courses = (coursesResult.data ?? []).map((course) => ({
    ...course,
    description: getCourseDescription(course.name, course.description),
    tutors: assignments
      .filter((assignment) => assignment.course_id === course.id)
      .map((assignment) => tutors.find((tutor) => tutor.id === assignment.tutor_id))
      .filter(Boolean),
  }));

  return NextResponse.json({
    courses,
    tutors,
    stats: {
      courses: courses.length,
      tutors: tutors.length,
      students: studentsResult.count ?? 0,
    },
  }, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=1800" },
  });
}
