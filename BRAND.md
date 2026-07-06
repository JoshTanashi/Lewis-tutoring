# Lewis Tutoring — Brand System

> **Building confident learners, one lesson at a time.**

This file documents how the official brand board translates into code.
A living, visual version lives at [`/brand`](http://localhost:3000/brand).

## Colour palette

| Token | Hex | Use |
| --- | --- | --- |
| `navy` | `#1F3A5F` | Ink: headings, body text, logo "TUTORING" |
| `night` | `#142440` | Hero night-sky backgrounds |
| `coral` | `#FF6F7D` | Primary CTAs, hearts, "Le" in the wordmark |
| `sunshine` | `#FFC857` | Highlights, stars, secondary CTAs |
| `grass` | `#7BC96F` | Success, achievement |
| `sky` | `#6DB7FF` | Links, info, focus rings |
| `lilac` | `#A78BFA` | Admin accents, "s" in the wordmark |
| `cream` | `#FFF8F0` | Page background |
| `pastel-blue/pink/yellow/green/purple` | tints | Alternating section backgrounds, chips |

All colours are CSS variables in `app/globals.css` (`@theme`) — change them there and the
whole site follows.

## Typography

- **Display / headings:** [Baloo 2](https://fonts.google.com/specimen/Baloo+2) — chunky,
  rounded, matches the logo letterforms.
- **Body:** [Nunito](https://fonts.google.com/specimen/Nunito) — friendly and highly legible.

Loaded via `next/font` in `app/layout.tsx`, exposed as `font-display` / `font-sans`.

## Logo

Recreated as pure SVG in `components/brand/logo.tsx`:

- `<LogoMark />` — rainbow arc "C" wrapping a navy **L**, with sunshine + sky sparkles.
- `<Logo />` — full lockup with rainbow "Lewis" + navy "TUTORING". `onNight` prop for dark
  backgrounds.
- Favicon: `public/favicon.svg` (same mark, hard-coded hexes).

## Mascots (`components/brand/mascots.tsx`)

One buddy per portal, noom-style blobs with dot eyes, a smile, and coral blush:

| Mascot | Component | Home |
| --- | --- | --- |
| ⭐ Twinkle the star | `StarPal` | Student portal |
| ❤️ Bubbles the heart | `HeartPal` | Parent portal |
| ✏️ Scribbles the pencil | `PencilPal` | Tutor portal |
| 👑 Reggie the crown | `CrownPal` | Super-admin portal |

Plus decorations: `BlobPal`, `CloudPal`, `Sparkle`, `RainbowArc`, `SquiggleArrow`.
All accept `size`, `className`, and a `mood` (`happy | excited | sleepy`).

## Voice & motifs

- Warm, encouraging, a little playful. Rainbows, sparkles and stars everywhere it helps —
  never where it distracts from data.
- Value props (from the board): **Personalised Learning · Confidence Building ·
  Homework Support · Exam Preparation · Online & In-Person**.
- Sticker-style cards (`card-sticker`) are reserved for the kids' space; soft-shadow cards
  (`card-pop`) everywhere else.
- Buttons squash when pressed (`squash` utility). Progress bars are rainbows
  (`RainbowProgress`).

## Icons

The 24 brand icons live in `public/icons/*.webp` (optimised from `/icons` source PNGs via
`node scripts/optimize-icons.mjs`). Use them at 20–48px in portal navigation and cards.
