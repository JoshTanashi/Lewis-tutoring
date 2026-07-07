"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cancelLesson, completeLesson } from "@/app/actions/tutor";
import { Button, Input } from "@/components/ui";

export function LessonActions({ lessonId, studentId }: { lessonId: string; studentId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);

  async function finish(attendance: "present" | "late" | "absent") {
    setBusy(true);
    await completeLesson({ lesson_id: lessonId, student_id: studentId, attendance, summary });
    setBusy(false);
    setOpen(false);
    router.refresh();
  }

  async function cancel() {
    setBusy(true);
    await cancelLesson(lessonId);
    setBusy(false);
    router.refresh();
  }

  if (!open) {
    return (
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          ✅ Wrap up
        </Button>
        <Button size="sm" variant="ghost" onClick={cancel} disabled={busy}>
          Cancel lesson
        </Button>
      </div>
    );
  }

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
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Back
        </Button>
      </div>
    </div>
  );
}
