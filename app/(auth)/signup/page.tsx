"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { StarPal } from "@/components/brand/mascots";
import { Button, Card, Field, Input } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { functionUrl } from "@/lib/supabase/config";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
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
      if (!res.ok) throw new Error(body.error ?? "Something went wrong — please try again.");

      const supabase = createBrowserSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      if (signInError) throw new Error("Account created! Please sign in.");

      const pkg = params.get("package");
      router.push(pkg ? `/onboarding?package=${pkg}` : "/onboarding");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Card className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <StarPal size={52} mood="excited" />
        <div>
          <h1 className="font-display font-bold text-2xl">Let&apos;s get started!</h1>
          <p className="text-sm text-ink-soft">
            Create your parent account — it takes less than a minute.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Your name">
          <Input required value={form.full_name} onChange={set("full_name")} placeholder="e.g. Sam Naidoo" autoComplete="name" />
        </Field>
        <Field label="Email">
          <Input type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" />
        </Field>
        <Field label="Phone" optional hint="So Miss Lewis can reach you about lessons.">
          <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="e.g. 082 123 4567" autoComplete="tel" />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <Input type="password" required minLength={8} value={form.password} onChange={set("password")} autoComplete="new-password" placeholder="••••••••" />
        </Field>
        {error && (
          <p className="rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">{error}</p>
        )}
        <Button type="submit" disabled={busy} className="w-full" variant="sunshine">
          {busy ? "Creating your account…" : "Create account & continue 🎉"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-coral underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
