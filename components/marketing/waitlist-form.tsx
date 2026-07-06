"use client";

import { useState, useTransition } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";
import { Button, Input } from "@/components/ui";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [pending, startTransition] = useTransition();

  if (state === "done") {
    return (
      <p className="card-pop bg-pastel-green p-4 text-center font-display font-bold text-navy">
        🎉 You&apos;re on the list! We&apos;ll wave when the cameras roll.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await joinWaitlist(email);
          setState(res.ok ? "done" : "error");
        });
      }}
    >
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        aria-label="Email address for the video lessons waitlist"
        className="bg-paper"
      />
      <Button type="submit" variant="sunshine" disabled={pending} className="shrink-0">
        {pending ? "Adding…" : "Join the waitlist"}
      </Button>
      {state === "error" && (
        <p className="text-xs text-coral font-bold sm:self-center">
          Hmm, that didn&apos;t work — try again?
        </p>
      )}
    </form>
  );
}
