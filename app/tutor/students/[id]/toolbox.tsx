"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addTutorNote,
  assignHomework,
  awardBadge,
  recordAssessment,
  setConfidence,
} from "@/app/actions/tutor";
import { Button, Card, Field, Input, Select, Textarea } from "@/components/ui";

type Subject = { id: number; name: string; emoji: string };
type Badge = { id: number; name: string; emoji: string };

const TABS = [
  ["assessment", "📝 Test result"],
  ["homework", "📚 Homework"],
  ["badge", "🏅 Badge"],
  ["note", "💬 Note"],
  ["confidence", "🌱 Confidence"],
] as const;

export function StudentToolbox({
  studentId,
  confidence,
  subjects,
  badges,
}: {
  studentId: string;
  confidence: number;
  subjects: Subject[];
  badges: Badge[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("assessment");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [assessment, setAssessment] = useState({ title: "", score: "", max: "100", subject: "", notes: "" });
  const [hw, setHw] = useState({ title: "", instructions: "", due: "", subject: "", url: "" });
  const [badgeId, setBadgeId] = useState("");
  const [note, setNote] = useState("");
  const [conf, setConf] = useState(confidence);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>, okText: string) {
    setBusy(true);
    setMsg(null);
    const res = await fn();
    setMsg(res.ok ? { kind: "ok", text: okText } : { kind: "err", text: res.error ?? "Something went wrong" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display font-bold text-lg">Record something ✨</h2>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              setMsg(null);
            }}
            className={`squash rounded-full border-2 px-3.5 py-1.5 text-xs font-bold ${
              tab === key ? "border-navy bg-sunshine text-navy" : "border-line text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "assessment" && (
        <div className="space-y-3">
          <Field label="What was it?">
            <Input
              value={assessment.title}
              onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
              placeholder="e.g. Fractions quiz"
            />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Score">
              <Input
                type="number"
                value={assessment.score}
                onChange={(e) => setAssessment({ ...assessment, score: e.target.value })}
              />
            </Field>
            <Field label="Out of">
              <Input
                type="number"
                value={assessment.max}
                onChange={(e) => setAssessment({ ...assessment, max: e.target.value })}
              />
            </Field>
            <Field label="Subject">
              <Select
                value={assessment.subject}
                onChange={(e) => setAssessment({ ...assessment, subject: e.target.value })}
              >
                <option value="">—</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Notes" optional>
            <Input
              value={assessment.notes}
              onChange={(e) => setAssessment({ ...assessment, notes: e.target.value })}
              placeholder="e.g. Big improvement on long division!"
            />
          </Field>
          <Button
            disabled={busy || !assessment.title || !assessment.score}
            onClick={() =>
              run(
                () =>
                  recordAssessment({
                    student_id: studentId,
                    subject_id: assessment.subject ? Number(assessment.subject) : null,
                    title: assessment.title,
                    score: Number(assessment.score),
                    max_score: Number(assessment.max) || 100,
                    notes: assessment.notes,
                  }),
                "Saved! It's on the journey timeline too. 📈",
              )
            }
          >
            Save test result
          </Button>
        </div>
      )}

      {tab === "homework" && (
        <div className="space-y-3">
          <Field label="Title">
            <Input
              value={hw.title}
              onChange={(e) => setHw({ ...hw, title: e.target.value })}
              placeholder="e.g. Reading log — 3 pages"
            />
          </Field>
          <Field label="Instructions" optional>
            <Textarea
              value={hw.instructions}
              onChange={(e) => setHw({ ...hw, instructions: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date" optional>
              <Input type="date" value={hw.due} onChange={(e) => setHw({ ...hw, due: e.target.value })} />
            </Field>
            <Field label="Subject" optional>
              <Select value={hw.subject} onChange={(e) => setHw({ ...hw, subject: e.target.value })}>
                <option value="">—</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Worksheet link" optional>
            <Input
              value={hw.url}
              onChange={(e) => setHw({ ...hw, url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Button
            disabled={busy || !hw.title}
            onClick={() =>
              run(
                () =>
                  assignHomework({
                    student_id: studentId,
                    subject_id: hw.subject ? Number(hw.subject) : null,
                    title: hw.title,
                    instructions: hw.instructions,
                    due_date: hw.due,
                    resource_url: hw.url,
                  }),
                "Homework assigned — it's in their space now! 🚀",
              )
            }
          >
            Assign homework
          </Button>
        </div>
      )}

      {tab === "badge" && (
        <div className="space-y-3">
          <Field label="Which badge?">
            <Select value={badgeId} onChange={(e) => setBadgeId(e.target.value)}>
              <option value="">Choose a badge…</option>
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.emoji} {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button
            disabled={busy || !badgeId}
            variant="sunshine"
            onClick={() =>
              run(() => awardBadge(studentId, Number(badgeId)), "Badge awarded — cue the confetti! 🏅")
            }
          >
            Award badge
          </Button>
        </div>
      )}

      {tab === "note" && (
        <div className="space-y-3">
          <Field label="A note for the journey" hint="Parents can see these — keep it warm!">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Zoë read a whole page out loud today — so proud!"
            />
          </Field>
          <Button
            disabled={busy || !note.trim()}
            onClick={() => run(() => addTutorNote(studentId, note), "Note added to the journey 💬")}
          >
            Add note
          </Button>
        </div>
      )}

      {tab === "confidence" && (
        <div className="space-y-3">
          <Field label={`Confidence: ${conf}%`}>
            <input
              type="range"
              min={0}
              max={100}
              value={conf}
              onChange={(e) => setConf(Number(e.target.value))}
              className="w-full accent-[var(--color-coral)]"
            />
          </Field>
          <Button
            disabled={busy}
            onClick={() => run(() => setConfidence(studentId, conf), "Confidence updated 🌱")}
          >
            Save confidence
          </Button>
        </div>
      )}

      {msg && (
        <p
          className={`mt-4 rounded-2xl px-4 py-2 text-sm font-bold ${
            msg.kind === "ok" ? "bg-pastel-green text-grass-deep" : "bg-pastel-pink text-coral-deep"
          }`}
        >
          {msg.text}
        </p>
      )}
    </Card>
  );
}
