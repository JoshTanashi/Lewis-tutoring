"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { bookFirstLesson, startCheckout } from "@/app/actions/onboarding";
import { submitPayfast } from "@/components/portal/payfast-submit";
import { fmtCents } from "@/components/portal/widgets";
import { Button, Card, Chip, Field, Select } from "@/components/ui";

type Kid = { id: string; full_name: string; grade: string };
type Slot = { slot_at: string; mode: string; duration_minutes: number };
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
  slots,
  enrollments,
  packages,
}: {
  kids: Kid[];
  slots: Slot[];
  enrollments: Enrollment[];
  packages: Pkg[];
}) {
  const router = useRouter();
  const [kidId, setKidId] = useState(kids[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [mode, setMode] = useState<"in_person" | "online">("in_person");
  const [slotAt, setSlotAt] = useState<string | null>(null);
  const [billing, setBilling] = useState<"plan" | "single">("plan");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const kidSubjects = enrollments.filter((e) => e.student_id === kidId).map((e) => e.subject);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      if (s.mode !== "both" && s.mode !== mode) continue;
      const day = new Date(s.slot_at).toDateString();
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots, mode]);

  async function book() {
    if (!kidId || !slotAt) {
      setNote({ kind: "err", text: "Pick a child and a time slot first!" });
      return;
    }
    setBusy(true);
    setNote(null);
    const res = await bookFirstLesson({
      student_id: kidId,
      subject_id: subjectId ?? kidSubjects[0]?.id ?? null,
      slot_at: slotAt,
      mode,
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
      setNote({
        kind: "err",
        text: "Lesson booked, but the invoice failed — please try from Invoices.",
      });
      setBusy(false);
      return;
    }
    setNote({ kind: "ok", text: "Booked! 🎉 It's on your dashboard and Miss Lewis' calendar." });
    setSlotAt(null);
    setBusy(false);
    router.refresh();
  }

  async function buyPackage(slug: string) {
    if (!kidId) return;
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
        <div className="grid gap-4 sm:grid-cols-3">
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
          <Field label="Where?">
            <Select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}>
              <option value="in_person">🏡 In person</option>
              <option value="online">💻 Online</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4 max-h-80 space-y-4 overflow-y-auto rounded-2xl border-2 border-line bg-paper p-4">
          {slotsByDay.length === 0 && (
            <p className="text-sm text-ink-soft">No open slots for that mode right now.</p>
          )}
          {slotsByDay.map(([day, daySlots]) => (
            <div key={day}>
              <p className="mb-2 font-display font-bold text-sm">
                {new Date(day).toLocaleDateString("en-ZA", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((s) => (
                  <button
                    key={s.slot_at}
                    type="button"
                    onClick={() => setSlotAt(s.slot_at)}
                    className={`squash rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                      slotAt === s.slot_at
                        ? "border-navy bg-grass text-white"
                        : "border-line bg-cream text-navy hover:border-grass"
                    }`}
                  >
                    {new Date(s.slot_at).toLocaleTimeString("en-ZA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBilling("plan")}
              className={`squash rounded-full border-2 px-4 py-1.5 text-xs font-bold ${
                billing === "plan" ? "border-navy bg-pastel-blue" : "border-line text-ink-soft"
              }`}
            >
              Part of my monthly plan
            </button>
            <button
              type="button"
              onClick={() => setBilling("single")}
              className={`squash rounded-full border-2 px-4 py-1.5 text-xs font-bold ${
                billing === "single" ? "border-navy bg-pastel-yellow" : "border-line text-ink-soft"
              }`}
            >
              Single lesson · R250
            </button>
          </div>
          <Button onClick={book} disabled={busy || !slotAt} className="ml-auto">
            {busy ? "Booking…" : billing === "single" ? "Book & pay 🔒" : "Book it! ✨"}
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
          Cheaper per lesson, and siblings get 10% off automatically.
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
                    Buy for {kids.find((k) => k.id === kidId)?.full_name.split(" ")[0] ?? "…"}
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
