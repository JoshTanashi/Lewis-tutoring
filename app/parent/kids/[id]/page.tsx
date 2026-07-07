import { notFound } from "next/navigation";
import { JourneyTimeline, type JourneyEvent } from "@/components/portal/journey";
import { PageTitle, StatCard } from "@/components/portal/widgets";
import { Card, Chip, RainbowProgress } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Learning journey" };

export default async function KidJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const [{ data: kid }, { data: overview }, { data: journey }, { data: badges }, { data: streak }] =
    await Promise.all([
      supabase.from("students").select("id, full_name, grade, goals, mascot").eq("id", id).single(),
      supabase.from("v_student_overview").select("*").eq("student_id", id).single(),
      supabase
        .from("journey_events")
        .select("id, type, title, detail, emoji, happened_at")
        .eq("student_id", id)
        .order("happened_at", { ascending: false })
        .limit(50),
      supabase
        .from("student_badges")
        .select("awarded_at, badges(name, emoji, description)")
        .eq("student_id", id)
        .order("awarded_at", { ascending: false }),
      supabase.from("streaks").select("current_weeks, best_weeks").eq("student_id", id).maybeSingle(),
    ]);
  if (!kid) notFound();

  return (
    <>
      <PageTitle
        title={`${kid.full_name}'s journey 🌈`}
        sub={`${kid.grade}${kid.goals ? ` · Goal: ${kid.goals}` : ""}`}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Attendance" value={`${overview?.attendance_pct ?? 100}%`} tone="grass" emoji="📅" />
        <StatCard
          label="Avg mark"
          value={overview?.avg_mark_pct != null ? `${overview.avg_mark_pct}%` : "—"}
          tone="sky"
          emoji="🧠"
        />
        <StatCard label="Homework" value={`${overview?.homework_pct ?? 100}%`} tone="sunshine" emoji="📚" />
        <StatCard label="Lessons done" value={overview?.lessons_completed ?? 0} tone="lilac" emoji="🎓" />
        <StatCard label="Streak" value={`${streak?.current_weeks ?? 0} wks`} hint={`best: ${streak?.best_weeks ?? 0}`} tone="coral" emoji="🔥" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 font-display font-bold text-lg">The story so far 📖</h2>
          <JourneyTimeline events={(journey ?? []) as JourneyEvent[]} />
        </Card>
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold text-lg">Confidence 🌱</h2>
            <RainbowProgress value={kid ? (overview?.confidence_score ?? 50) : 50} label="confidence" />
            <p className="mt-2 text-xs text-ink-soft">
              Miss Lewis updates this as {kid.full_name.split(" ")[0]} grows braver with the work.
            </p>
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 font-display font-bold text-lg">Badge shelf 🏅</h2>
            {badges?.length ? (
              <div className="flex flex-wrap gap-2">
                {badges.map((b, i) => {
                  const badge = b.badges as unknown as { name: string; emoji: string };
                  return (
                    <Chip key={i} tone="sunshine" className="border border-line py-1.5">
                      {badge.emoji} {badge.name}
                    </Chip>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-ink-soft">The first badge is always the sweetest — coming soon!</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
