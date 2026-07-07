import Link from "next/link";
import { EmptyState, PageTitle, StatCard, fmtCents } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { AdminCharts } from "./admin-charts";

export const metadata = { title: "Mission Control" };

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();
  const [{ data: kpis }, { data: monthly }, { data: subjectPerf }, { data: risk }] =
    await Promise.all([
      supabase.from("v_admin_kpis").select("*").single(),
      supabase.from("v_monthly_revenue").select("*").order("month").limit(12),
      supabase.from("v_subject_performance").select("*").order("students", { ascending: false }),
      supabase
        .from("v_student_overview")
        .select("student_id, full_name, grade, attendance_pct, avg_mark_pct, homework_pct")
        .or("attendance_pct.lt.80,homework_pct.lt.60")
        .limit(5),
    ]);

  return (
    <>
      <PageTitle
        title="Mission Control 👑"
        sub="Everything important, visible in 30 seconds."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Students" value={kpis?.total_students ?? 0} emoji="⭐" tone="sky" hint={`${kpis?.active_students ?? 0} active · ${kpis?.new_students_30d ?? 0} new`} />
        <StatCard label="Parents" value={kpis?.parents ?? 0} emoji="❤️" tone="coral" />
        <StatCard label="Revenue (month)" value={fmtCents(kpis?.revenue_this_month_cents ?? 0)} emoji="💰" tone="grass" hint={`${fmtCents(kpis?.outstanding_cents ?? 0)} outstanding`} />
        <StatCard label="Attendance" value={`${kpis?.attendance_pct ?? 100}%`} emoji="📅" tone="sunshine" hint={`homework ${kpis?.homework_pct ?? 100}%`} />
        <StatCard label="Video waitlist" value={kpis?.waitlist_count ?? 0} emoji="🎬" tone="lilac" hint="future subscribers!" />
      </div>

      <AdminCharts
        revenue={(monthly ?? []).map((m) => ({
          label: new Date(m.month!).toLocaleDateString("en-ZA", { month: "short" }),
          value: (m.revenue_cents ?? 0) / 100,
        }))}
        subjects={(subjectPerf ?? [])
          .filter((s) => (s.students ?? 0) > 0)
          .map((s) => ({ label: `${s.emoji} ${s.name}`, value: s.students ?? 0 }))}
      />

      <Card className="mt-6 p-5">
        <h2 className="mb-3 font-display font-bold text-lg">Students needing a look 🔍</h2>
        {risk?.length ? (
          <ul className="space-y-2.5">
            {risk.map((s) => (
              <li key={s.student_id}>
                <Link
                  href={`/tutor/students/${s.student_id}`}
                  className="squash flex flex-wrap items-center gap-2 rounded-2xl border-2 border-line bg-paper p-3"
                >
                  <p className="min-w-0 flex-1 font-display font-bold text-sm">
                    {s.full_name} <span className="font-sans text-ink-soft">· {s.grade}</span>
                  </p>
                  <Chip tone={Number(s.attendance_pct) < 80 ? "coral" : "grass"}>att {s.attendance_pct}%</Chip>
                  <Chip tone={Number(s.homework_pct) < 60 ? "coral" : "grass"}>hw {s.homework_pct}%</Chip>
                  <Chip tone="sky">avg {s.avg_mark_pct ?? "—"}%</Chip>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Everyone's on track!" hint="Students with low attendance or homework completion show up here." />
        )}
      </Card>
    </>
  );
}
