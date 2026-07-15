import { PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { BookingForm } from "./booking-form";

export const metadata = { title: "Book a lesson" };

export default async function BookPage() {
  const supabase = await createServerSupabase();
  const [{ data: kids }, { data: enrollments }, { data: packages }] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, grade, assigned_tutor_id, assignment_status")
      .order("full_name"),
    supabase
      .from("enrollments")
      .select("student_id, subject_id, subjects(id, name, emoji)")
      .eq("active", true),
    supabase
      .from("packages")
      .select("slug, name, emoji, price_cents, lessons_per_month, blurb, popular")
      .eq("active", true)
      .order("price_cents"),
  ]);

  return (
    <>
      <PageTitle
        title="Book a lesson 🗓️"
        sub="Live online lessons — the calendar shows your tutor's real availability."
      />
      <BookingForm
        kids={kids ?? []}
        enrollments={(enrollments ?? []).map((e) => ({
          student_id: e.student_id,
          subject: e.subjects as unknown as { id: number; name: string; emoji: string },
        }))}
        packages={packages ?? []}
      />
    </>
  );
}
