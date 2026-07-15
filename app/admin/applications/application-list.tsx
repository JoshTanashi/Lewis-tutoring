"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateApplication } from "@/app/actions/admin";
import { fmtDate } from "@/components/portal/widgets";
import { Button, Card, Chip, Field, Input, Textarea } from "@/components/ui";

type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subjects: string;
  experience: string;
  motivation: string;
  status: "new" | "interview" | "approved" | "rejected";
  interview_at: string | null;
  admin_notes: string | null;
  created_at: string;
};

const STATUS_TONE = { new: "sunshine", interview: "sky", approved: "grass", rejected: "coral" } as const;
const STATUS_LABEL = { new: "🆕 new", interview: "🗓️ interview booked", approved: "✅ approved", rejected: "✖ not now" } as const;

export function ApplicationList({ applications }: { applications: Application[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { interview: string; notes: string }>>({});

  async function patch(id: string, p: Parameters<typeof updateApplication>[1]) {
    setBusyId(id);
    await updateApplication(id, p);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {applications.map((a) => {
        const d = drafts[a.id] ?? {
          interview: a.interview_at ? a.interview_at.slice(0, 16) : "",
          notes: a.admin_notes ?? "",
        };
        const setD = (patch: Partial<typeof d>) =>
          setDrafts((all) => ({ ...all, [a.id]: { ...d, ...patch } }));
        return (
          <Card key={a.id} className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display font-bold text-lg">{a.full_name}</p>
              <Chip tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Chip>
              <span className="ml-auto text-xs text-ink-soft">applied {fmtDate(a.created_at)}</span>
            </div>
            <p className="mt-1 text-sm text-ink-soft">
              {a.email}
              {a.phone && ` · ${a.phone}`}
            </p>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-pastel-blue p-3">
                <p className="text-xs font-extrabold uppercase text-ink-soft">Subjects</p>
                <p>{a.subjects || "—"}</p>
              </div>
              <div className="rounded-2xl bg-pastel-yellow p-3">
                <p className="text-xs font-extrabold uppercase text-ink-soft">Experience</p>
                <p className="whitespace-pre-wrap">{a.experience || "—"}</p>
              </div>
              <div className="rounded-2xl bg-pastel-pink p-3">
                <p className="text-xs font-extrabold uppercase text-ink-soft">Why Lewis?</p>
                <p className="whitespace-pre-wrap">{a.motivation || "—"}</p>
              </div>
            </div>

            {a.interview_at && (
              <p className="mt-3 rounded-2xl bg-pastel-purple px-3 py-2 text-sm font-bold">
                🗓️ Interview: {fmtDate(a.interview_at, true)}
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr]">
              <Field label="Interview time">
                <Input
                  type="datetime-local"
                  value={d.interview}
                  onChange={(e) => setD({ interview: e.target.value })}
                />
              </Field>
              <Field label="Your private notes">
                <Textarea
                  className="min-h-12"
                  value={d.notes}
                  onChange={(e) => setD({ notes: e.target.value })}
                  placeholder="Impressions, references checked, rate discussed…"
                />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="sunshine"
                disabled={busyId === a.id || !d.interview}
                onClick={() =>
                  patch(a.id, {
                    status: "interview",
                    interview_at: new Date(d.interview).toISOString(),
                    admin_notes: d.notes,
                  })
                }
              >
                📅 Book interview
              </Button>
              <Button
                size="sm"
                disabled={busyId === a.id}
                onClick={() => patch(a.id, { status: "approved", admin_notes: d.notes })}
              >
                ✅ Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === a.id}
                onClick={() => patch(a.id, { status: "rejected", admin_notes: d.notes })}
              >
                Not now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busyId === a.id}
                onClick={() => patch(a.id, { admin_notes: d.notes })}
              >
                Save notes
              </Button>
            </div>
            {a.status === "approved" && (
              <p className="mt-2 text-xs font-bold text-grass-deep">
                ✨ When {a.full_name.split(" ")[0]} signs up at /login → Sign in with{" "}
                <span className="font-mono">{a.email}</span>, they automatically become a tutor.
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
