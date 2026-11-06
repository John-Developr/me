'use client'

import { useCallback, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import { useDismiss } from "@/hooks/useDismiss";
import { useApp } from "@/lib/.context/AppContext";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { AdminUser } from "@/utils/types";
import styles from "@/styles/pages/admin.module.css";

/** Two-letter initials from a name, else the first letter of the email. */
const getInitials = (admin: AdminUser): string => {
    const parts = admin.displayName?.split(/\s+/).filter(Boolean) ?? [];
    if (parts.length) return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
    return (admin.email[0] ?? "A").toUpperCase();
};

export default function AdminProfileMenu({ admin }: { admin: AdminUser }) {
    const router                  = useRouter();
    const { isDark, toggleTheme } = useApp();

    const [open,       setOpen]       = useState<boolean>(false);
    const [signingOut, setSigningOut] = useState<boolean>(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuId  = useId();

    const close = useCallback(() => setOpen(false), []);
    useDismiss(rootRef, open, close);

    const handleLogout = async () => {
        setSigningOut(true);

        try {
            const res = await fetch(networkDefine.ADMIN_LOGOUT_API, { method: "POST" });
            if (!res.ok) throw new Error(`Logout failed (${res.status})`);

            router.replace("/admin/login");
            router.refresh();
        } catch {
            setSigningOut(false);
            sileo.error({ title: "Couldn't sign out", description: "Please try again." });
        }
    };

    return (
        <div ref={rootRef} className={styles.popover}>
            <button
                type="button"
                className={styles["profile-trigger"]}
                aria-label="Account menu"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                onClick={() => setOpen((v) => !v)}>
                <span className={styles.avatar} aria-hidden="true">{getInitials(admin)}</span>
                <AdminIcons.ChevronDown width={14} height={14} className={styles["profile-chevron"]} />
            </button>

            {open && (
                <div id={menuId} className={`${styles["popover-panel"]} ${styles["profile-panel"]}`} role="menu">
                    <div className={styles["profile-head"]}>
                        <span className={styles.avatar} aria-hidden="true">{getInitials(admin)}</span>
                        <div>
                            <p>{admin.displayName ?? "Administrator"}</p>
                            <small title={admin.email}>{admin.email}</small>
                        </div>
                    </div>

                    <button type="button" role="menuitem" className={styles["menu-item"]} onClick={toggleTheme}>
                        {isDark ? <AdminIcons.Sun width={16} height={16} /> : <AdminIcons.Moon width={16} height={16} />}
                        {isDark ? "Light mode" : "Dark mode"}
                    </button>

                    <Link
                        href="/admin/account"
                        role="menuitem"
                        className={styles["menu-item"]}
                        onClick={close}>
                        <AdminIcons.Settings width={16} height={16} />
                        Account settings
                    </Link>

                    <button
                        type="button"
                        role="menuitem"
                        className={`${styles["menu-item"]} ${styles.danger}`}
                        disabled={signingOut}
                        onClick={handleLogout}>
                        <AdminIcons.LogOut width={16} height={16} />
                        {signingOut ? "Signing out…" : "Log out"}
                    </button>
                </div>
            )}
        </div>
    );
}
