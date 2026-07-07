import { PageTitle } from "@/components/portal/widgets";
import { createServerSupabase } from "@/lib/supabase/server";
import { AvailabilityEditor } from "./editor";

export const metadata = { title: "Availability" };

export default async function AvailabilityPage() {
  const supabase = await createServerSupabase();
  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, weekday, start_time, mode, active")
    .order("weekday")
    .order("start_time");

  return (
    <>
      <PageTitle
        title="Availability 🗓️"
        sub="Your weekly rhythm — families can only book the slots you switch on."
      />
      <AvailabilityEditor slots={slots ?? []} />
    </>
  );
}
