"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  addChild,
  bookFirstLesson,
  saveParentDetails,
  startCheckout,
} from "@/app/actions/onboarding";
import { Logo } from "@/components/brand/logo";
import {
  BlobPal,
  CloudPal,
  HeartPal,
  PencilPal,
  Sparkle,
  StarPal,
} from "@/components/brand/mascots";
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Field,
  Input,
  RainbowProgress,
  Select,
  Textarea,
} from "@/components/ui";
import { formatZar } from "@/lib/pricing";

type Subject = { id: number; name: string; emoji: string; color: string };
type Pkg = {
  slug: string;
  name: string;
  emoji: string;
  lessons_per_month: number;
  price_cents: number;
  per_lesson_cents: number;
  save_cents: number;
  blurb: string;
  popular: boolean;
};
type Slot = { slot_at: string; mode: string; duration_minutes: number };

const STEPS = ["You", "Your child", "First lesson", "Plan", "The promise", "Pay"] as const;

const MASCOTS = [
  { slug: "star", label: "Twinkle", el: <StarPal size={54} /> },
  { slug: "heart", label: "Bubbles", el: <HeartPal size={54} /> },
  { slug: "pencil", label: "Scribbles", el: <PencilPal size={54} /> },
  { slug: "cloud", label: "Puff", el: <CloudPal size={54} /> },
  { slug: "blob-green", label: "Pip", el: <BlobPal size={54} color="var(--color-grass)" /> },
  { slug: "blob-lilac", label: "Plum", el: <BlobPal size={54} color="var(--color-lilac)" /> },
] as const;

const GRADES = ["Grade R prep", "Grade R", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

const CHEERS = [
  "Hi there! Let's introduce ourselves 👋",
  "Tell us about your superstar ⭐",
  "Pick the perfect time 🗓️",
  "Choose your adventure 🚀",
  "The grown-up bit (almost there!) 🤝",
  "High five! Let's make it official 🎉",
];

export function OnboardingWizard({
  profile,
  subjects,
  packages,
  slots,
  preselectedPackage,
}: {
  profile: { full_name: string; phone: string };
  subjects: Subject[];
  packages: Pkg[];
  slots: Slot[];
  preselectedPackage: string | null;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // collected state
  const [parent, setParent] = useState(profile);
  const [child, setChild] = useState({
    full_name: "",
    grade: "",
    school: "",
    birthdate: "",
    mascot: "star",
    subject_ids: [] as number[],
    goals: "",
    learning_style: "",
    medical_notes: "",
  });
  const [studentId, setStudentId] = useState<string | null>(null);
  const [slotAt, setSlotAt] = useState<string | null>(null);
  const [bookedSlotAt, setBookedSlotAt] = useState<string | null>(null);
  const [mode, setMode] = useState<"online" | "in_person">("in_person");
  const [firstSubject, setFirstSubject] = useState<number | null>(null);
  const [pkg, setPkg] = useState<string>(
    preselectedPackage && packages.some((p) => p.slug === preselectedPackage)
      ? preselectedPackage
      : "intro",
  );
  const [agree, setAgree] = useState({ terms: false, privacy: false, payments: false });

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const day = new Date(s.slot_at).toDateString();
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);

  const chosenPkg = packages.find((p) => p.slug === pkg);

  async function next() {
    setError(null);
    setBusy(true);
    try {
      if (step === 0) {
        if (parent.full_name.trim().length < 2) throw new Error("Please tell us your name!");
        const res = await saveParentDetails(parent);
        if (!res.ok) throw new Error(res.error);
      }
      if (step === 1) {
        if (child.full_name.trim().length < 2) throw new Error("What's your child's name?");
        if (!child.grade) throw new Error("Please pick a grade.");
        if (!child.subject_ids.length) throw new Error("Pick at least one subject.");
        if (!studentId) {
          const res = await addChild(child);
          if (!res.ok) throw new Error(res.error);
          setStudentId(res.student_id);
        }
      }
      if (step === 2) {
        if (!slotAt) throw new Error("Pick a time for the first lesson!");
        if (bookedSlotAt !== slotAt) {
          const res = await bookFirstLesson({
            student_id: studentId!,
            subject_id: firstSubject ?? child.subject_ids[0] ?? null,
            slot_at: slotAt,
            mode,
          });
          if (!res.ok) throw new Error(res.error);
          setBookedSlotAt(slotAt);
        }
      }
      if (step === 4) {
        if (!agree.terms || !agree.privacy || !agree.payments) {
          throw new Error("Please tick all three boxes so we can continue.");
        }
      }
      if (step === 5) {
        const res = await startCheckout({ package_slug: pkg, student_id: studentId! });
        if (!res.ok) throw new Error(res.error);
        // Build & submit the PayFast form
        const form = document.createElement("form");
        form.method = "POST";
        form.action = res.checkout.processUrl;
        for (const [k, v] of res.checkout.fields) {
          const inp = document.createElement("input");
          inp.type = "hidden";
          inp.name = k;
          inp.value = v;
          form.appendChild(inp);
        }
        document.body.appendChild(form);
        form.submit();
        return; // navigating away
      }
      setStep((s) => s + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const toggleSubject = (id: number) =>
    setChild((c) => ({
      ...c,
      subject_ids: c.subject_ids.includes(id)
        ? c.subject_ids.filter((s) => s !== id)
        : [...c.subject_ids, id],
    }));

  return (
    <main className="min-h-screen bg-cream dotted-paper px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo size="sm" />
          <Chip tone="sunshine">
            Step {step + 1} of {STEPS.length}
          </Chip>
        </div>
        <RainbowProgress value={((step + 1) / STEPS.length) * 100} label="onboarding progress" />
        <div className="mt-2 mb-6 flex justify-between text-[10px] font-bold text-ink-soft">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= step ? "text-navy" : ""}>
              {s}
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="animate-bounce-soft">
                  {[
                    <HeartPal key={0} size={50} mood="excited" />,
                    <StarPal key={1} size={50} mood="excited" />,
                    <CloudPal key={2} size={50} />,
                    <BlobPal key={3} size={50} color="var(--color-grass)" mood="excited" />,
                    <PencilPal key={4} size={50} />,
                    <StarPal key={5} size={50} mood="excited" />,
                  ][step]}
                </div>
                <h1 className="font-display font-bold text-xl sm:text-2xl">{CHEERS[step]}</h1>
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  <Field label="Your full name">
                    <Input
                      value={parent.full_name}
                      onChange={(e) => setParent({ ...parent, full_name: e.target.value })}
                      placeholder="e.g. Sam Naidoo"
                    />
                  </Field>
                  <Field label="Phone number" optional hint="For lesson reminders and quick chats.">
                    <Input
                      type="tel"
                      value={parent.phone}
                      onChange={(e) => setParent({ ...parent, phone: e.target.value })}
                      placeholder="e.g. 082 123 4567"
                    />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Child's name">
                      <Input
                        value={child.full_name}
                        onChange={(e) => setChild({ ...child, full_name: e.target.value })}
                        placeholder="e.g. Zoë"
                      />
                    </Field>
                    <Field label="Grade">
                      <Select
                        value={child.grade}
                        onChange={(e) => setChild({ ...child, grade: e.target.value })}
                      >
                        <option value="">Choose a grade…</option>
                        {GRADES.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Subjects to work on">
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((s) => {
                        const on = child.subject_ids.includes(s.id);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSubject(s.id)}
                            className={`squash rounded-full px-4 py-2 text-sm font-bold border-2 ${
                              on
                                ? "border-navy bg-sunshine text-navy"
                                : "border-line bg-paper text-ink-soft hover:border-sky"
                            }`}
                          >
                            {s.emoji} {s.name}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Field label="Pick a buddy!" hint="Your child's little friend inside the app.">
                    <div className="flex flex-wrap gap-3">
                      {MASCOTS.map((m) => (
                        <button
                          key={m.slug}
                          type="button"
                          onClick={() => setChild({ ...child, mascot: m.slug })}
                          className={`squash flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 ${
                            child.mascot === m.slug
                              ? "border-navy bg-pastel-yellow"
                              : "border-line bg-paper"
                          }`}
                        >
                          {m.el}
                          <span className="text-[10px] font-bold text-ink-soft">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <details className="rounded-2xl border-2 border-line bg-paper p-4">
                    <summary className="cursor-pointer font-display font-bold text-sm text-navy">
                      Optional extras (school, goals, anything we should know)
                    </summary>
                    <div className="mt-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="School" optional>
                          <Input
                            value={child.school}
                            onChange={(e) => setChild({ ...child, school: e.target.value })}
                          />
                        </Field>
                        <Field label="Birthday" optional>
                          <Input
                            type="date"
                            value={child.birthdate}
                            onChange={(e) => setChild({ ...child, birthdate: e.target.value })}
                          />
                        </Field>
                      </div>
                      <Field label="Learning style" optional>
                        <Select
                          value={child.learning_style}
                          onChange={(e) => setChild({ ...child, learning_style: e.target.value })}
                        >
                          <option value="">Not sure yet</option>
                          <option>Visual — pictures & diagrams</option>
                          <option>Hands-on — learning by doing</option>
                          <option>Listening — talking it through</option>
                          <option>Reading & writing</option>
                        </Select>
                      </Field>
                      <Field label="Goals & dreams" optional>
                        <Textarea
                          value={child.goals}
                          onChange={(e) => setChild({ ...child, goals: e.target.value })}
                          placeholder="e.g. Feel confident with fractions, love reading…"
                        />
                      </Field>
                      <Field
                        label="Anything else we should know?"
                        optional
                        hint="Allergies, concentration, anything that helps us care for them."
                      >
                        <Textarea
                          value={child.medical_notes}
                          onChange={(e) => setChild({ ...child, medical_notes: e.target.value })}
                        />
                      </Field>
                    </div>
                  </details>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft -mt-2">
                    These are Miss Lewis&apos; open times for the next two weeks — grab the one
                    that fits your week best.
                  </p>
                  <Field label="Subject for the first lesson">
                    <Select
                      value={firstSubject ?? child.subject_ids[0] ?? ""}
                      onChange={(e) => setFirstSubject(Number(e.target.value))}
                    >
                      {child.subject_ids.map((id) => {
                        const s = subjects.find((x) => x.id === id);
                        return s ? (
                          <option key={id} value={id}>
                            {s.emoji} {s.name}
                          </option>
                        ) : null;
                      })}
                    </Select>
                  </Field>
                  <Field label="Online or in person?">
                    <div className="flex gap-2">
                      {(["in_person", "online"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMode(m)}
                          className={`squash rounded-full border-2 px-5 py-2 text-sm font-bold ${
                            mode === m ? "border-navy bg-pastel-blue text-navy" : "border-line text-ink-soft"
                          }`}
                        >
                          {m === "in_person" ? "🏡 In person" : "💻 Online"}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <div className="max-h-72 space-y-4 overflow-y-auto rounded-2xl border-2 border-line bg-paper p-4">
                    {slotsByDay.length === 0 && (
                      <p className="text-sm text-ink-soft">
                        No open slots right now — please contact Miss Lewis directly!
                      </p>
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
                          {daySlots
                            .filter((s) => s.mode === "both" || s.mode === mode)
                            .map((s) => {
                              const t = new Date(s.slot_at);
                              const on = slotAt === s.slot_at;
                              return (
                                <button
                                  key={s.slot_at}
                                  type="button"
                                  onClick={() => setSlotAt(s.slot_at)}
                                  className={`squash rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                                    on
                                      ? "border-navy bg-grass text-white"
                                      : "border-line bg-cream text-navy hover:border-grass"
                                  }`}
                                >
                                  {t.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  {packages.map((p) => {
                    const on = pkg === p.slug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        onClick={() => setPkg(p.slug)}
                        className={`squash flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left ${
                          on ? "border-navy bg-pastel-yellow" : "border-line bg-paper"
                        }`}
                      >
                        <span className="text-3xl">{p.emoji}</span>
                        <span className="flex-1">
                          <span className="flex items-center gap-2 font-display font-bold">
                            {p.name}
                            {p.popular && <Chip tone="coral">Most loved</Chip>}
                          </span>
                          <span className="block text-xs text-ink-soft">{p.blurb}</span>
                        </span>
                        <span className="text-right">
                          <span className="block font-display font-bold text-lg">
                            {formatZar(p.price_cents / 100)}
                          </span>
                          {p.save_cents > 0 && (
                            <span className="text-xs font-bold text-grass-deep">
                              save {formatZar(p.save_cents / 100)}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                  <p className="text-xs text-ink-soft">
                    💡 Siblings get 10% off monthly packages automatically. You can change or
                    pause your plan any time.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft -mt-2">
                    The not-so-fine print — short, honest, and written for humans. Please have a
                    quick read and tick the boxes.
                  </p>
                  <div className="space-y-3 rounded-2xl border-2 border-line bg-paper p-5">
                    <Checkbox
                      checked={agree.terms}
                      onChange={(e) => setAgree({ ...agree, terms: e.target.checked })}
                      label={
                        <>
                          I&apos;ve read and accept the{" "}
                          <Link href="/terms" target="_blank" className="font-bold text-sky-deep underline">
                            Terms of Service
                          </Link>{" "}
                          (bookings, cancellations &amp; lesson rules).
                        </>
                      }
                    />
                    <Checkbox
                      checked={agree.privacy}
                      onChange={(e) => setAgree({ ...agree, privacy: e.target.checked })}
                      label={
                        <>
                          I accept the{" "}
                          <Link href="/privacy" target="_blank" className="font-bold text-sky-deep underline">
                            Privacy Policy
                          </Link>{" "}
                          — my family&apos;s data is used only to run our lessons, never sold.
                        </>
                      }
                    />
                    <Checkbox
                      checked={agree.payments}
                      onChange={(e) => setAgree({ ...agree, payments: e.target.checked })}
                      label={
                        <>I authorise Lewis Tutoring to bill the plan I chose via PayFast, and I
                        understand monthly plans renew until I pause or cancel them.</>
                      }
                    />
                  </div>
                </div>
              )}

              {step === 5 && chosenPkg && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-pastel-green p-5">
                    <p className="font-display font-bold text-lg">Your order 🧾</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>
                        {chosenPkg.emoji} {chosenPkg.name} — {child.full_name}
                      </span>
                      <span className="font-display font-bold text-xl">
                        {formatZar(chosenPkg.price_cents / 100)}
                      </span>
                    </div>
                    {slotAt && (
                      <p className="mt-1 text-xs text-ink-soft">
                        First lesson:{" "}
                        {new Date(slotAt).toLocaleString("en-ZA", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({mode === "online" ? "online" : "in person"})
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-ink-soft">
                    You&apos;ll hop over to <strong className="text-navy">PayFast</strong> — South
                    Africa&apos;s trusted payment gateway — to pay securely. An invoice appears in
                    your parent portal automatically. <Sparkle size={14} className="inline" />
                  </p>
                </div>
              )}

              {error && (
                <p className="mt-4 rounded-2xl bg-pastel-pink px-4 py-2 text-sm font-bold text-coral-deep">
                  {error}
                </p>
              )}

              <div className="mt-7 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0 || busy}
                  className={step === 0 ? "invisible" : ""}
                >
                  ← Back
                </Button>
                <Button onClick={next} disabled={busy} size="lg" variant={step === 5 ? "sunshine" : "primary"}>
                  {busy
                    ? "One sec…"
                    : step === 5
                      ? `Pay ${chosenPkg ? formatZar(chosenPkg.price_cents / 100) : ""} securely 🔒`
                      : "Next →"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
