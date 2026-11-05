<h1 align="center">John Carlo Ylanan — Portfolio</h1>

<p align="center">
  Personal portfolio of a Web &amp; Mobile Developer based in Cebu, Philippines —<br/>
  projects, experience, tech stack, an AI-written blog, and an AI chat assistant.
</p>

<p align="center">
  <a href="https://johncarlo-portfolio.vercel.app"><img alt="Live" src="https://img.shields.io/badge/live-johncarlo--portfolio.vercel.app-476fff?style=flat-square" /></a>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15.3-000000?style=flat-square&logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel" />
</p>

---

## Features

- **Minimal card layout** in light and dark themes, with no flash on load
- **Staggered, scroll-triggered entrance animations**
- **AI blog**: a monthly Vercel Cron job has Gemini write a post and stores it in Supabase; readers can filter by category and sort by date
- **"Chat with John"**: a floating Gemini-powered assistant that renders Markdown and code
- **Contact form**: inquiry-type and budget pickers, sent through Gmail SMTP
- **Responsive layout** with a single 850px breakpoint
- **SEO**: per-page metadata, Open Graph and Twitter cards, and a sitemap

## Tech Stack

| | |
|---|---|
| **Framework** | Next.js 15 (App Router, Turbopack dev) · React 19 · TypeScript |
| **Styling** | Global CSS tokens + CSS Modules · Karla font |
| **Data** | Supabase (Postgres) |
| **AI** | Google Gemini via `@google/genai` |
| **Email** | Nodemailer (Gmail SMTP) |
| **Other** | react-markdown, remark-gfm, react-syntax-highlighter, sileo toasts |
| **Hosting** | Vercel + Vercel Cron |

## Quickstart

```bash
git clone https://github.com/John-Developr/me.git
cd me
npm install
cp .env.example .env   # fill in Supabase, Gemini, Gmail, and cron values
npm run dev            # http://localhost:3000
```

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Build for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

Without credentials the static pages still render; the blog, chat, and contact form need their services configured. See [Environment variables](docs/PROJECT_OVERVIEW.md#environment-variables).

## Project Structure

```
src/
├── app/          routes, API handlers (blog, chat, contact, cron), layout, sitemap
├── containers/   page-level UI (home-page/*-section, blog-page, contact-page, …)
├── components/   shared UI (header, footer, chat, icons, …)
├── lib/          AppContext, services (Blog/Chat/Contact), Supabase client
├── config/       networkDefine (URLs), storageKeys, assistantConfig
├── hooks/        useAnimateIn, useMediaQuery, useDebounce, …
├── styles/       globals.css (design tokens) + CSS Modules
├── docs/         Gemini system prompts
└── utils/        shared types and helpers
```

## Documentation

| Doc | What's inside |
|---|---|
| [PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) | Architecture, folder tree, routing, component map, data model, env vars, deployment |
| [DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Color tokens (light/dark), typography, spacing, breakpoints, component specs, motion |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Adding skills, experience, projects, blog schema, PR checklist |
| [AGENTS.md](AGENTS.md) | Rules for AI coding assistants (also loaded through `CLAUDE.md`) |
| [CHANGELOG.md](docs/CHANGELOG.md) | Release history |

## Deployment

The site deploys to Vercel from `main`. Add the variables from `.env.example` to the Vercel project. The blog cron in `vercel.json` calls `/api/cron/blog` at 00:00 UTC on the 1st of each month and authenticates with `CRON_SECRET`.

---

<p align="center">Built and designed by <strong>John Carlo A. Ylanan</strong></p>
