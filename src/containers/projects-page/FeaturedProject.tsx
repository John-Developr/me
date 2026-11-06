import Image from "next/image";

import styles from "@/styles/pages/projects.module.css";

import { useAnimateIn } from "@/hooks/useAnimateIn";
import { ProjectItem } from "@/utils/types";

import ProjectTech from "./ProjectTech";
import ProjectLinks from "./ProjectLinks";

interface FeaturedProjectProps {
    project: ProjectItem;
}

/**
 * Large card at the top of /projects: details on the left,
 * browser-framed screenshot on the right (on top on mobile).
 */
export default function FeaturedProject({ project }: FeaturedProjectProps) {
    const { ref, style } = useAnimateIn<HTMLElement>({ delay: 80, duration: 600 });

    return (
        <section
            ref={ref}
            style={style}
            className={styles.featured}
            aria-labelledby={`project-${project.slug}`}>
            <div className={styles["featured-body"]}>
                <p className={styles.eyebrow}>Featured Project</p>

                <div>
                    <h2 id={`project-${project.slug}`} className={styles["featured-name"]}>
                        {project.name}
                    </h2>
                    <p className={styles["featured-tagline"]}>{project.tagline}</p>
                </div>

                <p className={styles.description}>{project.description}</p>

                {project.highlights.length > 0 && (
                    <ul className={styles.highlights}>
                        {project.highlights.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                )}

                <ProjectTech tech={project.tech} />

                <ProjectLinks
                    projectName={project.name}
                    links={project.links}
                    note={project.note} />
            </div>

            {project.image && (
                <div className={styles["featured-media"]}>
                    <div className={styles["browser-frame"]}>
                        <div className={styles["browser-dots"]} aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                        <Image
                            src={project.image}
                            width={1000}
                            height={729}
                            sizes="(max-width: 850px) 100vw, 420px"
                            alt={`${project.name} website homepage`}
                            className={styles["browser-image"]} />
                    </div>
                </div>
            )}
        </section>
    );
}
