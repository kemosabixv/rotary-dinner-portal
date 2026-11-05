# Foundation Dinner — Advertising Portal

Next.js app for the District 9215 Foundation Dinner business-partner portal: a public directory of
advertising businesses, the advertiser landing page, an OBS/broadcast overlay, and an admin area for
the dinner team to manage listings and media.

Scope decisions live in `..\Advertising Portal — Scope & Build Plan.md`.

## Stack

| Layer | What |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack) · React 19 · Tailwind CSS 4 |
| Hosting | Vercel (default URL for now, subdomain later) |
| Database | Supabase Postgres — project `rotary-dinner-portal` (`gbjihzhlmdudvjuchtzn`, eu-central-1) |
| Media | Supabase Storage, public bucket `business-media` |
| Auth | Supabase Auth, **email + password** sessions (no magic links), admin-only, no sign-up |
| Email | Resend — coupon delivery; without `RESEND_API_KEY` the code is shown on screen |
| Payments | Offline: M-Pesa Paybill + manual reconciliation; admin records `paidStatus` |

## Brand

Tokens come from the district's own Pledger app (`trfpledge.rotary9215.org`), which uses the official
D9215 + The Rotary Foundation lockup:

| Token | Value | Use |
|---|---|---|
| `--brand` | `#17458f` | Rotary blue — buttons, links, emphasis |
| `--brand-ink` | `#122b52` | Hover / deep navy |
| `--accent` | `#be8218` | Rotary gold — eyebrows, bullets, highlights |
| `--ink` | `#0b1b3a` | Body headings |
| `--paper` | `#f7f8fb` | Page background |
| `--line` | `#d5dced` | Borders |
| Fonts | **Archivo** (display) · **Public Sans** (body) | via `next/font` |

Assets: `public/brand/rotary-d9215-trf.png` (header lockup) and `src/app/icon.png` (wheel favicon).

## Email (coupon codes)

Polls can issue a discount code. If `RESEND_API_KEY` is set, the code is emailed to the respondent;
otherwise the portal shows it on screen and records `coupon_email_status = skipped`.

- `RESEND_API_KEY` — sending-only key, stored in `.env.local` (gitignored) and in the Vercel project.
- `RESEND_FROM` — defaults to `Rotary D9215 Dinner <onboarding@resend.dev>`. That sender only delivers
  to the Resend account owner's address; real recipients need a verified domain.
- Domain records for `rotary9215.org` are in `..\02_investigation\Resend_DNS_Records.md` — they go in
  Azure DNS, unproxied, and must not touch the apex SPF.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # fill from Supabase → Project Settings → API
pnpm dev                     # http://localhost:3000
```

`.env.local` is gitignored. Only two variables are needed:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page: hero, live carousel, how it works |
| `/advertise` | Package tiers (from `src/data/packages.json`), add-on, what we need from businesses |
| `/businesses` | Public directory, filterable by category |
| `/businesses/[slug]` | A single listing (only `status = 'live'` is publicly readable) |
| `/overlay` | Transparent-background carousel for OBS / vMix browser source |
| `/polls/[slug]` | Public poll/quiz — answers questions, returns a coupon code |
| `/sign-in` | Admin sign-in |
| `/admin` | Business list, create form, quick status/payment changes, password change |
| `/admin/[id]` | Edit listing + media upload |
| `/admin/[id]/polls` | Polls for one business: create, status, open |
| `/admin/polls/[pollId]` | Edit poll/questions, read responses, CSV export, delete |

## Admin & media flow

- Accounts are created **manually** in Supabase (Auth → Users) or via SQL. There is no sign-up form.
  To add an admin, create the user with a password and send it to them; they can change it at
  `/admin` → "Change my password".
- Businesses send their logo and photos by **WhatsApp or email**. An admin uploads them on the
  business's edit page (`/admin/[id]` → Media). Uploads go straight from the browser to Supabase
  Storage; paths are stored on the row (`logo_path`, `photo_paths`).
- Limits: images only, 5MB per file, up to 6 photos per business.

## Data model

`public.businesses` — one row per listing. Key columns: `slug` (unique), `status`
(`submitted`/`approved`/`live`/`expired`), `paid_status`, `package_tier`, `carousel_weight` (1–5),
`active_from`/`active_to`, `logo_path`, `photo_paths`, `is_sample`.

RLS:

- `anon` can select only `status = 'live'`.
- `authenticated` can do everything (the admin area).
- Storage `business-media`: public read; insert/update/delete only for `authenticated`.

`is_sample` marks the six placeholder businesses seeded at setup — replace them with real submissions
and set the flag to false (or delete them) before launch.

## Deploy

```bash
npx vercel            # preview
npx vercel --prod     # production
```

Set the two `NEXT_PUBLIC_*` variables in the Vercel project (they are baked into the client bundle at
build time). The subdomain (`trfdinner.rotary9215.org` or agreed name) is added later in Vercel →
Domains, then the CNAME/TXT is created in Azure DNS.

Note: Vercel **Hobby is non-commercial**; selling ad space makes this a commercial deployment, so plan
for Pro (~$20/mo) or the district/Certitude account before the subdomain points here.

## Not built yet

- No automated tests yet (everything has been verified manually in a browser)
- **Streaming / stage screen (`/overlay`) is on hold** — the route exists and works as a transparent
  browser source, but nothing depends on it until the event's AV setup is confirmed with Muthoni
- `cacheComponents` is disabled in `next.config.ts` (it conflicts with `export const dynamic`);
  revisit if we adopt PPR/Cache Components later
