"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { assignStudent, deleteStudentForever } from "@/app/actions/admin";
import { EmptyState, fmtDate } from "@/components/portal/widgets";
import { Button, Card, Chip, Select } from "@/components/ui";

type Student = {
  id: string;
  full_name: string;
  grade: string;
  age_band: string;
  is_self: boolean;
  goals: string | null;
  medical_notes: string | null;
  learning_style: string | null;
  other_subjects: string | null;
  wants_assessment: boolean;
  mascot: string;
  username: string | null;
  created_at: string;
  parent_id: string;
  assigned_tutor_id: string | null;
  assignment_status: "unassigned" | "pending_tutor" | "active" | "denied";
  confidence_score: number;
};
type Person = { id: string; full_name: string; phone: string | null; role: string };
type Tutor = { tutor_id: string | null; full_name: string | null; active: boolean | null; active_students: number | null };
type Pair = { tutor_id: string; subject_id: number };
type Enrollment = { student_id: string; subject_id: number };
type Subject = { id: number; name: string; emoji: string };

const STATUS_META = {
  unassigned: ["🆕 Needs a tutor", "sunshine"],
  pending_tutor: ["⏳ Waiting on tutor", "sky"],
  active: ["✅ Active", "grass"],
  denied: ["↩ Needs re-assignment", "coral"],
} as const;

export function PeopleBoard({
  students,
  parents,
  tutors,
  tutorSubjects,
  enrollments,
  subjects,
}: {
  students: Student[];
  parents: Person[];
  tutors: Tutor[];
  tutorSubjects: Pair[];
  enrollments: Enrollment[];
  subjects: Subject[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parentOf = (id: string) => parents.find((p) => p.id === id);
  const tutorName = (id: string | null) => tutors.find((t) => t.tutor_id === id)?.full_name ?? "a tutor";
  const subjectsOf = (sid: string) =>
    enrollments
      .filter((e) => e.student_id === sid)
      .map((e) => subjects.find((s) => s.id === e.subject_id))
      .filter(Boolean) as Subject[];

  /** Smart match: tutors who teach ALL (or most) of the student's subjects float up. */
  function rankedTutors(sid: string) {
    const wanted = new Set(enrollments.filter((e) => e.student_id === sid).map((e) => e.subject_id));
    return tutors
      .map((t) => {
        const teaches = new Set(tutorSubjects.filter((x) => x.tutor_id === t.tutor_id).map((x) => x.subject_id));
        const hits = [...wanted].filter((s) => teaches.has(s)).length;
        return { ...t, hits, total: wanted.size };
      })
      .sort((a, b) => b.hits - a.hits || (a.active_students ?? 0) - (b.active_students ?? 0));
  }

  async function doAssign(sid: string) {
    const tid = pick[sid];
    if (!tid) return;
    setBusyId(sid);
    setError(null);
    const res = await assignStudent(sid, tid);
    if (!res.ok) setError(res.error);
    setBusyId(null);
    router.refresh();
  }

  async function doDelete(sid: string) {
    setBusyId(sid);
    setError(null);
    const res = await deleteStudentForever(sid);
    if (!res.ok) setError(res.error);
    setConfirmDelete(null);
    setBusyId(null);
    router.refresh();
  }

  const queue = students.filter((s) => s.assignment_status === "unassigned" || s.assignment_status === "denied");
  const waiting = students.filter((s) => s.assignment_status === "pending_tutor");
  const active = students.filter((s) => s.assignment_status === "active");

  function StudentCard({ s, showAssign }: { s: Student; showAssign: boolean }) {
    const parent = parentOf(s.parent_id);
    const [label, tone] = STATUS_META[s.assignment_status];
    const ranked = rankedTutors(s.id);
    return (
      <Card className={`p-5 ${s.assignment_status === "denied" ? "border-2 border-coral" : ""}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-display font-bold text-lg">
              {s.full_name}{" "}
              <span className="font-sans text-sm text-ink-soft">
                · {s.grade} · {s.age_band === "teen" ? "older student" : "young learner"}
                {s.is_self && " · signed up themself 🎓"}
              </span>
            </p>
            <p className="text-xs text-ink-soft">
              {s.is_self ? "Self-managed" : `Parent: ${parent?.full_name || "—"}${parent?.phone ? ` (${parent.phone})` : ""}`}
              {" · joined "}
              {fmtDate(s.created_at)}
            </p>
          </div>
          <Chip tone={tone as never}>{label}</Chip>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {subjectsOf(s.id).map((sub) => (
            <Chip key={sub.id} tone="sky">
              {sub.emoji} {sub.name}
            </Chip>
          ))}
          {s.other_subjects && <Chip tone="lilac">✏️ {s.other_subjects}</Chip>}
          {s.wants_assessment && <Chip tone="grass">✨ wants assessment</Chip>}
          {s.learning_style && <Chip tone="sunshine">🧩 {s.learning_style}</Chip>}
          {s.assignment_status !== "unassigned" && s.assigned_tutor_id && (
            <Chip tone="navy">👩‍🏫 {tutorName(s.assigned_tutor_id)}</Chip>
          )}
        </div>
        {s.goals && <p className="mt-2 text-sm text-ink-soft">🎯 {s.goals}</p>}
        {s.medical_notes && (
          <p className="mt-1 rounded-xl bg-pastel-pink px-3 py-1.5 text-xs font-bold">🩺 {s.medical_notes}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {showAssign && (
            <>
              <Select
                value={pick[s.id] ?? ""}
                onChange={(e) => setPick({ ...pick, [s.id]: e.target.value })}
                className="!w-auto min-w-52 !py-1.5 text-sm"
              >
                <option value="">Assign to…</option>
                {ranked.map((t) => (
                  <option key={t.tutor_id} value={t.tutor_id ?? ""}>
                    {t.full_name}
                    {t.total > 0 ? ` — teaches ${t.hits}/${t.total} subjects` : ""}
                    {` · ${t.active_students ?? 0} students`}
                  </option>
                ))}
              </Select>
              <Button size="sm" disabled={!pick[s.id] || busyId === s.id} onClick={() => doAssign(s.id)}>
                {busyId === s.id ? "Assigning…" : s.assignment_status === "active" ? "Hand over 🤝" : "Assign 🤝"}
              </Button>
            </>
          )}
          <Link
            href={`/tutor/students/${s.id}`}
            className="font-display text-sm font-bold text-sky-deep underline underline-offset-2"
          >
            Open full profile →
          </Link>
          <span className="ml-auto">
            {confirmDelete === s.id ? (
              <span className="flex items-center gap-2">
                <span className="text-xs font-bold text-coral-deep">Everything is erased. Sure?</span>
                <Button size="sm" variant="navy" disabled={busyId === s.id} onClick={() => doDelete(s.id)}>
                  Yes, delete forever
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                  No
                </Button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDelete(s.id)}
                className="text-xs font-bold text-ink-soft/60 underline underline-offset-2 hover:text-coral"
              >
                delete permanently
              </button>
            )}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">{error}</p>
      )}

      <section>
        <h2 className="mb-3 font-display font-bold text-xl">
          Intake queue{" "}
          <Chip tone={queue.length ? "sunshine" : "grass"}>{queue.length}</Chip>
        </h2>
        {queue.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {queue.map((s) => (
              <StudentCard key={s.id} s={s} showAssign />
            ))}
          </div>
        ) : (
          <EmptyState title="Queue is empty!" hint="New sign-ups appear here the moment they pay." />
        )}
      </section>

      {waiting.length > 0 && (
        <section>
          <h2 className="mb-3 font-display font-bold text-xl">
            Waiting on tutor approval <Chip tone="sky">{waiting.length}</Chip>
          </h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {waiting.map((s) => (
              <StudentCard key={s.id} s={s} showAssign />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-display font-bold text-xl">
          Active students <Chip tone="grass">{active.length}</Chip>
        </h2>
        {active.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {active.map((s) => (
              <StudentCard key={s.id} s={s} showAssign />
            ))}
          </div>
        ) : (
          <EmptyState title="No active students yet" hint="Assign the queue above to get rolling!" />
        )}
      </section>
    </div>
  );
}
