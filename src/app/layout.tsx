import "@/styles/general/globals.css";

import type { Metadata } from "next";
import { Karla } from "next/font/google";

import { AppProvider } from "@/lib/.context/AppContext";
import { ThemeEnum } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";

import LayoutProvider from "./LayoutProvider";
import { getPublicProfile } from "./getPublicProfile";
import { EMPTY_SKILLS, getPublicSkills } from "./getPublicSkills";
import { getSiteSettings } from "./getSiteSettings";
import { DEFAULT_FAVICON } from "@/utils/admin/siteSettingsSchema";
import { EMPTY_PROFILE } from "@/config/profileDefaults";
import { BASE_URL } from "@/config/siteUrl";


const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Site icon is set in Admin → SEO Settings; /favicon.ico when none is set.
  const { favicon_url } = await getSiteSettings();

  return {
    // Resolves relative metadata URLs (e.g. generated opengraph-image) to absolute ones
    metadataBase: new URL(BASE_URL),
    title: {
      default:  "John Carlo Ylanan | Web & Mobile Developer",
      template: "%s | John Carlo Ylanan",
    },
    icons: favicon_url
      ? { icon: [{ url: favicon_url }], apple: [{ url: favicon_url }] }
      : { icon: DEFAULT_FAVICON },
    verification: {
      google: "googlec34b432acc53a5cc",
    },
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