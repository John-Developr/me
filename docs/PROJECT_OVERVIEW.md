# Project Overview

Personal portfolio of **John Carlo A. Ylanan** (Web & Mobile Developer, Cebu, PH).
Live: <https://johncarlo-portfolio.vercel.app>

---

## 1. Architecture at a Glance

| Concern | Implementation |
|---|---|
| Framework | Next.js **15.3.8**, **App Router**, Turbopack in dev |
| UI | React **19**, TypeScript 5 (`strict`) |
| Styling | Global CSS (`globals.css`) + CSS Modules. No Tailwind / CSS-in-JS |
| Font | Karla via `next/font/google` |
| Client state | React Context — `AppProvider` / `useApp()` (theme, `isMobile`, page loading, modal flag) |
| Data store | Supabase Postgres — table `ai_blogs`, RPC `get_least_inserted_category` |
| AI | Google Gemini (`@google/genai`, model `gemini-2.5-flash`) for chat and blog generation |
| Email | Nodemailer over Gmail SMTP |
| Markdown | `react-markdown` + `remark-gfm`, `react-syntax-highlighter` (Prism / dracula) in chat |
| Toasts | `sileo` (`<Toaster position="top-right" />`) |
| Hosting | Vercel, with a monthly cron (`vercel.json`) |

### Request flow

```
Browser ──► app/<route>/page.tsx (metadata, server)
              └─► containers/<route>-page (client UI)
                    └─► fetch(networkDefine.X)  ──► app/api/**/route.ts
                                                       └─► lib/.services/*Service
                                                             ├─► Supabase (ai_blogs)
                                                             ├─► Gemini
                                                             └─► Gmail SMTP
```

All content outside the blog (profile, about, stack, experience, featured project, contact details) is **hard-coded JSX** in the home-page section components. Only blog posts are dynamic.

---

## 2. Folder Tree

```
.
├── AGENTS.md / CLAUDE.md  AI-assistant rules (CLAUDE.md imports AGENTS.md)
├── docs/             Project docs: overview, design system, contributing, changelog
├── public/
│   ├── documents/        email-template.html (contact email; the resume is in the Media Library)
│   ├── images/           Avatar, Logo, Featured, Ph-Flag, NativeCamp
│   │   ├── company/      experience logos (Forty, Proweaver, UC, CodeTag)
│   │   └── tech/         tech-stack logos (react, next, node, supabase, firebase, …)
│   └── favicon.ico
├── src/
│   ├── app/              App Router: routes, API handlers, layout, sitemap
│   ├── components/       Shared UI
│   │   ├── chat/         ChatAI, ChatBox, ChatButton, MessageBubble, MessageInput
│   │   ├── clipboard/    CopyClipboard (email copy button)
│   │   ├── custom/       SkeletonImage
│   │   ├── footer/       Footer
│   │   ├── header/       Header, MenuItems, PageIntro
│   │   ├── hr/           HrHorizontal
│   │   ├── icons/        ~50 inline-SVG icon components + HomeIcons barrel
│   │   └── shapes/       Shape404
│   ├── config/           networkDefine (URLs/endpoints), storageKeys, assistantConfig
│   ├── containers/       Page-level UI, one folder per page
│   ├── docs/             Gemini system prompts (chat + blog)
│   ├── hooks/            useAnimateIn, useMediaQuery, useDebounce, useFadeOutRemove, useChatAssistant
│   ├── lib/
│   │   ├── .context/     AppContext (AppProvider, useApp)
│   │   ├── .services/    BlogService, ChatService, ContactService
│   │   └── .supabase/    Supabase client, Table + RPC name constants
│   ├── middleware.ts     Clears chat cookie on each page request
│   ├── styles/
│   │   ├── general/      globals.css (tokens, header, footer), component.module.css (chat, modal, skeleton, clipboard)
│   │   └── pages/        page, blog, contact, projects, techStack, 404, welcome modules
│   └── utils/            types.ts, general/helpers.ts, general/stringHelpers.ts
├── next.config.ts        devIndicators: false
├── vercel.json           cron: /api/cron/blog @ "0 0 1 * *"
└── tsconfig.json         strict, alias @/* → src/*
```

---

## 3. Routing

### Pages

| Route | Route file | Container | Notes |
|---|---|---|---|
| `/` | `app/page.tsx` | `containers/home-page` | Full SEO metadata, OG, Twitter |
| `/projects` | `app/projects/page.tsx` | `containers/projects-page` | Featured project, "More Projects." grid, contact CTA — published projects from Supabase (edit in `/admin/projects`) |
| `/tech-stack` | `app/tech-stack/page.tsx` | `containers/tech-stack-page` | "Right Now", Core Stack and Full Toolkit from Supabase (edit in `/admin/skills`) |
| `/blog` | `app/blog/page.tsx` | `containers/blog-page` | Category filter + sort, fetches `/api/blog` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | `containers/blog-detail-page` | Fetches `/api/blog/[slug]`, renders Markdown; shows 404 container if missing |
| `/contact` | `app/contact/page.tsx` | `containers/contact-page` | Inquiry-type + budget cards, POSTs `/api/contact` |
| *(404)* | `app/not-found.tsx` | `containers/404-page` | |
| `/sitemap.xml` | `app/sitemap.ts` | — | Lists `/`, `/blog`, `/contact` |
| `/opengraph-image`, `/contact/opengraph-image` | `app/opengraph-image.tsx`, `app/contact/opengraph-image.tsx` | — | 1200×630 share images, statically generated at build by `utils/general/ogImage.tsx` (dark tokens + avatar). Child routes inherit the root image |

Navigation is the header's kebab dropdown (`components/header/MenuItems.tsx`): Home, Projects, Tech Stack, Blogs, Contact, plus the Dark/Light toggle.

### API routes

| Method & Path | Handler → Service | Purpose |
|---|---|---|
| `GET /api/blog?category=&sort=asc\|desc` | `BlogService.getBlogs` | List posts (ordered by `generated_at`) |
| `GET /api/blog/recent` | `BlogService.getRecentBlogs` | Latest 2 posts (home page) |
| `GET /api/blog/[slug]` | `BlogService.findBySlug` | One post; increments `views` |
| `POST /api/chat` `{ message }` | `ChatService.index` | Gemini chat; history in httpOnly cookie `ai_conversation`; returns `"limit"` near 4KB |
| `DELETE /api/chat` | `ChatService.clearChatCookie` | Reset conversation |
| `POST /api/contact` | `ContactService.index` | Validate, sanitize, send email |
| `GET /api/cron/blog` | `BlogService.index` | Generate + upsert one AI post. Requires `Authorization: Bearer $CRON_SECRET` |

---

## 4. Component Map

### Root shell (`app/layout.tsx` → `app/LayoutProvider.tsx`)
```
<html> (inline themeScript adds .dark before paint)
 └─ <body class=karla>
     └─ AppProvider
         └─ LayoutProvider
             ├─ <Toaster/> (sileo)
             └─ Preloader  (WelcomeOverlay once/day, else SpinnerOverlay)
                 └─ .wrapper > main.content (max 970px)
                     ├─ {page}
                     └─ <ChatAI/> (fixed bottom-right)
```

### Home page (`containers/home-page/index.tsx`)
Each row is an `AnimatedSection` (uses `useAnimateIn`, staggered delays 50 / 150 / 220 / 280 ms):

| Row class | Contents |
|---|---|
| `Header` | Logo, phone, LinkedIn button, menu |
| `.first` | `DetailSection` — name, role, location, CTA buttons (Schedule a Call / Send Email), avatar + online indicator |
| `.second` | Desktop: left = `AboutSection` + `StackSection`, right = `ExperienceSection`. Mobile (≤850px): left = About + Experience, right = Stack |
| `.third` | `ProjectSection` — featured project (Gordon Bostic), "Built With" badges, browser-chrome image frame, Live/Source buttons |
| `.fourth` | `ConnectSection` (email copy, Calendly, contact form link, phone, resume download) + `BlogSection` (2 recent posts with skeleton/empty/error states) |
| `Footer` | Copyright year range + social icons |

### Other shared components
- `PageIntro` — subtitle / big uppercase title / intro paragraph for inner pages.
- `HrHorizontal` — divider; uses `--divider-bottom` in dark mode.
- `SkeletonImage` — `next/image` with shimmer class; cache-busts with `?t=`.
- `ChatAI` → `ChatButton` + `ChatBox` → `MessageBubble` (Markdown) + `MessageInput`; state via `useChatAssistant`.

---

## 5. Data & Content Architecture

| Content | Where it lives | How it renders |
|---|---|---|
| Profile / role / location | `home-page/detail-section/DetailSection.tsx` | From Supabase (edit in `/admin/profile`) |
| About | `home-page/about-section/AboutSection.tsx` | From Supabase (edit in `/admin/profile`) |
| Tech stack | `home-page/stack-section/StackSection.tsx` — the first 8 Core Stack tools | From Supabase (edit in `/admin/skills`), 2-col grid (1-col mobile) |
| Experience | `home-page/experience-section/ExperienceSection.tsx` — roles grouped by company, durations computed | From Supabase (edit in `/admin/experience`) |
| Featured project | `home-page/project-section/ProjectSection.tsx` | Featured project from Supabase (edit in `/admin/projects`) |
| Contact details / socials | `ConnectSection.tsx`, `Header.tsx`, `Footer.tsx` | From Supabase (edit in `/admin/profile`) |
| Blog posts | Supabase `ai_blogs` (shape = `AIBlogResponse` in `utils/types.ts`) | Client fetch → API → Supabase |
| Chat persona | `src/docs/system-instruction.md` | Read by `/api/chat` |
| Blog prompt | `src/docs/blog-instruction.md` + Zod schema in `ChatService.blogMain` | Read by `/api/cron/blog` |

### Blog record (`ai_blogs`)
```ts
interface AIBlogResponse {
  id: number;
  title: string;
  slug?: string;          // unique; upsert conflict key
  category?: "technology" | "study" | "life" | "future";
  content?: string;       // Markdown
  excerpt: string;
  tags: string[];
  reading: number;        // minutes
  views?: number;         // incremented on detail fetch
  generated_at: string;   // ISO timestamp (DB default)
}
```
The cron picks the category via RPC `get_least_inserted_category` (falls back to random) so categories stay balanced.

---

## 6. Setup & Local Development

**Prerequisites:** Node.js 18.18+ (developed on Node 22), npm.

```bash
git clone https://github.com/John-Developr/me.git
cd me
npm install
cp .env.example .env      # fill in values
npm run dev               # http://localhost:3000 (Turbopack)
```

| Script | Command |
|---|---|
| `npm run dev` | `next dev --turbopack` |
| `npm run build` | `next build` |
| `npm run start` | `next start` |
| `npm run lint` | `next lint` (ESLint 9, `next/core-web-vitals` + `next/typescript`) |

Without Supabase/Gemini/Gmail credentials the static pages still render; blog lists show their error state, chat replies with its fallback message, and contact submissions fail.

To trigger blog generation locally:
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/blog
```

### Environment variables

See [`.env.example`](../.env.example).

| Variable | Scope | Used by |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | public | Metadata canonicals/OG, `sitemap.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | public | `lib/.supabase/server.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Present in env; not currently read by code |
| `NEXT_SECRET_SUPABASE_ROLE_KEY` | server | Supabase client key |
| `NEXT_SECRET_GEMINI_API_KEY` | server | `ChatService` |
| `GMAIL_USER_EMAIL` | server | `ContactService` (sender + recipient) |
| `GMAIL_APP_PASSWORD` | server | `ContactService` |
| `CRON_SECRET` | server | `/api/cron/blog` auth |

---

## 7. Deployment

- **Platform:** Vercel (Next.js preset, no custom build settings).
- **Env vars:** set every variable above in the Vercel project. Vercel sends `CRON_SECRET` automatically as the cron bearer token when it's defined.
- **Cron:** `vercel.json` runs `GET /api/cron/blog` at `0 0 1 * *` (00:00 UTC on the 1st of each month).
- **Branches:** `main` is production; feature branches (e.g. `static-layout-minimalist`, `liquid-glass`) merge via pull request.
- **Supabase prerequisites:** table `ai_blogs` with the columns above (`slug` unique, `views` default 0, `generated_at` default `now()`), and the RPC `get_least_inserted_category()` returning a category string.
