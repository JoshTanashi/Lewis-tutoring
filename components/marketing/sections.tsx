import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  BlobPal,
  HeartPal,
  PencilPal,
  RainbowArc,
  Sparkle,
  SquiggleArrow,
  StarPal,
} from "@/components/brand/mascots";
import { ButtonLink, Card, Chip, SectionHeading } from "@/components/ui";
import { INTRO_LESSON_ZAR, PACKAGES, SIBLING_DISCOUNT_PCT, formatZar } from "@/lib/pricing";
import { Reveal, RevealItem, RevealStagger } from "./reveal";
import { WaitlistForm } from "./waitlist-form";

/* ------------------------------ marquee ------------------------------ */

const MARQUEE_ITEMS = [
  "♥ Personalised Learning",
  "★ Confidence Building",
  "📖 Homework Support",
  "✏️ Exam Preparation",
  "💻 Live online lessons",
  "🎓 Grade 1 Prep",
  "🧮 Maths made friendly",
  "📚 Reading adventures",
];

export function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden border-y-2 border-navy bg-sunshine py-3">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-8 will-change-transform">
        {row.map((item, i) => (
          <span key={i} className="font-display font-bold text-navy whitespace-nowrap text-sm sm:text-base">
            {item}
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

/* ------------------------------ about ------------------------------ */

export function About() {
  return (
    <section id="about" className="bg-pastel-blue py-24">
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 md:grid-cols-2">
        <Reveal>
          <div className="relative mx-auto w-fit">
            <div className="card-sticker flex size-64 items-center justify-center rounded-[3rem] bg-pastel-pink sm:size-80">
              {/* TODO: replace with a real photo of Miss Lewis */}
              <HeartPal size={150} mood="excited" />
            </div>
            <RainbowArc size={110} className="absolute -top-10 -left-8 -rotate-12" />
            <Sparkle size={26} className="absolute -right-4 top-8 animate-twinkle" />
            <Chip tone="sunshine" className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap border-2 border-navy py-1.5">
              ⭐ Your tutor &amp; biggest fan
            </Chip>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <SectionHeading
            center={false}
            eyebrow="MEET MISS LEWIS"
            title={
              <>
                The tutor kids ask to <span className="text-rainbow">come back to</span>
              </>
            }
          />
          <div className="space-y-4 text-ink-soft leading-relaxed -mt-4">
            <p>
              Hi! I&apos;m the Lewis behind Lewis Tutoring. I tutor children of all ages — from
              little ones getting ready for grade 1 to learners chasing their best exam marks —
              and I believe every child can love learning when it&apos;s built around{" "}
              <strong className="text-navy">them</strong>.
            </p>
            <p>
              Lessons with me are affordable, personal and full of encouragement. We set goals
              together, celebrate every win (there are badges!), and I keep mom and dad in the
              loop with real progress they can see.
            </p>
            {/* TODO: Joshua — drop in her real bio, years of experience & photo here */}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Chip tone="coral">All ages welcome</Chip>
            <Chip tone="grass">Grade 1 prep specialist</Chip>
            <Chip tone="sky">Affordable lessons (wink wink)</Chip>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ how it works ------------------------------ */

const STEPS = [
  {
    icon: "students",
    title: "Tell us about your child",
    text: "A quick, friendly sign-up — their grade, subjects and what they're dreaming of.",
    bg: "bg-pastel-pink",
  },
  {
    icon: "calender",
    title: "Pick a time that fits",
    text: "See the live calendar and grab a slot that suits your family's week.",
    bg: "bg-pastel-yellow",
  },
  {
    icon: "lessons",
    title: "Meet for a first lesson",
    text: `A get-to-know-you assessment lesson for just ${formatZar(INTRO_LESSON_ZAR)} — goals set together.`,
    bg: "bg-pastel-green",
  },
  {
    icon: "progress",
    title: "Watch confidence grow",
    text: "Progress reports, badges and a journey timeline you can follow every step.",
    bg: "bg-pastel-purple",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading
        eyebrow="FOR PARENTS"
        title="Getting started is the easy part"
        sub="From hello to first lesson in four little hops."
      />
      <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <RevealItem key={i} className="relative">
            <Card sticker className={`h-full p-6 ${s.bg}`}>
              <span className="font-display font-bold text-ink-soft/60 text-sm">
                STEP {i + 1}
              </span>
              <Image
                src={`/icons/${s.icon}.webp`}
                alt=""
                width={56}
                height={56}
                className="mt-2"
              />
              <h3 className="mt-3 font-display font-bold text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.text}</p>
            </Card>
            {i < STEPS.length - 1 && (
              <SquiggleArrow
                size={54}
                className="absolute -right-8 top-1/2 z-10 hidden -translate-y-1/2 -rotate-90 lg:block"
                color="var(--color-coral)"
              />
            )}
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  );
}

/* ------------------------------ pricing ------------------------------ */

export function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden bg-pastel-yellow py-24">
      <Sparkle size={22} className="absolute left-[8%] top-16 animate-twinkle" color="var(--color-coral)" />
      <Sparkle size={16} className="absolute right-[10%] top-28 animate-twinkle" color="var(--color-lilac)" />
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="SIMPLE PRICING"
          title={
            <>
              Big value, <span className="text-rainbow">little prices</span>
            </>
          }
          sub={`One-hour lessons. First assessment lesson only ${formatZar(INTRO_LESSON_ZAR)}, and siblings get ${SIBLING_DISCOUNT_PCT}% off. No surprises.`}
        />
        <RevealStagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
          {PACKAGES.map((p) => (
            <RevealItem key={p.slug} className="h-full">
              <Card
                className={`relative flex h-full flex-col p-6 ${
                  p.popular ? "border-2 border-coral shadow-[0_16px_40px_-16px_rgba(255,111,125,0.45)]" : ""
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-coral px-4 py-1 font-display text-xs font-bold text-white shadow-[0_4px_12px_-4px_rgba(255,111,125,0.8)]">
                    💛 Most loved
                  </span>
                )}
                <p className="text-3xl">{p.emoji}</p>
                <h3 className="mt-2 font-display font-bold text-xl">{p.name}</h3>
                <p className="mt-1 text-sm text-ink-soft min-h-10">{p.blurb}</p>
                <p className="mt-4 font-display font-bold text-4xl">
                  {formatZar(p.priceZar)}
                  <span className="text-base text-ink-soft font-sans font-bold">
                    {p.slug === "single" ? " / lesson" : " / month"}
                  </span>
                </p>
                <p className="mt-1 text-xs font-bold text-ink-soft">
                  {p.slug === "single"
                    ? "Pay as you go"
                    : `${p.lessonsPerMonth} lessons · ${formatZar(p.perLessonZar)} each`}
                </p>
                {p.saveZar > 0 && (
                  <Chip tone="grass" className="mt-2 w-fit">
                    Save {formatZar(p.saveZar)} 🎉
                  </Chip>
                )}
                <div className="grow" />
                <ButtonLink
                  href={`/signup?package=${p.slug}`}
                  variant={p.popular ? "primary" : "outline"}
                  className="mt-5 w-full"
                >
                  Choose {p.name}
                </ButtonLink>
              </Card>
            </RevealItem>
          ))}
        </RevealStagger>
        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-sm text-ink-soft">
            Monthly packages renew automatically and you can pause anytime — unused lessons roll
            over one month. Payments are securely handled by{" "}
            <strong className="text-navy">PayFast</strong> 🔒
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ coming soon ------------------------------ */

export function ComingSoon() {
  return (
    <section className="relative overflow-hidden bg-night py-24">
      <Sparkle size={16} className="absolute left-[12%] top-14 animate-twinkle" />
      <Sparkle size={12} className="absolute right-[18%] top-24 animate-twinkle" color="#6DB7FF" />
      <Sparkle size={20} className="absolute right-[8%] bottom-16 animate-twinkle" color="#ffffff" />
      <div className="mx-auto max-w-4xl px-5 text-center">
        <Chip tone="sunshine" className="border-2 border-sunshine mb-6">
          🎬 COMING SOON
        </Chip>
        <SectionHeading
          onNight
          title={
            <>
              Video lessons, <span className="text-rainbow">any time you like</span>
            </>
          }
          sub="A growing library of pre-made lessons to watch and re-watch at home — one friendly subscription for the whole family. We're busy filming!"
        />
        <div className="relative mx-auto max-w-md">
          <div className="card-pop flex items-center gap-3 p-4 bg-paper">
            <BlobPal size={52} color="var(--color-lilac)" mood="excited" />
            <div className="text-left">
              <p className="font-display font-bold text-navy">Be the first to know</p>
              <p className="text-xs text-ink-soft">Join the waitlist — no spam, just sparkles.</p>
            </div>
          </div>
          <div className="mt-4">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FAQ ------------------------------ */

const FAQS = [
  {
    q: "What ages and grades do you tutor?",
    a: "All ages of school kids — from grade 1 preparation for the littlest learners right through to older students needing homework support and exam preparation.",
  },
  {
    q: "How do online lessons work?",
    a: "All lessons are live one-on-one video lessons — your tutor sends the video link before each lesson, and older students can even sign themselves up and manage their own dashboard.",
  },
  {
    q: "How much does it cost?",
    a: `A one-hour lesson is ${formatZar(250)}, and monthly packages bring that down to as little as ${formatZar(195)} per lesson. Your very first assessment lesson is just ${formatZar(INTRO_LESSON_ZAR)}, and siblings get ${SIBLING_DISCOUNT_PCT}% off.`,
  },
  {
    q: "How do I know it's working?",
    a: "You'll have your own parent dashboard with attendance, marks, homework completion and a journey timeline of every milestone — plus regular progress reports from Miss Lewis.",
  },
  {
    q: "How do payments work?",
    a: "Securely through PayFast — South Africa's trusted payment gateway. You'll get a proper invoice for every payment, all visible in your parent portal.",
  },
  {
    q: "Can my child really have their own login?",
    a: "Yes! Kids get their own cheerful space with a simple username + PIN — homework, badges and streaks, with none of the grown-up stuff.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
      <SectionHeading eyebrow="QUESTIONS" title="Asked all the time" />
      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <details className="card-pop group px-5 py-4 open:bg-pastel-blue">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-bold text-navy">
                {f.q}
                <span className="text-coral transition-transform duration-300 group-open:rotate-45 text-xl leading-none">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ big CTA + footer ------------------------------ */

export function FooterCta() {
  return (
    <section id="contact" className="relative">
      <div className="mx-auto max-w-4xl px-5 pb-28 pt-8 text-center">
        <Reveal>
          <RainbowArc size={140} className="mx-auto" />
          <h2 className="font-display font-bold text-4xl sm:text-5xl -mt-4">
            Ready when <span className="text-rainbow">you</span> are!
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-soft">
            Book that first {formatZar(INTRO_LESSON_ZAR)} lesson, or just say hi — we love
            questions almost as much as we love gold stars.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/signup" size="lg">
              Book a lesson ✨
            </ButtonLink>
            {/* TODO: Joshua — real email & WhatsApp number */}
            <ButtonLink href="mailto:hello@lewistutoring.co.za" variant="outline" size="lg">
              Say hello 💌
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <footer className="relative bg-night pt-16 pb-8 text-white">
        {/* buddies peeking over the footer edge */}
        <StarPal size={62} className="absolute -top-12 left-[12%]" mood="excited" />
        <BlobPal size={54} color="var(--color-grass)" className="absolute -top-10 left-[45%]" />
        <PencilPal size={64} className="absolute -top-12 right-[15%]" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 md:flex-row md:items-start md:justify-between">
          <div className="text-center md:text-left">
            <Logo size="md" onNight href="/" />
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Building confident learners, one lesson at a time.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div className="space-y-2">
              <p className="font-display font-bold text-sunshine">Explore</p>
              {[
                ["About", "/#about"],
                ["Pricing", "/#pricing"],
                ["FAQ", "/#faq"],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="block text-white/70 hover:text-white">
                  {l}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-display font-bold text-sunshine">Families</p>
              {[
                ["Sign in", "/login"],
                ["Kids' login", "/kid-login"],
                ["Book a lesson", "/onboarding"],
                ["Become a tutor", "/become-a-tutor"],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="block text-white/70 hover:text-white">
                  {l}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-display font-bold text-sunshine">Boring bits</p>
              {[
                ["Terms of service", "/terms"],
                ["Privacy policy", "/privacy"],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="block text-white/70 hover:text-white">
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 px-5 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Lewis Tutoring · Made with ❤️ (and head scratches) by
          Joshua
        </div>
      </footer>
    </section>
  );
}
