import { PageTitle } from "@/components/portal/widgets";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { AvailabilityEditor } from "./editor";

export const metadata = { title: "Availability" };

export default async function AvailabilityPage() {
  const supabase = await createServerSupabase();
  const me = (await getProfile())!;
  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, weekday, start_time, active, tutor_id")
    .eq("tutor_id", me.id)
    .order("weekday")
    .order("start_time");

  return (
    <>
      <PageTitle
        title="My availability 🗓️"
        sub="Your weekly rhythm — families can only book the online slots you switch on."
      />
      <AvailabilityEditor slots={slots ?? []} tutorId={me.id} />
    </>
  );
}
