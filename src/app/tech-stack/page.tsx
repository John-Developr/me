import type { Metadata } from "next";
import { buildPageMetadata } from "../seoMetadata";
import TechStackPage from "@/containers/tech-stack-page";
import { getPublicSkills } from "../getPublicSkills";

// Admin edits revalidate this page right away; this is only a safety net.
export const revalidate = 300;

/** Title, description, keywords and social cards come from Admin → SEO Settings. */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("tech-stack");
}

export default async function TechStack() {
  const skills = await getPublicSkills();
  return <TechStackPage core={skills.core} categories={skills.categories} current={skills.current} />;
}