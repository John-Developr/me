import Image from "next/image";

import styles from "@/styles/pages/projects.module.css";

import { useAnimateIn } from "@/hooks/useAnimateIn";
import { ProjectItem } from "@/utils/types";

/** Tech chips shown on a tile; the rest collapse into "+N more" (all are in the drawer). */
const TECH_SHOWN = 3;

interface ProjectTileProps {
    project: ProjectItem;
    index:   number;
    onOpen:  (project: ProjectItem) => void;
}

/**
 * A project in the "More Projects." tile grid. With a screenshot: full-bleed
 * image, name, tagline and tech on a dark scrim; the image zooms on hover/focus.
 * Without one: a plain card with the logo. Opens the details drawer.
 */
export default function ProjectTile({ project, index, onOpen }: ProjectTileProps) {
    const { ref, style } = useAnimateIn<HTMLButtonElement>({
        delay:    120 + index * 80, // 120ms, 200ms, 280ms, ...
        duration: 600,
    });

    const hasImage = Boolean(project.image);

    return (
        <button
            ref={ref}
            type="button"
            className={`${styles.tile} ${hasImage ? styles["tile-image"] : styles["tile-plain"]}`}
            style={style}
            aria-haspopup="dialog"
            aria-label={`${project.name}: ${project.tagline}. View details`}
            onClick={() => onOpen(project)}>
            {hasImage ? (
                <Image
                    src={project.image!}
                    fill
                    sizes="(max-width: 850px) 100vw, 475px"
                    alt="" />
            ) : project.logo && (
                <span className={styles["card-logo"]}>
                    <Image src={project.logo} width={44} height={44} alt="" />
                </span>
            )}

            <span className={styles["tile-content"]}>
                {project.kind && <span className={styles["tile-kind"]}>{project.kind}</span>}
                <span className={styles["tile-name"]}>{project.name}</span>
                <span className={styles["tile-details"]}>
                    <span className={styles["tile-tagline"]}>{project.tagline}</span>
                    {project.tech.length > 0 && (
                        <span className={styles["tile-tech"]}>
                            {project.tech.slice(0, TECH_SHOWN).map((name) => <span key={name}>{name}</span>)}
                            {project.tech.length > TECH_SHOWN && (
                                <span>+{project.tech.length - TECH_SHOWN} more</span>
                            )}
                        </span>
                    )}
                </span>
            </span>
        </button>
    );
}
