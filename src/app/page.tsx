import type { Metadata } from "next";
import { buildPageMetadata } from "./seoMetadata";
import HomePage from "@/containers/home-page";
import { getPublicProfile } from "./getPublicProfile";
import { getPublicExperience } from "./getPublicExperience";
import { getPublicProjects } from "./projects/getProjects";
import { getPublicSkills } from "./getPublicSkills";

// Admin edits revalidate this page right away; this is only a safety net.
export const revalidate = 300;


/** Title, description, keywords and social cards come from Admin → SEO Settings. */
export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home");
}

export default async function Home() {
  const [profile, experience, projects, skills] = await Promise.all([
    getPublicProfile(),
    getPublicExperience(),
    getPublicProjects(),
    getPublicSkills(),
  ]);

  // "Recent Projects." shows the featured project, else the first published one.
  const highlight = projects.featured ?? projects.projects[0] ?? null;

  return <HomePage profile={profile} experience={experience} project={highlight} coreTools={skills.core} />;
}