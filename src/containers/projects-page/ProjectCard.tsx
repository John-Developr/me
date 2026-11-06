import Image from "next/image";

import styles from "@/styles/pages/projects.module.css";

import Calendar from "@/components/icons/Calendar";
import Work from "@/components/icons/Work";
import { useAnimateIn } from "@/hooks/useAnimateIn";
import { ProjectItem } from "@/utils/types";

import ProjectTech from "./ProjectTech";
import ProjectLinks from "./ProjectLinks";

interface ProjectCardProps {
    project: ProjectItem;
    index:   number; // for the staggered entrance
}

/**
 * A project in the "More Projects." grid. Actions are pinned to the
 * bottom so cards in the same row line up.
 */
export default function ProjectCard({ project, index }: ProjectCardProps) {
    const { ref, style } = useAnimateIn<HTMLElement>({
        delay:    120 + index * 80, // 120ms, 200ms, 280ms, ...
        duration: 600,
    });

    const roleLine = [project.role, project.organization].filter(Boolean).join(" · ");

    return (
        <article
            ref={ref}
            style={style}
            className={styles.card}
            aria-labelledby={`project-${project.slug}`}>
            <header className={styles["card-header"]}>
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
                    <h3 id={`project-${project.slug}`}>{project.name}</h3>
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

            <p className={styles.description}>{project.description}</p>

            {project.highlights.length > 0 && (
                <ul className={styles.highlights}>
                    {project.highlights.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}

            <ProjectTech tech={project.tech} />

            <footer className={styles["card-footer"]}>
                <ProjectLinks
                    projectName={project.name}
                    links={project.links}
                    note={project.note} />
            </footer>
        </article>
    );
}
