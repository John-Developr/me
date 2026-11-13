import styles from "@/styles/pages/projects.module.css";

import ProjectSummary from "@/components/projects/ProjectSummary";
import { useAnimateIn } from "@/hooks/useAnimateIn";
import { ProjectItem } from "@/utils/types";

interface FeaturedProjectProps {
    project: ProjectItem;
}

/**
 * Large card at the top of /projects: heading, description, highlights,
 * tech and actions in one column (the screenshot shows in the drawer
 * for other projects, not here).
 */
export default function FeaturedProject({ project }: FeaturedProjectProps) {
    const { ref, style } = useAnimateIn<HTMLElement>({ delay: 80, duration: 600 });

    return (
        <section
            ref={ref}
            style={style}
            className={styles.featured}
            aria-labelledby={`project-${project.slug}`}>
            <p className={styles.eyebrow}>Featured Project</p>
            <ProjectSummary project={project} />
        </section>
    );
}
