import { PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { BookingForm } from "./booking-form";

export const metadata = { title: "Book a lesson" };

export default async function BookPage() {
  const supabase = await createServerSupabase();
  const [{ data: kids }, { data: slots }, { data: enrollments }, { data: packages }] =
    await Promise.all([
      supabase.from("students").select("id, full_name, grade").order("full_name"),
      supabase.rpc("get_open_slots", { p_days: 21 }),
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
      <PageTitle title="Book a lesson 🗓️" sub="Live availability — first come, first served!" />
      <BookingForm
        kids={kids ?? []}
        slots={(slots ?? []) as { slot_at: string; mode: string; duration_minutes: number }[]}
        enrollments={(enrollments ?? []).map((e) => ({
          student_id: e.student_id,
          subject: e.subjects as unknown as { id: number; name: string; emoji: string },
        }))}
        packages={packages ?? []}
      />
    </>
  );
}
