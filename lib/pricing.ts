/** Lesson pricing & monthly packages. Mirrors the `packages` table in Supabase —
 *  the DB is the source of truth at runtime; this is the seed + marketing copy. */

export type Package = {
  slug: string;
  name: string;
  emoji: string;
  lessonsPerMonth: number;
  priceZar: number; // total per month, in rand
  perLessonZar: number;
  saveZar: number;
  blurb: string;
  popular?: boolean;
};

export const SINGLE_LESSON_ZAR = 250;
export const INTRO_LESSON_ZAR = 150;
export const SIBLING_DISCOUNT_PCT = 10;

export const PACKAGES: Package[] = [
  {
    slug: "single",
    name: "Single lesson",
    emoji: "🎈",
    lessonsPerMonth: 1,
    priceZar: 250,
    perLessonZar: 250,
    saveZar: 0,
    blurb: "One-hour lesson, book whenever you need a boost.",
  },
  {
    slug: "starter",
    name: "Starter",
    emoji: "🌱",
    lessonsPerMonth: 4,
    priceZar: 900,
    perLessonZar: 225,
    saveZar: 100,
    blurb: "Once a week — steady rhythm, visible progress.",
  },
  {
    slug: "momentum",
    name: "Momentum",
    emoji: "🚀",
    lessonsPerMonth: 8,
    priceZar: 1680,
    perLessonZar: 210,
    saveZar: 320,
    blurb: "Twice a week — our sweet spot for catching up and pulling ahead.",
    popular: true,
  },
  {
    slug: "champion",
    name: "Champion",
    emoji: "🏆",
    lessonsPerMonth: 12,
    priceZar: 2340,
    perLessonZar: 195,
    saveZar: 660,
    blurb: "Three times a week — exam season's best friend.",
  },
];

export function formatZar(amount: number): string {
  return `R${amount.toLocaleString("en-ZA").replace(/,/g, " ")}`;
}
