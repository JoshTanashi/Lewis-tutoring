"use client";

import Link from "next/link";
import { useState } from "react";
import { applyToTutor } from "@/app/actions/apply";
import { StarPal } from "@/components/brand/mascots";
import { Button, Card, Field, Input, Textarea } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { functionUrl } from "@/lib/supabase/config";

export function TutorApplyForm() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    subjects: "",
    experience: "",
    motivation: "",
  });
  const [state, setState] = useState<"idle" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await applyToTutor(form);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <Card className="p-8 text-center">
        <StarPal size={72} mood="excited" className="mx-auto animate-bounce-soft" />
        <h2 className="mt-4 font-display font-bold text-2xl">Application in! 🎉</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Thank you, {form.full_name.split(" ")[0]}! The Lewis team has been notified and will be
          in touch about an interview. Once you&apos;re approved, simply{" "}
          <Link href="/login" className="font-bold text-sky-deep underline">sign in</Link> with{" "}
          <strong>{form.email}</strong> and your Tutor HQ will be waiting.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-7">
      <h2 className="mb-4 font-display font-bold text-xl">Apply now ✏️</h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input required value={form.full_name} onChange={set("full_name")} autoComplete="name" />
          </Field>
          <Field label="Email">
            <Input type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
          </Field>
        </div>
        <Field label="Phone" optional>
          <Input type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" />
        </Field>
        <Field label="Subjects & grades you can teach">
          <Input
            required
            value={form.subjects}
            onChange={set("subjects")}
            placeholder="e.g. Maths gr 4–9, Afrikaans gr 1–7"
          />
        </Field>
        <Field label="Your teaching experience">
          <Textarea
            required
            value={form.experience}
            onChange={set("experience")}
            placeholder="Qualifications, years of tutoring, age groups you love…"
          />
        </Field>
        <Field label="Why Lewis Tutoring?">
          <Textarea
            required
            value={form.motivation}
            onChange={set("motivation")}
            placeholder="What makes teaching kids special for you?"
          />
        </Field>
        {error && (
          <p className="rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">{error}</p>
        )}
        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy ? "Sending…" : "Send my application 🚀"}
        </Button>
        <p className="text-center text-xs text-ink-soft">
          Already approved after your interview?{" "}
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="font-bold text-sky-deep underline"
          >
            Create your tutor account here
          </button>
        </p>
      </form>

      {showCreate && <CreateTutorAccount />}
    </Card>
  );
}

/** Approved applicants create their login here — the database recognises the
 *  approved email and hands them the tutor role automatically. */
function CreateTutorAccount() {
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(functionUrl("auth-signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not create the account.");
      const supabase = createBrowserSupabase();
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (signInErr) throw new Error("Account created — please sign in at /login.");
      window.location.href = "/tutor";
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={create} className="mt-5 space-y-3 rounded-2xl border-2 border-line bg-pastel-blue p-5">
      <p className="font-display font-bold text-sm">
        🔑 Create your tutor login (use your approved application email!)
      </p>
      <Input
        required
        placeholder="Full name"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
      />
      <Input
        required
        type="email"
        placeholder="Approved email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        required
        type="password"
        minLength={8}
        placeholder="Password (8+ characters)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {error && (
        <p className="rounded-xl bg-pastel-pink px-3 py-2 text-xs font-bold text-coral-deep">{error}</p>
      )}
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "Creating…" : "Create account & open Tutor HQ →"}
      </Button>
    </form>
  );
}
