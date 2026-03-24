import "@/styles/general/globals.css";

import type { Metadata } from "next";
import { Karla } from "next/font/google";

import { AppProvider } from "@/lib/.context/AppContext";
import { ThemeEnum } from "@/utils/types";
import { storageKeys } from "@/config/storageKeys";

import LayoutProvider from "./LayoutProvider";


const karla = Karla({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:  "John Carlo Ylanan | Web & Mobile Developer",
    template: "%s | John Carlo Ylanan",
  },
  description: "Portfolio of John Carlo Ylanan, Web and Mobile Developer specializing in modern web technologies and mobile development.",
  icons: {
    icon: "/favicon.ico",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* dangerouslySetInnerHTML bypasses React hydration for this script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={karla.variable}>
        <AppProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </AppProvider>
      </body>
    </html>
  );
}