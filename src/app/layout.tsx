import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "@/styles/general/globals.css";
import LayoutProvider from "./LayoutProvider";
import { AppProvider } from "@/lib/context/AppContext";

const karla = Karla({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <LayoutProvider>
            {children}
          </LayoutProvider>
        </AppProvider>
      </body>
    </html>
  );
}