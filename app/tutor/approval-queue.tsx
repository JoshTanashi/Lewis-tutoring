"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { decideOnStudent } from "@/app/actions/tutor";
import { Button, Card, Chip, Input } from "@/components/ui";

export type PendingStudent = {
  id: string;
  full_name: string;
  grade: string;
  goals: string | null;
  wants_assessment: boolean;
  other_subjects: string | null;
  subjects: { name: string; emoji: string }[];
};

/** New students the admin matched with this tutor — approve or send back. */
export function ApprovalQueue({ students }: { students: PendingStudent[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [denying, setDenying] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!students.length) return null;

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    setError(null);
    const res = await decideOnStudent(id, approve, approve ? undefined : reason);
    if (!res.ok) setError(res.error);
    setBusyId(null);
    setDenying(null);
    setReason("");
    router.refresh();
  }

  return (
    <Card className="mb-6 border-2 border-sunshine bg-pastel-yellow p-5">
      <h2 className="font-display font-bold text-lg">
        🤝 New students for you <Chip tone="coral">{students.length}</Chip>
      </h2>
      <p className="mb-4 text-xs text-ink-soft">
        The Lewis team matched these learners with you — say yes to add them to your class, or
        send them back and they&apos;ll be matched with someone else.
      </p>
      {error && (
        <p className="mb-3 rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">{error}</p>
      )}
      <div className="space-y-3">
        {students.map((s) => (
          <div key={s.id} className="rounded-2xl border-2 border-navy/20 bg-paper p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display font-bold">
                {s.full_name} <span className="font-sans text-sm text-ink-soft">· {s.grade}</span>
              </p>
              {s.wants_assessment && <Chip tone="grass">✨ prepare an assessment</Chip>}
              <Link
                href={`/tutor/students/${s.id}`}
                className="ml-auto text-sm font-bold text-sky-deep underline underline-offset-2"
              >
                Full profile →
              </Link>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {s.subjects.map((sub, i) => (
                <Chip key={i} tone="sky">
                  {sub.emoji} {sub.name}
                </Chip>
              ))}
              {s.other_subjects && <Chip tone="lilac">✏️ {s.other_subjects}</Chip>}
            </div>
            {s.goals && <p className="mt-2 text-sm text-ink-soft">🎯 {s.goals}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {denying === s.id ? (
                <>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional: tell the admin why (only they see this)"
                    className="!w-72 !py-1.5 text-sm"
                  />
                  <Button size="sm" variant="navy" disabled={busyId === s.id} onClick={() => decide(s.id, false)}>
                    Send back
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDenying(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" disabled={busyId === s.id} onClick={() => decide(s.id, true)}>
                    {busyId === s.id ? "…" : "Welcome them in! 🎉"}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busyId === s.id} onClick={() => setDenying(s.id)}>
                    Not a fit
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
