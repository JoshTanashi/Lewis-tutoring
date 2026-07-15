"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { CloudPal, HeartPal, Sparkle, StarPal } from "@/components/brand/mascots";
import { ButtonLink, Chip } from "@/components/ui";

const STARS = [
  { top: "14%", left: "6%", size: 13, delay: "0s" },
  { top: "24%", left: "16%", size: 8, delay: "1.2s" },
  { top: "10%", left: "30%", size: 10, delay: "0.5s" },
  { top: "18%", left: "48%", size: 8, delay: "1.8s" },
  { top: "8%", left: "63%", size: 12, delay: "0.9s" },
  { top: "20%", left: "78%", size: 9, delay: "0.3s" },
  { top: "12%", left: "91%", size: 14, delay: "1.5s" },
  { top: "38%", left: "8%", size: 9, delay: "2s" },
  { top: "44%", left: "90%", size: 11, delay: "0.7s" },
  { top: "52%", left: "20%", size: 8, delay: "1s" },
  { top: "56%", left: "72%", size: 9, delay: "1.6s" },
  { top: "34%", left: "38%", size: 7, delay: "0.2s" },
  { top: "30%", left: "60%", size: 8, delay: "2.2s" },
];

const RAINBOW = [
  "var(--color-coral)",
  "var(--color-sunshine)",
  "var(--color-grass)",
  "var(--color-sky)",
  "var(--color-lilac)",
];

/** The rainbow ribbon that spills from the night sky into the cream page. */
function RainbowSpill({ progress }: { progress: MotionValue<number> }) {
  return (
    <svg
      viewBox="0 0 1200 560"
      preserveAspectRatio="xMidYMax meet"
      className="pointer-events-none absolute -bottom-6 left-1/2 w-[1400px] max-w-none -translate-x-1/2"
      aria-hidden="true"
    >
      {RAINBOW.map((c, i) => (
        <motion.path
          key={i}
          d={`M -40 ${70 + i * 22}
             C 260 ${10 + i * 22}, 320 ${240 + i * 16}, 620 ${250 + i * 16}
             C 860 ${258 + i * 14}, 920 ${420 + i * 12}, 1240 ${430 + i * 12}`}
          fill="none"
          stroke={c}
          strokeWidth={17}
          strokeLinecap="round"
          style={{ pathLength: progress }}
        />
      ))}
    </svg>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const cloudY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const starsY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.25]);
  const spill = useTransform(scrollYProgress, [0, 0.45], [reduce ? 1 : 0.25, 1]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-night pb-40 pt-28 sm:pt-32">
      {/* twinkling stars */}
      <motion.div style={{ y: starsY }} className="absolute inset-0">
        {STARS.map((s, i) => (
          <Sparkle
            key={i}
            size={s.size}
            color={i % 3 === 0 ? "#FFC857" : i % 3 === 1 ? "#ffffff" : "#6DB7FF"}
            className="absolute animate-twinkle"
            style={{ top: s.top, left: s.left, animationDelay: s.delay }}
          />
        ))}
      </motion.div>

      {/* drifting clouds */}
      <motion.div style={{ y: cloudY }} className="absolute inset-0">
        <CloudPal size={92} mood="sleepy" className="absolute left-[4%] top-[30%] animate-float-slow opacity-70" />
        <CloudPal size={64} className="absolute right-[6%] top-[16%] animate-float opacity-80" />
      </motion.div>

      <motion.div style={{ opacity: heroFade }} className="relative z-10 mx-auto max-w-4xl px-5 text-center">
        <p className="font-display font-bold tracking-[0.3em] text-xs sm:text-sm text-sunshine mb-5">
          FRESH LEARNING MADE WITH ❤️
        </p>

        <h1 className="font-display font-bold text-white leading-[0.95] text-5xl sm:text-7xl lg:text-8xl">
          WHERE LEARNING
          <br />
          MEETS <span className="text-rainbow">CONFIDENCE</span>
        </h1>

        <div className="relative mx-auto mt-6 max-w-xl">
          <StarPal size={64} mood="excited" className="absolute -left-20 -top-10 hidden rotate-[-10deg] animate-float sm:block" />
          <HeartPal size={56} className="absolute -right-16 -bottom-8 hidden rotate-6 animate-float-slow sm:block" />
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Building confident learners, one lesson at a time. Personalised tutoring for kids of
            all ages — grade&nbsp;1 prep, homework help and exam prep that&apos;s equal parts
            serious and seriously fun.
          </p>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/signup" variant="sunshine" size="lg">
            Book your first lesson · R150 🎉
          </ButtonLink>
          <ButtonLink
            href="#peek"
            size="lg"
            className="bg-white/10 text-white border-2 border-white/40 hover:bg-white/20 backdrop-blur-sm"
            variant="ghost"
          >
            Peek inside 👀
          </ButtonLink>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Chip tone="coral">♥ Personalised Learning</Chip>
          <Chip tone="sunshine">★ Confidence Building</Chip>
          <Chip tone="grass">📖 Homework Support</Chip>
          <Chip tone="sky">✏️ Exam Preparation</Chip>
          <Chip tone="lilac">💻 Live Online Lessons</Chip>
        </div>
      </motion.div>

      {/* rainbow spilling toward the cream page below */}
      <RainbowSpill progress={spill} />

      {/* wavy edge into the cream section, with buddies peeking over it */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="relative">
          <StarPal size={58} className="absolute -top-11 left-[14%] animate-float" />
          <HeartPal size={48} mood="excited" className="absolute -top-9 right-[18%] animate-float-slow" />
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block h-[70px] w-full" aria-hidden="true">
            <path
              d="M0 60 C 180 20 320 90 520 55 C 720 20 860 85 1080 50 C 1240 25 1360 55 1440 40 L 1440 90 L 0 90 Z"
              fill="var(--color-cream)"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
