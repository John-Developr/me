# Contributing

How to add content and features to the portfolio without breaking the existing design. Read [AGENTS.md](../AGENTS.md) for coding rules and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for tokens.

> **Content model:** apart from blog posts, all portfolio content is hard-coded JSX in `src/containers/home-page/*-section/`. There is no CMS, JSON, or MDX layer. To add content you copy an existing markup block and edit it.

---

## 1. Adding Content

### 1.1 Skills & Technologies

Edit in **Admin → Skills & Technologies**: add skills to categories, tick **Core Stack** (with a one-line description) to feature a tool on `/tech-stack` and, for the first 8, on the home page; tick **Using right now** for the "Right Now" chips. The logo you set shows on every chip with that tool's name.

### 1.2 Profile, projects, experience and images (admin)

This content lives in Supabase and is edited in the admin at `/admin` (sign in at `/admin/login`). Don't hard-code it.

| What | Where in the admin | Shown on |
|---|---|---|
| Name, headline, location, photo, bio, email, phone, booking link, resume, social links | Personal Profile | Home hero, About Me, Connect, header and footer on every page |
| Projects (featured, order, published/draft) | Projects | `/projects`, home "Recent Projects." |
| Work, education and milestones | Work Experience | Home "Experience." (grouping and durations are automatic) |
| Skills, categories, Core Stack, "Right now", tech logos | Skills & Technologies | `/tech-stack`, home "Tech Stack." (first 8 core tools), logos on tech chips everywhere |
| Images and PDFs | Media Library (or the "Library" button on any image field) | Wherever they're picked |

Changes go live when you save. Tech chips (projects, tech stack) show a logo when a skill with that exact name has one.

### 1.4 Blog posts

Blog posts are **AI-generated**, not hand-written. Monthly, Vercel Cron calls `/api/cron/blog`, which asks Gemini for a post (prompt: `src/docs/blog-instruction.md`) and upserts it into Supabase `ai_blogs` by `slug`.

Schema (validated with Zod in `ChatService.blogMain`; type `AIBlogResponse` in `src/utils/types.ts`):

| Field | Type | Rules |
|---|---|---|
| `title` | string | 8–12 words recommended |
| `slug` | string | 3–5 lowercase hyphenated words, ≤40 chars, **unique** |
| `category` | enum | `technology` \| `study` \| `life` \| `future` |
| `content` | string | Markdown (GFM), 300–400+ words |
| `excerpt` | string | 30–50 words |
| `tags` | string[] | 3–5 |
| `reading` | number | minutes |
| `views` | number | DB-managed, default 0 |
| `generated_at` | string | DB-managed timestamp |

To add a post manually, insert a row in Supabase with the fields above. To add a **category**, update `BlogCategoryEnum` (`utils/types.ts`), the Zod enum and prompt in `ChatService`, the category list in `containers/blog-page/index.tsx`, and the Supabase RPC.

### 1.5 Contact details & links

Email, phone, booking (Calendly) link, resume and social links are edited in **Admin → Personal Profile**. `src/config/networkDefine.ts` only holds the site's own API paths.

---

## 2. Adding Features

Follow the workflows in [AGENTS.md §4](../AGENTS.md#4-workflow-rules). Summary:

- **New page:** `app/<route>/page.tsx` (metadata only) → `containers/<route>-page/index.tsx` → `styles/pages/<route>.module.css` → add to `MenuItems.tsx` and `sitemap.ts`.
- **New API:** service in `lib/.services/` → `app/api/<name>/route.ts` → path in `networkDefine`.
- **New icon:** add `src/components/icons/<Name>.tsx` using the existing SVG pattern (`currentColor`, spreads `props`); add to `HomeIcons` in `icons/index.tsx` if used across home sections.
- **New env var:** add to `.env.example` and the table in [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md#environment-variables).

---

## 3. Pull Requests

### Branches
- `main` = production (auto-deployed by Vercel).
- Work on a feature branch named in kebab-case describing the change (e.g. `liquid-glass`, `static-layout-minimalist`), then open a PR into `main`.

### Commits
Short, imperative, sentence-case summaries, e.g. `Fix logo not showing`, `Add Firebase to tech stack`.

### Checklist (every PR)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes (type-checks included)
- [ ] Checked in **light and dark** mode
- [ ] Checked at **≤850px** and desktop widths
- [ ] Only existing CSS tokens used for color; no new breakpoints
- [ ] New URLs added to `networkDefine`; new env vars added to `.env.example`
- [ ] No secrets, `.env`, or `.DS_Store` files committed
- [ ] `docs/CHANGELOG.md` updated under **Unreleased** for user-visible changes
- [ ] Screenshots attached for UI changes

There is no automated test suite; lint + build + manual visual check are the validation gate.
