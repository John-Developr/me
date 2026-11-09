import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import SiteSettingsService from "@/lib/.services/siteSettingsService";
import { ServiceError } from "@/lib/.services/serviceError";
import { SiteSettings } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import SiteIconForm from "./SiteIconForm";

async function load(): Promise<{ ok: true; data: SiteSettings } | { ok: false; message: string }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false, message: "Not authorized." };
        return { ok: true, data: await new SiteSettingsService(session.client).get() };
    } catch (error) {
        return { ok: false, message: error instanceof ServiceError ? error.message : "Couldn't load settings." };
    }
}

export default async function AdminSeoPage() {
    const settings = await load();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                <PageHeader
                    title="SEO Settings"
                    description="How your site appears in browser tabs and search results." />

                {settings.ok
                    ? <SiteIconForm faviconUrl={settings.data.favicon_url} updatedAt={settings.data.updated_at} />
                    : <ErrorState message={settings.message} />}
            </div>
        </DashboardRefreshProvider>
    );
}
