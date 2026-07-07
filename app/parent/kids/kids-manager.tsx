"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addChild } from "@/app/actions/onboarding";
import {
  BlobPal,
  CloudPal,
  HeartPal,
  PencilPal,
  StarPal,
} from "@/components/brand/mascots";
import { Button, Card, Chip, Field, Input, Select } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";

type Kid = {
  id: string;
  full_name: string;
  grade: string;
  mascot: string;
  username: string | null;
  confidence_score: number;
};
type Subject = { id: number; name: string; emoji: string };

export function mascotEl(slug: string, size = 44) {
  switch (slug) {
    case "heart":
      return <HeartPal size={size} />;
    case "pencil":
      return <PencilPal size={size} />;
    case "cloud":
      return <CloudPal size={size} />;
    case "blob-green":
      return <BlobPal size={size} color="var(--color-grass)" />;
    case "blob-lilac":
      return <BlobPal size={size} color="var(--color-lilac)" />;
    default:
      return <StarPal size={size} />;
  }
}

const GRADES = ["Grade R prep", "Grade R", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

function KidLoginForm({ kid, onDone }: { kid: Kid; onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function create() {
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-kid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ student_id: kid.id, username, pin }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not create the login.");
      setMsg({ kind: "ok", text: `Done! ${kid.full_name.split(" ")[0]} signs in with "${body.username}" + their PIN at the Kids' Door.` });
      onDone();
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-pastel-yellow p-4">
      <p className="text-xs font-bold text-ink-soft">
        Create their Kids&apos; Door login — pick a fun secret name + a 6-digit PIN.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="secret name, e.g. super-zoe"
        />
        <Input
          value={pin}
          inputMode="numeric"
          maxLength={6}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="6-digit PIN"
        />
      </div>
      {msg && (
        <p
          className={`rounded-xl px-3 py-2 text-xs font-bold ${
            msg.kind === "ok" ? "bg-pastel-green text-grass-deep" : "bg-pastel-pink text-coral-deep"
          }`}
        >
          {msg.text}
        </p>
      )}
      <Button size="sm" onClick={create} disabled={busy || !username || pin.length !== 6}>
        {busy ? "Creating…" : "Create login 🔑"}
      </Button>
    </div>
  );
}

export function KidsManager({ kids, subjects }: { kids: Kid[]; subjects: Subject[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [child, setChild] = useState({ full_name: "", grade: "", subject_ids: [] as number[] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveChild() {
    if (child.full_name.trim().length < 2 || !child.grade || !child.subject_ids.length) {
      setError("Name, grade and at least one subject, please!");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await addChild({ ...child, mascot: "star" });
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
      return;
    }
    setAdding(false);
    setChild({ full_name: "", grade: "", subject_ids: [] });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {kids.map((kid) => (
          <Card key={kid.id} className="p-5">
            <div className="flex items-center gap-3">
              {mascotEl(kid.mascot)}
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-lg">{kid.full_name}</p>
                <p className="text-xs text-ink-soft">{kid.grade}</p>
              </div>
              <Link
                href={`/parent/kids/${kid.id}`}
                className="font-display text-sm font-bold text-sky-deep underline underline-offset-2"
              >
                Journey →
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Chip tone="lilac">Confidence {kid.confidence_score}%</Chip>
              {kid.username ? (
                <Chip tone="grass">🔑 Kids&apos; login: {kid.username}</Chip>
              ) : (
                <Chip tone="sunshine">No kids&apos; login yet</Chip>
              )}
            </div>
            {!kid.username && <KidLoginForm kid={kid} onDone={() => router.refresh()} />}
          </Card>
        ))}
      </div>

      {adding ? (
        <Card className="p-5">
          <h2 className="mb-3 font-display font-bold text-lg">Add another child 💛</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <Input
                value={child.full_name}
                onChange={(e) => setChild({ ...child, full_name: e.target.value })}
              />
            </Field>
            <Field label="Grade">
              <Select
                value={child.grade}
                onChange={(e) => setChild({ ...child, grade: e.target.value })}
              >
                <option value="">Choose…</option>
                {GRADES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Subjects">
            <div className="mt-1 flex flex-wrap gap-2">
              {subjects.map((s) => {
                const on = child.subject_ids.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setChild((c) => ({
                        ...c,
                        subject_ids: on
                          ? c.subject_ids.filter((x) => x !== s.id)
                          : [...c.subject_ids, s.id],
                      }))
                    }
                    className={`squash rounded-full border-2 px-3.5 py-1.5 text-sm font-bold ${
                      on ? "border-navy bg-sunshine" : "border-line text-ink-soft"
                    }`}
                  >
                    {s.emoji} {s.name}
                  </button>
                );
              })}
            </div>
          </Field>
          {error && (
            <p className="mt-3 rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">
              {error}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button onClick={saveChild} disabled={busy}>
              {busy ? "Saving…" : "Add child 🎉"}
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setAdding(true)}>
          + Add another child (10% sibling discount!)
        </Button>
      )}
    </div>
  );
}
