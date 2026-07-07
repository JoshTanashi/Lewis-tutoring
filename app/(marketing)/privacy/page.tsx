import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Privacy Policy" };

/* NOTE for Joshua: plain-language POPIA-minded draft — have it reviewed before
   marketing to the public. */

const SECTIONS: Array<[string, string]> = [
  [
    "What we collect",
    "Parent contact details (name, email, phone), each child's first name, grade, subjects, goals and optional notes you choose to share (like learning style or health notes that help us tutor safely), lesson history, homework, marks and payment records.",
  ],
  [
    "Why we collect it",
    "Only to run your lessons: scheduling, teaching, tracking progress, invoicing and keeping you informed. Optional details exist purely so lessons fit your child better — skip them freely.",
  ],
  [
    "Who can see what",
    "You see your own family only. Your child's login shows only their lessons and rewards — never payments or contact details. Miss Lewis (and the site administrator) see the data needed to teach and run the business. Access is enforced by role-based security at the database level, and sensitive records keep an audit trail.",
  ],
  [
    "Payments",
    "Payments are handled by PayFast; your card details never touch our servers. We keep the payment confirmations PayFast sends us as a permanent, unedited record so your billing history is always accurate.",
  ],
  [
    "Where your data lives",
    "In a secured Supabase (PostgreSQL) database hosted in the EU (Ireland region), encrypted in transit. We don't sell, rent or share your data with anyone — ever.",
  ],
  [
    "Your choices",
    "Ask any time to see, correct or delete your family's information, or to close your account — email us and it's done. If your child stops tutoring, we'll keep invoices (the law asks us to) and delete the rest on request.",
  ],
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Logo size="sm" />
      <h1 className="mt-8 font-display font-bold text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Your family&apos;s trust matters more than anything. Last updated 7 July 2026.
      </p>
      <div className="mt-8 space-y-6">
        {SECTIONS.map(([h, body]) => (
          <section key={h} className="card-pop p-5">
            <h2 className="font-display font-bold text-lg">{h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink-soft">
        See also our <Link href="/terms" className="font-bold text-sky-deep underline">Terms of Service</Link>.
      </p>
    </main>
  );
}
