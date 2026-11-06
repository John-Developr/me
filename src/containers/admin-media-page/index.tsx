import PageHeader from "@/components/admin/PageHeader";
import ErrorState from "@/components/admin/ErrorState";
import { DashboardRefreshProvider } from "@/components/admin/DashboardRefresh";
import AdminAuthService from "@/lib/.services/adminAuthService";
import MediaService from "@/lib/.services/mediaService";
import { MediaAsset, StorageUsage } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";

import MediaLibrary from "./MediaLibrary";

async function loadLibrary(): Promise<{ ok: true; assets: MediaAsset[]; usage: StorageUsage } | { ok: false }> {
    try {
        const session = await AdminAuthService.getSession();
        if (session.status !== "admin") return { ok: false };
        const service = new MediaService(session.client);
        const [assets, usage] = await Promise.all([service.list(), service.storageUsage()]);
        return { ok: true, assets, usage };
    } catch {
        return { ok: false };
    }
}

export default async function AdminMediaPage() {
    const library = await loadLibrary();

    return (
        <DashboardRefreshProvider>
            <div className={adminStyles.page}>
                {library.ok ? (
                    <MediaLibrary assets={library.assets} usage={library.usage} />
                ) : (
                    <>
                        <PageHeader title="Media Library" description="Images and documents used across your portfolio." />
                        <ErrorState message="Couldn't load the Media Library. If you just updated, run the Media Library migration, then try again." />
                    </>
                )}
            </div>
        </DashboardRefreshProvider>
    );
}
