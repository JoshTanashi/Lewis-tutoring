"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BlobPal, Sparkle, StarPal } from "@/components/brand/mascots";
import { Button, Card, Field, Input } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";

const KID_DOMAIN = "kids.lewistutoring.co.za";

export default function KidLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createBrowserSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${username.trim().toLowerCase()}@${KID_DOMAIN}`,
      password: pin,
    });
    if (signInError) {
      setError("Hmm, that name or PIN isn't quite right. Ask a grown-up to help!");
      setBusy(false);
      return;
    }
    router.push("/student");
    router.refresh();
  }

  return (
    <Card sticker className="relative p-8 bg-pastel-yellow">
      <Sparkle size={20} className="absolute -top-2 -right-2 animate-twinkle" color="var(--color-coral)" />
      <div className="mb-6 flex items-center gap-3">
        <StarPal size={58} mood="excited" className="animate-wiggle" />
        <div>
          <h1 className="font-display font-bold text-2xl">The Kids&apos; Door 🌈</h1>
          <p className="text-sm text-ink-soft">Type your secret name and PIN!</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Your secret name">
          <Input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. super-zoe"
            autoComplete="username"
            className="text-lg font-bold"
          />
        </Field>
        <Field label="Your 6-number PIN">
          <Input
            required
            type="password"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="text-center text-2xl tracking-[0.5em] font-bold"
          />
        </Field>
        {error && (
          <p className="rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">{error}</p>
        )}
        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy ? "Opening the door…" : "Let me in! 🚪✨"}
        </Button>
      </form>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-soft">
        <BlobPal size={26} color="var(--color-grass)" />
        <p>
          Grown-ups go{" "}
          <Link href="/login" className="font-bold text-navy underline underline-offset-2">
            this way
          </Link>
        </p>
      </div>
    </Card>
  );
}
