# AGENTS.md — Instructions for AI Coding Assistants

This file is the source of truth for any AI assistant (Claude Code, Copilot, Cursor, etc.) making changes in this repository. Read it fully before editing code.

Companion docs: [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) · [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) · [CONTRIBUTING.md](docs/CONTRIBUTING.md) · [CHANGELOG.md](docs/CHANGELOG.md)

> If this file and the code disagree, the **code wins**. Fix this file in the same change, and don't follow the outdated rule.

---

## 1. Role & Purpose

This is **John Carlo A. Ylanan's personal portfolio** — a Next.js 15 (App Router) + React 19 + TypeScript site with plain **CSS Modules + global CSS** (no Tailwind, no CSS-in-JS, no UI kit). It has two halves:

**Public site**: home (profile, about, tech stack, experience, featured project, connect, recent blog), `/projects`, `/tech-stack`, `/blog`, `/blog/[slug]`, `/contact`, plus:
- A blog (Supabase `ai_blogs`): a monthly Vercel cron writes a post with Gemini; the admin can also write posts by hand or generate one per category. Only `status = 'published'` posts are public.
- A floating AI chat assistant ("Chat with John", Gemini)
- A contact form that sends email via Nodemailer/Gmail SMTP and saves to `contact_messages`
- First-party, privacy-friendly analytics (`PageViewTracker` → `POST /api/p`)

**Admin CMS** (`/admin`, private, Supabase Auth): dashboard, Projects, Personal Profile, Work Experience, Skills & Technologies, Blog, Contact Messages (+ notification bell), Media Library, Analytics, SEO Settings, Account.

**All portfolio content lives in Supabase and is edited in the admin.** Nothing is hard-coded in components anymore, and there are no code fallbacks (see §4.1).

Your job is to extend and maintain this codebase **without changing its visual identity**. The design is finished; treat it as fixed unless the owner explicitly asks for a redesign.

---

## 2. Strict Design Constraints (non-negotiable)

1. **Use existing CSS variables only.** All colors come from the tokens in `src/styles/general/globals.css` (`:root` for light, `.dark` for dark). Never introduce a new hex/rgb color in a component when a token exists. See [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for the catalog.
2. **Never edit token values** in `:root` / `.dark` unless explicitly asked. Adding a *new* token is allowed only if no existing one fits, and it must be defined in **both** `:root` and `.dark`.
3. **Every new UI must work in light and dark mode.** Dark mode is a `.dark` class on `<html>`, not `prefers-color-scheme` in CSS. Test both by toggling (header menu on the site, profile menu or Account in the admin).
4. **Do not add a styling framework** (Tailwind, styled-components, Emotion, MUI, Chakra, shadcn, Framer Motion, etc.). Styling is CSS Modules + `globals.css`.
5. **Keep the layout contract (public site):**
   - Content column max width `var(--content-based-width)` (970px), provided by `.wrapper .content` in `LayoutProvider`. Pages must not add their own outer container.
   - Home cards: `padding: 30px; border-radius: 12px; background: var(--container-bg)` with a `.title` row (20px icon + `h3` ending in a period, e.g. `About Me.`).
   - Single responsive breakpoint: **`@media (max-width: 850px)`** (and `useApp().isMobile`, which uses the same 850px value). Don't invent new breakpoints; `462px` exists only for the hero role text.
6. **Primary actions** use `background-color: var(--bg-primary); color: white;` with hover `var(--primary-hover-color)`, radius 8–10px, height 35–40px. Secondary actions use `color: var(--text-secondary)` and no fill. Many buttons also carry the global `liquid_glass_btn` class. Reuse it, don't fork it.
7. **Badges/chips** use `border: var(--badges-border); background: var(--badges-bg); color: var(--badges-text); border-radius: 8px`.
8. **Font:** Karla, loaded by `next/font/google` in `src/app/layout.tsx` as the CSS variable `--font-karla` and applied with `font-family: var(--font-karla), sans-serif` on `*`. Don't add fonts or hard-code the family name.
9. **Icons:** inline SVG React components in `src/components/icons/` (admin set: `icons/admin/index.tsx` → `AdminIcons`) using `stroke="currentColor"` / `fill="currentColor"`. Don't add an icon library.
10. **Motion:** entrance animation via `useAnimateIn` (fade + 20px rise, ~600ms, staggered delays). Keep new animations subtle and consistent with existing keyframes.
11. **Admin UI** follows the same theme through the `--admin-*` tokens (`--admin-accent`, `--admin-success`, `--admin-danger`, `--admin-warning`, `--admin-shadow`, …), which alias the site tokens. Use them in `admin*.module.css`; don't write raw colors. Reuse the shared building blocks in `src/components/admin/` (`PageHeader`, `FormField`, `FormDialog`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `Skeleton`, `StatCard`, `AssetInput`, `TagInput`, `DateRangePicker`, `MarkdownEditor`, …) before making new ones. The admin uses the same 850px breakpoint (the sidebar becomes a drawer).

---

## 3. Coding Standards

### TypeScript
- `strict: true` (see `tsconfig.json`). No `any`; prefer explicit interfaces for props and state.
- Path alias `@/*` → `src/*`. Always import via `@/…` for cross-folder imports; relative imports are fine inside the same feature folder.
- Shared types/enums live in `src/utils/types.ts` (e.g. `AIBlogResponse`, `PublicProfile`, `ProjectRecord`, `AdminUser`). Add new shared types there, grouped under the existing `// ===== SECTION =====` banners.
- String-literal sets are modelled as `enum` (e.g. `BlogCategoryEnum`) or `as const` objects (e.g. `networkDefine`, `storageKeys`, `SEO_PAGES`, `Table`, `RPC`).
- Input validation uses **zod** (v4). Admin schemas live in `src/utils/admin/<thing>Schema.ts` and are shared by the form (client) and the API route (server). Reuse the field helpers in `utils/admin/fieldSchemas.ts` (e.g. `optionalAssetRef`).

### React / Next.js
- App Router. Route files in `src/app/**/page.tsx` stay **thin**: metadata, data loading, and rendering a container from `src/containers/`. No UI markup in route files.
- Page logic/UI lives in `src/containers/<name>-page/`. Containers that use hooks/state start with `'use client'`. Admin containers are usually **async server components** that load data and render a client "Manager"/"Form" child.
- **Public pages are server-rendered** (for SEO). Data is loaded on the server through the loaders in `src/app/` (`getPublicProfile`, `getPublicExperience`, `getPublicSkills`, `projects/getProjects`, `blog/[slug]/getBlog`, `getSiteSettings`). They are wrapped in React `cache()` and **throw** on database errors, so ISR keeps serving the last good page. Pages set `export const revalidate = 300` as a safety net.
- Global client state: `useApp()` from `src/lib/.context/AppContext.tsx` (`isDark`, `toggleTheme`, `isMobile`, `pageLoading`, `showModal`). Site-wide data from the root layout: `SiteProfileContext` (owner profile for header/footer) and `TechLogosContext` (logos for tech chips). Don't add Redux/Zustand.
- Client-side requests go through **API routes** (`src/app/api/**/route.ts`) and the endpoint registry `src/config/networkDefine.ts`. Never hard-code URLs in components; add them to `networkDefine`.
- Server logic is in class-based services in `src/lib/.services/`. API routes call a service and return `NextResponse.json(...)` inside `try/catch`.
- Async list UIs follow the **loading → error → empty → data** pattern with a dedicated Skeleton, Empty, and Error component (see `home-page/blog-section/`, and `components/admin/` for the admin).
- Use `next/image` for images and `next/link` for internal navigation. Remote images are allowed only from the Supabase Storage `media` bucket (`next.config.ts`).
- Storage keys (localStorage, cookies) come from `src/config/storageKeys.ts`.
- **Render must be deterministic.** No `Date.now()`, `Math.random()`, `new Date()` formatting or `window` checks in output that is server-rendered. (A `?t=<timestamp>` cache-buster in `SkeletonImage` caused a hydration error on every page.) Use `useEffect` or `TimeAgo`-style client components for time-relative UI.

### Naming & files
| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase `.tsx` | `BlogSectionCard.tsx` |
| Container folders | kebab-case, `-page` / `-section` suffix | `blog-detail-page/`, `admin-skills-page/`, `stack-section/` |
| Container entry | `index.tsx` default export | `containers/blog-page/index.tsx` |
| Hooks | camelCase, `use` prefix | `useAnimateIn.ts` |
| Config / utils | camelCase `.ts` | `networkDefine.ts`, `stringHelpers.ts` |
| Services | camelCase file, PascalCase class | `projectService.ts` → `ProjectService` |
| CSS Modules | `<name>.module.css` in `src/styles/pages/` or `src/styles/general/` | `blog.module.css`, `adminSkills.module.css` |
| CSS class names | kebab-case, accessed as `styles["kebab-name"]` or `styles.single` | `styles["card-divider"]` |
| Global classes | plain strings in `className` | `"header"`, `"liquid_glass_btn"` |
| Migrations | `supabase/migrations/YYYYMMDDHHMMSS_snake_name.sql` | `20261115000100_site_settings.sql` |
| Tests | `src/utils/**/__tests__/<name>.test.mjs` | `projectSchema.test.mjs` |

### Exports
- Components, containers, and services: **default export**. Data loaders in `src/app/` are named exports.
- Hooks: `useMediaQuery` is default; `useAnimateIn`, `useDebounce`, `useFadeOutRemove`, `useChatAssistant` are named. Match the file you're touching.
- Icons: default export per file; frequently used icons are re-exported via `HomeIcons` (`src/components/icons/index.tsx`) and `AdminIcons` (`src/components/icons/admin/index.tsx`).

### Style of code
- Match surrounding formatting: 2- or 4-space indentation as in the file, double quotes, semicolons. Many files align `=` / `:` in columns. Keep that when editing those blocks.
- Section banners (`// ─── … ───`, `// =====`, `/* ===== … ===== */`) and JSDoc on hooks/services/loaders are the house style. Keep them when editing.
- Don't leave debugging `console.log` in new code. Server errors are logged once, by `serviceErrorResponse` (`console.error` with a route label).

---

## 4. Architecture Rules

### 4.1 Content comes from the database
- Profile, projects, experience, skills, media, SEO and site settings are rows in Supabase, edited in `/admin`. **Never hard-code portfolio content, links (email, phone, Calendly, socials, resume) or project data in components or config.** `config/profileDefaults.ts` only holds an empty profile.
- Don't add "fallback" copies of content in code. If the database is unreachable, public loaders throw (ISR keeps the last good page). Only site-wide chrome (root layout: header/footer) catches the error and renders without personal details.
- Images and PDFs used by content live in the **Media Library** (Supabase Storage bucket `media`). Don't add content images to `/public`. `/public` holds only `favicon.ico`, `images/Avatar.jpg` (share images, chat and blog read it directly), `images/Logo.png`, `images/Ph-Flag.png` and `documents/email-template.html`. SVG uploads are not allowed (they can carry scripts).

### 4.2 Supabase clients — pick the right one
| Client | File | Key | RLS | Use for |
|---|---|---|---|---|
| Service role | `src/lib/.supabase/server.ts` (default export) | `NEXT_SECRET_SUPABASE_ROLE_KEY` | **bypassed** | Public reads on the server, cron jobs, analytics/rate-limit RPCs |
| Signed-in user | `createAuthClient()` in `src/lib/.supabase/authClient.ts` | anon key + session cookies | applies | Everything admins read or write |
| Middleware | `src/lib/.supabase/middlewareClient.ts` | anon key | applies | Session refresh in `middleware.ts` only |

- The service-role client must **never** be imported by a `'use client'` file or anything a client file imports (its header comment says "browser"; that comment is wrong).
- Admin services take the session's client in the constructor (`new ProjectService(auth.session.client)`) so RLS applies and the activity-log triggers record who changed what. Don't use the service-role client for admin writes.
- Table and RPC names come from the `Table` / `RPC` constants in `server.ts`. Add new ones there; don't write string table names inline.

### 4.3 Admin area
- Auth is checked **three times**: `middleware.ts` (signed-in session → else redirect to `/admin/login?next=…`), `app/admin/(dashboard)/layout.tsx` (`AdminAuthService.getSession()` + `is_admin()`), and RLS in the database. Keep all three for anything new.
- Admin screens go in `src/app/admin/(dashboard)/<name>/page.tsx` with a short `metadata.title` (template is `%s | Portfolio CMS`; admin pages are `noindex` from `app/admin/layout.tsx`). Add `loading.tsx` for slow lists. Register the screen in `src/components/admin/adminNav.ts` (flip a `kind: "soon"` item to `kind: "route"`).
- **Admin API route recipe** (copy `src/app/api/admin/projects/[id]/route.ts`):
  1. `export const dynamic = "force-dynamic";`
  2. `const auth = await AdminAuthService.authorizeRequest(); if (!auth.ok) return auth.response;`
  3. Validate ids (`z.uuid()`) and the body with the shared zod schema. On failure, return 400 with `{ message, errors: toFieldErrors(...), result: false }`.
  4. Call the service with `auth.session.client`. Services throw `ServiceError(message, status, field?)` (`lib/.services/serviceError.ts`).
  5. `revalidatePath(...)` **every public page that shows this data** plus `revalidatePath("/admin", "layout")`. Profile, skills and site settings revalidate `("/", "layout")` because the header/footer/chips/metadata use them on every page. Forgetting this means the change doesn't show up for up to 5 minutes.
  6. Return `{ message, data?, result: true }`. In `catch`, return `serviceErrorResponse(error, "api/admin/<name> METHOD")`.
- Response shape for every admin route: `{ result: boolean; message: string; errors?: Record<string,string>; data?: T }` (`AdminApiResponse`). Clients call routes with `sendJson()` from `utils/admin/sendJson.ts` and show results with `sileo` toasts.
- Forms: inline field errors from `errors`, unsaved-changes warning, and validation shared with the API. Follow `admin-project-form-page/ProjectForm.tsx`.

### 4.4 SEO & metadata
- The five public pages use `generateMetadata()` → `buildPageMetadata(key)` (`src/app/seoMetadata.ts`), which reads **Admin → SEO Settings** and sets an **absolute** title. Don't hard-code titles, descriptions or keywords for these pages.
- The root layout's title template is `%s | <site_name from SEO Settings>`. It only applies to pages that pass a plain string title (e.g. blog posts, 404). Never add the suffix yourself.
- A new public page that should be editable in SEO Settings needs a key in `SEO_PAGES` (`utils/admin/seoPages.ts`), a migration that extends the `seo_pages.key` CHECK constraint and seeds a row, `generateMetadata` → `buildPageMetadata`, and an `opengraph-image.tsx` that calls `renderPageOgImage(key, eyebrow)` (`src/app/pageOgImage.tsx`).
- Build absolute URLs with `BASE_URL` from `src/config/siteUrl.ts` (trailing slash stripped), never `process.env.NEXT_PUBLIC_BASE_URL` directly. `metadataBase` is set in the root layout.
- Don't add `openGraph.images` / `twitter.images` URLs pointing to files that don't exist. Share images come from `opengraph-image.tsx` files.
- Add public routes to `src/app/sitemap.ts`.

### 4.5 Database migrations
- Schema changes are SQL files in `supabase/migrations/`. The owner applies them in Supabase, so **say so in your final message** when a change needs a migration, and name the file.
- Never edit a migration that has already been committed; add a new one with a later timestamp.
- Each migration starts with a banner comment: what it does, what it requires (`Requires 2026…_x.sql`), `Safe to re-run.`, and a rollback snippet. Make it idempotent (`if not exists`, `create or replace`, `on conflict do nothing`), and never overwrite owner-edited content in seeds.
- Every new table gets RLS enabled with admin-only policies via `is_admin()`. Public reads go through the server (service role), not anon policies.

### 4.6 Privacy, security & limits
- Analytics must never store IPs, full user agents or cookies, and must honour Do Not Track / Global Privacy Control (see `utils/analytics.ts`, `api/p`). Don't weaken this.
- Public POST endpoints (chat, contact, page views, admin login) are rate limited with `RateLimitService` and cap input sizes. New public write endpoints need the same.
- Uploads are checked by real file type (magic bytes), 4 MB per file (Vercel body limit is 4.5 MB) and `MEDIA_STORAGE_LIMIT_MB`.
- Secrets: read from `process.env` server-side only. Never prefix a secret with `NEXT_PUBLIC_`. New env vars go into `.env.example` with a comment.

---

## 5. Workflow Rules

### Package manager & toolchain
- The project uses **pnpm** (`pnpm-lock.yaml`). Install with `pnpm install` and run scripts with `pnpm <script>`. Don't run `npm install` or commit a `package-lock.json` (two lockfiles drift apart).
- Tests need **Node ≥ 22.18** (glob in `node --test` + built-in TypeScript type stripping). Run them with `pnpm test`: pnpm uses its own newer Node (`pnpm exec node -v`). `npm test` uses the system Node; on 20.x it fails with `Could not find '…/src/**/*.test.mjs'`. That is an environment problem, not a test failure. Don't "fix" the script.

### Adding a component
1. Check `src/components/` (incl. `components/admin/`) and the relevant container folder for something reusable first.
2. Put shared UI in `src/components/<area>/`, page-specific UI in `src/containers/<page>/`.
3. Style it in the **existing** module for that page (e.g. home sections → `page.module.css`, scoped under the section class like `.fourth .blog …`; admin forms → `adminForm.module.css`). Create a new module only for a new page.
4. Colors/borders/shadows → tokens only. Add `@media (max-width: 850px)` rules if the layout has columns.

### Adding a public page
1. `src/app/<route>/page.tsx`: `generateMetadata` (see §4.4), load data with a server loader, `export const revalidate = 300` if it reads the database, render `<XPage …props />`.
2. `src/containers/<route>-page/index.tsx`: compose `<Header />`, `<PageIntro subtitle title intro />`, `<main>`, `<Footer />` (see `projects-page/index.tsx`). `'use client'` only where interactivity needs it.
3. `src/styles/pages/<route>.module.css` for page styles.
4. Add the route to `menuItems` in `src/components/header/MenuItems.tsx`, to `src/app/sitemap.ts`, and an `opengraph-image.tsx`.

### Adding an API endpoint
1. Business logic in a service under `src/lib/.services/`.
2. Route handler in `src/app/api/<name>/route.ts`, wrapped in `try/catch`, returning `NextResponse.json`. Admin routes follow the recipe in §4.3.
3. Register the path in `networkDefine`.

### Adding admin-managed content
Migration (table/columns + RLS + seed) → `Table` constant → type in `utils/types.ts` → zod schema in `utils/admin/` (+ test) → service → admin API routes → admin screen + `adminNav.ts` → public loader in `src/app/` → public container → `revalidatePath` for every page that shows it → Media Library "Used by" if it references media.

### Tests
- Pure logic and every zod schema in `src/utils/` should have a test in `src/utils/**/__tests__/*.test.mjs` (Node's `node:test` + `node:assert/strict`). Import TypeScript with the explicit extension (`../projectSchema.ts`); `resolveTs.mjs` handles `@/` and extensionless imports inside the app code.
- Tested modules must import from `@/utils/types` with **`import type`**. Node's type stripping can't run `types.ts` (it has enums), so a plain import fails with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.
- There are no component or end-to-end tests. UI is verified manually.

### Before finishing
- `pnpm lint` must pass. (`next lint` prints a deprecation notice; that's expected.)
- `pnpm build` must pass. **Known local issue:** in a checkout whose path contains an apostrophe (e.g. `C:\Users\John\Documents\John's Files\…`), `next build` fails with `Module parse failed: Unexpected token` in `next-metadata-route-loader` for every `opengraph-image.tsx`. Next puts the file path into a single-quoted JS string without escaping it. The code is fine, and Vercel builds normally. In that case run `npx tsc --noEmit` for the type check, and say in your final message that the full build couldn't run locally. Don't rename or remove `opengraph-image.tsx` files to work around it. `subst` drive aliases don't help (Node resolves the real path).
- `pnpm test` passes.
- Visually check the change in **light and dark** mode and at **≤850px** width.
- Don't touch unrelated files; don't reformat whole files.
- Update [CHANGELOG.md](docs/CHANGELOG.md) under `Unreleased` for user-visible changes (see §7).
- If you changed how something works (data flow, a convention, a route, an env var), update **this file and the affected companion docs** in the same change.

---

## 6. Do-Not-Touch / Handle-With-Care

- `src/app/layout.tsx`: the inline `themeScript` prevents a theme flash. Keep it in `<head>` and keep `suppressHydrationWarning`. The layout also loads the site profile, tech logos and SEO settings for every page (including the admin), so its loaders must never throw.
- `src/middleware.ts`: clears the chat cookie on every page navigation (by design; chat history is per page load) **and** guards `/admin`. Keep both.
- `src/docs/system-instruction.md` and `src/docs/blog-instruction.md`: runtime prompts for Gemini, read from disk by API routes. Editing them changes AI output in production.
- `GEMINI_MODEL` in `chatService.ts` is pinned on purpose (not an alias), with automatic fallback to `NEXT_SECRET_GEMINI_API_KEY2`. Don't change the model unless asked.
- `public/documents/email-template.html`: `{{placeholder}}` names must match `ContactService`.
- `supabase/migrations/*`: committed migrations are immutable (§4.5).
- `.env`: never read values into output, commit, or log them.
- `vercel.json` crons: `/api/cron/blog` (monthly) and `/api/cron/keep-alive` (daily; keeps the free Supabase project awake and prunes old page views). Both need `CRON_SECRET`.
- Folders prefixed with `.` in `src/lib/` (`.context`, `.services`, `.supabase`) are intentional; keep the names.

---

## 7. Docs & Changelog Hygiene

Earlier AI changes kept the code and CHANGELOG up to date but let the other docs go stale. Avoid repeating that:
- **CHANGELOG entries:** one bullet per change, written for the owner (what changed and where), a sentence or two, not a paragraph. Mention required migrations by file name.
- When a later change **supersedes** an `Unreleased` entry (e.g. something listed as "still static" that is now dynamic), edit or remove the old entry. Don't leave contradictions.
- [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md), [CONTRIBUTING.md](docs/CONTRIBUTING.md) and `README.md` describe architecture, routes, env vars and setup. Update them when those change. Version numbers there must match `package.json`.

---

## 8. Known Deviations (don't copy these)

Existing code that breaks the rules above. Leave them alone unless your task touches them; don't use them as examples:
- `src/hooks/useChatAssistant.ts` calls `"/api/chat"` directly instead of a `networkDefine` entry.
- `src/app/blog/[slug]/page.tsx` hard-codes the site name and author in Open Graph metadata instead of reading SEO Settings / the profile.
- `src/lib/.supabase/server.ts` has a `// (browser)` header comment, but it is the server-only service-role client.
