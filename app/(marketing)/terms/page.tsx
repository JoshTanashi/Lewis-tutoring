import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export const metadata = { title: "Terms of Service" };

/* NOTE for Joshua: this is a plain-language draft. Please have it looked over
   before taking real customers — especially cancellation & refund windows. */

const SECTIONS: Array<[string, string]> = [
  [
    "1. Who we are",
    "Lewis Tutoring provides one-on-one tutoring for school children — live online lessons — plus this website, where families book lessons, follow progress and pay invoices.",
  ],
  [
    "2. Bookings & cancellations",
    "Lessons are one hour unless agreed otherwise. Life happens! You may reschedule or cancel a lesson free of charge up to 24 hours before it starts. Lessons cancelled with less notice, or missed without notice, may be charged in full.",
  ],
  [
    "3. Monthly packages",
    "Monthly packages renew each month until you pause or cancel them (which you can do any time from your parent portal, or by simply telling us). Unused lessons roll over for one month. The sibling discount applies automatically to monthly packages for second and further children.",
  ],
  [
    "4. Payments",
    "All payments are processed securely by PayFast. We never see or store your card details. Every payment produces an invoice you can view and download in your parent portal. Prices are shown in South African Rand and include any applicable taxes.",
  ],
  [
    "5. Refunds",
    "If we cancel a lesson and can't offer a suitable replacement time, that lesson is refunded or credited — your choice. If something ever feels unfair, talk to us; we'd rather fix it than argue about it.",
  ],
  [
    "6. Your child's space",
    "Children get their own login with a username and PIN. It shows only their lessons, homework and rewards — no payment or contact information. Parents can see everything their child sees.",
  ],
  [
    "7. Behaviour & safety",
    "We keep lessons kind, patient and encouraging, and ask the same of learners and parents. For online lessons, a parent or guardian should be reachable at home during the session for younger children.",
  ],
  [
    "8. Changes to these terms",
    "If we change these terms we'll update this page and note the date below. Continuing to book lessons after a change means you accept the new terms.",
  ],
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Logo size="sm" />
      <h1 className="mt-8 font-display font-bold text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-soft">
        The not-so-fine print — written for humans. Last updated 7 July 2026.
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
        Questions? <Link href="/#contact" className="font-bold text-coral underline">Get in touch</Link> —
        we answer faster than homework gets &quot;lost&quot;. See also our{" "}
        <Link href="/privacy" className="font-bold text-sky-deep underline">Privacy Policy</Link>.
      </p>
    </main>
  );
}
