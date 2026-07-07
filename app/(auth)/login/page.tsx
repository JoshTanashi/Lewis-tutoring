"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { HeartPal } from "@/components/brand/mascots";
import { Button, Card, Field, Input } from "@/components/ui";
import { homePathFor, type Role } from "@/lib/roles";
import { createBrowserSupabase } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabase();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (signInError || !data.user) {
      setError("Hmm, that email or password doesn't look right. Try again?");
      setBusy(false);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    const next = params.get("next");
    router.push(next ?? homePathFor((profile?.role ?? "parent") as Role));
    router.refresh();
  }

  return (
    <Card className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <HeartPal size={52} mood="excited" />
        <div>
          <h1 className="font-display font-bold text-2xl">Welcome back!</h1>
          <p className="text-sm text-ink-soft">We kept your seat warm.</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </Field>
        {error && (
          <p className="rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in ✨"}
        </Button>
      </form>
      <div className="mt-6 space-y-1 text-center text-sm text-ink-soft">
        <p>
          New here?{" "}
          <Link href="/signup" className="font-bold text-coral underline underline-offset-2">
            Book your first lesson
          </Link>
        </p>
        <p>
          Are you a kid?{" "}
          <Link href="/kid-login" className="font-bold text-sky-deep underline underline-offset-2">
            Go to the Kids&apos; door 🌈
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
