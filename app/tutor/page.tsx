import Link from "next/link";
import { PencilPal, Sparkle } from "@/components/brand/mascots";
import { EmptyState, PageTitle, StatCard, fmtDate } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { getProfile } from "@/lib/rbac";
import { createServerSupabase } from "@/lib/supabase/server";
import { ApprovalQueue, type PendingStudent } from "./approval-queue";
import { LessonActions } from "./schedule/lesson-actions";

export const metadata = { title: "Tutor HQ" };

export default async function TutorDashboard() {
  const supabase = await createServerSupabase();
  const me = (await getProfile())!;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [
    { data: pending },
    { data: pendingSubjects },
    { data: roster },
    { data: today },
    { count: reviewCount },
    { data: motivation },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id, full_name, grade, goals, wants_assessment, other_subjects")
      .eq("assigned_tutor_id", me.id)
      .eq("assignment_status", "pending_tutor")
      .order("created_at"),
    supabase.from("enrollments").select("student_id, subjects(name, emoji)"),
    supabase
      .from("v_student_overview")
      .select("*")
      .order("full_name"),
    supabase
      .from("lessons")
      .select("id, scheduled_at, mode, status, meeting_url, student_id, students(full_name), subjects(name, emoji)")
      .eq("tutor_id", me.id)
      .gte("scheduled_at", dayStart.toISOString())
      .lt("scheduled_at", dayEnd.toISOString())
      .order("scheduled_at"),
    supabase.from("homework").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("motivational_messages").select("body, author"),
  ]);

  // v_student_overview is RLS-scoped; keep only the students actually in my class here
  const { data: myStudents } = await supabase
    .from("students")
    .select("id, assigned_tutor_id, assignment_status, wants_assessment, mascot")
    .eq("assigned_tutor_id", me.id)
    .eq("assignment_status", "active");
  const myIds = new Set((myStudents ?? []).map((s) => s.id));
  const myRoster = (roster ?? []).filter((r) => myIds.has(r.student_id as string));

  const pendingCards: PendingStudent[] = (pending ?? []).map((p) => ({
    ...p,
    subjects: (pendingSubjects ?? [])
      .filter((e) => e.student_id === p.id)
      .map((e) => e.subjects as unknown as { name: string; emoji: string })
      .filter(Boolean),
  }));

  const dayIndex = Math.floor(dayStart.getTime() / 86_400_000);
  const note = motivation?.length ? motivation[dayIndex % motivation.length] : null;
  const firstName = (me.full_name || "there").split(" ")[0];

  return (
    <>
      <PageTitle
        title={`Good day, ${firstName}! ✏️`}
        sub="Here's your classroom at a glance."
      />

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

      <ApprovalQueue students={pendingCards} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Lessons today" value={today?.length ?? 0} emoji="🎓" tone="sky" />
        <StatCard label="Homework to review" value={reviewCount ?? 0} emoji="📚" tone="sunshine" />
        <StatCard label="My students" value={myRoster.length} emoji="⭐" tone="grass" />
        <StatCard label="Waiting to join" value={pendingCards.length} emoji="🤝" tone="lilac" />
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
                    {l.meeting_url ? (
                      <a
                        href={l.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="squash rounded-full bg-grass px-3.5 py-1.5 font-display text-xs font-bold text-white"
                      >
                        💻 Join lesson
                      </a>
                    ) : (
                      <Chip tone="sunshine">no link yet</Chip>
                    )}
                  </div>
                  {l.status === "scheduled" && (
                    <LessonActions lessonId={l.id} studentId={l.student_id} meetingUrl={l.meeting_url} />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="A free day!" hint="No lessons today — time for a cup of tea. ☕" />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold text-lg">My class ⭐</h2>
          {myRoster.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {myRoster.map((s) => (
                <Link
                  key={s.student_id}
                  href={`/tutor/students/${s.student_id}`}
                  className="squash block rounded-2xl border-2 border-line bg-paper p-3"
                >
                  <p className="font-display font-bold text-sm">{s.full_name}</p>
                  <p className="text-xs text-ink-soft">{s.grade}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Chip tone="grass">att {s.attendance_pct}%</Chip>
                    <Chip tone="sky">avg {s.avg_mark_pct ?? "—"}%</Chip>
                    {s.next_lesson_at && (
                      <Chip tone="sunshine">⏰ {fmtDate(s.next_lesson_at)}</Chip>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No students in your class yet"
              hint="When the Lewis team assigns you a student, they pop up above for your yes!"
            />
          )}
        </Card>
      </div>
    </>
  );
}
