import styles from "@/styles/pages/projects.module.css";
import Styles from "@/styles/general/component.module.css";

import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import Github from "@/components/icons/Github";
import InfoSquare from "@/components/icons/InfoSquare";
import { ProjectLink } from "@/utils/types";

interface ProjectLinksProps {
    projectName: string;
    links:       ProjectLink[];
    note?:       string;
}

/**
 * A project's actions: "live" links are primary buttons, "source" links are
 * glass secondary buttons. Shows `note` (e.g. "Proprietary codebase") when
 * there are no links, or alongside them.
 */
export default function ProjectLinks({ projectName, links, note }: ProjectLinksProps) {
    return (
        <div className={styles.actions}>
            {links.length > 0 && (
                <div className={Styles["action-links"]}>
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${link.label} — ${projectName} (opens in a new tab)`}
                            className={`liquid_glass_btn ${Styles["action-button"]} ${link.kind === "live" ? Styles["action-primary"] : Styles["action-secondary"]}`}>
                            {link.kind === "source" && (
                                <Github width={18} height={16} />
                            )}
                            {link.label}
                            {link.kind === "live" && (
                                <ArrowRightV2
                                    width={16}
                                    height={16}
                                    style={{ transform: "rotate(-46grad)" }} />
                            )}
                        </a>
                    ))}
                </div>
            )}

            {note && (
                <p className={styles.note}>
                    <InfoSquare width={14} height={14} />
                    {note}
                </p>
            )}
        </div>
    );
}
