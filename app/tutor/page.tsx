import Link from "next/link";
import { PencilPal, Sparkle } from "@/components/brand/mascots";
import { EmptyState, PageTitle, StatCard, fmtCents } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { LessonActions } from "./schedule/lesson-actions";

export const metadata = { title: "Tutor HQ" };

export default async function TutorDashboard() {
  const supabase = await createServerSupabase();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [
    { data: kpis },
    { data: today },
    { count: reviewCount },
    { data: attention },
    { data: motivation },
  ] = await Promise.all([
    supabase.from("v_admin_kpis").select("*").single(),
    supabase
      .from("lessons")
      .select("id, scheduled_at, mode, status, student_id, students(full_name), subjects(name, emoji)")
      .gte("scheduled_at", dayStart.toISOString())
      .lt("scheduled_at", dayEnd.toISOString())
      .order("scheduled_at"),
    supabase
      .from("homework")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted"),
    supabase
      .from("v_student_overview")
      .select("student_id, full_name, grade, attendance_pct, avg_mark_pct, homework_pct")
      .order("avg_mark_pct", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase.from("motivational_messages").select("body, author"),
  ]);

  // a different love note each day, rotating through the collection
  const dayIndex = Math.floor(dayStart.getTime() / 86_400_000);
  const note = motivation?.length ? motivation[dayIndex % motivation.length] : null;

  return (
    <>
      <PageTitle title="Good day, Miss Lewis! ✏️" sub="Here's your classroom at a glance." />

      {note && (
        <Card className="relative mb-6 overflow-hidden border-2 border-lilac bg-pastel-purple p-5">
          <Sparkle size={18} className="absolute right-4 top-4 animate-twinkle" color="var(--color-lilac)" />
          <div className="flex items-center gap-4">
            <PencilPal size={54} mood="excited" className="shrink-0 animate-wiggle" />
            <div>
              <p className="font-display font-bold text-navy">“{note.body}”</p>
              <p className="mt-1 text-xs font-bold text-ink-soft">
                — {note.author} · only you can see these 💛
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Lessons today" value={today?.length ?? 0} emoji="🎓" tone="sky" />
        <StatCard label="Homework to review" value={reviewCount ?? 0} emoji="📚" tone="sunshine" />
        <StatCard
          label="Revenue this month"
          value={fmtCents(kpis?.revenue_this_month_cents ?? 0)}
          emoji="💰"
          tone="grass"
        />
        <StatCard
          label="Active students"
          value={`${kpis?.active_students ?? 0}/${kpis?.total_students ?? 0}`}
          emoji="⭐"
          tone="lilac"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold text-lg">Today&apos;s schedule 🗓️</h2>
          {today?.length ? (
            <ul className="space-y-3">
              {today.map((l) => (
                <li key={l.id} className="rounded-2xl bg-pastel-blue p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-display font-bold">
                      {new Date(l.scheduled_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {(l.students as unknown as { full_name: string } | null)?.full_name}
                        <span className="text-ink-soft font-normal">
                          {" "}· {(l.subjects as unknown as { name: string; emoji: string } | null)?.emoji}{" "}
                          {(l.subjects as unknown as { name: string } | null)?.name ?? "Lesson"}
                        </span>
                      </p>
                    </div>
                    <Chip tone={l.mode === "online" ? "sky" : "grass"}>
                      {l.mode === "online" ? "💻 online" : "🏡 in person"}
                    </Chip>
                  </div>
                  {l.status === "scheduled" && (
                    <LessonActions lessonId={l.id} studentId={l.student_id} />
                  )}
                  {l.status !== "scheduled" && (
                    <p className="mt-1 text-xs font-bold text-ink-soft">status: {l.status}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="A free day!" hint="No lessons today — time for a cup of tea. ☕" />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold text-lg">Might need a boost 💪</h2>
          {attention?.length ? (
            <ul className="space-y-3">
              {attention.map((s) => (
                <li key={s.student_id}>
                  <Link
                    href={`/tutor/students/${s.student_id}`}
                    className="squash flex items-center gap-3 rounded-2xl border-2 border-line bg-paper p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-sm">{s.full_name}</p>
                      <p className="text-xs text-ink-soft">{s.grade}</p>
                    </div>
                    <Chip tone="sky">avg {s.avg_mark_pct ?? "—"}%</Chip>
                    <Chip tone="grass">att {s.attendance_pct}%</Chip>
                    <Chip tone="sunshine">hw {s.homework_pct}%</Chip>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No students yet" hint="They'll appear as families sign up." />
          )}
        </Card>
      </div>
    </>
  );
}
