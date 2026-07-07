import { notFound } from "next/navigation";
import { JourneyTimeline, type JourneyEvent } from "@/components/portal/journey";
import { PageTitle, StatCard } from "@/components/portal/widgets";
import { Card, Chip } from "@/components/ui";
import { createServerSupabase } from "@/lib/supabase/server";
import { StudentToolbox } from "./toolbox";

export const metadata = { title: "Student" };

export default async function TutorStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, grade, school, goals, learning_style, medical_notes, confidence_score, username, parent_id",
    )
    .eq("id", id)
    .single();
  if (!student) notFound();

  const [{ data: overview }, { data: journey }, { data: subjects }, { data: badges }, { data: parent }] =
    await Promise.all([
      supabase.from("v_student_overview").select("*").eq("student_id", id).single(),
      supabase
        .from("journey_events")
        .select("id, type, title, detail, emoji, happened_at")
        .eq("student_id", id)
        .order("happened_at", { ascending: false })
        .limit(30),
      supabase
        .from("enrollments")
        .select("subjects(id, name, emoji)")
        .eq("student_id", id)
        .eq("active", true),
      supabase.from("badges").select("id, name, emoji").order("id"),
      supabase.from("profiles").select("full_name, phone").eq("id", student.parent_id).single(),
    ]);

  const enrolledSubjects = (subjects ?? []).map(
    (e) => e.subjects as unknown as { id: number; name: string; emoji: string },
  );

  return (
    <>
      <PageTitle
        title={student.full_name}
        sub={
          <>
            {student.grade}
            {student.school && ` · ${student.school}`}
            {parent?.full_name && ` · parent: ${parent.full_name}${parent.phone ? ` (${parent.phone})` : ""}`}
          </>
        }
      />

      {student.medical_notes && (
        <Card className="mb-4 border-2 border-coral bg-pastel-pink p-4">
          <p className="text-sm font-bold">🩺 Care note: {student.medical_notes}</p>
        </Card>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Attendance" value={`${overview?.attendance_pct ?? 100}%`} tone="grass" emoji="📅" />
        <StatCard label="Avg mark" value={overview?.avg_mark_pct != null ? `${overview.avg_mark_pct}%` : "—"} tone="sky" emoji="🧠" />
        <StatCard label="Homework" value={`${overview?.homework_pct ?? 100}%`} tone="sunshine" emoji="📚" />
        <StatCard label="Lessons done" value={overview?.lessons_completed ?? 0} tone="lilac" emoji="🎓" />
        <StatCard label="Confidence" value={`${student.confidence_score}%`} tone="coral" emoji="🌱" />
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {enrolledSubjects.map((s) => (
          <Chip key={s.id} tone="sky">
            {s.emoji} {s.name}
          </Chip>
        ))}
        {student.learning_style && <Chip tone="lilac">🧩 {student.learning_style}</Chip>}
        {student.goals && <Chip tone="grass">🎯 {student.goals}</Chip>}
        {student.username ? (
          <Chip tone="sunshine">🔑 kid login: {student.username}</Chip>
        ) : (
          <Chip tone="navy">no kid login yet</Chip>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentToolbox
          studentId={student.id}
          confidence={student.confidence_score}
          subjects={enrolledSubjects}
          badges={badges ?? []}
        />
        <Card className="p-5">
          <h2 className="mb-4 font-display font-bold text-lg">Journey timeline 🌈</h2>
          <JourneyTimeline events={(journey ?? []) as JourneyEvent[]} />
        </Card>
      </div>
    </>
  );
}
