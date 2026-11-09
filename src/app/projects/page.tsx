import type { Metadata } from "next";
import { buildPageMetadata } from "../seoMetadata";
import ProjectsPage from "@/containers/projects-page";
import { getPublicProjects } from "./getProjects";

// Admin changes revalidate this page right away; this is only a safety net.
export const revalidate = 300;

/** Title, description, keywords and social cards come from Admin → SEO Settings. */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("projects");
}

export default async function Projects() {
  const { featured, projects } = await getPublicProjects();
  return <ProjectsPage featured={featured} projects={projects} />;
}
