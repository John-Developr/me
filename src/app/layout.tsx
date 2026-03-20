import "@/styles/general/globals.css";

import type { Metadata } from "next";
import { Karla } from "next/font/google";
import { AppProvider } from "@/lib/.context/AppContext";

import LayoutProvider from "./LayoutProvider";

const karla = Karla({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "John Carlo Ylanan | Web & Mobile Developer",
    template: "%s | John Carlo Ylanan",
  },
  description:
    "Portfolio of John Carlo Ylanan, Web and Mobile Developer specializing in modern web technologies and mobile development.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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