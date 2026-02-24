import type { Metadata } from "next";
import BlogPage from "@/containers/blog-page";

export const metadata: Metadata = {
  title: "Blog",
  description: `
    Explore insights on technology, study, future trends, and life with John Carlo Ylanan. 
    Discover tips, guides, and personal experiences that inspire developers, learners, and curious minds alike.`,
};

export default function Blog() {
  return <BlogPage />;
}
