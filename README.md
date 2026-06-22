# Caravan 🐪

A warm, mobile-first travel companion for a trip you take together — itinerary,
real-time weather for each day's exact spot, full flight details, a live
dual-timezone clock, and shared notes (public for family following along,
private for the group).

Built as a platform: the **engine** (logic + components) is generic, and each
**trip lives in config** (`data/itinerary.ts`). First trip: **Our European
Vacation** — Brendan & Sha'Meaka, June 23 – July 5, 2026 (Paris · Versailles ·
London · Amsterdam · Puglia).

> See [`PROJECT.md`](./PROJECT.md) for the product cornerstone / decision guide.

## Stack

- **Next.js (App Router)** + TypeScript, **Tailwind v4** with a custom design
  system (`app/globals.css`), **Playfair Display** + Inter.
- **Open-Meteo** for weather (free, keyless), 30-min ISR.
- **Upstash KV** (note text) + **Vercel Blob** (photos) for shared notes; a
  filesystem fallback (`.notes-dev/`, `public/uploads/`) runs locally with no
  provisioning.

## Run it

```bash
npm install
npm run dev -- -p 3100   # 3100 keeps clear of other local servers
```

Then open http://localhost:3100.

## Layout

- `data/itinerary.ts` — the one file per-trip config (days, coords, timezones,
  per-day `plan` + `kind` icons, country accents).
- `lib/` — `trip` (today/status, country grouping), `forecasts`, `useUnit`,
  `notes`, auth/groups.
- `components/` — `TripBoard` (overview), `DayView` + `DayTimeline`,
  `FeaturedStop`, `LiveClock`, `NotesSection` + `PhotoGrid`.
- `app/api/notes/` — public/private notes, passcode unlock, photo upload.

## Deploy

Personal Vercel (`brendan-dudleys-projects`):

```bash
vercel deploy --prod --yes --scope brendan-dudleys-projects
```

`our-european-vacation.vercel.app` (this trip) and `our-vacation.vercel.app`
(generic base) are auto-following production domains — no alias step.
