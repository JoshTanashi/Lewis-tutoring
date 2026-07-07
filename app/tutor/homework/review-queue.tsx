"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { reviewSubmission } from "@/app/actions/tutor";
import { fmtDate } from "@/components/portal/widgets";
import { Button, Card, Input, Textarea } from "@/components/ui";

type Item = {
  homework_id: string;
  submission_id: string;
  title: string;
  student: string;
  subject: { name: string; emoji: string } | null;
  content: string | null;
  submitted_at: string;
};

export function ReviewQueue({ items }: { items: Item[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(item: Item) {
    const d = drafts[item.submission_id] ?? { grade: "", feedback: "" };
    setBusyId(item.submission_id);
    await reviewSubmission({
      submission_id: item.submission_id,
      homework_id: item.homework_id,
      grade: d.grade === "" ? null : Number(d.grade),
      feedback: d.feedback,
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const d = drafts[item.submission_id] ?? { grade: "", feedback: "" };
        const setD = (patch: Partial<typeof d>) =>
          setDrafts((all) => ({ ...all, [item.submission_id]: { ...d, ...patch } }));
        return (
          <Card key={item.submission_id} className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl">{item.subject?.emoji ?? "📘"}</span>
              <p className="font-display font-bold">{item.title}</p>
              <p className="text-sm text-ink-soft">
                — {item.student} · handed in {fmtDate(item.submitted_at, true)}
              </p>
            </div>
            {item.content && (
              <blockquote className="mt-3 whitespace-pre-wrap rounded-2xl bg-pastel-blue p-4 text-sm">
                {item.content}
              </blockquote>
            )}
            <div className="mt-3 grid gap-3 sm:grid-cols-[110px_1fr_auto]">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Mark %"
                value={d.grade}
                onChange={(e) => setD({ grade: e.target.value })}
              />
              <Textarea
                className="min-h-12"
                placeholder="Feedback the student will see — sprinkle some encouragement! ✨"
                value={d.feedback}
                onChange={(e) => setD({ feedback: e.target.value })}
              />
              <Button
                onClick={() => review(item)}
                disabled={busyId === item.submission_id}
                className="self-start"
              >
                {busyId === item.submission_id ? "Saving…" : "Mark it ⭐"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
