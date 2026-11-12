/* ============================================================
   ADMIN PAGE HEADERS
   ------------------------------------------------------------
   Title + description of each admin list screen, shared by the
   screen itself and its loading.tsx skeleton so both show the
   same header (no jump when the data arrives).
   ============================================================ */

export const ADMIN_PAGE_HEADERS = {
  projects:   { title: "Projects",              description: "Everything here appears on your portfolio's Projects page once published." },
  blog:       { title: "Blog",                  description: "AI-generated and personal posts. Only published posts appear on your blog." },
  experience: { title: "Work Experience",       description: "Your career timeline: the “Experience.” card on the home page." },
  skills:     { title: "Skills & Technologies", description: "Your tech stack on /tech-stack and the home page. Logos here also show on project chips." },
  media:      { title: "Media Library",         description: "Images and documents used across your portfolio. Choose them from any image field." },
  messages:   { title: "Contact Messages",      description: "Messages sent through your portfolio's contact form. Each one is also emailed to you." },
  analytics:  { title: "Analytics",             description: "Anonymous, cookie-free visit stats for your portfolio." },
} as const;

export type AdminPageKey = keyof typeof ADMIN_PAGE_HEADERS;
