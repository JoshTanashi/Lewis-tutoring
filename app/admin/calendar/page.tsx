import Link from "next/link";
import { PageTitle } from "@/components/portal/widgets";
import { Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { AvailabilityEditor } from "@/app/tutor/availability/editor";

export const metadata = { title: "Calendar & availability" };

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ tutor?: string }>;
}) {
  const supabase = await createServerSupabase();
  const { tutor: tutorParam } = await searchParams;
  const selected = tutorParam === "general" || !tutorParam ? null : tutorParam;

  const [{ data: tutors }, { data: slots }] = await Promise.all([
    supabase.from("v_tutor_month").select("tutor_id, full_name, active").order("full_name"),
    selected
      ? supabase
          .from("availability_slots")
          .select("id, weekday, start_time, active, tutor_id")
          .eq("tutor_id", selected)
          .order("weekday")
          .order("start_time")
      : supabase
          .from("availability_slots")
          .select("id, weekday, start_time, active, tutor_id")
          .is("tutor_id", null)
          .order("weekday")
          .order("start_time"),
  ]);

  return (
    <>
      <PageTitle
        title="Calendar & availability 🗓️"
        sub="Set the bookable times for each tutor — and the general pool new families see before they're matched."
      />
      <div className="mb-5 flex flex-wrap gap-2">
        <Link href="/admin/calendar?tutor=general">
          <Chip tone={selected === null ? "navy" : "sky"} className="cursor-pointer border-2 border-line py-1.5">
            🌈 General pool (new sign-ups)
          </Chip>
        </Link>
        {(tutors ?? []).map((t) => (
          <Link key={t.tutor_id} href={`/admin/calendar?tutor=${t.tutor_id}`}>
            <Chip
              tone={selected === t.tutor_id ? "navy" : t.active ? "grass" : "coral"}
              className="cursor-pointer border-2 border-line py-1.5"
            >
              {t.full_name || "Unnamed"}
            </Chip>
          </Link>
        ))}
      </div>
      <AvailabilityEditor slots={slots ?? []} tutorId={selected} />
    </>
  );
}
