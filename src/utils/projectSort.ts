import type { ProjectItem } from "@/utils/types";

/**
 * Start year of a project from its free-text period, e.g.
 * "2023 – Present" → 2023, "Jan 2021 – Mar 2022" → 2021, "2026" → 2026.
 * Returns null when there is no 4-digit year.
 */
export function projectStartYear(period?: string | null): number | null {
  const match = period?.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

/**
 * Projects ordered by start year: newest first, or oldest first when
 * `ascending`. Stable, so projects from the same year keep the admin's
 * display order; projects without a year always go last.
 */
export function sortProjectsByYear<T extends Pick<ProjectItem, "period">>(projects: readonly T[], ascending: boolean): T[] {
  return projects
    .map((project, index) => ({ project, index, year: projectStartYear(project.period) }))
    .sort((a, b) => {
      if (a.year === null || b.year === null) {
        if (a.year === b.year) return a.index - b.index;
        return a.year === null ? 1 : -1;
      }
      return (ascending ? a.year - b.year : b.year - a.year) || a.index - b.index;
    })
    .map(({ project }) => project);
}
