# 👨‍💻 johncarlo — Personal Portfolio

A personal developer portfolio built with **Next.js** and **TypeScript**, showcasing my projects, skills, work experience, and blog — deployed on Vercel.

🌐 **Live:** [johncarlo-portfolio.vercel.app](https://johncarlo-portfolio.vercel.app)

---

## ✨ Features

- **Animated sections** — smooth bottom-to-top entrance animations with staggered delays
- **Responsive layout** — adaptive two-column layout that reflows for mobile viewports
- **AI-powered blog** — blog posts generated and served via an AI pipeline
- **Project showcase** — curated list of personal and side projects
- **Dark/light aware** — clean CSS module architecture for easy theming
- **Fast & optimised** — built on Next.js App Router with static generation where possible

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14+](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | CSS Modules |
| Deployment | [Vercel](https://vercel.com) |
| AI Blog | Gemini API via `/api/chat` |

---

## 🚀 Getting Started

### Prerequisites

- Node.js `18+`
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/John-Developr/me.git
cd me

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── page.tsx          # Home page
│   └── blog/[slug]/      # Dynamic blog post pages
├── components/           # Reusable UI components
│   ├── header/
│   ├── footer/
│   ├── icons/
│   └── custom/
├── hooks/                # Custom React hooks
│   ├── useAnimateIn.ts   # Scroll-triggered entrance animation
│   └── useMediaQuery.ts  # Responsive breakpoint detection
├── styles/               # CSS Modules
├── utils/                # Helpers and type definitions
├── config/               # App-wide configuration
└── lib/                  # Context providers and shared logic
```

---

## 📝 Environment Variables

Create a `.env.local` file in the root:

```env
# Add your environment variables here
GEMINI_API_KEY=your_key_here
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Built and designed by <strong>John Carlo</strong></p>