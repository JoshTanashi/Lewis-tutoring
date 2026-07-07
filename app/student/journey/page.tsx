import { JourneyTimeline, type JourneyEvent } from "@/components/portal/journey";
import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { Card } from "@/components/ui";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "My Journey" };

export default async function StudentJourneyPage() {
  const supabase = await createServerSupabase();
  const profile = (await getProfile())!;
  const { data: me } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("auth_user_id", profile.id)
    .maybeSingle();

  if (!me) return <EmptyState title="No journey found" hint="Ask a grown-up to help!" />;

  const { data: journey } = await supabase
    .from("journey_events")
    .select("id, type, title, detail, emoji, happened_at")
    .eq("student_id", me.id)
    .order("happened_at", { ascending: false })
    .limit(50);

  return (
    <>
      <PageTitle
        title="My journey 🌈"
        sub="Every win, every badge, every brave moment — this is your story!"
      />
      <Card sticker className="p-6">
        <JourneyTimeline events={(journey ?? []) as JourneyEvent[]} />
      </Card>
    </>
  );
}
