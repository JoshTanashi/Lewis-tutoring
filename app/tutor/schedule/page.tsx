import { EmptyState, PageTitle } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { LessonActions } from "./lesson-actions";

export const metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const supabase = await createServerSupabase();
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 14);

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, scheduled_at, mode, status, meeting_url, student_id, students(full_name, grade), subjects(name, emoji)")
    .gte("scheduled_at", from.toISOString())
    .lt("scheduled_at", to.toISOString())
    .order("scheduled_at");

  const byDay = new Map<string, NonNullable<typeof lessons>>();
  for (const l of lessons ?? []) {
    const day = new Date(l.scheduled_at).toDateString();
    byDay.set(day, [...(byDay.get(day) ?? []), l]);
  }

  return (
    <>
      <PageTitle title="Schedule 🗓️" sub="The next two weeks of lessons." />
      {byDay.size === 0 && (
        <EmptyState title="Nothing on the calendar" hint="Bookings from families appear here instantly." />
      )}
      <div className="space-y-6">
        {[...byDay.entries()].map(([day, dayLessons]) => (
          <div key={day}>
            <h2 className="mb-2 font-display font-bold text-lg">
              {new Date(day).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}
            </h2>
            <div className="space-y-3">
              {dayLessons.map((l) => {
                const student = l.students as unknown as { full_name: string; grade: string } | null;
                const subject = l.subjects as unknown as { name: string; emoji: string } | null;
                return (
                  <Card key={l.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-display font-bold text-lg">
                        {new Date(l.scheduled_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">{student?.full_name}</p>
                        <p className="text-xs text-ink-soft">
                          {student?.grade} · {subject?.emoji} {subject?.name ?? "Lesson"}
                        </p>
                      </div>
                      {l.meeting_url && (
                        <a
                          href={l.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="squash rounded-full bg-grass px-3.5 py-1.5 font-display text-xs font-bold text-white"
                        >
                          💻 Join
                        </a>
                      )}
                      <Chip
                        tone={
                          l.status === "completed"
                            ? "grass"
                            : l.status === "cancelled" || l.status === "no_show"
                              ? "coral"
                              : "sunshine"
                        }
                      >
                        {l.status}
                      </Chip>
                    </div>
                    {l.status === "scheduled" && (
                      <LessonActions lessonId={l.id} studentId={l.student_id} meetingUrl={l.meeting_url} />
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
