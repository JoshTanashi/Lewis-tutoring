"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitHomework } from "@/app/actions/homework";
import { EmptyState, fmtDate } from "@/components/portal/widgets";
import { Button, Card, Chip, Textarea } from "@/components/ui";

type Item = {
  id: string;
  title: string;
  instructions: string | null;
  due_date: string | null;
  status: "assigned" | "submitted" | "reviewed";
  resource_url: string | null;
  subject: { name: string; emoji: string } | null;
  submission: { grade: number | null; feedback: string | null; reviewed_at: string | null } | null;
};

export function HomeworkList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!items.length) {
    return (
      <EmptyState
        title="No homework yet!"
        hint="When Miss Lewis gives you a mission it lands right here."
        color="var(--color-sunshine)"
      />
    );
  }

  async function handIn(id: string) {
    setBusy(true);
    setError(null);
    const res = await submitHomework(id, content);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setOpenId(null);
    setContent("");
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((h) => (
        <Card key={h.id} sticker className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl">{h.subject?.emoji ?? "📘"}</span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold">{h.title}</p>
              <p className="text-xs font-bold text-ink-soft">
                {h.subject?.name}
                {h.due_date && ` · due ${fmtDate(h.due_date)}`}
              </p>
            </div>
            <Chip tone={h.status === "reviewed" ? "grass" : h.status === "submitted" ? "sky" : "sunshine"}>
              {h.status === "reviewed" ? "⭐ marked" : h.status === "submitted" ? "✔ handed in" : "to do"}
            </Chip>
          </div>

          {h.instructions && <p className="mt-3 text-sm text-ink-soft">{h.instructions}</p>}
          {h.resource_url && (
            <a
              href={h.resource_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-bold text-sky-deep underline underline-offset-2"
            >
              📎 Open the worksheet
            </a>
          )}

          {h.status === "reviewed" && h.submission && (
            <div className="mt-3 rounded-2xl bg-pastel-green p-4">
              {h.submission.grade != null && (
                <p className="font-display font-bold">Your mark: {h.submission.grade}% 🎉</p>
              )}
              {h.submission.feedback && (
                <p className="mt-1 text-sm text-ink-soft">
                  💬 Miss Lewis says: “{h.submission.feedback}”
                </p>
              )}
            </div>
          )}

          {h.status === "assigned" &&
            (openId === h.id ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your answers, or tell Miss Lewis you did it on paper!"
                />
                {error && (
                  <p className="rounded-xl bg-pastel-pink px-3 py-2 text-xs font-bold text-coral-deep">
                    {error}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handIn(h.id)} disabled={busy}>
                    {busy ? "Sending…" : "Hand it in! 🚀"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setOpenId(null)}>
                    Not yet
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="sunshine" className="mt-3" onClick={() => { setOpenId(h.id); setContent(""); }}>
                Hand in my work ✏️
              </Button>
            ))}
        </Card>
      ))}
    </div>
  );
}
