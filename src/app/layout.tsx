import "@/styles/general/globals.css";

import type { Metadata } from "next";
import { Karla } from "next/font/google";

import { AppProvider } from "@/lib/.context/AppContext";
import { ThemeEnum } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";

import LayoutProvider from "./LayoutProvider";
import { getPublicProfile } from "./getPublicProfile";
import { EMPTY_PROFILE } from "@/config/profileDefaults";
import { BASE_URL } from "@/config/siteUrl";


const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Resolves relative metadata URLs (e.g. generated opengraph-image) to absolute ones
  metadataBase: new URL(BASE_URL),
  title: {
    default:  "John Carlo Ylanan | Web & Mobile Developer",
    template: "%s | John Carlo Ylanan",
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "googlec34b432acc53a5cc",
  }
};

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
  // Header/footer on every page show the owner profile. If it can't load,
  // they render without personal details rather than breaking every page.
  const profile = await getPublicProfile().catch(() => EMPTY_PROFILE);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* dangerouslySetInnerHTML bypasses React hydration for this script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={karla.variable}>
        <AppProvider>
          <LayoutProvider profile={profile}>
            {children}
          </LayoutProvider>
        </AppProvider>
      </body>
    </html>
  );
}