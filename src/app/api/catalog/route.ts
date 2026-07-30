import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCourseDescription } from "@/lib/course-descriptions";

export const runtime = "nodejs";

export async function GET() {
  const admin = createAdminClient();
  const [coursesResult, tutorsResult, assignmentsResult, studentsResult, publicLessonsResult] = await Promise.all([
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
    admin.from("lessons")
      .select("id,title,topic,duration,course_id", { count: "exact" })
      .eq("is_active", true)
      .eq("access_level", "PUBLIC")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const error = coursesResult.error
    || tutorsResult.error
    || assignmentsResult.error
    || studentsResult.error
    || publicLessonsResult.error;
  if (error) return NextResponse.json({ error: "Não foi possível carregar o catálogo" }, { status: 500 });

  const tutors = tutorsResult.data ?? [];
  const assignments = assignmentsResult.data ?? [];
  const courseRows = coursesResult.data ?? [];
  const courses = courseRows.map((course) => ({
    ...course,
    description: getCourseDescription(course.name, course.description),
    tutors: assignments
      .filter((assignment) => assignment.course_id === course.id)
      .map((assignment) => tutors.find((tutor) => tutor.id === assignment.tutor_id))
      .filter(Boolean),
  }));
  const publicLessons = (publicLessonsResult.data ?? []).map((lesson) => ({
    ...lesson,
    course_name: courseRows.find((course) => course.id === lesson.course_id)?.name ?? "Aula gratuita",
  }));

  return NextResponse.json({
    courses,
    tutors,
    publicLessons,
    stats: {
      courses: courses.length,
      tutors: tutors.length,
      students: studentsResult.count ?? 0,
      freeLessons: publicLessonsResult.count ?? publicLessons.length,
    },
  }, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=1800" },
  });
}
