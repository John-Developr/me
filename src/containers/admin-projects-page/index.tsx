import Link from "next/link";

import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import { AdminIcons } from "@/components/icons/admin";
import AdminAuthService from "@/lib/.services/adminAuthService";
import ProjectService from "@/lib/.services/projectService";
import { ProjectRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import ProjectsManager from "./ProjectsManager";

/** Loads every project (drafts included) under the admin's RLS session. */
async function loadProjects(): Promise<{ ok: true; data: ProjectRecord[] } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        return { ok: true, data: await new ProjectService(session.client).list() };
    } catch {
        return { ok: false };
    }
}

export default async function AdminProjectsPage() {
    const projects = await loadProjects();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title="Projects"
                    description="Everything here appears on your portfolio's Projects page once published."
                    actions={
                        <Link href="/admin/projects/new" className={`liquid_glass_btn ${adminStyles["btn-primary"]}`}>
                            <AdminIcons.Plus width={15} height={15} />
                            New Project
                        </Link>
                    } />

                {projects.ok
                    ? <ProjectsManager projects={projects.data} />
                    : <ErrorState message="Couldn't load your projects. Check your connection and try again." />}
            </div>
        </DashboardRefreshProvider>
    );
}
