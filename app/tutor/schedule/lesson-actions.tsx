"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cancelLesson, completeLesson, setLessonMeetingUrl } from "@/app/actions/tutor";
import { Button, Input } from "@/components/ui";

export function LessonActions({
  lessonId,
  studentId,
  meetingUrl,
}: {
  lessonId: string;
  studentId: string;
  meetingUrl?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "wrap" | "link">("idle");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState(meetingUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish(attendance: "present" | "late" | "absent") {
    setBusy(true);
    await completeLesson({ lesson_id: lessonId, student_id: studentId, attendance, summary });
    setBusy(false);
    setMode("idle");
    router.refresh();
  }

  async function cancel() {
    setBusy(true);
    await cancelLesson(lessonId);
    setBusy(false);
    router.refresh();
  }

  async function saveLink() {
    setBusy(true);
    setError(null);
    const res = await setLessonMeetingUrl(lessonId, url);
    if (!res.ok) setError(res.error);
    else setMode("idle");
    setBusy(false);
    router.refresh();
  }

  if (mode === "wrap") {
    return (
      <div className="mt-2 space-y-2">
        <Input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="One-line summary for the parents (optional)"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => finish("present")} disabled={busy}>
            Present 🎉
          </Button>
          <Button size="sm" variant="sunshine" onClick={() => finish("late")} disabled={busy}>
            Late ⏰
          </Button>
          <Button size="sm" variant="outline" onClick={() => finish("absent")} disabled={busy}>
            No-show 😴
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMode("idle")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "link") {
    return (
      <div className="mt-2 space-y-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://meet.google.com/… (the family sees this too)"
        />
        {error && (
          <p className="rounded-xl bg-pastel-pink px-3 py-1.5 text-xs font-bold text-coral-deep">{error}</p>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={saveLink} disabled={busy}>
            Save link 💻
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMode("idle")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={() => setMode("wrap")}>
        ✅ Wrap up
      </Button>
      <Button size="sm" variant="outline" onClick={() => setMode("link")}>
        💻 {meetingUrl ? "Change link" : "Add lesson link"}
      </Button>
      <Button size="sm" variant="ghost" onClick={cancel} disabled={busy}>
        Cancel lesson
      </Button>
    </div>
  );
}
