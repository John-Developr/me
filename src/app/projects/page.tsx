import type { Metadata } from "next";
import ProjectsPage from "@/containers/projects-page";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore web and mobile projects built by John Carlo Ylanan — showcasing how I solve problems, write code, and use modern frameworks and tools to build applications that scale.",
  keywords: [
    "John Carlo Ylanan",
    "Projects",
    "Portfolio Projects",
    "Web Development Projects",
    "Mobile App Projects",
    "React Projects",
    "Next.js Projects",
    "Swift iOS Projects",
    "Software Engineer Portfolio",
  ],
  openGraph: {
    title: "Projects | John Carlo Ylanan",
    description:
      "A showcase of web and mobile projects — built with React, Next.js, Swift, and Node.js.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/projects`,
    siteName: "John Carlo Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects | John Carlo Ylanan",
    description:
      "A showcase of web and mobile projects built with modern frameworks and tools.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/projects`,
  },
};

export default function Projects() {
  return <ProjectsPage />;
}
