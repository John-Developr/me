import { ReactNode } from "react";
import styles from "@/styles/pages/admin.module.css";

interface PageHeaderProps {
    title:        string;
    description?: ReactNode;
    /** Buttons on the right (wrap below the title on small screens). */
    actions?:     ReactNode;
}

/** Title row for admin module pages (Projects, Profile, …). */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <header className={styles["page-header"]}>
            <div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {actions && <div className={styles["page-header-actions"]}>{actions}</div>}
        </header>
    );
}
