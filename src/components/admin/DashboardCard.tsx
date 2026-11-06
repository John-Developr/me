import { ReactNode } from "react";

import { AdminIconComponent } from "@/components/icons/admin";
import styles from "@/styles/pages/admin.module.css";

interface DashboardCardProps {
    title:      string;
    icon?:      AdminIconComponent;
    /** Short line under the title. */
    subtitle?:  ReactNode;
    /** Controls on the right of the header (filters, links). */
    actions?:   ReactNode;
    className?: string;
    children:   ReactNode;
}

/** Bordered surface with a title row — the building block of admin pages. */
export default function DashboardCard({ title, icon: Icon, subtitle, actions, className, children }: DashboardCardProps) {
    return (
        <section className={`${styles.card} ${className ?? ""}`}>
            <header className={styles["card-header"]}>
                <div className={styles["card-heading"]}>
                    {Icon && <span className={styles["card-icon"]}><Icon width={16} height={16} /></span>}
                    <div>
                        <h2>{title}</h2>
                        {subtitle && <p>{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className={styles["card-actions"]}>{actions}</div>}
            </header>
            {children}
        </section>
    );
}
