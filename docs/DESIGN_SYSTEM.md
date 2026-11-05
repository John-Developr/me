# Design System

A catalog of the design **as currently implemented**. This is descriptive, not aspirational — when adding UI, reuse what's here. Source files:

- Tokens & global UI: `src/styles/general/globals.css`
- Shared component styles: `src/styles/general/component.module.css`
- Page styles: `src/styles/pages/*.module.css`

Aesthetic: minimalist, card-based single column; soft neutral greys in light mode, GitHub-style dark palette with an electric-blue accent in dark mode.

---

## 1. Theming

- Light tokens on `:root`; dark overrides on **`.dark`** (class on `<html>`).
- Initial theme: `localStorage["theme_preference"]`, falling back to `prefers-color-scheme`. Applied by an inline script in `<head>` (no flash), then synced by `AppProvider`.
- Toggle: `useApp().toggleTheme()` (header menu → Dark Mode / Light Mode).
- `body` transitions `background 0.2s ease, color 0.3s ease`.

---

## 2. Color Tokens

### Surfaces & text

| Token | Light (`:root`) | Dark (`.dark`) | Use |
|---|---|---|---|
| `--bg` | `#f2f2f2` | `#0d1117` | Page background |
| `--text` | `#000000` | `#f8fafc` | Body text |
| `--container-bg` | `rgb(255, 255, 255)` | `#161b22` | Cards / sections / chat panel |
| `--container-back-drop-filter` | `blur(24px) saturate(200%)` | `unset` | Card backdrop |
| `--text-header` | `var(--bg-primary)` → `rgb(40, 42, 54)` | `#e6edf3` | Section headings, card titles |
| `--text-sub` | `#999898` | `#484f58` | Sub-labels, dates, intro copy |
| `--text-muted` | `#7d8590` | `#7d8590` | Meta text, footer, hints |
| `--divider-bottom` | `rgb(225, 225, 225)` | `#30363d` | Dividers, list separators |

### Brand / actions

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg-primary` | `rgb(40, 42, 54)` (charcoal `#282a36`) | `#476fff` (blue) | Primary buttons, active chips, user chat bubble |
| `--primary-hover-color` | `#363636` | `#476fff86` | Primary hover |
| `--primary-btn-box-shadow` | `0 2px 10px rgba(0,0,0,0.35)` | `0 4px 16px rgba(79,124,255,0.35)` | Primary/floating button shadow |
| `--bg-secondary` | `#ffffff` | `#f5f5f5` | Secondary surface |
| `--secondary-hover-color` | `#e1e1e1` | `#e1e1e1` | Secondary hover |
| `--text-secondary` | `black` | `#e8e7e7` | Secondary (unfilled) button text |

### Borders, badges, misc

| Token | Light | Dark |
|---|---|---|
| `--border-container` | `1px solid #eaeaea` | `1px solid #3d404c46` |
| `--border-input-field` | `1px solid #e1e1e1` | `1px solid #3d404c46` |
| `--border-line-theme` | `1px solid #eee` | *(inherits light)* |
| `--badges-border` | `1px solid #e5e7eb` | `1px solid #30363d` |
| `--badges-bg` | `none` | `none` |
| `--badges-text` | `#000000` | `#7d8590` |
| `--sub-exp-indicator` | `1.5px solid #686868` | `1.5px solid #ffffff` |
| `--box-shadow-default` | `0 4px 20px -4px rgba(0,0,0,.08)` | *(inherits light)* |
| `--experience-box-shadow` | `0 1px 6px -3px rgba(0,0,0,0.93)` | `0 1px 6px -3px rgba(255,255,255,0.93)` |
| `--clip-hover` | `rgb(235, 235, 235)` | `#30363d` |
| `--chat-buble-bg` | `#f2f2f2` | `#27272742` |
| `--chat-buble-after` | `#f2f2f2` | `#1a1e23` |
| `--disabled-input-bg` | `#f0f0f0` | `#3d404c46` |
| `--skeleton-base` | `#f1f1f1` | `#1e2330` |
| `--skeleton-shine` | `#e4e4e4` | `#252b3b` |
| `--logo-filter` | `unset` | CSS filter chain tinting the logo blue |

### Fixed (non-token) colors in use

These are hard-coded in existing CSS. Reuse them only in the same role.

| Color | Role |
|---|---|
| `#476fff` | LinkedIn header button (`.header .linkend`), = dark primary |
| `#42dd88` + `rgba(34,197,94,0.6)` | Avatar online indicator + pulse |
| `#ff5f56` / `#ffe312` / `#4ed459` | Browser-chrome dots on project image |
| `rgb(41, 41, 134)` | `.github-path-section` link |
| `#777` | Home "See More" links |
| `#DBDBDB` | Inner-page subtitle (`.other-page .page-title h3`) |
| `rgba(15,15,20,0.6)` + white text | Header menu dropdown (glass, same in both themes) |
| `rgb(254,221,36)` / `rgb(41,137,255)` | Sun / moon icon in theme toggle |
| `rgb(10,102,194)` | Share buttons on blog detail |
| `rgb(155,154,154)` → hover `rgb(105,105,105)` | Blog detail "back" link |

---

## 3. Typography

| Property | Value |
|---|---|
| Family | **Karla** (`next/font/google`, latin, exposed as `--font-karla` on `<body>`) — CSS: `font-family: var(--font-karla), sans-serif` on `*`, `font-optical-sizing: auto` |
| Monospace | `Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace` (chat tables); code blocks use Prism `dracula` theme |
| Body line-height | `25px` in home cards; `30px` in hero |

### Type scale (as used)

| Element | Size / weight |
|---|---|
| 404 heading | `80px` |
| Inner-page title (`.other-page h1`) | `45px`, `800`, uppercase |
| Welcome overlay name | `2.5rem` (`1.6rem` ≤850px) |
| Featured project name | `30px`, `700` |
| Hero role (`.first .role`) | `26px`, `bolder` (`clamp(1rem, 5.5vw, 3.5rem)` ≤462px) |
| Inner-page subtitle | `25px`, uppercase, `#DBDBDB` |
| Blog detail title | `1.70rem` |
| Blog list card title | `1.50rem` |
| Hero name | `20px` |
| Home blog card title | `18px` |
| Section title (`.title h3`) | `15px`, color `--text-header` |
| Tech card name (`h5`) | `15px` |
| Small UI / buttons | `13–14px` |
| Meta (dates) | `11px` |
| Tag chips | `10px` (home) |

Section headings are short and end with a period: **About Me. · Tech Stack. · Experience. · Recent Projects. · Connect. · Recent Blog post.**

---

## 4. Spacing, Radii, Elevation

**Spacing (recurring values):** `5 · 10 · 15 · 20 · 30 · 40px`. Card padding `30px`; gap between home rows `20px` (`.content { row-gap: 20px }`); column gaps `20px` (rows) / `40px` (hero, project).

**Border radius:**

| Radius | Used on |
|---|---|
| `50%` / `100%` | Circular icon buttons, avatars in chat, indicator dots |
| `100px` | Chat launcher pill, blog category filter chips |
| `20px` | Hero avatar, projects card |
| `15px` | Contact form inputs |
| `12px` | Home section cards, header dropdown |
| `10px` | Project action buttons, resume button, chat panel, contact cards, `.btn` |
| `8px` | Hero CTA buttons, tech cards, badges/tags |
| `5–6px` | Small controls, skeleton bars, company logos |

**Elevation:** `--box-shadow-default` for hover lift on cards (with `transform: translateY(-2px)`); `--primary-btn-box-shadow` on primary/floating buttons. Home section cards have no border/shadow at rest — separation comes from `--container-bg` vs `--bg`.

---

## 5. Layout

| Spec | Value |
|---|---|
| Page wrapper | `.wrapper { margin-top: 50px; padding: 0 20px }` |
| Content column | `.wrapper .content { max-width: var(--content-based-width) /* 970px */; margin: 0 auto; display: flex; flex-direction: column; row-gap: 20px }` |
| Inner pages | `.other-page { margin-top: 70px }` via `PageIntro` |
| Home grid | Flex rows: `.first` (hero) · `.second` (content + 240px experience column) · `.third` (project) · `.fourth` (250px connect + blog) |

### Breakpoints

| Breakpoint | Source | Effect |
|---|---|---|
| **`max-width: 850px`** | CSS + `useMediaQuery(850)` → `isMobile` | Rows stack to a single column; tech grid 1-col; footer stacks (`column-reverse`); avatar moves top-right; project image moves inline; contact form full width |
| `max-width: 462px` | `page.module.css` | Hero role font becomes fluid `clamp()` |

This is the only breakpoint system. Don't add others.

---

## 6. Components

### Section card (home)
```css
padding: 30px; border-radius: 12px; position: relative;
background: var(--container-bg); backdrop-filter: var(--container-back-drop-filter);
```
Header: `div.title` (flex, `column-gap: 10px`, `margin-bottom: 20px`) with a 20×20 icon + `h3`. Optional "See More" link absolutely positioned bottom-right (`right: 15px; bottom: 13px`, 13px, `#777`, 15px arrow icon).

### Buttons

| Variant | Spec |
|---|---|
| **Primary** | `background: var(--bg-primary); color: white; border: none; height: 35px (hero/project/resume) or 40px (contact .btn); padding 0 16–20px; radius 8–10px; font-weight: 500; hover → var(--primary-hover-color)` |
| **Secondary** | No fill, `color: var(--text-secondary)`, same size as primary |
| **Liquid glass** (global) | `.liquid_glass_btn` — translucent white (`rgba(255,255,255,0.12)`), white 28% border, `backdrop-filter: blur(20px) saturate(180%)`, inset highlights; hover `scale(1.1)`, active `scale(1)`. Applied on hero CTAs, project actions, resume button |
| **Liquid glass icon** (global) | `.liquid_glass` — same glass recipe, `blur(50px)`, hover `scale(1.28)`. Used on 35×35 circular header buttons |
| **Chat launcher** | Pill `180×40`, radius `100px`, `--bg-primary`, collapses to a 40px circle when open; hover `scale(1.12)` |
| **Filter chip** | `padding: 5px 12px; border: var(--badges-border); radius: 100px; bg: var(--container-bg)`; active = `--bg-primary` fill, white bold text |

### Badges / tags
`border: var(--badges-border); background: var(--badges-bg); color: var(--badges-text); border-radius: 8px;` Sizes: home blog tags `3px 7px / 10px`, "Built With" `5px 16px / 17px` (radius 10px) with 14px logo.

### Tech card
`li.tech-list` — flex, 25×25 logo, `h5` 15px + 10px one-line description in `--text-sub`; `padding: 10px 15px; border: var(--badges-border); radius: 8px`. 2-col grid, `10px` gaps.

### Experience timeline
Company row: 25×25 logo (radius 5px, `--experience-box-shadow`, 3px padding) + name `h4` (`--text-header`) + date (11px `--text-sub`). Sub-roles: hollow 10px circle (`--sub-exp-indicator`) with a 1px connector line; companies separated by 1px `--divider-bottom` lines.

### Blog card (home)
Padding `20px 25px`, transparent border; hover lifts `-2px`, adds `--box-shadow-default`, `--badges-border`, radius 10px. Title one-line ellipsis 18px; meta 11px `--text-muted` with `•` separator; excerpt 2-line clamp 15px.

### Skeleton loaders
Shimmer gradient `var(--skeleton-base) 25% → var(--skeleton-shine) 50% → var(--skeleton-base) 75%`, `background-size: 200% 100%`, `1.4s ease-in-out infinite`, radius 4–10px. (`SkeletonImage` uses an older white→`#cacaca` shimmer in `component.module.css`.)

### Empty / error states
Centered column, max height 350px: title 20px/600 `--text-header`, description 15px `--text-sub` (line-height 1.6), hint 11px `--text-muted`.

### Header dropdown (menu)
`200px` wide, radius 12px, glass `rgba(15,15,20,0.6)` + `blur(24px) saturate(200%)`, white text, items `10px` padding separated by `rgba(255,255,255,0.1)` lines; opens with `dropdownOpen` (scale 0.92→1, 0.2s).

### Modal (side drawer)
`component.module.css`: overlay `rgba(0,0,0,0.4)`, z-index 2000; 500px panel sliding in from the right (`translateX(100%) → 0`, 0.35s); fixed header/footer with `1px solid rgb(224,224,224)` borders; footer buttons radius 10px (cancel `#f2f2f2`, confirm `--bg-primary`).

### Chat panel
`400×500`, radius 10px (bottom-right 0) with a speech-tail, `--container-bg`, `--border-container`, `--box-shadow-default`. Assistant bubble `--chat-buble-bg`, user bubble `--bg-primary` + white; 13px text, max width 250px. Input is a pill (`radius 50px`) with a 30px circular send button.

### Forms (contact)
Inputs: radius `15px`, `var(--border-input-field)`, 16px text, `--bg` background; focus → border `--text` + `0 0 0 .2rem rgba(0,0,0,0.388)` ring; floating label color `--text-sub` → `--text` on focus. Selection cards: radius 10px, `--border-container`, hover/active border `--bg-primary`.

---

## 7. Motion

| Name | Spec | Where |
|---|---|---|
| `useAnimateIn` | opacity 0→1, `translateY(20px)→0`, default 500ms (home uses 600ms), IntersectionObserver threshold 0.1, once | Home rows (delays 50/150/220/280ms), `PageIntro` (30ms), blog list (120ms), contact form (200ms) |
| `dropdownOpen` | scale .92→1, translateY -8→0, 0.2s `cubic-bezier(0.16,1,0.3,1)` | Header menu |
| `pulse` | scale 1→2, fade, 1s infinite | Online indicator |
| `wiggle` / `spinOnce` | ±20° rotate 1.5s / 360° 0.3s | Chat launcher icon |
| `slideUpFadeIn` / `slideDownFadeIn` | translateY 30px, 0.3s / 0.1s | Chat panel open/close |
| `blink` | 1.4s staggered dots | Chat typing indicator |
| `blogSectionShimmer` | 1.4s | Skeletons |
| Glass hover | `transform 0.3s cubic-bezier(0.22,1,0.36,1)` | `.liquid_glass*` |
| Welcome overlay | typing + caret blink in `--bg-primary`, fades out after 5s | Once per day |

---

## 8. Iconography & Imagery

- Icons: `src/components/icons/*.tsx`, 24×24 viewBox (some 25), `stroke="currentColor"`, `strokeWidth 1.5`, rounded caps/joins. Sizes: 15 (menu, see-more), 17.5 (header/footer), 18 (buttons), 20 (section titles).
- Logo: `public/images/Logo.png` at 75×17; tinted blue in dark mode via `--logo-filter`.
- Avatar: 75×75, radius 20px, `box-shadow: 1px 1px 20px -3px #000000bf`.
- Tech logos 25×25 (cards) / 14×14 (badges) in `public/images/tech/`; company logos 25×25 in `public/images/company/`.
