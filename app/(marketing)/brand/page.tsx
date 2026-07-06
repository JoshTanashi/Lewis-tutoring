import type { Metadata } from "next";
import { Logo, LogoMark } from "@/components/brand/logo";
import {
  BlobPal,
  CloudPal,
  CrownPal,
  HeartPal,
  PencilPal,
  RainbowArc,
  Sparkle,
  SquiggleArrow,
  StarPal,
} from "@/components/brand/mascots";
import {
  Button,
  Card,
  Chip,
  Checkbox,
  Field,
  Input,
  RainbowProgress,
  SectionHeading,
} from "@/components/ui";

export const metadata: Metadata = { title: "Brand styleguide" };

const SWATCHES = [
  ["Navy", "var(--color-navy)", "#1F3A5F"],
  ["Coral", "var(--color-coral)", "#FF6F7D"],
  ["Sunshine", "var(--color-sunshine)", "#FFC857"],
  ["Grass", "var(--color-grass)", "#7BC96F"],
  ["Sky", "var(--color-sky)", "#6DB7FF"],
  ["Lilac", "var(--color-lilac)", "#A78BFA"],
  ["Cream", "var(--color-cream)", "#FFF8F0"],
] as const;

export default function BrandPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 space-y-14">
      <div>
        <Logo size="lg" href={null} />
        <p className="mt-3 text-ink-soft">
          Living styleguide — everything here comes straight from the design tokens, so it
          always matches the real site.
        </p>
      </div>

      <section>
        <SectionHeading title="Colours" center={false} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SWATCHES.map(([name, v, hex]) => (
            <div key={name} className="card-pop overflow-hidden">
              <div className="h-20" style={{ background: v }} />
              <div className="p-3">
                <p className="font-display font-bold text-sm">{name}</p>
                <p className="text-xs text-ink-soft">{hex}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Logo" center={false} />
        <div className="flex flex-wrap items-center gap-10">
          <LogoMark size={90} />
          <Logo size="md" href={null} />
          <div className="rounded-3xl bg-night p-6">
            <Logo size="md" onNight href={null} />
          </div>
        </div>
      </section>

      <section>
        <SectionHeading title="Meet the crew" center={false} sub="One buddy per portal." />
        <div className="flex flex-wrap items-end gap-8">
          {[
            [<StarPal key="s" size={84} />, "Twinkle · students"],
            [<HeartPal key="h" size={84} />, "Bubbles · parents"],
            [<PencilPal key="p" size={84} />, "Scribbles · tutor"],
            [<CrownPal key="c" size={84} />, "Reggie · admin"],
            [<BlobPal key="b" size={84} color="var(--color-grass)" mood="excited" />, "Blob"],
            [<CloudPal key="cl" size={84} mood="sleepy" />, "Puff"],
          ].map(([m, label], i) => (
            <figure key={i} className="flex flex-col items-center gap-2">
              {m}
              <figcaption className="text-xs font-bold text-ink-soft">{label}</figcaption>
            </figure>
          ))}
          <RainbowArc size={120} />
          <Sparkle size={30} />
          <SquiggleArrow size={70} />
        </div>
      </section>

      <section>
        <SectionHeading title="Components" center={false} />
        <div className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button>Book a lesson</Button>
            <Button variant="sunshine">Let&apos;s go!</Button>
            <Button variant="navy">Sign in</Button>
            <Button variant="outline">Learn more</Button>
            <Button variant="ghost">Skip</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="coral">♥ Personalised</Chip>
            <Chip tone="sunshine">★ Confidence</Chip>
            <Chip tone="grass">📖 Homework</Chip>
            <Chip tone="sky">✏ Exam prep</Chip>
            <Chip tone="lilac">🌈 Online &amp; in-person</Chip>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <p className="font-display font-bold mb-1">Soft card</p>
              <p className="text-sm text-ink-soft">For grown-up dashboards.</p>
            </Card>
            <Card sticker className="p-5">
              <p className="font-display font-bold mb-1">Sticker card</p>
              <p className="text-sm text-ink-soft">For the kids&apos; space.</p>
            </Card>
          </div>
          <div className="max-w-sm space-y-4">
            <Field label="Your name" hint="What should we call you?">
              <Input placeholder="e.g. Michaela" />
            </Field>
            <Checkbox label="I agree to have a wonderful lesson" defaultChecked />
            <RainbowProgress value={72} label="demo progress" />
          </div>
        </div>
      </section>
    </main>
  );
}
