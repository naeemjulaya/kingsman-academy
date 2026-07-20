"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";

export type TutorCourse = {
  id: string;
  name: string;
  department: string | null;
  university: string | null;
  description: string | null;
  price_monthly: number | null;
  is_active: boolean;
};

export function useTutorScope() {
  const { user } = useAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [courses, setCourses] = useState<TutorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      setError("");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();
      if (profileError || !profile) {
        setError(profileError?.message || "Perfil do explicador não encontrado.");
        setLoading(false);
        return;
      }

      setProfileId(profile.id);
      const { data, error: coursesError } = await supabase
        .from("course_tutors")
        .select("course:courses(id,name,department,university,description,price_monthly,is_active)")
        .eq("tutor_id", profile.id)
        .eq("is_active", true);
      if (coursesError) {
        setError(coursesError.message);
      } else {
        const assigned = (data || [])
          .flatMap((row) => Array.isArray(row.course) ? row.course : row.course ? [row.course] : [])
          .filter((course): course is TutorCourse => Boolean(course?.id));
        setCourses(assigned);
      }
      setLoading(false);
    }

    void load();
  }, [user]);

  return { profileId, courses, courseIds: courses.map((course) => course.id), loading, error };
}
