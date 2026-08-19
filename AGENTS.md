# AGENTS.md — Dr Iliana Valiullina website

Durable project facts and rules for agents and maintainers. Public repository; never put secrets, credentials, temporary task status, or private personal data here.

## Site purpose & commercial goal

- Cloudflare Workers + static assets site for Dr Iliana Valiullina (international law scholar and language teacher).
- Primary commercial goal: paying online students.
- Homepage leads with **Legal English** and **Russian for Lawyers**.
- Secondary offers: language lessons, intensive programmes, Russian-law courses, academic coaching.
- Academic credibility is visible on the homepage; the long CV and research detail live at `/academic/`.
- Main conversion action: free 15-minute consultation at `/lessons/` (Cal.com embed + fallback).

## Key routes (English)

- `/` — commercial homepage (Legal English & Russian for Lawyers first)
- `/lessons/` — booking page (Cal.com free 15-min consultation calendar only; paid events from `/language-lessons/`)
- `/language-lessons/` — full public USD price list and lesson descriptions
- `/online-intensive-programmes/` — intensive programmes
- `/online-courses-russian-law/` — Russian-law courses
- `/academic-coaching/` — academic coaching
- `/academic/` — academic profile, research, publications, past teaching
- `/privacy/`, `/cookies/`, `/terms/` — legal pages
- Localised home and key pages under `/ar/`, `/zh/`, `/fr/`, `/ru/`, `/es/`

## Pricing (verified, do not invent or alter without instruction)

Current 60-minute lesson prices (USD):

- Legal English: $120
- Academic English: $90
- Professional language: $90
- Academic coaching: $150
- General Russian: $60
- Russian for Business: $90
- Russian for Lawyers: $120
- Russian Legal Terminology: $150

Preserve existing package prices and published programme “from” prices exactly as published on the site. Do not invent testimonials, clients, reviews, student counts, outcomes, credentials, or prices.

## Content & claims rules

- CEUB (Brasília University Centre) appointment ended June 2026; describe only as completed / past (e.g. “recently completed … June 2025–June 2026”). Never present as current.
- Legal-language lessons are **education**, not legal advice. The Terms already state this; keep any additional wording consistent.
- Show `contact@drilianavaliullina.com` plainly on key pages.
- Do not upload personal CV PDFs.
- Do not add Meta Pixel, Google Analytics, or other tracking without explicit approval **and** the necessary consent / privacy work.
- Keep consultation, prices, and CTAs consistent across money pages. All primary “Book a free 15-minute consultation” CTAs should point to `/lessons/`.

## Technical constraints

- Stack: static HTML in `public/`, Tailwind CSS (`src/input.css` → `public/css/site.css`), Cloudflare Worker (`worker.js`) for contact form (Resend) and Telegram webhook, Assets binding.
- `wrangler.toml` assets `not_found_handling` must serve the real `404.html` (use `"404-page"`, not SPA fallback).
- Build: `npm run build` regenerates CSS. GitHub Action on `main` rebuilds and commits CSS if needed.
- Never push directly to `main`. Work on a branch and open a pull request.
- Do not change DNS, domain settings, ads, email, or external accounts.
- Run available tests / build / link-check scripts (`scripts/fix-booking-ctas.js`, `scripts/audit-localized-homepages.js`, etc.) before proposing changes.
- For visible changes, capture before/after screenshots where practical.

## Agent behaviour

- Prefer small, justified, safe fixes over redesigns. Keep the current visual language.
- Ask before any major redesign, new tracking, new price, or new factual claim.
- Never invent social proof or credentials.
- When in doubt about a fact, check the live site or existing copy; do not invent.
