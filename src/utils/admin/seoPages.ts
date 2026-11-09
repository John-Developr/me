/** Public pages whose SEO is edited in Admin → SEO Settings (CHECK constraint on seo_pages.key). */
export const SEO_PAGES = [
  { key: "home",       label: "Home",       path: "/" },
  { key: "projects",   label: "Projects",   path: "/projects" },
  { key: "tech-stack", label: "Tech Stack", path: "/tech-stack" },
  { key: "blog",       label: "Blog",       path: "/blog" },
  { key: "contact",    label: "Contact",    path: "/contact" },
] as const;

export type SeoPageKey = (typeof SEO_PAGES)[number]["key"];

export const SEO_PAGE_KEYS = SEO_PAGES.map((p) => p.key) as [SeoPageKey, ...SeoPageKey[]];

/** Where Google typically cuts off titles and descriptions (characters). */
export const SEO_LIMITS = { title: 60, description: 160 } as const;
