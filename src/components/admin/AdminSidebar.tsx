'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_HOME, ADMIN_NAV, AdminNavItem, isNavItemActive, notifyComingSoon } from "./adminNav";
import { AdminIcons } from "@/components/icons/admin";
import styles from "@/styles/pages/admin.module.css";

interface AdminSidebarProps {
    collapsed:         boolean;
    mobileOpen:        boolean;
    onCloseMobile:     () => void;
    onToggleCollapsed: () => void;
}

export default function AdminSidebar({ collapsed, mobileOpen, onCloseMobile, onToggleCollapsed }: AdminSidebarProps) {
    const pathname = usePathname();

    const renderItem = (item: AdminNavItem) => {
        const Icon    = item.icon;
        const tooltip = collapsed ? item.label : undefined;

        const content = (
            <>
                <Icon className={styles["nav-icon"]} />
                <span className={styles["nav-label"]}>{item.label}</span>
                {item.kind === "external" && <AdminIcons.ExternalLink className={styles["nav-trailing"]} width={14} height={14} />}
                {item.kind === "soon"     && <span className={styles["soon-badge"]}>Soon</span>}
            </>
        );

        if (item.kind === "route") {
            const active = isNavItemActive(item, pathname);
            return (
                <Link
                    href={item.href}
                    title={tooltip}
                    aria-current={active ? "page" : undefined}
                    className={`${styles["nav-item"]} ${active ? styles.active : ""}`}>
                    {content}
                </Link>
            );
        }

        if (item.kind === "external") {
            return (
                <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={tooltip ?? `${item.label} (opens in a new tab)`}
                    className={styles["nav-item"]}>
                    {content}
                </a>
            );
        }

        return (
            <button
                type="button"
                title={tooltip ? `${item.label} — coming soon` : "Coming soon"}
                aria-disabled="true"
                className={`${styles["nav-item"]} ${styles.soon}`}
                onClick={() => notifyComingSoon(item.label)}>
                {content}
            </button>
        );
    };

    return (
        <aside
            className={`${styles.sidebar} ${mobileOpen ? styles.open : ""}`}
            aria-label="Admin navigation">
            <div className={styles.brand}>
                <Link href={ADMIN_HOME} className={styles["brand-link"]} title="Admin overview">
                    <span className={styles["brand-text"]}>
                        <strong>Portfolio CMS</strong>
                        <small>Admin</small>
                    </span>
                </Link>

                <button
                    type="button"
                    className={`${styles["icon-btn"]} ${styles["drawer-close"]}`}
                    aria-label="Close navigation"
                    onClick={onCloseMobile}>
                    <AdminIcons.Close />
                </button>
            </div>

            <nav className={styles.nav}>
                {ADMIN_NAV.map((group, index) => (
                    <div key={group.title ?? index} className={styles["nav-group"]}>
                        {group.title && <p className={styles["nav-group-title"]}>{group.title}</p>}
                        <ul>
                            {group.items.map((item) => <li key={item.key}>{renderItem(item)}</li>)}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className={styles["sidebar-footer"]}>
                <button
                    type="button"
                    className={styles["nav-item"]}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    aria-expanded={!collapsed}
                    title={collapsed ? "Expand sidebar" : undefined}
                    onClick={onToggleCollapsed}>
                    <AdminIcons.PanelLeft className={styles["nav-icon"]} />
                    <span className={styles["nav-label"]}>Collapse</span>
                </button>
            </div>
        </aside>
    );
}
