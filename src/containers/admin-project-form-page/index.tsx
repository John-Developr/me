import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import ProjectService from "@/lib/.services/projectService";
import { ProjectRecord } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import ProjectForm from "./ProjectForm";

interface AdminProjectFormPageProps {
    /** Project id to edit; omitted when creating. */
    id?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function AdminProjectFormPage({ id }: AdminProjectFormPageProps) {
    if (id !== undefined && !UUID.test(id)) notFound();

    let project:   ProjectRecord | undefined;
    let nextOrder = 0;
    let failed    = false;
    let missing   = false;

    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") throw new Error("Not authorized.");
        const service = new ProjectService(session.client);

        if (id) {
            project = (await service.getById(id)) ?? undefined;
            missing = !project;
        } else {
            // New projects go to the end of the list by default.
            const all = await service.list();
            nextOrder = all.length ? Math.max(...all.map((p) => p.sort_order)) + 1 : 0;
        }
    } catch {
        failed = true;
    }

    if (missing) notFound();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title={project ? `Edit “${project.title}”` : "New Project"}
                    description={project ? "Changes go live on your Projects page as soon as you save a published project." : "Start as a draft, or publish right away."} />

                {failed
                    ? <ErrorState message="Couldn't load this project. Check your connection and try again." />
                    : <ProjectForm key={project?.id ?? "new"} project={project} nextOrder={nextOrder} />}
            </div>
        </DashboardRefreshProvider>
    );
}
