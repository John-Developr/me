import type { Metadata } from "next";
import ProjectsPage from "@/containers/projects-page";

export const metadata: Metadata = {
  title: "Tech Stack | John Carlo Ylanan",
  description:
    "Explore the technologies, tools, and frameworks I use as an iOS and web developer. From Swift and React to modern backend solutions, discover how I build scalable and high-performance applications.",
  keywords: [
    "John Carlo Ylanan",
    "Tech Stack",
    "iOS Developer",
    "Swift Developer",
    "React Developer",
    "Next.js",
    "Web Development",
    "Mobile Development",
    "Software Engineer Portfolio",
  ],
  openGraph: {
    title: "Tech Stack | John Carlo Ylanan",
    description:
      "A look into my development stack including Swift, React, Next.js, and more. See how I build modern apps across web and mobile.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/tech-stack`,
    siteName: "John Carlo Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Stack | John Carlo Ylanan",
    description:
      "Discover the tools and technologies I use to build modern, scalable applications.",
  },
};

export default function Projects() {
  return <ProjectsPage />;
}