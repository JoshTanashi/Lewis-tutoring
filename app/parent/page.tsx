import Link from "next/link";
import { redirect } from "next/navigation";
import { JourneyTimeline, type JourneyEvent } from "@/components/portal/journey";
import { EmptyState, PageTitle, StatCard, fmtCents, fmtDate } from "@/components/portal/widgets";
import { ButtonLink, Card, Chip } from "@/components/ui";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { MarksChartCard } from "./marks-chart";

export const metadata = { title: "Parent dashboard" };

export default async function ParentDashboard() {
  const supabase = await createServerSupabase();
  const profile = (await getProfile())!;

  const { data: kids } = await supabase
    .from("v_student_overview")
    .select("*")
    .order("full_name");

  // Brand-new parents go straight to onboarding
  if (!kids?.length && profile.role === "parent") redirect("/onboarding");

  const kidIds = (kids ?? []).map((k) => k.student_id).filter(Boolean) as string[];
  if (!kidIds.length) {
    return (
      <>
        <PageTitle title={`Hi ${profile.full_name.split(" ")[0] || "there"}! 👋`} />
        <EmptyState title="No students yet" hint="Families appear here as they sign up." />
      </>
    );
  }

  const [{ data: lessons }, { data: pendingInvoices }, { data: journey }, { data: marks }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("id, scheduled_at, mode, status, meeting_url, student_id, subjects(name, emoji)")
        .in("student_id", kidIds)
        .eq("status", "scheduled")
        .gte("scheduled_at", new Date().toISOString())
        .order("scheduled_at")
        .limit(5),
      supabase
        .from("invoices")
        .select("id, number, description, amount_cents, due_at")
        .eq("status", "pending")
        .order("issued_at", { ascending: false }),
      supabase
        .from("journey_events")
        .select("id, type, title, detail, emoji, happened_at, student_id")
        .in("student_id", kidIds)
        .order("happened_at", { ascending: false })
        .limit(6),
      supabase
        .from("assessments")
        .select("assessed_on, score, max_score, student_id")
        .in("student_id", kidIds)
        .order("assessed_on")
        .limit(40),
    ]);

  const kidName = (id: string | null) =>
    kids?.find((k) => k.student_id === id)?.full_name?.split(" ")[0] ?? "";

  return (
    <>
      <PageTitle
        title={`Hi ${profile.full_name.split(" ")[0] || "there"}! 👋`}
        sub="Here's how your crew is doing."
        action={<ButtonLink href="/parent/book">Book a lesson ✨</ButtonLink>}
      />

      {!!pendingInvoices?.length && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-2 border-sunshine bg-pastel-yellow p-4">
          <p className="font-display font-bold">
            🧾 You have {pendingInvoices.length} unpaid invoice
            {pendingInvoices.length > 1 ? "s" : ""} (
            {fmtCents(pendingInvoices.reduce((s, i) => s + i.amount_cents, 0))})
          </p>
          <ButtonLink href="/parent/billing" size="sm" variant="navy">
            View &amp; pay →
          </ButtonLink>
        </Card>
      )}

      {/* per-child overview */}
      <div className="grid gap-5 lg:grid-cols-2">
        {(kids ?? []).map((k) => (
          <Card key={k.student_id} className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-xl">{k.full_name}</p>
                <p className="text-xs text-ink-soft">{k.grade}</p>
              </div>
              <Link
                href={`/parent/kids/${k.student_id}`}
                className="font-display text-sm font-bold text-sky-deep underline underline-offset-2"
              >
                Journey →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="Attendance" value={`${k.attendance_pct ?? 100}%`} tone="grass" emoji="📅" />
              <StatCard label="Avg mark" value={k.avg_mark_pct != null ? `${k.avg_mark_pct}%` : "—"} tone="sky" emoji="🧠" />
              <StatCard label="Homework" value={`${k.homework_pct ?? 100}%`} tone="sunshine" emoji="📚" />
              <StatCard
                label="Next lesson"
                value={k.next_lesson_at ? fmtDate(k.next_lesson_at, true) : "—"}
                tone="coral"
                emoji="⏰"
              />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* upcoming lessons */}
        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold text-lg">Coming up 🗓️</h2>
          {lessons?.length ? (
            <ul className="space-y-3">
              {lessons.map((l) => (
                <li key={l.id} className="flex items-center gap-3 rounded-2xl bg-pastel-blue p-3">
                  <span className="text-xl">
                    {(l.subjects as unknown as { emoji: string } | null)?.emoji ?? "📘"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-bold text-sm">
                      {kidName(l.student_id)} ·{" "}
                      {(l.subjects as unknown as { name: string } | null)?.name ?? "Lesson"}
                    </p>
                    <p className="text-xs text-ink-soft">{fmtDate(l.scheduled_at, true)}</p>
                  </div>
                  {l.meeting_url ? (
                    <a
                      href={l.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="squash rounded-full bg-grass px-3 py-1 font-display text-xs font-bold text-white"
                    >
                      💻 Join
                    </a>
                  ) : (
                    <Chip tone="sky">💻</Chip>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No lessons booked" hint="Grab a spot on the calendar!" />
          )}
        </Card>

        {/* marks trend */}
        <MarksChartCard
          marks={(marks ?? []).map((m) => ({
            label: new Date(m.assessed_on).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }),
            value: Math.round((Number(m.score) / Number(m.max_score || 100)) * 100),
          }))}
        />

        {/* recent journey */}
        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold text-lg">Latest wins 🌈</h2>
          <JourneyTimeline
            events={(journey ?? []).map((j) => ({
              ...j,
              title: kids && kids.length > 1 ? `${kidName(j.student_id)}: ${j.title}` : j.title,
            })) as JourneyEvent[]}
          />
        </Card>
      </div>
    </>
  );
}
