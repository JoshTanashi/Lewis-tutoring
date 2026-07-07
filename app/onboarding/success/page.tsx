"use client";

import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { StarPal } from "@/components/brand/mascots";
import { ButtonLink, Card } from "@/components/ui";

const BRAND_COLORS = ["#FF6F7D", "#FFC857", "#7BC96F", "#6DB7FF", "#A78BFA"];

export default function PaymentSuccessPage() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const end = Date.now() + 1200;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0 }, colors: BRAND_COLORS });
      confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1 }, colors: BRAND_COLORS });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream dotted-paper px-5">
      <Card className="max-w-md p-8 text-center">
        <StarPal size={84} mood="excited" className="mx-auto animate-bounce-soft" />
        <h1 className="mt-4 font-display font-bold text-3xl">Woohoo! You&apos;re in! 🎉</h1>
        <p className="mt-3 text-ink-soft">
          Payment received (or on its way — PayFast confirms in a moment). Your invoice is
          waiting in your parent portal, and Miss Lewis already can&apos;t wait for the first
          lesson.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <ButtonLink href="/parent" size="lg">
            Go to my parent portal →
          </ButtonLink>
          <Link href="/" className="text-sm text-ink-soft underline underline-offset-2">
            Back to the homepage
          </Link>
        </div>
      </Card>
    </main>
  );
}
