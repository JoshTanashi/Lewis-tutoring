import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { PencilPal, RainbowArc, Sparkle } from "@/components/brand/mascots";
import { Chip } from "@/components/ui";
import { TutorApplyForm } from "./apply-form";

export const metadata: Metadata = {
  title: "Become a tutor",
  description:
    "Love teaching? Join Lewis Tutoring — apply in two minutes, we'll book an interview, and you'll get your own tutor space with students matched to your subjects.",
};

const PERKS: Array<[string, string, string]> = [
  ["🗓️", "Teach on your terms", "You set your weekly availability — families can only book the online slots you switch on."],
  ["🤝", "Students matched to you", "The Lewis team matches learners to your subjects; you approve every student before they join your class."],
  ["🧰", "Your own Tutor HQ", "Schedule, homework reviews, progress tools, badges and parent chat — all in one cheerful place."],
  ["💛", "Paid per lesson", "A clear per-lesson rate agreed at your interview, tracked automatically as you teach."],
];

export default function BecomeATutorPage() {
  return (
    <main className="min-h-screen bg-cream dotted-paper">
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-10 flex items-center justify-between">
          <Logo size="sm" />
          <Chip tone="lilac">🧑‍🏫 Join the team</Chip>
        </div>

        <div className="relative text-center">
          <RainbowArc size={150} className="mx-auto" />
          <PencilPal size={70} mood="excited" className="absolute left-1/2 top-8 -translate-x-1/2 animate-bounce-soft" />
          <h1 className="mt-6 font-display font-bold text-4xl sm:text-5xl">
            Teach with <span className="text-rainbow">Lewis Tutoring</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            We&apos;re looking for patient, playful tutors who love watching kids grow. Apply in
            two minutes — we read every application and book interviews for the ones that fit.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {PERKS.map(([emoji, title, text]) => (
            <div key={title} className="card-pop p-5">
              <p className="text-2xl">{emoji}</p>
              <p className="mt-1 font-display font-bold">{title}</p>
              <p className="mt-1 text-sm text-ink-soft">{text}</p>
            </div>
          ))}
        </div>

        <div className="relative mx-auto mt-12 max-w-xl">
          <Sparkle size={22} className="absolute -top-3 -right-3 animate-twinkle" />
          <TutorApplyForm />
        </div>
      </div>
    </main>
  );
}
