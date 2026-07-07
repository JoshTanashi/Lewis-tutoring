import Link from "next/link";
import { EmptyState, PageTitle, fmtDate } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata = { title: "Students" };

export default async function StudentsPage() {
  const supabase = await createServerSupabase();
  const { data: students } = await supabase
    .from("v_student_overview")
    .select("*")
    .order("full_name");

  return (
    <>
      <PageTitle title="Students ⭐" sub="Your whole crew, at a glance." />
      {!students?.length && (
        <EmptyState title="No students yet" hint="As soon as a family signs up, they'll appear here." />
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(students ?? []).map((s) => (
          <Link key={s.student_id} href={`/tutor/students/${s.student_id}`} className="squash block">
            <Card className="h-full p-5">
              <p className="font-display font-bold text-lg">{s.full_name}</p>
              <p className="text-xs text-ink-soft">{s.grade}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip tone="grass">att {s.attendance_pct}%</Chip>
                <Chip tone="sky">avg {s.avg_mark_pct ?? "—"}%</Chip>
                <Chip tone="sunshine">hw {s.homework_pct}%</Chip>
                <Chip tone="lilac">conf {s.confidence_score}%</Chip>
              </div>
              <p className="mt-3 text-xs font-bold text-ink-soft">
                {s.next_lesson_at ? `Next lesson ${fmtDate(s.next_lesson_at, true)}` : "No lesson booked"}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
