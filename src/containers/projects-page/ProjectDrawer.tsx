import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import styles from "@/styles/pages/projects.module.css";

import ArrowLeft from "@/components/icons/ArrowLeft";
import Close from "@/components/icons/Close";
import { ProjectItem } from "@/utils/types";

import ProjectHeading from "@/components/projects/ProjectHeading";
import ProjectTech from "@/components/projects/ProjectTech";
import ProjectLinks from "@/components/projects/ProjectLinks";

interface ProjectDrawerProps {
    /** Project to show; null keeps the drawer closed. */
    project: ProjectItem | null;
    onClose: () => void;
}

/** Must match the `drawer-out` animation duration in projects.module.css. */
const CLOSE_MS = 280;

/**
 * Right-side panel with a project's full details, opened from a project
 * tile. Native modal <dialog>: focus is trapped inside, Escape closes it,
 * and the page behind is dimmed and doesn't scroll. Clicking the dimmed
 * area also closes it. It slides in, and slides back out before `onClose`
 * runs (instantly with "reduce motion").
 */
export default function ProjectDrawer({ project, onClose }: ProjectDrawerProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [closing, setClosing] = useState<boolean>(false);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !project) return;

        setClosing(false);
        if (!dialog.open) dialog.showModal();
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.documentElement.style.overflow = "";
            if (dialog.open) dialog.close();
        };
    }, [project]);

    // Let the slide-out play, then tell the parent to clear the project.
    useEffect(() => {
        if (!closing) return;
        const timer = setTimeout(onClose, CLOSE_MS);
        return () => clearTimeout(timer);
    }, [closing, onClose]);

    const requestClose = () => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) onClose();
        else setClosing(true);
    };

    return (
        <dialog
            ref={dialogRef}
            className={`${styles.drawer} ${closing ? styles["drawer-closing"] : ""}`}
            aria-labelledby={project ? `project-${project.slug}` : undefined}
            onKeyDown={(e) => {
                // Handle Escape here so the slide-out plays (stops the native cancel).
                if (e.key === "Escape") {
                    e.preventDefault();
                    requestClose();
                }
            }}
            onCancel={(e) => {
                e.preventDefault(); // animate out instead of closing at once
                requestClose();
            }}
            onClose={() => {
                // The browser can still force-close the dialog; keep state in sync.
                if (project) onClose();
            }}
            onClick={(e) => {
                // A click on the dialog box itself (not its content) is the backdrop.
                if (e.target === e.currentTarget) requestClose();
            }}>
            {project && (
                <div className={styles["drawer-panel"]}>
                    <div className={styles["drawer-head"]}>
                        <button type="button" className={styles["drawer-back"]} onClick={requestClose}>
                            <ArrowLeft width={18} height={18} />
                            Back to projects
                        </button>
                        <button type="button" className={styles["drawer-close"]} aria-label="Close" onClick={requestClose}>
                            <Close width={20} height={20} />
                        </button>
                    </div>

                    <div className={styles["drawer-body"]}>
                        <ProjectHeading project={project} featured />

                        {project.image && (
                            <div className={styles["browser-frame"]}>
                                <div className={styles["browser-dots"]} aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                <div className={`${styles["browser-view"]} ${styles["drawer-shot"]}`}>
                                    <Image
                                        src={project.image}
                                        fill
                                        sizes="(max-width: 850px) 100vw, 460px"
                                        alt={`${project.name} screenshot`} />
                                </div>
                            </div>
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
                    </div>

                    {(project.links.length > 0 || project.note) && (
                        <div className={styles["drawer-foot"]}>
                            <ProjectLinks
                                projectName={project.name}
                                links={project.links}
                                note={project.note} />
                        </div>
                    )}
                </div>
            )}
        </dialog>
    );
}
