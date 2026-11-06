import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import SkillService, { SkillsData } from "@/lib/.services/skillService";
import adminStyles from "@/styles/pages/admin.module.css";

import SkillsManager from "./SkillsManager";

async function loadSkills(): Promise<{ ok: true; data: SkillsData } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        return { ok: true, data: await new SkillService(session.client).listAll() };
    } catch {
        return { ok: false };
    }
}

export default async function AdminSkillsPage() {
    const result = await loadSkills();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                {result.ok ? (
                    <SkillsManager categories={result.data.categories} skills={result.data.skills} />
                ) : (
                    <>
                        <PageHeader title="Skills & Technologies" description="Your tech stack: Core Stack, Full Toolkit and Right Now." />
                        <ErrorState message="Couldn't load your skills. If you just updated, run the skills migration, then try again." />
                    </>
                )}
            </div>
        </DashboardRefreshProvider>
    );
}
