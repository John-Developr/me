import type { Metadata } from "next";
import { buildPageMetadata } from "../seoMetadata";
import BlogPage from "@/containers/blog-page";

/** Title, description, keywords and social cards come from Admin → SEO Settings. */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("blog");
}

export default function Blog() {
  return <BlogPage />;
}