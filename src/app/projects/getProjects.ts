import ProjectService from "@/lib/.services/projectService";
import { ProjectItem, ProjectKindEnum, ProjectLink, ProjectRecord } from "@/utils/types";

export interface PublicProjects {
  featured: ProjectItem | null;
  projects: ProjectItem[];
}

const KINDS = Object.values(ProjectKindEnum) as string[];

/** Database row → the shape the public project components render. */
function toProjectItem(row: ProjectRecord): ProjectItem {
  const links: ProjectLink[] = [];
  if (row.live_url)   links.push({ kind: "live",   label: row.live_label   || "Open Live Site",   href: row.live_url });
  if (row.source_url) links.push({ kind: "source", label: row.source_label || "View Source Code", href: row.source_url });

  return {
    slug:         row.slug,
    name:         row.title,
    tagline:      row.tagline ?? "",
    kind:         row.kind && KINDS.includes(row.kind) ? (row.kind as ProjectKindEnum) : undefined,
    role:         row.role ?? undefined,
    organization: row.organization ?? undefined,
    period:       row.period ?? undefined,
    description:  row.description ?? "",
    highlights:   row.highlights,
    tech:         row.tech,
    logo:         row.logo_url ?? undefined,
    image:        row.image_url ?? undefined,
    links,
    note:         row.note ?? undefined,
  };
}

/**
 * Published projects for /projects and the home "Recent Projects." card,
 * managed in /admin/projects.
 *
 * Throws on database errors: the pages are ISR, so a failed refresh keeps
 * serving the last good page instead of outdated copies from code.
 */
export async function getPublicProjects(): Promise<PublicProjects> {
  const rows     = await ProjectService.getPublished();
  const featured = rows.find((row) => row.is_featured);

  return {
    featured: featured ? toProjectItem(featured) : null,
    projects: rows.filter((row) => row !== featured).map(toProjectItem),
  };
}
