import Link from "next/link";

import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import { AdminIcons } from "@/components/icons/admin";
import AdminAuthService from "@/lib/.services/adminAuthService";
import ExperienceService from "@/lib/.services/experienceService";
import { ExperienceRecord } from "@/utils/types";
import { ADMIN_PAGE_HEADERS } from "@/utils/admin/pageHeaders";
import adminStyles from "@/styles/pages/admin.module.css";

import ExperienceManager from "./ExperienceManager";

async function loadEntries(): Promise<{ ok: true; data: ExperienceRecord[] } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        return { ok: true, data: await new ExperienceService(session.client).list() };
    } catch {
        return { ok: false };
    }
}

export default async function AdminExperiencePage() {
    const entries = await loadEntries();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title={ADMIN_PAGE_HEADERS.experience.title}
                    description={ADMIN_PAGE_HEADERS.experience.description}
                    actions={
                        <Link href="/admin/experience/new" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                            <AdminIcons.Plus width={15} height={15} />
                            Add Entry
                        </Link>
                    } />

                {entries.ok
                    ? <ExperienceManager entries={entries.data} />
                    : <ErrorState message="Couldn't load your experience. If you just updated, run the experience migration, then try again." />}
            </div>
        </DashboardRefreshProvider>
    );
}
