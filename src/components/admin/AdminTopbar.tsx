'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

import AdminNotifications from "./AdminNotifications";
import AdminProfileMenu from "./AdminProfileMenu";
import AdminSearch from "./AdminSearch";
import { getBreadcrumbs } from "./adminNav";

import { AdminIcons } from "@/components/icons/admin";
import { BASE_URL } from "@/config/siteUrl";
import { AdminUser, MessageNotifications } from "@/utils/types";
import styles from "@/styles/pages/admin.module.css";

interface AdminTopbarProps {
    admin:         AdminUser;
    notifications: MessageNotifications | null;
    onOpenMenu:    () => void;
}

export default function AdminTopbar({ admin, notifications, onOpenMenu }: AdminTopbarProps) {
    const pathname = usePathname();
    const crumbs   = getBreadcrumbs(pathname);

    return (
        <header className={styles.topbar}>
            <button
                type="button"
                className={`${styles["icon-btn"]} ${styles["menu-btn"]}`}
                aria-label="Open navigation"
                onClick={onOpenMenu}>
                <AdminIcons.Menu />
            </button>

            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
                <ol>
                    {crumbs.map((crumb, i) => (
                        <li key={i} aria-current={i === crumbs.length - 1 ? "page" : undefined}>
                            {crumb.href && i < crumbs.length - 1 ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
                        </li>
                    ))}
                </ol>
            </nav>

            <AdminSearch />

            <div className={styles["topbar-actions"]}>
                <AdminNotifications notifications={notifications} />

                <a
                    href={BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`liquid_glass_btn ${styles["btn-primary"]} ${styles["live-btn"]}`}
                    aria-label="View live portfolio (opens in a new tab)">
                    <AdminIcons.ExternalLink width={16} height={16} />
                    <span>View Live Portfolio</span>
                </a>

                <AdminProfileMenu admin={admin} />
            </div>
        </header>
    );
}
