# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/) (`package.json` version).

## [Unreleased]

Work in progress on the `liquid-glass` branch.

### Added
- Global `.liquid_glass` and `.liquid_glass_btn` glassmorphism utility classes (`globals.css`), applied to header icon buttons, hero CTAs, project actions, and the resume button.
- Firebase card in the home Tech Stack section.
- `ThreeDotsHorizontal` icon for the header menu trigger.
- Daily `/api/cron/keep-alive` Vercel cron that runs a lightweight Supabase query so the free-tier project isn't paused for inactivity.
- Blog cron dry-run mode: `GET /api/cron/blog?dry=1` (with the cron secret) generates and returns a post without saving it.

### Changed
- Experience section: Forty Degrees Celsius roles listed as AI Engineer, iOS Developer, Web Developer.
- Experience section: AI Engineer duration updated to 11 months.
- Header menu button and "Chat with John" button share the `liquid_glass_btn` hover; the menu button stays highlighted while the menu is open (new `.liquid_glass.is-active` modifier).
- Blog generation instructions rewritten: Markdown with `##` subheadings, 450–650 words, no invented personal stories, employers or statistics, stricter cliché bans. Recent titles are passed to the prompt to avoid repeated topics.
- Blog generation retries up to 3 times, rejects cliché titles in code, computes reading time from word count, and only asks Gemini for the fields it writes.
- Faster blog navigation: in-memory client cache for blog API responses, CDN caching on the blog list APIs, view counting moved after the response (`after()`), no 500ms debounce on the first blog list load, a `loading.tsx` skeleton for blog articles, and prefetching for header menu routes and home blog cards.

### Fixed
- Header menu dropdown no longer zooms with the menu button on hover, and clicking a menu item no longer re-toggles the menu.
- Security: cron routes now reject requests when `CRON_SECRET` is unset (previously `Authorization: Bearer undefined` was accepted).
- Blog generation no longer overwrites an existing post when Gemini repeats a slug; a numeric suffix is added instead (`insert` instead of `upsert`).
- Blog cron sets `maxDuration = 60` so Gemini generation isn't cut off by the function timeout.
- Pre-existing lint errors in `layout.tsx`, `Header.tsx`, and `StackSection.tsx`.
- Karla now actually renders: the `next/font` variable is renamed to `--font-karla` and used in `globals.css` (it was bound to an unused `--font-geist-sans`, while CSS asked for the literal family name `"Karla"`).
- `/projects` had the Tech Stack title and description; it now has its own metadata and canonical URL.
- Share images: the missing `og-home.png` / `og-contact.png` references are replaced by generated `opengraph-image` routes. `metadataBase` is added so image URLs are absolute.
- `zod` and `zod-to-json-schema` are now declared in `package.json` instead of relying on transitive installs.

### SEO
- Page content is now in the server-rendered HTML: `Preloader` keeps children mounted (invisible until hydrated) instead of not rendering them, so crawlers and link previews see real content.
- Blog posts render on the server with their own `<title>`, description, keywords, article Open Graph tags, canonical URL, and a generated share image (`blog/[slug]/opengraph-image.tsx`). Unknown slugs show the 404 page (`noindex`).
- `sitemap.xml` lists `/projects`, `/tech-stack`, and every blog post (revalidated hourly).
- Fixed `//` in sitemap and canonical URLs when `NEXT_PUBLIC_BASE_URL` ends with a slash: the origin now comes from one place, `src/config/siteUrl.ts`.
- Share images shrink long titles so they fit the card.

### Security
- Upgraded `next` 15.3.8 → 15.5.29 (fixes 30+ advisories incl. critical RCE in the Image Optimization API), `nodemailer` 8 → 10.3.1, `@google/genai` 0.13 → 2.32, `zod` 3 → 4.6.7, `react-syntax-highlighter` 15 → 16.1.2; `npm audit fix` for transitive packages. Remaining: `postcss` bundled inside Next.js (build-time only; fixed in Next 16).
- Removed the unused `GEMINI_GENERATE_CONTENT_URL` entry, which would inline `NEXT_PUBLIC_GEMINI_API_KEY` into client JavaScript if that variable were set.
- Replaced `zod-to-json-schema` with zod 4's built-in `z.toJSONSchema`.
- Blog generation retries now back off (3s, 6s) instead of retrying immediately.
- `next.config.ts` pins `outputFileTracingRoot` so a stray parent-folder lockfile doesn't change the inferred workspace root.

- Rate limiting for `/api/chat` (20 messages / 10 min) and `/api/contact` (3 / hour) per visitor, keyed by a hashed IP in a Supabase `rate_limits` table (`supabase/migrations/20261105_rate_limits.sql`). Fails open if the table is missing. The keep-alive cron prunes day-old counters.
- Input caps: chat messages ≤ 1,000 characters; contact fields capped (message ≤ 5,000), enforced server-side and with `maxLength` on the inputs.
- Chat and contact APIs no longer return raw provider/SMTP error text to visitors (logged server-side instead).

### Cleanup
- Renamed `ExperienceSeciton.tsx` → `ExperienceSection.tsx` and `components/clipoard/` → `components/clipboard/` (plus the `.container-clipoard` CSS class).
- `/blog` and `/tech-stack` page titles no longer repeat the ` | John Carlo Ylanan` suffix.
- `Avatar` and `Featured` converted to resized JPEGs (2.0 MB → 56 KB, 1.4 MB → 89 KB); removed unused `Avatar(2).png`, `other/404.png`, `tech/HTML.png`.
- Removed the unused `@supabase/ssr` dependency and leftover debug `console.log`s.
- AGENTS.md: "Known Quirks" replaced by "Conventions & Gotchas" (title suffix rule, `BASE_URL`).

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
