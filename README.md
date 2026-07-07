# Lewis Tutoring 🌈

> **Building confident learners, one lesson at a time.**

A complete tutoring platform built with love — playful landing page, four
role-based portals (kids, parents, tutor, super admin), live booking calendar,
PayFast payments with auto-invoicing, homework, badges & streaks, and a
**Student Journey Timeline** that records every proud moment.

Made by Joshua for Miss Lewis as an anniversary gift. ❤️

## Stack

- **Next.js 16** (App Router, TypeScript) · **Tailwind CSS v4** · **motion** (animations) · **Recharts**
- **Supabase** — auth, Postgres with row-level security, edge functions
  (project `lewis-tutoring` / `uatzbulkyoyuntghqcno`, eu-west-1)
- **PayFast** — ZA payments (sandbox until you flip it live)
- Brand system: see [`BRAND.md`](./BRAND.md) and the living styleguide at `/brand`

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

`.env.local` values (already configured in this repo's local copy):

| Variable | What |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uatzbulkyoyuntghqcno.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key (Supabase dashboard → API) |
| `PAYFAST_MERCHANT_ID` / `PAYFAST_MERCHANT_KEY` / `PAYFAST_PASSPHRASE` | sandbox test values by default |
| `PAYFAST_MODE` | `sandbox` (switch to `live` with real credentials) |
| `NEXT_PUBLIC_SITE_URL` | the deployed URL (for PayFast return links) |

## Demo logins (safe to delete later)

| Who | Where | Credentials |
| --- | --- | --- |
| Parent | `/login` | `demo.parent@lewistutoring.co.za` / `DemoParent2026!` |
| Kid (Zoë) | `/kid-login` | secret name `super-zoe` / PIN `123456` |
| Tutor | `/login` | `miss.lewis@lewistutoring.co.za` / `MissLewis2026!` |

**Super admin:** sign up / sign in with `michaelajanepotgieter22@gmail.com`
(or `father8son951@gmail.com`) — those two emails are automatically granted
the `super_admin` role and land in Mission Control at `/admin`.

## The four portals

| Portal | Path | Highlights |
| --- | --- | --- |
| Kids' space | `/student` | missions, badge shelf, streaks, confidence meter, homework hand-in |
| Parent | `/parent` | per-child KPIs, marks chart, live booking, invoices (pay & print), kid-login creation, chat |
| Tutor HQ | `/tutor` | today's schedule, wrap-up + attendance, record tests/badges/notes, homework review, finance, availability editor, private love notes 💛 |
| Mission Control | `/admin` | business KPIs, revenue & subject charts, at-risk students, user roles, audit log, pricing editor, waitlist |

## Payments (PayFast)

- Checkout is a signed form POST; prices are computed **server-side only**.
- Every ITN webhook is stored raw in `payments` **before** processing, then
  validated (signature → server postback → amount-to-the-cent) before the
  invoice is marked paid. Invoices auto-number `LT-YYYY-NNNN`.
- **Go live:** set `PAYFAST_MODE=live` + your real merchant ID/key/passphrase
  in the app env **and** in the `payfast-itn` edge function secrets
  (Supabase dashboard → Edge Functions → payfast-itn → secrets).

## Data & security

Schema, RLS permission matrix and migration list: [`supabase/README.md`](./supabase/README.md).
The matrix is enforced in Postgres (verified by role-simulation tests) — the UI
is a convenience, the database is the guard.

## Still on Joshua's list 📝

- [ ] Replace the About-section placeholder bio/photo with Miss Lewis' real ones (`components/marketing/sections.tsx`, marked `TODO`)
- [ ] Real contact email / WhatsApp in the footer CTA (`TODO` markers)
- [ ] Have `/terms` and `/privacy` drafts reviewed before going live
- [ ] Live PayFast credentials when ready
- [ ] Phase 2: video lesson library + subscription (waitlist is already collecting!)
