import "@/styles/general/globals.css";

import type { Metadata } from "next";
import { Karla } from "next/font/google";

import { AppProvider } from "@/lib/.context/AppContext";
import { ThemeEnum } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";

import LayoutProvider from "./LayoutProvider";
import { getPublicProfile } from "./getPublicProfile";
import { EMPTY_SKILLS, getPublicSkills } from "./getPublicSkills";
import { getSeoSettingsSafe } from "./getSiteSettings";
import { DEFAULT_FAVICON } from "@/utils/admin/siteSettingsSchema";
import { EMPTY_PROFILE } from "@/config/profileDefaults";
import { BASE_URL } from "@/config/siteUrl";


const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Site-wide SEO from Admin → SEO Settings (defaults if it can't be loaded).
  const { settings, pages } = await getSeoSettingsSafe();
  const siteName = settings.site_name ?? "Portfolio";
  const home     = pages.find((p) => p.key === "home");

  return {
    // Resolves relative metadata URLs (e.g. generated opengraph-image) to absolute ones
    metadataBase: new URL(BASE_URL),
    title: {
      default:  home?.title ?? siteName,
      template: `%s | ${siteName}`,
    },
    description: home?.description,
    icons: settings.favicon_url
      ? { icon: [{ url: settings.favicon_url }], apple: [{ url: settings.favicon_url }] }
      : { icon: DEFAULT_FAVICON },
    // "Allow search engines" off → noindex on every page.
    robots: settings.allow_indexing
      ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } }
      : { index: false, follow: false },
    verification: settings.google_verification ? { google: settings.google_verification } : undefined,
  };
}

// No flash
const themeScript = `
  (function() {
    try {
      var saved   = localStorage.getItem("${storageKeys.local.theme}");
      var prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (saved === "${ThemeEnum.dark}" || (!saved && prefers)) {
        document.documentElement.classList.add("${ThemeEnum.dark}");
      } else {
        document.documentElement.classList.remove("${ThemeEnum.dark}");
      }
    } catch(e) {}
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Site-wide data: the owner profile (header/footer) and tech logos (chips).
  // If either can't load, pages render without it rather than breaking.
  const [profile, skills] = await Promise.all([
    getPublicProfile().catch(() => EMPTY_PROFILE),
    getPublicSkills().catch(() => EMPTY_SKILLS),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* dangerouslySetInnerHTML bypasses React hydration for this script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={karla.variable}>
        <AppProvider>
          <LayoutProvider profile={profile} techLogos={skills.logos}>
            {children}
          </LayoutProvider>
        </AppProvider>
      </body>
    </html>
  );
}