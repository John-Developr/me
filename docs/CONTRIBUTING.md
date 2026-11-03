# Contributing

How to add content and features to the portfolio without breaking the existing design. Read [AGENTS.md](../AGENTS.md) for coding rules and [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for tokens.

> **Content model:** apart from blog posts, all portfolio content is hard-coded JSX in `src/containers/home-page/*-section/`. There is no CMS, JSON, or MDX layer. To add content you copy an existing markup block and edit it.

---

## 1. Adding Content

### 1.1 Add a tech-stack skill

File: `src/containers/home-page/stack-section/StackSection.tsx`

1. Add a logo PNG to `public/images/tech/` (lowercase filename, square, shown at 25×25).
2. Copy an existing `<li>` inside `ul.tech-container`:

```tsx
<li className={styles["tech-list"]}>
    <Image
     src="/images/tech/<logo>.png"
     width={25}
     height={25}
     alt="<Tech Name>"
     className={styles["tech-image"]} />
    <div className={styles["tech-detail"]}>
        <h5><Tech Name></h5>
        <p><one-line description, ~45 chars — it is clamped to 1 line></p>
    </div>
</li>
```

Keep an even number of items so the 2-column grid stays balanced on desktop.

### 1.2 Add a work-experience entry

File: `src/containers/home-page/experience-section/ExperienceSeciton.tsx` (filename is intentionally unchanged)

1. Add the company logo to `public/images/company/` (shown at 25×25).
2. Entries are newest-first. Pick the pattern:

**Single role** (`no-sub`):
```tsx
<li className={styles["no-sub"]}>
    <div className={styles["ex-name-date-profile"]}>
        <Image src="/images/company/<Logo>.png" width={25} height={25} alt="Company Logo" />
        <section>
            <h4><Company, Inc.></h4>
            <p className={styles["ex-pos"]}><Position></p>
            <p className={styles["ex-date"]}>MM / YYYY - MM / YYYY</p>
        </section>
    </div>
</li>
```

**Multiple roles at one company** (`has-sub`):
```tsx
<li className={styles["has-sub"]}>
    <div className={styles["ex-name-date-profile"]}>
        <Image src="/images/company/<Logo>.png" width={25} height={25} alt="Company Logo" />
        <section>
            <h4><Company, Inc.></h4>
            <p className={styles["ex-date"]}>MM / YYYY - Present</p>
        </section>
    </div>
    <ul>
        <li>
            <p className={styles["ex-pos"]}><Most recent role></p>
            <p className={styles["ex-date"]}>For N Months</p>
        </li>
        {/* older roles below */}
    </ul>
</li>
```

Date format: `MM / YYYY` with spaces around the slash; durations as `For N Years and N Months`.

### 1.3 Update the featured project

File: `src/containers/home-page/project-section/ProjectSection.tsx`

- Name / tagline: `ProjectDetail` → `h1` / `h2`.
- Description: `.about-auth` → `p`.
- "Built With" badges: copy an `<li>` with a 14×14 logo from `public/images/tech/`.
- Screenshot: replace `public/images/Featured.png` (rendered at 250×170 desktop, full-width × 270px mobile).
- Links: add `<NAME>_PROJECTS_URL` / `<NAME>_GITHUB_URL` to `src/config/networkDefine.ts` and reference them in `Action()`. Don't inline URLs.

The `/projects` page is currently a placeholder; a project list there should reuse the `projects.module.css` `.list` / `.card` classes.

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

All external URLs and API paths live in `src/config/networkDefine.ts`. Phone number appears in `Header.tsx` and `ConnectSection.tsx`; email in `ConnectSection.tsx` and `components/clipoard/index.tsx`. Resume: replace `public/documents/resume.pdf`.

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
