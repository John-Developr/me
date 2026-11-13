import Image from "next/image";

import styles from "@/styles/pages/projects.module.css";

import Calendar from "@/components/icons/Calendar";
import Work from "@/components/icons/Work";
import { ProjectItem } from "@/utils/types";

interface ProjectHeadingProps {
    project:   ProjectItem;
    /** The featured card uses an h2 and a larger title; grid cards use h3. */
    featured?: boolean;
}

/**
 * Logo, name, tagline and type badge, then the role · organization and
 * period line. Shared by the featured card and the "More Projects." cards.
 * The heading's id labels the surrounding card.
 */
export default function ProjectHeading({ project, featured = false }: ProjectHeadingProps) {
    const Title    = featured ? "h2" : "h3";
    const roleLine = [project.role, project.organization].filter(Boolean).join(" · ");

    return (
        <>
            <header className={`${styles["card-header"]} ${featured ? styles["card-header-featured"] : ""}`}>
                {project.logo && (
                    <span className={styles["card-logo"]}>
                        <Image
                            src={project.logo}
                            width={44}
                            height={44}
                            alt="" />
                    </span>
                )}
                <div className={styles["card-heading"]}>
                    <Title id={`project-${project.slug}`}>{project.name}</Title>
                    <p>{project.tagline}</p>
                </div>
                {project.kind && (
                    <span className={styles.kind}>{project.kind}</span>
                )}
            </header>

            {(roleLine || project.period) && (
                <ul className={styles.meta}>
                    {roleLine && (
                        <li>
                            <Work width={14} height={14} aria-hidden="true" />
                            {roleLine}
                        </li>
                    )}
                    {project.period && (
                        <li>
                            <Calendar width={14} height={14} aria-hidden="true" />
                            {project.period}
                        </li>
                    )}
                </ul>
            )}
        </>
    );
}
