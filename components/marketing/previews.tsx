"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { CrownPal, HeartPal, StarPal } from "@/components/brand/mascots";
import { Chip, RainbowProgress, SectionHeading } from "@/components/ui";

/* ---------- shared browser frame ---------- */

function BrowserFrame({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-navy/90 bg-paper shadow-[6px_8px_0_0_rgba(31,58,95,0.85)]">
      <div className="flex items-center gap-2 border-b-2 border-navy/90 bg-pastel-yellow px-3 py-2">
        <span className="size-2.5 rounded-full bg-coral" />
        <span className="size-2.5 rounded-full bg-sunshine" />
        <span className="size-2.5 rounded-full bg-grass" />
        <span className="ml-2 flex-1 truncate rounded-full bg-paper px-3 py-0.5 text-[10px] font-bold text-ink-soft">
          {url}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ---------- mini dashboards (hand-made "screenshots") ---------- */

function MiniKid() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <StarPal size={34} mood="excited" />
        <div>
          <p className="font-display font-bold text-sm leading-tight">Hi Zoë! ⭐</p>
          <p className="text-[10px] text-ink-soft">Maths lesson in 2 days!</p>
        </div>
        <Chip tone="sunshine" className="ml-auto">🔥 5-week streak</Chip>
      </div>
      <div className="card-sticker p-2.5">
        <p className="text-[10px] font-bold text-ink-soft mb-1">TODAY&apos;S MISSION</p>
        <p className="text-xs font-bold">Fractions worksheet 🍕</p>
        <RainbowProgress value={66} className="mt-2 h-2.5" />
      </div>
      <div className="flex gap-2">
        {["🏅", "🚀", "📚", "🌈"].map((b, i) => (
          <span
            key={i}
            className={`flex size-9 items-center justify-center rounded-xl border-2 border-navy text-base ${
              ["bg-pastel-pink", "bg-pastel-yellow", "bg-pastel-green", "bg-pastel-blue"][i]
            }`}
          >
            {b}
          </span>
        ))}
        <span className="self-center text-[10px] font-bold text-ink-soft">4 badges!</span>
      </div>
    </div>
  );
}

function MiniParent() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HeartPal size={30} />
        <p className="font-display font-bold text-sm">Zoë&apos;s progress</p>
        <Chip tone="grass" className="ml-auto">Attendance 96%</Chip>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Avg mark", "78%", "bg-pastel-green"],
          ["Homework", "9/10", "bg-pastel-blue"],
          ["Next lesson", "Tue 15:00", "bg-pastel-pink"],
        ].map(([k, v, bg]) => (
          <div key={k} className={`rounded-xl ${bg} px-1.5 py-2`}>
            <p className="text-[9px] font-bold text-ink-soft">{k}</p>
            <p className="font-display font-bold text-xs">{v}</p>
          </div>
        ))}
      </div>
      {/* tiny bar chart */}
      <div className="flex h-14 items-end gap-1.5 rounded-xl bg-cream p-2">
        {[45, 58, 52, 66, 72, 78].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-sky"
            style={{ height: `${h}%`, opacity: 0.55 + i * 0.075 }}
          />
        ))}
      </div>
      <p className="text-[10px] text-ink-soft text-center font-bold">Term marks — up 33% since March 📈</p>
    </div>
  );
}

function MiniTimeline() {
  const events = [
    ["🎯", "Goals set with mom & dad", "coral"],
    ["🏅", "Times-tables badge earned", "sunshine"],
    ["📝", "Test: 82% — personal best!", "grass"],
    ["💬", "“Zoë's confidence is blooming”", "sky"],
  ] as const;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CrownPal size={30} />
        <p className="font-display font-bold text-sm">Zoë&apos;s learning journey</p>
      </div>
      <div className="relative space-y-2.5 pl-4">
        <span className="absolute left-1 top-1 bottom-1 w-1 rounded-full bg-rainbow" />
        {events.map(([icon, text, tone], i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <p className="text-[11px] font-bold text-navy/90">{text}</p>
            <span
              className="ml-auto size-2 rounded-full"
              style={{ background: `var(--color-${tone})` }}
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-ink-soft font-bold text-center">
        Every win, recorded — from first assessment to final certificate.
      </p>
    </div>
  );
}

/* ---------- the tilted showcase ---------- */

const CARDS = [
  {
    url: "lewistutoring.co.za/kids",
    label: "The kids' space",
    sub: "Badges, streaks & missions that make practice feel like play.",
    body: <MiniKid />,
    tilt: 10,
    float: [-10, 30] as [number, number],
  },
  {
    url: "lewistutoring.co.za/parents",
    label: "The parents' view",
    sub: "Attendance, marks and progress — confidence at a glance.",
    body: <MiniParent />,
    tilt: 0,
    float: [20, -30] as [number, number],
  },
  {
    url: "lewistutoring.co.za/journey",
    label: "The journey timeline",
    sub: "A living record of every milestone on the way up.",
    body: <MiniTimeline />,
    tilt: -10,
    float: [-16, 24] as [number, number],
  },
];

export function Previews() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section id="peek" ref={ref} className="relative mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="PEEK INSIDE"
        title={
          <>
            A whole little world, <span className="text-rainbow">ready to explore</span>
          </>
        }
        sub="Kids get their own playful space. Parents get clarity. Everyone gets to watch confidence grow."
      />
      <div className="grid gap-10 md:grid-cols-3 md:gap-6" style={{ perspective: "1400px" }}>
        {CARDS.map((c, i) => (
          <PreviewCard key={i} card={c} index={i} progress={scrollYProgress} reduce={!!reduce} />
        ))}
      </div>
    </section>
  );
}

function PreviewCard({
  card,
  index,
  progress,
  reduce,
}: {
  card: (typeof CARDS)[number];
  index: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const y = useTransform(progress, [0, 1], reduce ? [0, 0] : card.float);
  return (
    <motion.div
      style={{ y, rotateY: reduce ? 0 : card.tilt, transformStyle: "preserve-3d" }}
      whileHover={reduce ? undefined : { rotateY: 0, scale: 1.04, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={index === 1 ? "md:-mt-6" : "md:mt-6"}
    >
      <BrowserFrame url={card.url}>{card.body}</BrowserFrame>
      <div className="mt-4 text-center">
        <p className="font-display font-bold text-lg">{card.label}</p>
        <p className="text-sm text-ink-soft">{card.sub}</p>
      </div>
    </motion.div>
  );
}
