"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { bookLessons, startCheckout } from "@/app/actions/onboarding";
import { submitPayfast } from "@/components/portal/payfast-submit";
import { fmtCents } from "@/components/portal/widgets";
import { Button, Card, Chip, Field, Select } from "@/components/ui";
import { createBrowserSupabase } from "@/lib/supabase/client";

type Kid = {
  id: string;
  full_name: string;
  grade: string;
  assigned_tutor_id: string | null;
  assignment_status: string;
};
type Slot = { slot_at: string; duration_minutes: number; tutor_id: string | null };
type Enrollment = { student_id: string; subject: { id: number; name: string; emoji: string } };
type Pkg = {
  slug: string;
  name: string;
  emoji: string;
  price_cents: number;
  lessons_per_month: number;
  blurb: string;
  popular: boolean;
};

export function BookingForm({
  kids,
  enrollments,
  packages,
}: {
  kids: Kid[];
  enrollments: Enrollment[];
  packages: Pkg[];
}) {
  const router = useRouter();
  const [kidId, setKidId] = useState(kids[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [picked, setPicked] = useState<Slot[]>([]);
  const [billing, setBilling] = useState<"plan" | "single">("plan");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const kid = kids.find((k) => k.id === kidId);
  const kidSubjects = enrollments.filter((e) => e.student_id === kidId).map((e) => e.subject);
  const maxSlots = billing === "single" ? 1 : 12;

  // slots follow the child's assigned tutor (general pool when unassigned)
  useEffect(() => {
    let live = true;
    async function load() {
      setLoadingSlots(true);
      setPicked([]);
      const supabase = createBrowserSupabase();
      const { data } = await supabase.rpc("get_open_slots", {
        p_days: 21,
        p_tutor: kid?.assigned_tutor_id ?? null,
      });
      if (live) {
        setSlots((data ?? []) as Slot[]);
        setLoadingSlots(false);
      }
    }
    if (kid) load();
    return () => {
      live = false;
    };
  }, [kidId, kid?.assigned_tutor_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const day = new Date(s.slot_at).toDateString();
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);

  function toggle(s: Slot) {
    setPicked((prev) => {
      const on = prev.some((p) => p.slot_at === s.slot_at);
      if (on) return prev.filter((p) => p.slot_at !== s.slot_at);
      if (prev.length >= maxSlots) return billing === "single" ? [s] : prev;
      return [...prev, s];
    });
  }

  async function book() {
    if (!kidId || picked.length === 0) {
      setNote({ kind: "err", text: "Pick a child and at least one time slot!" });
      return;
    }
    if (busy) return;
    setBusy(true);
    setNote(null);
    const res = await bookLessons({
      student_id: kidId,
      subject_id: subjectId ?? kidSubjects[0]?.id ?? null,
      slots: picked.map((p) => ({ slot_at: p.slot_at, tutor_id: p.tutor_id })),
    });
    if (!res.ok) {
      setNote({ kind: "err", text: res.error });
      setBusy(false);
      return;
    }
    if (billing === "single") {
      const pay = await startCheckout({ package_slug: "single", student_id: kidId });
      if (pay.ok) {
        submitPayfast(pay.checkout);
        return;
      }
      setNote({ kind: "err", text: "Lesson booked, but the invoice failed — try from Invoices." });
      setBusy(false);
      return;
    }
    setNote({
      kind: "ok",
      text: `Booked ${picked.length} lesson${picked.length > 1 ? "s" : ""}! 🎉 They're on your dashboard and your tutor's calendar.`,
    });
    setPicked([]);
    setBusy(false);
    router.refresh();
  }

  async function buyPackage(slug: string) {
    if (!kidId || busy) return;
    setBusy(true);
    const res = await startCheckout({ package_slug: slug, student_id: kidId });
    if (res.ok) {
      submitPayfast(res.checkout);
      return;
    }
    setNote({ kind: "err", text: res.error });
    setBusy(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="For which child?">
            <Select value={kidId} onChange={(e) => setKidId(e.target.value)}>
              {kids.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Subject">
            <Select
              value={subjectId ?? kidSubjects[0]?.id ?? ""}
              onChange={(e) => setSubjectId(Number(e.target.value))}
            >
              {kidSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {kid && (
          <p className="mt-2 text-xs font-bold text-ink-soft">
            {kid.assignment_status === "active"
              ? "💻 Showing your tutor's live availability — all lessons online."
              : "💻 Showing general availability — a tutor will be matched by the Lewis team."}
          </p>
        )}

        <div className="mt-3 max-h-80 space-y-4 overflow-y-auto rounded-2xl border-2 border-line bg-paper p-4">
          {loadingSlots && <p className="text-sm text-ink-soft animate-pulse">Fetching open times…</p>}
          {!loadingSlots && slotsByDay.length === 0 && (
            <p className="text-sm text-ink-soft">No open slots right now — check back soon!</p>
          )}
          {!loadingSlots &&
            slotsByDay.map(([day, daySlots]) => (
              <div key={day}>
                <p className="mb-2 font-display font-bold text-sm">
                  {new Date(day).toLocaleDateString("en-ZA", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((s) => {
                    const on = picked.some((p) => p.slot_at === s.slot_at);
                    return (
                      <button
                        key={s.slot_at}
                        type="button"
                        onClick={() => toggle(s)}
                        className={`squash rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                          on
                            ? "border-navy bg-grass text-white"
                            : "border-line bg-cream text-navy hover:border-grass"
                        }`}
                      >
                        {new Date(s.slot_at).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setBilling("plan");
              }}
              className={`squash rounded-full border-2 px-4 py-1.5 text-xs font-bold ${
                billing === "plan" ? "border-navy bg-pastel-blue" : "border-line text-ink-soft"
              }`}
            >
              Part of my monthly plan
            </button>
            <button
              type="button"
              onClick={() => {
                setBilling("single");
                setPicked((p) => p.slice(0, 1));
              }}
              className={`squash rounded-full border-2 px-4 py-1.5 text-xs font-bold ${
                billing === "single" ? "border-navy bg-pastel-yellow" : "border-line text-ink-soft"
              }`}
            >
              Single lesson · R250
            </button>
          </div>
          <Chip tone={picked.length ? "grass" : "navy"} className="ml-auto">
            {picked.length} picked
          </Chip>
          <Button onClick={book} disabled={busy || picked.length === 0}>
            {busy ? "Booking…" : billing === "single" ? "Book & pay 🔒" : "Book them! ✨"}
          </Button>
        </div>
        {note && (
          <p
            className={`mt-3 rounded-2xl px-4 py-2 text-sm font-bold ${
              note.kind === "ok" ? "bg-pastel-green text-grass-deep" : "bg-pastel-pink text-coral-deep"
            }`}
          >
            {note.text}
          </p>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-1 font-display font-bold text-lg">Monthly plans 💛</h2>
        <p className="mb-4 text-xs text-ink-soft">
          Cheaper per lesson, siblings 10% off — and no double charges: paying twice for the
          same plan just re-opens the same invoice.
        </p>
        <div className="space-y-3">
          {packages
            .filter((p) => p.lessons_per_month > 1)
            .map((p) => (
              <div key={p.slug} className="rounded-2xl border-2 border-line p-3">
                <p className="flex items-center gap-2 font-display font-bold text-sm">
                  {p.emoji} {p.name}
                  {p.popular && <Chip tone="coral">Most loved</Chip>}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">{p.blurb}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-display font-bold">{fmtCents(p.price_cents)}/mo</p>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => buyPackage(p.slug)}>
                    Buy for {kid?.full_name.split(" ")[0] ?? "…"}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
