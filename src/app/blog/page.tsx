import type { Metadata } from "next";
import BlogPage from "@/containers/blog-page";

export const metadata: Metadata = {
  title: "Blog | John Carlo Ylanan",
  description:
    "Explore articles on web development, iOS development, technology trends, and personal growth. Learn from real-world experiences, coding tips, and insights by John Carlo Ylanan.",
  keywords: [
    "John Carlo Ylanan Blog",
    "Web Development Blog",
    "iOS Development Blog",
    "React Tips",
    "Swift Programming",
    "Software Engineering Articles",
    "Tech Blog Philippines",
    "Programming Tutorials",
  ],
  openGraph: {
    title: "Blog | John Carlo Ylanan",
    description:
      "Read articles on coding, technology, and growth. Discover insights on React, Swift, and modern software development.",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
    siteName: "John Carlo Portfolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | John Carlo Ylanan",
    description:
      "Insights on web & mobile development, tech trends, and personal growth.",
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog`,
  },
};

export default function Blog() {
  return <BlogPage />;
}