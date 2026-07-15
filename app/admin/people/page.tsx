import { PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { PeopleBoard } from "./people-board";

export const metadata = { title: "Students & parents" };

export default async function PeoplePage() {
  const supabase = await createServerSupabase();

  const [{ data: students }, { data: parents }, { data: tutors }, { data: tutorSubjects }, { data: enrollments }, { data: subjects }] =
    await Promise.all([
      supabase
        .from("students")
        .select(
          "id, full_name, grade, age_band, is_self, goals, medical_notes, learning_style, other_subjects, wants_assessment, mascot, username, created_at, parent_id, assigned_tutor_id, assignment_status, confidence_score",
        )
        .order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, phone, role"),
      supabase.from("v_tutor_month").select("tutor_id, full_name, active, active_students"),
      supabase.from("tutor_subjects").select("tutor_id, subject_id"),
      supabase.from("enrollments").select("student_id, subject_id"),
      supabase.from("subjects").select("id, name, emoji"),
    ]);

  return (
    <>
      <PageTitle
        title="Students & parents 🎒"
        sub="Every sign-up lands here first — you match them with the right tutor (or take them yourself)."
      />
      <PeopleBoard
        students={students ?? []}
        parents={parents ?? []}
        tutors={(tutors ?? []).filter((t) => t.active)}
        tutorSubjects={tutorSubjects ?? []}
        enrollments={enrollments ?? []}
        subjects={subjects ?? []}
      />
    </>
  );
}
