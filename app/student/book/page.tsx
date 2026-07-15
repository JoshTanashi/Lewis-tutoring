import { BookingForm } from "@/app/parent/book/booking-form";
import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Book lessons" };

/** Older students who signed up for themselves manage their own bookings. */
export default async function StudentBookPage() {
  const supabase = await createServerSupabase();
  const profile = (await getProfile())!;

  const { data: me } = await supabase
    .from("students")
    .select("id, full_name, grade, assigned_tutor_id, assignment_status, is_self")
    .eq("auth_user_id", profile.id)
    .maybeSingle();

  if (!me?.is_self) {
    return (
      <EmptyState
        title="Bookings live with your parent"
        hint="Ask them to grab a slot from their portal — or come get your own account when you're in Grade 6+!"
      />
    );
  }

  const [{ data: enrollments }, { data: packages }] = await Promise.all([
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
      <PageTitle title="Book lessons 🗓️" sub="Your tutor's live availability — all online." />
      <BookingForm
        kids={[me]}
        enrollments={(enrollments ?? []).map((e) => ({
          student_id: e.student_id,
          subject: e.subjects as unknown as { id: number; name: string; emoji: string },
        }))}
        packages={packages ?? []}
      />
    </>
  );
}
