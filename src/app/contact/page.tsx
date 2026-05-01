import type { Metadata } from "next";
import ContactPage from "@/containers/contact-page";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://johncarlo-portfolio.vercel.app";

export const metadata: Metadata = {
  // Concise + keyword-rich — under 60 chars (Google truncates at 60)
  title: "Contact John Carlo — Web & Mobile Developer",

  // Under 160 chars — clear value proposition + CTA
  description:
    "Hire John Carlo A. Ylanan, a Web & Mobile Developer based in Cebu, Philippines. Open for freelance projects, collaborations, and full-time opportunities.",

  // Removed duplicates, kept high-intent keywords only
  keywords: [
    "hire web developer Philippines",
    "hire mobile developer Philippines",
    "freelance developer Cebu",
    "React developer for hire",
    "Next.js developer freelance",
    "John Carlo Ylanan contact",
    "web and mobile developer portfolio",
    "software engineer Philippines",
  ],

  // Canonical URL
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },

  // Prevent indexing of duplicate content
  robots: {
    index:            true,
    follow:           true,
    googleBot: {
      index:          true,
      follow:         true,
      "max-snippet":  -1,
    },
  },

  // ============================================================
  // OPEN GRAPH
  // ============================================================
  openGraph: {
    title:       "Contact John Carlo — Web & Mobile Developer",
    description: "Have a project in mind? Let's work together. John Carlo A. Ylanan is open for freelance projects, collaborations, and full-time opportunities.",
    url:         `${BASE_URL}/contact`,
    siteName:    "John Carlo A. Ylanan — Portfolio",
    type:        "website",
    locale:      "en_US", // added — improves localization signal

    images: [
      {
        // Use a wide OG image (1200x630) for best preview on all platforms
        // Avatar (400x400) renders poorly as a banner — create a dedicated OG image
        url:    `${BASE_URL}/images/og-contact.png`, // dedicated OG image
        width:   1200,
        height:  630,
        alt:     "Contact John Carlo A. Ylanan — Web & Mobile Developer",
      },
      {
        // Square fallback for platforms that prefer square (WhatsApp, Telegram)
        url:    `${BASE_URL}/images/Avatar.png`,
        width:   400,
        height:  400,
        alt:     "John Carlo A. Ylanan",
      },
    ],
  },

  // ============================================================
  // TWITTER / X
  // ============================================================
  twitter: {
    card:        "summary_large_image", // shows large image preview
    title:       "Contact John Carlo — Web & Mobile Developer",
    description: "Open for freelance projects, collaborations, and opportunities in Web & Mobile development. Based in Cebu, Philippines.",
    // added — Twitter pulls from OG images if not specified
    images:      [`${BASE_URL}/images/og-contact.png`],
    creator:     "@johncarlo_dev", // add your Twitter/X handle
  },

  // ============================================================
  // ADDITIONAL SEO
  // ============================================================

  // Author signal
  authors: [{ name: "John Carlo A. Ylanan", url: BASE_URL }],

  // Creator signal
  creator: "John Carlo A. Ylanan",

  // Publisher
  publisher: "John Carlo A. Ylanan",

  // Category hint for search engines
  category: "technology",
};

export default function Contact() {
  return <ContactPage />;
}