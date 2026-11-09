import { sileo } from "sileo";

import { AdminIcons, AdminIconComponent } from "@/components/icons/admin";
import { BASE_URL } from "@/config/siteUrl";

/* ============================================================
   ADMIN NAVIGATION
   ------------------------------------------------------------
   Single source for the sidebar, breadcrumb and quick actions.
   `kind: "soon"` items are placeholders: they render disabled
   with a "Soon" badge and explain themselves when clicked.
   Flip one to `kind: "route"` with an `href` once its screen ships.
   ============================================================ */

export const ADMIN_HOME = "/admin";

export type AdminNavItem =
  | { key: string; label: string; icon: AdminIconComponent; kind: "route";    href: string }
  | { key: string; label: string; icon: AdminIconComponent; kind: "external"; href: string }
  | { key: string; label: string; icon: AdminIconComponent; kind: "soon" };

export interface AdminNavGroup {
  title: string | null;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: null,
    items: [
      { key: "overview", label: "Overview",          icon: AdminIcons.LayoutGrid, kind: "route",    href: ADMIN_HOME },
      { key: "preview",  label: "Portfolio Preview", icon: AdminIcons.Eye,        kind: "external", href: BASE_URL },
    ],
  },
  {
    title: "Content Management",
    items: [
      { key: "profile",        label: "Personal Profile",      icon: AdminIcons.User,          kind: "route", href: "/admin/profile" },
      { key: "projects",       label: "Projects",              icon: AdminIcons.Folder,        kind: "route", href: "/admin/projects" },
      { key: "experience",     label: "Work Experience",       icon: AdminIcons.Briefcase,     kind: "route", href: "/admin/experience" },
      { key: "skills",         label: "Skills & Technologies", icon: AdminIcons.Code,          kind: "route", href: "/admin/skills" },
      { key: "education",      label: "Education",             icon: AdminIcons.GraduationCap, kind: "soon" },
      { key: "certifications", label: "Certifications",        icon: AdminIcons.Award,         kind: "soon" },
      { key: "services",       label: "Services",              icon: AdminIcons.Layers,        kind: "soon" },
      { key: "testimonials",   label: "Testimonials",          icon: AdminIcons.Quote,         kind: "soon" },
    ],
  },
  {
    title: "Communication",
    items: [
      { key: "messages", label: "Contact Messages", icon: AdminIcons.Mail, kind: "soon" },
    ],
  },
  {
    title: "Insights",
    items: [
      { key: "analytics", label: "Analytics", icon: AdminIcons.BarChart, kind: "route", href: "/admin/analytics" },
    ],
  },
  {
    title: "System",
    items: [
      { key: "media",    label: "Media Library",    icon: AdminIcons.Image,    kind: "route", href: "/admin/media" },
      { key: "seo",      label: "SEO Settings",     icon: AdminIcons.Globe,    kind: "route", href: "/admin/seo" },
      { key: "account",  label: "Account Settings", icon: AdminIcons.Settings, kind: "route", href: "/admin/account" },
    ],
  },
];

/** Every item, flattened (for lookups by key). */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV.flatMap((group) => group.items);

/** Whether a route item is the current page or one of its sub-pages (Overview: exact only). */
export const isNavItemActive = (item: AdminNavItem, pathname: string): boolean =>
  item.kind === "route" &&
  (pathname === item.href || (item.href !== ADMIN_HOME && pathname.startsWith(`${item.href}/`)));

/** The route item matching a pathname, for the breadcrumb and active state. */
export const findActiveNavItem = (pathname: string): AdminNavItem | undefined =>
  ADMIN_NAV_ITEMS.find((item) => isNavItemActive(item, pathname));

export interface Breadcrumb {
  label: string;
  href?: string;   // omitted for the current page
}

/** "Admin / Projects / Edit" — section from the nav, last segment from the URL. */
export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  const section = findActiveNavItem(pathname);
  if (!section || section.kind !== "route") return [{ label: "Admin" }, { label: "Admin" }];

  const crumbs: Breadcrumb[] = [{ label: "Admin", href: ADMIN_HOME }];

  if (pathname === section.href) return [...crumbs, { label: section.label }];

  const last = pathname.split("/").filter(Boolean).at(-1);
  const sub  = last === "new" ? "New" : last === "edit" ? "Edit" : null;

  return [...crumbs, { label: section.label, href: section.href }, { label: sub ?? "Details" }];
}

/** Toast shown when a not-yet-built module is clicked. */
export function notifyComingSoon(label: string): void {
  sileo.info({
    title:       `${label} isn't available yet`,
    description: "This screen is planned but hasn't been built yet.",
  });
}
