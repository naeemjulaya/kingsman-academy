import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIdentity, hasPaidCourseAccess } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const idSchema = z.string().uuid();
const lessonFields = `
  id,title,topic,description,duration,order_index,course_id,
  courses:course_id(name)
`;

export async function GET(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const params = new URL(request.url).searchParams;
    const courseId = params.get("courseId");
    const lessonId = params.get("lessonId");
    if ((courseId && !idSchema.safeParse(courseId).success) || (lessonId && !idSchema.safeParse(lessonId).success)) {
      return NextResponse.json({ error: "Identificador inválido" }, { status: 400 });
    }

    const admin = createAdminClient();
    let selectedCourseIds: string[] = [];

    if (lessonId) {
      const { data: requestedLesson, error } = await admin
        .from("lessons")
        .select("course_id")
        .eq("id", lessonId)
        .eq("is_active", true)
        .single();
      if (error || !requestedLesson) return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 });
      if (!(await hasPaidCourseAccess(identity, requestedLesson.course_id))) {
        return NextResponse.json({ error: "Acesso negado. Inscrição necessária." }, { status: 403 });
      }
      selectedCourseIds = [requestedLesson.course_id];
    } else if (courseId) {
      selectedCourseIds = [courseId];
    } else {
      const { data: enrollments, error } = await admin
        .from("enrollments")
        .select("course_id,end_date")
        .eq("student_id", identity.profileId)
        .eq("status", "ACTIVE")
        .eq("payment_status", "CONFIRMED");
      if (error) throw error;
      selectedCourseIds = (enrollments || [])
        .filter((enrollment) => !enrollment.end_date || new Date(enrollment.end_date) > new Date())
        .map((enrollment) => enrollment.course_id);
    }

    if (!selectedCourseIds.length) {
      return NextResponse.json({ lessons: [] }, { headers: { "Cache-Control": "private, no-store" } });
    }

    const { data, error } = await admin
      .from("lessons")
      .select(lessonFields)
      .in("course_id", selectedCourseIds)
      .eq("is_active", true)
      .order("course_id")
      .order("order_index");
    if (error) throw error;

    return NextResponse.json({ lessons: data || [] }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error loading student lessons:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível carregar as aulas",
    }, { status: 500 });
  }
}
