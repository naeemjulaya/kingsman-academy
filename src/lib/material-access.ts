import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type RequestIdentity = {
  userId: string;
  profileId: string;
  role: "ESTUDANTE" | "EXPLICADOR" | "COORDENADOR" | "ADMIN";
};

export async function getRequestIdentity(): Promise<RequestIdentity | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("id,role,status")
    .eq("user_id", user.id)
    .single();
  if (!profile || profile.status !== "active") return null;

  return { userId: user.id, profileId: profile.id, role: profile.role } as RequestIdentity;
}

export async function canManageCourseMaterial(identity: RequestIdentity, courseId: string) {
  if (identity.role === "ADMIN") return true;
  if (identity.role !== "EXPLICADOR") return false;

  const { data } = await createAdminClient()
    .from("course_tutors")
    .select("id")
    .eq("course_id", courseId)
    .eq("tutor_id", identity.profileId)
    .eq("is_active", true)
    .maybeSingle();
  return Boolean(data);
}

export async function hasPaidCourseAccess(identity: RequestIdentity, courseId: string) {
  if (await canManageCourseMaterial(identity, courseId)) return true;
  if (identity.role !== "ESTUDANTE") return false;

  const { data } = await createAdminClient()
    .from("enrollments")
    .select("id,end_date")
    .eq("course_id", courseId)
    .in("student_id", [...new Set([identity.userId, identity.profileId])])
    .eq("status", "ACTIVE")
    .eq("payment_status", "CONFIRMED")
    .maybeSingle();

  return Boolean(data && (!data.end_date || new Date(data.end_date) > new Date()));
}
