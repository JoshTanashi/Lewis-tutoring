"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CloudPal, Sparkle, StarPal } from "@/components/brand/mascots";
import { Button, ButtonLink } from "@/components/ui";

const STARS = [
  { top: "12%", left: "8%", size: 14, delay: "0s" },
  { top: "22%", left: "28%", size: 9, delay: "0.7s" },
  { top: "9%", left: "55%", size: 12, delay: "1.4s" },
  { top: "18%", left: "82%", size: 15, delay: "0.4s" },
  { top: "38%", left: "12%", size: 10, delay: "1.1s" },
  { top: "42%", left: "90%", size: 9, delay: "1.8s" },
  { top: "55%", left: "5%", size: 12, delay: "0.2s" },
  { top: "60%", left: "78%", size: 13, delay: "0.9s" },
];

export default function NotFound() {
  return (
    <main className="relative flex flex-1 min-h-screen flex-col items-center justify-center overflow-hidden bg-night px-6 py-16 text-center">
      {STARS.map((s, i) => (
        <Sparkle
          key={i}
          size={s.size}
          color="#FFC857"
          className="absolute animate-twinkle"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
      <CloudPal size={90} mood="sleepy" className="absolute top-16 right-[12%] animate-float-slow opacity-80" />
      <CloudPal size={64} mood="happy" className="absolute bottom-24 left-[10%] animate-float opacity-70" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl">
        <Logo size="md" onNight href="/" />

        <div className="relative mt-4">
          <h1 className="font-display font-bold text-white leading-none text-[7rem] sm:text-[9rem]">
            4<span className="text-rainbow">0</span>4
          </h1>
          <StarPal
            size={74}
            mood="excited"
            className="absolute -right-10 -top-6 rotate-12 animate-float"
          />
        </div>

        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
          Oops! This page floated off into the stars.
        </h2>
        <p className="text-white/75 text-base leading-relaxed">
          Don&apos;t worry — it happens to the best of us! This usually means the link was
          mistyped, the page has moved to a new home, or your session took a little nap while
          you were away.
        </p>

        <div className="card-pop w-full p-5 text-left text-sm text-navy">
          <p className="font-display font-bold mb-2">Here&apos;s what you can try:</p>
          <ul className="space-y-1.5 list-none">
            <li>🔄 <strong>Refresh the page</strong> — sometimes it just needs a second try.</li>
            <li>🚪 <strong>Go out and come back in</strong> — head home, then find your way back.</li>
            <li>🔗 <strong>Check the address</strong> — a tiny typo can send you to the stars.</li>
            <li>💤 <strong>Signed in a while ago?</strong> Your session may have expired — log in again.</li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="sunshine" size="lg" onClick={() => window.location.reload()}>
            🔄 Refresh the page
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            🏠 Take me home
          </ButtonLink>
        </div>

        <p className="text-white/50 text-xs">
          Still stuck?{" "}
          <Link href="/#contact" className="underline decoration-sunshine underline-offset-2 hover:text-white">
            Send us a message
          </Link>{" "}
          and we&apos;ll come rescue you. 🌈
        </p>
      </div>
    </main>
  );
}
