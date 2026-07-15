"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setCommission, setTutorSubjects, updateTutorProfile } from "@/app/actions/admin";
import { Button, Card, Checkbox, Field, Input, Textarea } from "@/components/ui";

type Subject = { id: number; name: string; emoji: string };

export function TutorAdminPanel({
  tutorId,
  bio,
  meetingUrl,
  active,
  rateCents,
  allSubjects,
  subjectIds,
}: {
  tutorId: string;
  bio: string;
  meetingUrl: string;
  active: boolean;
  rateCents: number;
  allSubjects: Subject[];
  subjectIds: number[];
}) {
  const router = useRouter();
  const [form, setForm] = useState({ bio, meetingUrl, active, rate: String(rateCents / 100) });
  const [picked, setPicked] = useState<number[]>(subjectIds);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    const results = await Promise.all([
      updateTutorProfile(tutorId, {
        bio: form.bio,
        meeting_url: form.meetingUrl.trim() || undefined,
        active: form.active,
      }),
      setCommission(tutorId, Math.round(Number(form.rate || "100") * 100)),
      setTutorSubjects(tutorId, picked),
    ]);
    const failed = results.find((r) => !r.ok) as { ok: false; error: string } | undefined;
    setMsg(failed ? { kind: "err", text: failed.error } : { kind: "ok", text: "Saved! ✨" });
    setBusy(false);
    router.refresh();
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-display font-bold text-lg">Tutor profile ⚙️</h2>
      <div className="space-y-3">
        <Field label="Subjects they can teach" hint="Used for smart matching in the intake queue.">
          <div className="flex flex-wrap gap-1.5">
            {allSubjects.map((s) => {
              const on = picked.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))
                  }
                  className={`squash rounded-full border-2 px-3 py-1 text-xs font-bold ${
                    on ? "border-navy bg-sunshine" : "border-line text-ink-soft"
                  }`}
                >
                  {s.emoji} {s.name}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Commission per completed lesson (R)" hint="Only super admins ever see this. Default R100.">
          <Input
            type="number"
            min={0}
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
            className="!w-32"
          />
        </Field>
        <Field label="Default online classroom link" optional>
          <Input
            value={form.meetingUrl}
            onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
            placeholder="https://meet.google.com/…"
          />
        </Field>
        <Field label="Bio" optional>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <Checkbox
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          label="Active — can receive new students"
        />
        {msg && (
          <p
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              msg.kind === "ok" ? "bg-pastel-green text-grass-deep" : "bg-pastel-pink text-coral-deep"
            }`}
          >
            {msg.text}
          </p>
        )}
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </Card>
  );
}
