import { ReactNode } from "react";

import { AdminIconComponent } from "@/components/icons/admin";
import styles from "@/styles/pages/admin.module.css";

interface EmptyStateProps {
    icon:         AdminIconComponent;
    title:        string;
    description?: ReactNode;
    action?:      ReactNode;
    compact?:     boolean;
}

/** Explains why a section has nothing to show, and what will fill it. */
export default function EmptyState({ icon: Icon, title, description, action, compact }: EmptyStateProps) {
    return (
        <div className={`${styles.empty} ${compact ? styles.compact : ""}`}>
            <span className={styles["empty-icon"]}><Icon width={20} height={20} /></span>
            <p className={styles["empty-title"]}>{title}</p>
            {description && <p className={styles["empty-description"]}>{description}</p>}
            {action}
        </div>
    );
}
