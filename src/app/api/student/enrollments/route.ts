import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestIdentity } from "@/lib/material-access";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const courseIdSchema = z.string().uuid();

export async function GET(request: Request) {
  try {
    const identity = await getRequestIdentity();
    if (!identity) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const courseId = new URL(request.url).searchParams.get("courseId");
    if (courseId && !courseIdSchema.safeParse(courseId).success) {
      return NextResponse.json({ error: "Cadeira inválida" }, { status: 400 });
    }

    let query = createAdminClient()
      .from("enrollments")
      .select(`
        id, course_id, end_date, start_date, status, payment_status,
        courses:course_id(id,name,department,price_monthly)
      `)
      .eq("student_id", identity.profileId)
      .order("created_at", { ascending: false });
    if (courseId) query = query.eq("course_id", courseId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ enrollments: data || [] }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Error loading student enrollments:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível carregar as inscrições",
    }, { status: 500 });
  }
}
