import styles from "@/styles/pages/projects.module.css";

import TechChips from "@/components/tech/TechChips";

interface ProjectTechProps {
    tech: string[];
}

/**
 * "Built With" heading + tech chips for a project.
 */
export default function ProjectTech({ tech }: ProjectTechProps) {
    if (tech.length === 0) return null;

    return (
        <div className={styles["built-with"]}>
            <h4>Built With</h4>
            <TechChips items={tech} ariaLabel="Built with" />
        </div>
    );
}
