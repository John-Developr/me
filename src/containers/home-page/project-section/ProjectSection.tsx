import Link from "next/link";

import styles from "@/styles/pages/page.module.css";

import { HomeIcons } from "@/components/icons";
import ProjectSummary from "@/components/projects/ProjectSummary";
import { ProjectItem } from "@/utils/types";

/**
 * "Recent Projects." card — the featured project managed in /admin/projects
 * (or the first published project when none is featured). Same content as
 * the /projects featured card: no screenshot, buttons at the bottom.
 */
export default function ProjectSection({ project }: { project: ProjectItem }) {
    return (
        <section className={styles["recent-projects"]} aria-labelledby={`project-${project.slug}`}>
            <div className={styles.title}>
                <span className={styles.icon}>
                <HomeIcons.Category
                 width={20}
                 height={20} />
                </span>
            <h3>
              Recent Projects.
            </h3>
            </div>
            <div className={styles["recent-content"]}>
                <ProjectSummary project={project} />
            </div>
            <div className={styles["see-more"]}>
                <Link href="/projects">
                    <HomeIcons.ArrowTopRightCircle
                     width={15}
                     height={15} />
                    See More
                </Link>
            </div>
        </section>
    )
}
