import type { Metadata } from "next";
import HomePage from "@/containers/home-page";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://johncarlo-portfolio.vercel.app";

export const metadata: Metadata = {

  // Under 60 chars — name first for brand recognition
  title: "John Carlo Ylanan — Web & Mobile Developer",

  // Under 160 chars — who, what, where, value proposition
  description:
    "John Carlo A. Ylanan is a Web & Mobile Developer based in Cebu, Philippines. Specializing in React, Next.js, Swift, and Node.js — building scalable, high-performance applications.",

  // High-intent keywords — removed generic/weak ones
  keywords: [
    "John Carlo Ylanan",
    "John Carlo Ylanan portfolio",
    "web and mobile developer Cebu Philippines",
    "React Next.js developer Philippines",
    "Swift iOS developer Philippines",
    "freelance web developer Philippines",
    "full stack developer portfolio",
    "Node.js developer Philippines",
    "hire web developer Cebu",
    "software engineer portfolio Philippines",
  ],

  // Canonical URL
  alternates: {
    canonical: BASE_URL,
  },

  // Robots
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:          true,
      follow:         true,
      "max-snippet":  -1,
      "max-image-preview": "large", // added — allows Google to show large image previews
    },
  },

  // Author signals
  authors:   [{ name: "John Carlo A. Ylanan", url: BASE_URL }],
  creator:   "John Carlo A. Ylanan",
  publisher: "John Carlo A. Ylanan",
  category:  "technology",

  // ============================================================
  // OPEN GRAPH
  // ============================================================
  openGraph: {
    title:       "John Carlo Ylanan — Web & Mobile Developer",
    description: "Portfolio of John Carlo A. Ylanan — Web & Mobile Developer based in Cebu, Philippines. React, Next.js, Swift, and Node.js specialist.",
    url:          BASE_URL,
    siteName:    "John Carlo A. Ylanan — Portfolio",
    type:        "website",
    locale:      "en_US",
    images: [
      {
        url:    `${BASE_URL}/images/og-home.png`, // create a home-specific OG image in Figma
        width:   1200,
        height:  630,
        alt:     "John Carlo A. Ylanan — Web & Mobile Developer Portfolio",
      },
    ],
  },

  // ============================================================
  // TWITTER / X
  // ============================================================
  twitter: {
    card:        "summary_large_image",
    title:       "John Carlo Ylanan — Web & Mobile Developer",
    description: "Web & Mobile Developer based in Cebu, Philippines. Specializing in React, Next.js, Swift, and Node.js.",
    images:      [`${BASE_URL}/images/og-home.png`],
    creator:     "@johncarlo_dev", // add your Twitter/X handle
  },
};

export default function Home() {
  return <HomePage />;
}