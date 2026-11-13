import styles from "@/styles/pages/projects.module.css";

import { ProjectItem } from "@/utils/types";

import ProjectHeading from "./ProjectHeading";
import ProjectTech from "./ProjectTech";
import ProjectLinks from "./ProjectLinks";

/**
 * A featured project's text, in one column: heading (logo, name, tagline,
 * type badge, role and period), description, highlights, "Built With", and
 * the action buttons last. Used by the /projects featured card and the home
 * page "Recent Projects." card; the parent provides the card and spacing.
 */
export default function ProjectSummary({ project }: { project: ProjectItem }) {
    return (
        <>
            <ProjectHeading project={project} featured />

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
        </>
    );
}
