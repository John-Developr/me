# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows [SemVer](https://semver.org/) (`package.json` version).

## [Unreleased]

Work in progress on the `liquid-glass` branch.

### Added
- **SEO Settings is fully active** (`/admin/seo`, same layout as Personal Profile: cards + sticky preview + save bar). **Pages** (Home, Projects, Tech Stack, Blog, Contact): full title, description and keywords with 60/160-character guides; **Site**: site name (title suffix for other pages, og:site_name) and X handle (normalized from @name or an x.com URL); **Search engines**: "Allow search engines" (off adds noindex site-wide) and Google Search Console verification (code or the whole meta tag); **Site icon**. Preview of the Google result, the page's real generated share card, and the browser tab.
- The five public pages use `generateMetadata` → `buildPageMetadata()` (`src/app/seoMetadata.ts`) and the root layout reads site-wide SEO; saving revalidates every page. Titles are now absolute, which fixes the Contact title showing the name twice ("… | John Carlo Ylanan").
- Migration `20261116000100_seo_settings.sql`: `site_name`, `twitter_handle`, `google_verification`, `allow_indexing` on `site_settings`; new `seo_pages` table, seeded with the current titles, descriptions and keywords.
- **Skill logos come only from the Media Library.** The skill Logo field is pick-from-library only (with a remove button); the API rejects local paths, and migration `20261118000100_skill_logos_media_only.sql` adds a database check (it stops with a clear message if any skill still uses a /public path). Removed `public/images/tech/` — all 10 skill logos were already served from Supabase Storage.
- Fixed a hydration error on every page: `SkeletonImage` added `?t=<timestamp>` to image URLs, so server and browser HTML differed and the photo was never cached.
- **Cleanup:** removed unused code: the unused `FloatingTestimonials` component, the outdated `src/auto/generate-icons.sh` (it would overwrite the real `icons/index.tsx`), dead helpers (`formDataToJson`, `generateRandomDigits`, `formatMessageBubbleString`), `AppPagesEnum`, three unused schema type aliases, unused CSS (old modal styles, the pre-picker `custom-range` inputs, old experience/GitHub and blog-skeleton classes) and commented-out color values. This also removes the autoprefixer `end` build warning.
- **Link-preview (share) cards are now dynamic.** Each page's card uses your Personal Profile photo plus that page's SEO title and description (home shows your profile name), and the site host. Tech Stack and Blog now have their own cards. A per-page **Share image** in SEO Settings (from the Media Library) replaces the generated card. Requires `supabase/migrations/20261117000100_seo_share_images.sql`. Long card titles now wrap instead of running under the photo.
- `TagInput` moved to `components/admin/` (shared by Projects and SEO).
- **Admin — SEO Settings** (`/admin/seo`), starting with the **site icon (favicon)**: pick or upload it from the Media Library, live previews (browser tab in light and dark, Google result, phone home screen), warnings when the image isn't square or is smaller than 180×180, "Use default icon" to go back to `/favicon.ico`. The root layout's metadata is now generated (`generateMetadata`) and sets the icon and Apple touch icon from settings on every page; saving revalidates the whole site. The icon shows in the Media Library's "Used by".
- Migration `20261115000100_site_settings.sql`: single-row `site_settings` (admin-only RLS; public reads go through the server).
- **Date range picker** for the admin (`components/admin/DateRangePicker.tsx`, styled in `adminDatePicker.module.css`): trigger button showing the range ("Oct 1 – Nov 5, 2026"), popover with quick picks (Last 7/30/90 days, This month, Last month, This year), a two-month calendar (one month as a bottom sheet on phones), future days disabled, 365-day limit, and a live summary before Apply. Replaces the browser date inputs on the Analytics screen and the dashboard Traffic card. Built on `react-day-picker` 10 (unstyled; every part uses the admin theme tokens, so it follows light/dark mode).
- **Admin — Analytics** (`/admin/analytics`). Visitor details without IP addresses: summary (visitors, page views, pages per visit, top country with % change), daily chart, top countries / cities / sources / devices / browsers / operating systems / pages, and a **Recent visitors** table (one row per visitor per day: location with flag, device, browser and OS, source, pages in order, time on site). 7/30/90-day presets (segmented control) and a custom range (one pill with Apply), kept in the URL; changing the range is a soft navigation (no full reload, current data stays visible and dimmed while loading, dates validated in the browser). The dashboard Traffic card links to it.
- Page views now store coarse details: country/region/city from Vercel's request geolocation headers, device type, and browser/OS family names (`parseUserAgent`, `readVercelGeo` in `utils/analytics.ts`). Still no IPs, full user agents or cookies.
- Migration `20261114000100_analytics_details.sql`: detail columns, 9-argument `record_page_view`, admin-only `traffic_breakdown()` and `recent_visitors()`.
- Stat cards can show a text value (`display`).
- **Admin — Skills & Technologies** (`/admin/skills`). Core Stack list (numbered; the first 8 marked "Home"), category cards with skills as chips (★ core, ● right now), search, and dialogs to add/edit/delete skills (name, category or none, logo from the Media Library, Core Stack + one-line description + order, "Using right now", order) and categories (name, description, icon, order; delete keeps or removes its skills). API: `POST /api/admin/skills`, `PATCH`/`DELETE /api/admin/skills/[id]`, `POST /api/admin/skill-categories`, `PATCH`/`DELETE /api/admin/skill-categories/[id]`. Reusable `FormDialog`; `sendJson` moved to `utils/admin/`.
- `/tech-stack` (Right Now, Core Stack, Full Toolkit) and the home "Tech Stack." card read from Supabase; tech chip logos site-wide come from skills (`TechLogosProvider`, loaded in the root layout). Removed `techStackData.ts` and `config/techLogos.ts`. Skill logos count in the Media Library's "Used by" and "Import site images".
- Migration `20261113000100_skills.sql`: `skill_categories.icon`, `skills.description`, `skills.core_order`, `skills.is_current`, a unique name for uncategorized skills, and a seed of the existing tech stack (10 categories, 71 skills, 8 core, 6 right now).
- **Home page and site-wide details now come from the admin** (no longer hard-coded):
  - Header phone number and LinkedIn button, and footer name and social icons on every page, read the Personal Profile through a site-wide `SiteProfileProvider` (root layout loads the profile once). Footer icons are now real links; icons without a link are hidden.
  - "Schedule a Call" buttons (home hero, Connect card, Projects page CTA) use the new profile **Booking link**.
  - Home "Recent Projects." shows the **featured project** from Projects (else the first published one): name, tagline, description, tech logos, screenshot and links. Hidden when there are no published projects.
  - Profile editor: new Booking link, Facebook, Instagram and X fields; contact and social links split into two cards. Profile saves revalidate every page; project saves also revalidate the home page.
  - Still static: the home "Tech Stack." card (needs the Skills & Technologies screen) and page metadata (SEO Settings screen).
- Migration `20261112000100_profile_links.sql`: `booking_url`, `facebook_url`, `instagram_url`, `x_url` on profiles; the existing profile gets the Calendly and Facebook links the site already used.
- **Portfolio traffic is live** (first-party, privacy-friendly analytics stored in Supabase). Public pages send one page view per route change (`components/analytics/PageViewTracker.tsx` → `POST /api/p`, sendBeacon). No cookies; no IPs or user agents stored: the server hashes IP + user agent, and the database salts that hash with a random daily salt that is deleted after a day, so visitors are counted once per day but can't be followed across days. Not recorded: bots/previewers/monitors, Do Not Track and Global Privacy Control, admin/API paths, browsers signed in to the admin, and local development (unless `ANALYTICS_DEV=1`). Rate limited per visitor. The dashboard chart shows daily unique visitors with 7/30/90-day and custom ranges, page views in the summary, and % change vs the previous period; "Portfolio Views" shows page views for the last 30 days. Page views older than ~13 months are pruned by the daily keep-alive cron. `ANALYTICS_DISABLED=1` turns it off.
- Migration `20261111000100_analytics.sql`: `analytics_page_views` (admin read only), `analytics_salts` (no access), `record_page_view` (service role), `traffic_daily` (admins), `prune_page_views` (service role).
- **Admin — Media Library** (`/admin/media`). Upload images (PNG, JPEG, WebP, GIF, AVIF) and PDFs to the public Supabase Storage bucket `media` by drag-and-drop or file picker, with per-file progress. Files are checked by their real type (magic bytes, not the extension), size (4 MB each, under Vercel's 4.5 MB body limit) and the storage limit. Storage gauge shows "X GB of Y GB used" with file count and free space (warns at 80%, red at 95%); the limit is `MEDIA_STORAGE_LIMIT_MB` (default 1024 = Supabase Free plan). Grid with Images/PDFs filters and search; details panel with preview, size, dimensions, copy link, alt text, **"Used by"** list (projects, profile, experience) and delete (blocked while a file is in use). **"Import site images"** uploads the `/public` files that content points to and repoints those fields to the library copies (re-runnable, no duplicates). API: `GET`/`POST /api/admin/media`, `PATCH`/`DELETE /api/admin/media/[id]`, `POST /api/admin/media/import`.
- **Every image field now has a "Library" picker** (`AssetInput` + `MediaPickerDialog`): project logo and screenshot, profile photo, profile resume (PDF), experience logo. Pick an existing file or upload from the dialog; typed `/public` paths still work. Validation accepts Media Library URLs (`optionalAssetRef`).
- Migration `20261110000100_media_library.sql`: bucket (public read, 4 MB, allowed types; SVG excluded because it can carry scripts), admin-only Storage policies, `media_assets` table with RLS, `media_storage_usage()` RPC (real bytes in the bucket), and media uploads/deletes in the activity log.
- `next.config.ts` allows `next/image` to load from the project's Supabase Storage `media` path. New `--admin-warning` token (light and dark).
- "Download Resume" fetches without a custom request header, so a library-hosted PDF downloads without a CORS preflight.
- **Admin — Work Experience** (`/admin/experience`). Manage the home page career timeline: entries are Work (role at a company), Education (degree/course) or Milestone (single date). List with All/Work/Education/Milestones filters, search, computed dates and durations, edit and delete (confirmed). Form with type-aware labels, month pickers, "I currently work/study here", company suggestions (picking a known company fills its logo so roles group together), logo preview, live preview of the timeline line, and unsaved-changes warning. Validation shared with the API (`utils/admin/experienceSchema.ts`). API: `POST /api/admin/experiences`, `PATCH`/`DELETE /api/admin/experiences/[id]`.
- The **home page "Experience." card now reads the timeline from Supabase**: roles at the same company are grouped with per-role durations, current entries first, then newest first (`utils/experienceTimeline.ts`, built on the server). `src/config/experienceDefaults.ts` (the previous hard-coded timeline) is used only if the database is unreachable or empty.
- Migration `20261109000100_experience_timeline.sql`: `entry_type` column (work/education/milestone; milestones can't have an end date) and a seed of the existing timeline. Forty Degrees Celsius start months were derived from the durations shown on 2026-11-06.
- Dashboard "Work Experience" counts work entries only (not education or milestones). Quick action "Add Work Experience" opens the new form.
- Admin services share one `ServiceError` class and `serviceErrorResponse()` helper (`lib/.services/serviceError.ts`).
- **Admin — Personal Profile** (`/admin/profile`). Edit full name, headline, location, photo, bio (paragraphs on blank lines), email, phone, GitHub, LinkedIn, website and resume, with validation shared with the API (`utils/admin/profileSchema.ts`), a live completion score (same rules as the dashboard; click a missing item to jump to its field), and an unsaved-changes warning. API: `PUT /api/admin/profile`. Saves are logged as "Profile updated".
- The **home page now reads the profile** (hero name/headline/location/photo, "About Me." bio, "Connect." email/phone/resume, Send Email link) and revalidates on save. Cleared fields are hidden. `src/config/profileDefaults.ts` (the previous hard-coded values) is used only if no profile exists or the database is unreachable. The header phone/LinkedIn and footer links are not wired yet.
- Migration `20261108000100_profile_singleton_seed.sql`: one profile row only, seeded from the current home page (never overwrites an existing profile).
- `CopyClipboard` takes the text to copy as a prop. Shared zod field helpers moved to `utils/admin/fieldSchemas.ts`; `ImagePathInput` moved to `components/admin/`. `npm test` loads TypeScript through a small resolver hook (`utils/admin/__tests__/resolveTs.mjs`) so tests can import modules that use `@/` and extensionless paths.
- **Admin — Account Settings** (`/admin/account`, also in the account menu). Display name (stored in the Supabase Auth user's metadata; now used for the greeting and menu ahead of the portfolio profile name), read-only sign-in email, password change (current password verified on a throwaway client; letter + number, 8–72 chars; optional sign-out of other devices; rate limited 5 per 15 min), light/dark appearance, "Sign out other devices", and account details (created, admin since, last sign-in, user ID). API: `PATCH /api/admin/account`, `POST /api/admin/account/password`, `POST /api/admin/account/sign-out-others`. Email changes stay in the Supabase dashboard for now.
- Shared admin form building blocks: `FormField`, `PasswordInput`, and `adminForm.module.css` (moved out of the Projects styles); `toFieldErrors` moved to `utils/admin/formErrors.ts`.
- **Admin — Projects** (`/admin/projects`). List with search, All/Published/Drafts filters, and per-row actions (edit, publish/unpublish, make featured, view on site, delete with confirmation). Create/edit form (`/admin/projects/new`, `/admin/projects/[id]/edit`) with auto-slug, highlights list, tech chips, link labels, image-path previews, publish status, featured flag, display order, unsaved-changes warning, and inline validation shared with the API (`utils/admin/projectSchema.ts`). API: `POST /api/admin/projects`, `PATCH`/`DELETE /api/admin/projects/[id]` (admin session + RLS). Every change is recorded in the activity log by the existing trigger.
- The public **`/projects` page now reads published projects from Supabase** (featured first, then by display order) and revalidates immediately after admin edits (ISR every 5 min as a safety net). `projectsData.ts` is kept only as a fallback if the database is unreachable.
- Migrations `20261107000100_projects_cms_fields.sql` (`note`, `live_label`, `source_label`; one featured project at a time) and `20261107000200_seed_projects.sql` (imports the four existing projects; re-runnable, never overwrites).
- Dashboard "Add Project" and "Create Project" now open the new project form. Sidebar "Projects" is live; breadcrumbs show sub-pages (Admin / Projects / Edit).
- **Admin Dashboard — Overview** (`/admin`, private). Supabase Auth sign-in at `/admin/login`; admins are listed in `admin_users` and checked three ways: middleware (session), the `(dashboard)` layout (`is_admin()`), and RLS in the database. Sidebar (collapsible, drawer on ≤850px) with every planned module marked "Soon", top bar (breadcrumb, search placeholder, unread-message bell, View Live Portfolio, profile menu with theme toggle and logout). Overview: welcome header with refresh, six stat cards, portfolio traffic chart (7/30/90-day and custom ranges), recent activity, content overview with profile completion, and quick actions. All figures come from the database; nothing is sample data. Admin pages are `noindex`. Styled with the site theme: `--admin-*` tokens alias `--bg-primary` / `--primary-hover-color` (near-black in light mode, site blue in dark), primary and secondary buttons use `liquid_glass_btn`, and the chart line is the site blue `#476fff`.
- Supabase migrations `20261106000100_admin_access.sql`, `…0200_portfolio_content.sql`, `…0300_activity_logs.sql`: `admin_users` + `is_admin()`, `profiles`, `projects`, `experiences`, `skill_categories`, `skills`, `contact_messages`, and `activity_logs` filled automatically by triggers on content changes and new messages. RLS on every table.
- Contact form submissions are also saved to `contact_messages` (after the email is sent; a database error never affects the visitor). No IP or user agent is stored.
- `AnalyticsService` provider abstraction. No provider is configured yet, so the dashboard shows "Analytics not connected" instead of visitor numbers.
- Admin sign-in is rate limited (5 attempts per 15 minutes per IP).
- `npm test`: Node's built-in test runner for the dashboard's pure logic (profile completion, date ranges, chart scale, redirects).
- `@supabase/ssr` dependency for cookie-based sessions (`@supabase/supabase-js` range raised to `^2.114.0`, its peer requirement).
- Chat assistant closes when clicking or tapping outside the chat box, or pressing Escape (`components/chat/ChatAI.tsx`).
- Tech Stack page content (`/tech-stack`): "Right Now" card, "Core Stack." grid (the home tools), and a "Full Toolkit." of 10 categories with tool chips, plus a closing CTA. Data in `src/containers/tech-stack-page/techStackData.ts`; `TechTool` / `TechCategory` types in `utils/types.ts`.
- Shared inner-page components: `PageCta` (`components/cta/`), `SectionTitle` (`components/header/`), `TechChips` (`components/tech/`), with styles in `component.module.css`; the tech-logo map moved to `src/config/techLogos.ts`. The Projects page now uses them.
- Home "Tech Stack." → "See more" now links to `/tech-stack` (was `/projects`).
- Projects page content (`/projects`): featured Gordon Bostic card with browser-framed screenshot, a "More Projects." grid (NativeCamp, this portfolio, COVID Tracker) with role/period, highlights, "Built With" chips and links, and a "Have a project in mind?" call to action. Static data lives in `src/containers/projects-page/projectsData.ts`; `ProjectItem` / `ProjectKindEnum` types in `utils/types.ts`. Share image via `src/app/projects/opengraph-image.tsx`.
- Home "Recent Projects" → "See More" now links to `/projects` (was `#`).
- Global `.liquid_glass` and `.liquid_glass_btn` glassmorphism utility classes (`globals.css`), applied to header icon buttons, hero CTAs, project actions, and the resume button.
- Firebase card in the home Tech Stack section.
- `ThreeDotsHorizontal` icon for the header menu trigger.
- Daily `/api/cron/keep-alive` Vercel cron that runs a lightweight Supabase query so the free-tier project isn't paused for inactivity.
- Blog cron dry-run mode: `GET /api/cron/blog?dry=1` (with the cron secret) generates and returns a post without saving it.

### Changed
- Admin account menu (top right) shows your Personal Profile photo instead of initials (initials remain the fallback) and has a "Personal profile" link. `AdminUser` gains `avatarUrl`.
- **Content now has one source: the database.** Removed the code copies used as fallbacks (`containers/projects-page/projectsData.ts`, `config/experienceDefaults.ts`, the profile values in `config/profileDefaults.ts`, now just an empty profile) and the link constants that moved to the Profile/Projects admin (`CALENDLY_URL`, `MAIL_TO`, `RESUME_URL`, `LINKEDIN_URL`, `FACEBOOK_URL`, `GORDON_*`, `NATIVECAMP_URL`, `PORTFOLIO_GITHUB_URL`). If a page refresh can't reach the database, ISR keeps serving the last good page; the site-wide header/footer render without personal details instead of failing. Empty name/experience are hidden.
- Removed `/public` files now served from the Media Library: `images/NativeCamp.png`, `images/Featured.jpg`, `images/company/{Forty,Proweaver,UC,CodeTag}.png`, `documents/resume.pdf` (still in git history; the seed migrations reference these paths, so a brand-new database should use "Import site images" before deleting, or re-upload). `images/Avatar.jpg` stays: share images, chat and blog read it directly.
- `CONTRIBUTING.md` / `PROJECT_OVERVIEW.md`: content editing now points to the admin.
- Admin layout polish: cards side by side now line up. Dashboard sections are laid out in rows (Traffic | Content Overview, Recent Activity | Quick Actions) whose cards share a height; stat cards are an even 3×2 grid (2 columns on phones) with labels on one line and hints pinned to the bottom; Media Library's storage card matches the Upload card and shows a per-type breakdown; Account Settings columns end on the same line; empty states center inside stretched cards; the dashboard Refresh button matches the other header buttons.
- Home "Recent Projects." screenshot frame matches the `/projects` featured frame (theme tokens, soft shadow) and now has a proper dark-mode look instead of a fixed light-grey frame.
- Experience section: Forty Degrees Celsius roles listed as AI Engineer, iOS Developer, Web Developer.
- Experience section: AI Engineer duration updated to 11 months.
- Blog post "Share with" buttons (Facebook, LinkedIn) and the "View All Blogs" back link use the same `liquid_glass` style and hover as the header buttons. New `.liquid_glass_group` parent class applies the glass hover when hovering anywhere in the parent.
- Blog list sort button uses the `liquid_glass_btn` style (35px circle, gentler 1.1× hover zoom like the other glass buttons); ascending order keeps the primary fill. Fixes the dark-mode version, which showed a light-grey square with a black icon. Added an `aria-label`.
- Chat send button uses `liquid_glass_btn` (hover zoom; hover color is now `--primary-hover-color` instead of a hard-coded grey) and has an `aria-label`.
- Contact page "Start the Conversation" button uses `liquid_glass_btn` like Download Resume (hover zoom, primary fill kept); its primary-color glow shadow is removed.
- Blog category chips (All, Technology, …) use `liquid_glass_btn` too; the selected chip keeps the primary fill.
- Blog category chips scroll sideways on narrow screens instead of pushing the sort button off-screen and making the page scroll horizontally.
- "View All Blogs" hover brightens in dark mode instead of dimming, via a new `--text-muted-hover` token (defined in `:root` and `.dark`).
- Header menu button and "Chat with John" button share the `liquid_glass_btn` hover; the menu button stays highlighted while the menu is open (new `.liquid_glass.is-active` modifier).
- Blog generation instructions rewritten: Markdown with `##` subheadings, 450–650 words, no invented personal stories, employers or statistics, stricter cliché bans. Recent titles are passed to the prompt to avoid repeated topics.
- Blog generation retries up to 3 times, rejects cliché titles in code, computes reading time from word count, and only asks Gemini for the fields it writes.
- Faster blog navigation: in-memory client cache for blog API responses, CDN caching on the blog list APIs, view counting moved after the response (`after()`), no 500ms debounce on the first blog list load, a `loading.tsx` skeleton for blog articles, and prefetching for header menu routes and home blog cards.

### Fixed
- OpenAI logo was invisible in dark mode (black glyph); new `--mono-logo-filter` token inverts it in `.dark` wherever it appears (home and Tech Stack).
- `Work` icon had one path hard-coded to `stroke="black"` (invisible in dark mode); now `currentColor`.
- Header menu dropdown no longer zooms with the menu button on hover, and clicking a menu item no longer re-toggles the menu. Menu items show the pointer cursor.
- Security: cron routes now reject requests when `CRON_SECRET` is unset (previously `Authorization: Bearer undefined` was accepted).
- Blog generation no longer overwrites an existing post when Gemini repeats a slug; a numeric suffix is added instead (`insert` instead of `upsert`).
- Blog cron sets `maxDuration = 60` so Gemini generation isn't cut off by the function timeout.
- Pre-existing lint errors in `layout.tsx`, `Header.tsx`, and `StackSection.tsx`.
- Karla now actually renders: the `next/font` variable is renamed to `--font-karla` and used in `globals.css` (it was bound to an unused `--font-geist-sans`, while CSS asked for the literal family name `"Karla"`).
- `/projects` had the Tech Stack title and description; it now has its own metadata and canonical URL.
- Share images: the missing `og-home.png` / `og-contact.png` references are replaced by generated `opengraph-image` routes. `metadataBase` is added so image URLs are absolute.
- `zod` and `zod-to-json-schema` are now declared in `package.json` instead of relying on transitive installs.

### AI
- Gemini model upgraded from `gemini-2.5-flash` to `gemini-3.6-flash` (3.7 and 3.8 were returning 503 overloads at the time) (chat assistant and blog generation), defined once as `GEMINI_MODEL` in `chatService.ts`.
- Gemini API key fallback: if `NEXT_SECRET_GEMINI_API_KEY` hits a rate/quota limit (429), is invalid/disabled (400/401/403), or the service is unavailable (500/503), the request is retried with the optional `NEXT_SECRET_GEMINI_API_KEY2`, and later requests start with the key that last worked.

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
