"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { completeOnboarding, type OnboardingPayload } from "@/app/actions/onboarding";
import { Logo } from "@/components/brand/logo";
import { submitPayfast } from "@/components/portal/payfast-submit";
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
import { createBrowserSupabase } from "@/lib/supabase/client";
import { functionUrl } from "@/lib/supabase/config";
import { formatZar } from "@/lib/pricing";

type Subject = { id: number; name: string; emoji: string };
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
type Slot = { slot_at: string; duration_minutes: number; tutor_id: string | null };

const MASCOTS = [
  { slug: "star", label: "Twinkle", el: <StarPal size={54} /> },
  { slug: "heart", label: "Bubbles", el: <HeartPal size={54} /> },
  { slug: "pencil", label: "Scribbles", el: <PencilPal size={54} /> },
  { slug: "cloud", label: "Puff", el: <CloudPal size={54} /> },
  { slug: "blob-green", label: "Pip", el: <BlobPal size={54} color="var(--color-grass)" /> },
  { slug: "blob-lilac", label: "Plum", el: <BlobPal size={54} color="var(--color-lilac)" /> },
] as const;

const ALL_GRADES = ["Grade R prep", "Grade R", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
const SELF_GRADES = [...Array.from({ length: 7 }, (_, i) => `Grade ${i + 6}`), "Matric rewrite / Post-school"];

function gradeToAgeBand(grade: string): "young" | "teen" {
  const m = grade.match(/Grade (\d+)/);
  if (!m) return grade.includes("Post-school") || grade.includes("Matric") ? "teen" : "young";
  return Number(m[1]) >= 6 ? "teen" : "young";
}

export function OnboardingWizard({
  subjects,
  packages,
  slots,
  preselectedPackage,
  existingUser,
}: {
  subjects: Subject[];
  packages: Pkg[];
  slots: Slot[];
  preselectedPackage: string | null;
  existingUser: { email: string; full_name: string; phone: string } | null;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [who, setWho] = useState<"parent" | "self" | null>(null);
  const [account, setAccount] = useState({
    full_name: existingUser?.full_name ?? "",
    email: existingUser?.email ?? "",
    phone: existingUser?.phone ?? "",
    password: "",
    password2: "",
  });
  const [child, setChild] = useState({
    full_name: "",
    grade: "",
    mascot: "star",
    subject_ids: [] as number[],
    other_on: false,
    other_subjects: "",
    goals: "",
    care_notes: "",
  });
  const [pkg, setPkg] = useState<string>(
    preselectedPackage && packages.some((p) => p.slug === preselectedPackage)
      ? preselectedPackage
      : "intro",
  );
  const [picked, setPicked] = useState<Slot[]>([]);
  const [agree, setAgree] = useState({ terms: false, privacy: false, payments: false });

  const chosenPkg = packages.find((p) => p.slug === pkg);
  const requiredSlots = chosenPkg?.lessons_per_month ?? 1;

  // steps: 0 who · 1 about you · 2 the learner · 3 adventure · 4 times · 5 promise · 6 pay
  const STEP_LABELS = ["Hello", "You", who === "self" ? "Your goals" : "Your child", "Plan", "Times", "Promise", "Pay"];
  const CHEERS = [
    "Welcome! Who are we signing up today? 👋",
    who === "self" ? "Tell us about yourself 🎓" : "First, a little about you 💛",
    who === "self" ? "What are we conquering? 🚀" : "Now, tell us about your superstar ⭐",
    "Choose your adventure 🗺️",
    `Pick your lesson time${requiredSlots > 1 ? "s" : ""} 🗓️`,
    "The grown-up bit (almost there!) 🤝",
    "High five! Let's make it official 🎉",
  ];

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const day = new Date(s.slot_at).toDateString();
      map.set(day, [...(map.get(day) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);

  function toggleSlot(s: Slot) {
    setPicked((prev) => {
      const on = prev.some((p) => p.slot_at === s.slot_at);
      if (on) return prev.filter((p) => p.slot_at !== s.slot_at);
      if (prev.length >= requiredSlots) return prev; // full — deselect one first
      return [...prev, s];
    });
  }

  const toggleSubject = (id: number) =>
    setChild((c) => ({
      ...c,
      subject_ids: c.subject_ids.includes(id)
        ? c.subject_ids.filter((s) => s !== id)
        : [...c.subject_ids, id],
    }));

  async function next() {
    setError(null);
    try {
      if (step === 0 && !who) throw new Error("Pick one so we know how to greet you!");
      if (step === 1) {
        if (account.full_name.trim().length < 2) throw new Error("Please tell us your name!");
        if (!existingUser && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email.trim()))
          throw new Error("We need a valid email for your invoices & login.");
        if (who === "self" && !child.grade) throw new Error("Pick your grade.");
        if (who === "self") setChild((c) => ({ ...c, full_name: account.full_name }));
      }
      if (step === 2) {
        if (who === "parent" && child.full_name.trim().length < 2)
          throw new Error("What's your child's name?");
        if (who === "parent" && !child.grade) throw new Error("Please pick a grade.");
        if (!child.subject_ids.length && !(child.other_on && child.other_subjects.trim()))
          throw new Error("Pick at least one subject (or fill in your own).");
      }
      if (step === 4 && picked.length !== requiredSlots)
        throw new Error(
          `Your ${chosenPkg?.name ?? "plan"} includes ${requiredSlots} lesson${requiredSlots > 1 ? "s" : ""} — pick ${requiredSlots - picked.length} more time${requiredSlots - picked.length > 1 ? "s" : ""}.`,
        );
      if (step === 5 && !(agree.terms && agree.privacy && agree.payments))
        throw new Error("Please tick all three boxes so we can continue.");
      if (step === 6) {
        await payNow();
        return;
      }
      // moving from package step: trim picked slots if the plan shrank
      if (step === 3) setPicked((prev) => prev.slice(0, requiredSlots));
      setStep((s) => s + 1);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function payNow() {
    if (busy) return; // double-click = double-payment risk; never twice
    setBusy(true);
    setError(null);
    try {
      const supabase = createBrowserSupabase();
      if (!existingUser) {
        if (account.password.length < 8) throw new Error("Password must be at least 8 characters.");
        if (account.password !== account.password2) throw new Error("Passwords don't match!");
        // the account is born right here — no dead accounts from abandoned wizards
        const res = await fetch(functionUrl("auth-signup"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: account.email,
            password: account.password,
            full_name: account.full_name,
            phone: account.phone || null,
            self_student: who === "self",
          }),
        });
        const body = await res.json();
        if (!res.ok) {
          if (/already have an account/i.test(body.error ?? "")) {
            throw new Error("You already have an account — sign in first, then book from your portal!");
          }
          throw new Error(body.error ?? "Could not create your account.");
        }
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: account.email.trim().toLowerCase(),
          password: account.password,
        });
        if (signInErr) throw new Error("Account created — please sign in to finish up.");
      }

      const payload: OnboardingPayload = {
        who: who!,
        parent: { full_name: account.full_name, phone: account.phone },
        child: {
          full_name: who === "self" ? account.full_name : child.full_name,
          grade: child.grade,
          age_band: gradeToAgeBand(child.grade),
          mascot: gradeToAgeBand(child.grade) === "young" ? child.mascot : "star",
          subject_ids: child.subject_ids,
          other_subjects: child.other_on ? child.other_subjects : undefined,
          goals: child.goals,
          care_notes: child.care_notes,
        },
        package_slug: pkg,
        slots: picked.map((p) => ({ slot_at: p.slot_at, tutor_id: p.tutor_id })),
      };
      const res = await completeOnboarding(payload);
      if (!res.ok) throw new Error(res.error);
      submitPayfast(res.checkout); // navigating away to PayFast
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const mascotFor = [
    <HeartPal key={0} size={50} mood="excited" />,
    <StarPal key={1} size={50} mood="excited" />,
    who === "self" ? <BlobPal key={2} size={50} color="var(--color-sky)" mood="excited" /> : <CloudPal key={2} size={50} />,
    <BlobPal key={3} size={50} color="var(--color-grass)" mood="excited" />,
    <PencilPal key={4} size={50} />,
    <HeartPal key={5} size={50} />,
    <StarPal key={6} size={50} mood="excited" />,
  ][step];

  return (
    <main className="min-h-screen bg-cream dotted-paper px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo size="sm" />
          <Chip tone="sunshine">
            Step {step + 1} of {STEP_LABELS.length}
          </Chip>
        </div>
        <RainbowProgress value={((step + 1) / STEP_LABELS.length) * 100} label="onboarding progress" />
        <div className="mt-2 mb-6 flex justify-between text-[10px] font-bold text-ink-soft">
          {STEP_LABELS.map((s, i) => (
            <span key={i} className={i <= step ? "text-navy" : ""}>
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
                <div className="animate-bounce-soft">{mascotFor}</div>
                <h1 className="font-display font-bold text-xl sm:text-2xl">{CHEERS[step]}</h1>
              </div>

              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setWho("parent")}
                    className={`squash rounded-3xl border-2 p-6 text-left ${
                      who === "parent" ? "border-navy bg-pastel-pink" : "border-line bg-paper"
                    }`}
                  >
                    <HeartPal size={56} mood="excited" />
                    <p className="mt-3 font-display font-bold text-lg">I&apos;m a parent</p>
                    <p className="text-sm text-ink-soft">
                      Signing up my child (or children!) for lessons.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWho("self")}
                    className={`squash rounded-3xl border-2 p-6 text-left ${
                      who === "self" ? "border-navy bg-pastel-blue" : "border-line bg-paper"
                    }`}
                  >
                    <BlobPal size={56} color="var(--color-sky)" mood="excited" />
                    <p className="mt-3 font-display font-bold text-lg">I&apos;m a student</p>
                    <p className="text-sm text-ink-soft">
                      Grade 6 and up — signing up for myself, like a boss.
                    </p>
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <Field label={who === "self" ? "Your full name" : "Your full name"}>
                    <Input
                      value={account.full_name}
                      onChange={(e) => setAccount({ ...account, full_name: e.target.value })}
                      placeholder={who === "self" ? "e.g. Thabo Naidoo" : "e.g. Sam Naidoo"}
                      autoComplete="name"
                    />
                  </Field>
                  {!existingUser && (
                    <Field label="Email" hint="Asked once — used for your login and invoices. No spam, ever.">
                      <Input
                        type="email"
                        value={account.email}
                        onChange={(e) => setAccount({ ...account, email: e.target.value })}
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </Field>
                  )}
                  {who === "self" && (
                    <Field label="Your grade">
                      <Select
                        value={child.grade}
                        onChange={(e) => setChild({ ...child, grade: e.target.value })}
                      >
                        <option value="">Choose your grade…</option>
                        {SELF_GRADES.map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </Select>
                    </Field>
                  )}
                  <Field label="Phone" optional hint="For quick lesson reminders on WhatsApp.">
                    <Input
                      type="tel"
                      value={account.phone}
                      onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                      placeholder="e.g. 082 123 4567"
                      autoComplete="tel"
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  {who === "parent" && (
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
                          {ALL_GRADES.map((g) => (
                            <option key={g}>{g}</option>
                          ))}
                        </Select>
                      </Field>
                    </div>
                  )}

                  <Field label={who === "self" ? "Subjects you want help with" : "Subjects to work on"}>
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
                      <button
                        type="button"
                        onClick={() => setChild((c) => ({ ...c, other_on: !c.other_on }))}
                        className={`squash rounded-full px-4 py-2 text-sm font-bold border-2 ${
                          child.other_on
                            ? "border-navy bg-pastel-purple text-navy"
                            : "border-dashed border-line bg-paper text-ink-soft hover:border-lilac"
                        }`}
                      >
                        ✏️ Something else…
                      </button>
                    </div>
                  </Field>
                  {child.other_on && (
                    <Field label="Tell us the subject(s)" hint="We'll match the right tutor for it.">
                      <Input
                        value={child.other_subjects}
                        onChange={(e) => setChild({ ...child, other_subjects: e.target.value })}
                        placeholder="e.g. Accounting, French, chess…"
                      />
                    </Field>
                  )}

                  {who === "parent" && child.grade && gradeToAgeBand(child.grade) === "young" && (
                    <Field label="Pick a buddy!" hint="Their little friend inside the app — it cheers them on.">
                      <div className="flex flex-wrap gap-3">
                        {MASCOTS.map((m) => (
                          <button
                            key={m.slug}
                            type="button"
                            onClick={() => setChild({ ...child, mascot: m.slug })}
                            className={`squash flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 ${
                              child.mascot === m.slug ? "border-navy bg-pastel-yellow" : "border-line bg-paper"
                            }`}
                          >
                            {m.el}
                            <span className="text-[10px] font-bold text-ink-soft">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}

                  <Field
                    label={who === "self" ? "What are you aiming for?" : "Goals & dreams"}
                    optional
                  >
                    <Textarea
                      value={child.goals}
                      onChange={(e) => setChild({ ...child, goals: e.target.value })}
                      placeholder={
                        who === "self"
                          ? "e.g. Pass maths with 70%+, feel ready for finals…"
                          : "e.g. Feel confident with fractions, love reading…"
                      }
                    />
                  </Field>
                  <Field
                    label={
                      who === "self"
                        ? "Anything your tutor should know?"
                        : gradeToAgeBand(child.grade || "Grade 1") === "teen"
                          ? "Anything the tutor should know?"
                          : "Anything we should know?"
                    }
                    optional
                    hint="Learning style, concentration, allergies — whatever helps us care."
                  >
                    <Textarea
                      value={child.care_notes}
                      onChange={(e) => setChild({ ...child, care_notes: e.target.value })}
                    />
                  </Field>
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
                            {p.slug === "intro" && <Chip tone="grass">Perfect first step</Chip>}
                          </span>
                          <span className="block text-xs text-ink-soft">{p.blurb}</span>
                        </span>
                        <span className="text-right">
                          <span className="block font-display font-bold text-lg">
                            {formatZar(p.price_cents / 100)}
                          </span>
                          <span className="text-xs font-bold text-ink-soft">
                            {p.lessons_per_month} lesson{p.lessons_per_month > 1 ? "s" : ""}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                  {pkg === "intro" && (
                    <p className="rounded-2xl bg-pastel-green px-4 py-2.5 text-xs font-bold text-grass-deep">
                      ✨ Assessment lesson chosen — your tutor and the Lewis team are told to
                      prepare a get-to-know-you assessment.
                    </p>
                  )}
                  <p className="text-xs text-ink-soft">
                    💡 All lessons are live online video lessons. Siblings get 10% off monthly
                    plans automatically.
                  </p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl bg-pastel-blue px-4 py-3">
                    <p className="text-sm font-bold">
                      {chosenPkg?.emoji} {chosenPkg?.name}: pick{" "}
                      <strong>{requiredSlots}</strong> time{requiredSlots > 1 ? "s" : ""}
                    </p>
                    <Chip tone={picked.length === requiredSlots ? "grass" : "sunshine"}>
                      {picked.length} / {requiredSlots} picked
                    </Chip>
                  </div>
                  <div className="max-h-80 space-y-4 overflow-y-auto rounded-2xl border-2 border-line bg-paper p-4">
                    {slotsByDay.length === 0 && (
                      <p className="text-sm text-ink-soft">
                        No open slots right now — please check back soon or{" "}
                        <Link href="/#contact" className="font-bold underline">say hello</Link>!
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
                          {daySlots.map((s) => {
                            const on = picked.some((p) => p.slot_at === s.slot_at);
                            const full = picked.length >= requiredSlots && !on;
                            return (
                              <button
                                key={s.slot_at}
                                type="button"
                                onClick={() => toggleSlot(s)}
                                disabled={full}
                                className={`squash rounded-full border-2 px-4 py-1.5 text-sm font-bold disabled:opacity-40 ${
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
                  <p className="text-xs text-ink-soft">
                    💻 All lessons happen online — your tutor sends the video link before each
                    lesson. Picked too many? Tap a green time to unpick it.
                  </p>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <p className="text-sm text-ink-soft -mt-2">
                    The not-so-fine print — short, honest, and written for humans.
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
                          — our data is used only to run lessons, never sold.
                        </>
                      }
                    />
                    <Checkbox
                      checked={agree.payments}
                      onChange={(e) => setAgree({ ...agree, payments: e.target.checked })}
                      label={
                        <>I authorise Lewis Tutoring to bill the plan I chose via PayFast, and I
                        understand monthly plans renew until paused or cancelled.</>
                      }
                    />
                  </div>
                </div>
              )}

              {step === 6 && chosenPkg && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-pastel-green p-5">
                    <p className="font-display font-bold text-lg">Your order 🧾</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>
                        {chosenPkg.emoji} {chosenPkg.name} —{" "}
                        {who === "self" ? account.full_name : child.full_name}
                      </span>
                      <span className="font-display font-bold text-xl">
                        {formatZar(chosenPkg.price_cents / 100)}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-xs text-ink-soft">
                      {picked
                        .slice()
                        .sort((a, b) => a.slot_at.localeCompare(b.slot_at))
                        .map((p) => (
                          <li key={p.slot_at}>
                            💻{" "}
                            {new Date(p.slot_at).toLocaleString("en-ZA", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </li>
                        ))}
                    </ul>
                  </div>

                  {!existingUser && (
                    <div className="space-y-3 rounded-2xl border-2 border-line bg-paper p-5">
                      <p className="font-display font-bold text-sm">
                        Create your login <span className="text-ink-soft font-sans">({account.email})</span>
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          type="password"
                          placeholder="Password (8+ characters)"
                          value={account.password}
                          onChange={(e) => setAccount({ ...account, password: e.target.value })}
                          autoComplete="new-password"
                        />
                        <Input
                          type="password"
                          placeholder="Repeat password"
                          value={account.password2}
                          onChange={(e) => setAccount({ ...account, password2: e.target.value })}
                          autoComplete="new-password"
                        />
                      </div>
                      <p className="text-xs text-ink-soft">
                        Your account is only created now, right before payment —{" "}
                        <Sparkle size={12} className="inline" /> no half-finished sign-ups floating
                        about.
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-ink-soft">
                    You&apos;ll hop over to <strong className="text-navy">PayFast</strong> to pay
                    securely. Your invoice appears in your portal automatically, and the Lewis
                    team is notified to match you with the perfect tutor. 🌈
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
                <Button onClick={next} disabled={busy} size="lg" variant={step === 6 ? "sunshine" : "primary"}>
                  {busy
                    ? "One sec…"
                    : step === 6
                      ? `${existingUser ? "" : "Create account & "}pay ${chosenPkg ? formatZar(chosenPkg.price_cents / 100) : ""} 🔒`
                      : "Next →"}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
        <p className="mt-4 text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-coral underline underline-offset-2">
            Sign in
          </Link>{" "}
          and book from your portal instead.
        </p>
      </div>
    </main>
  );
}
