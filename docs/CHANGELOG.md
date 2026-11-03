# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/) (`package.json` version).

## [Unreleased]

Work in progress on the `liquid-glass` branch.

### Added
- Global `.liquid_glass` and `.liquid_glass_btn` glassmorphism utility classes (`globals.css`), applied to header icon buttons, hero CTAs, project actions, and the resume button.
- Firebase card in the home Tech Stack section.
- `ThreeDotsHorizontal` icon for the header menu trigger.

### Changed
- Experience section: Forty Degrees Celsius roles listed as AI Engineer, iOS Developer, Web Developer.

### Fixed
- Karla now actually renders: the `next/font` variable is renamed to `--font-karla` and used in `globals.css` (it was bound to an unused `--font-geist-sans`, while CSS asked for the literal family name `"Karla"`).
- `/projects` had the Tech Stack title and description; it now has its own metadata and canonical URL.
- Share images: the missing `og-home.png` / `og-contact.png` references are replaced by generated `opengraph-image` routes. `metadataBase` is added so image URLs are absolute.
- `zod` and `zod-to-json-schema` are now declared in `package.json` instead of relying on transitive installs.

### Documentation
- Added `AGENTS.md`, `CLAUDE.md`, `.env.example`, and `docs/` (`PROJECT_OVERVIEW.md`, `DESIGN_SYSTEM.md`, `CONTRIBUTING.md`, `CHANGELOG.md`); rewrote `README.md`.

## [0.1.0] — Baseline

Baseline of the portfolio as of 2026-11-03 (`main` @ `ed6081e`).

### Pages
- **Home** — hero (name, role, location, Schedule a Call / Send Email, avatar with online indicator), About, Tech Stack, Experience timeline, featured project (Gordon Bostic), Connect, Recent Blog posts.
- **Blog** — category filter (All / technology / study / life / future) and date sort; skeleton, empty, and error states.
- **Blog detail** — Markdown rendering, author/date/reading time, tags, share buttons, view counter.
- **Contact** — inquiry type cards, budget cards (freelance), validated form sent by email.
- **Projects** and **Tech Stack** — intro + "being updated" placeholders.
- **404** page and `sitemap.xml`.

### Features
- Light/dark theme with no-flash inline script and persisted preference.
- Once-per-day welcome overlay; spinner preloader on later visits.
- Scroll-triggered staggered entrance animations (`useAnimateIn`).
- Floating "Chat with John" AI assistant (Gemini 2.5 Flash) with cookie-stored history and Markdown/code rendering.
- AI blog pipeline: monthly Vercel Cron → Gemini → Supabase `ai_blogs`, with category balancing.
- Contact form → Nodemailer/Gmail SMTP with HTML template and input sanitization.
- Resume download with toast feedback (`sileo`); one-click email copy.
- Per-page SEO metadata, Open Graph and Twitter cards.

### Layout
- Single 970px content column; four home rows (`first`–`fourth`) of 12px-radius cards.
- One responsive breakpoint at 850px.
