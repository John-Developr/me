'use client'

import { ReactNode, useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

import { useApp } from "@/lib/.context/AppContext";
import { storageKeys } from "@/config/storageKeys";
import { AdminUser } from "@/utils/types";
import styles from "@/styles/pages/admin.module.css";

interface AdminShellProps {
    admin:       AdminUser;
    /** Unread contact messages for the bell; null if the count couldn't be loaded. */
    newMessages: number | null;
    children:    ReactNode;
}

/**
 * Admin frame: sidebar + top bar around the page.
 * Desktop: the sidebar collapses to icons (remembered per browser).
 * ≤850px: the sidebar becomes an off-canvas drawer.
 */
export default function AdminShell({ admin, newMessages, children }: AdminShellProps) {
    const { isMobile } = useApp();
    const pathname     = usePathname();

    const [collapsed,  setCollapsed]  = useState<boolean>(false);
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);

    // Restore the collapsed preference after hydration.
    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(storageKeys.local.adminSidebarCollapsed) === "1");
        } catch {
            // Storage unavailable (private mode) — keep the default.
        }
    }, []);

    // Close the drawer when navigating or growing past the breakpoint.
    useEffect(() => { setMobileOpen(false); }, [pathname, isMobile]);

    // Escape closes the drawer.
    useEffect(() => {
        if (!mobileOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [mobileOpen]);

    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(storageKeys.local.adminSidebarCollapsed, next ? "1" : "0");
            } catch {
                // Ignore — the preference just won't persist.
            }
            return next;
        });
    }, []);

    const isCollapsed = !isMobile && collapsed;

    return (
        <div className={`${styles.shell} ${isCollapsed ? styles.collapsed : ""}`}>
            <AdminSidebar
                collapsed={isCollapsed}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
                onToggleCollapsed={toggleCollapsed} />

            {mobileOpen && (
                <div
                    className={styles.backdrop}
                    aria-hidden="true"
                    onClick={() => setMobileOpen(false)} />
            )}

            <div className={styles.main}>
                <AdminTopbar
                    admin={admin}
                    newMessages={newMessages}
                    onOpenMenu={() => setMobileOpen(true)} />

                <main id="admin-content" className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
