import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { RainbowArc, Sparkle } from "@/components/brand/mascots";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cream px-5 py-12 dotted-paper">
      <RainbowArc size={220} className="pointer-events-none absolute -top-10 -left-16 opacity-40 -rotate-12" />
      <RainbowArc size={180} className="pointer-events-none absolute -bottom-8 -right-10 rotate-160 opacity-30" />
      <Sparkle size={22} className="absolute top-[18%] right-[16%] animate-twinkle" />
      <Sparkle size={16} color="var(--color-lilac)" className="absolute bottom-[22%] left-[12%] animate-twinkle" />

      <div className="mb-8">
        <Logo size="md" />
      </div>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-ink-soft">
        <Link href="/" className="underline underline-offset-2 hover:text-navy">
          ← Back to the homepage
        </Link>
      </p>
    </main>
  );
}
