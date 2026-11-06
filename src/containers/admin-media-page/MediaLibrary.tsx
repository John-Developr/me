'use client'

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";

import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DashboardCard from "@/components/admin/DashboardCard";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import MediaGrid from "@/components/admin/media/MediaGrid";
import MediaUploader from "@/components/admin/media/MediaUploader";
import StorageUsageCard from "@/components/admin/media/StorageUsageCard";
import { AdminIcons } from "@/components/icons/admin";
import { networkDefine } from "@/config/networkDefine";
import { useApp } from "@/lib/.context/AppContext";
import { isImageMime } from "@/utils/media";
import { MediaAsset, MediaImportResult, StorageUsage } from "@/utils/types";
import adminStyles from "@/styles/pages/admin.module.css";
import styles from "@/styles/pages/adminMedia.module.css";

import MediaDetails from "./MediaDetails";

type Filter = "all" | "images" | "documents";

const FILTERS: { key: Filter; label: string; test: (a: MediaAsset) => boolean }[] = [
    { key: "all",       label: "All",    test: () => true },
    { key: "images",    label: "Images", test: (a) => isImageMime(a.mime_type) },
    { key: "documents", label: "PDFs",   test: (a) => a.mime_type === "application/pdf" },
];

export default function MediaLibrary({ assets, usage }: { assets: MediaAsset[]; usage: StorageUsage }) {
    const router       = useRouter();
    const { isMobile } = useApp();

    const [filter,     setFilter]     = useState<Filter>("all");
    const [query,      setQuery]      = useState<string>("");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState<boolean>(false);
    const [importing,  setImporting]  = useState<boolean>(false);
    const [lastImport, setLastImport] = useState<MediaImportResult | null>(null);

    const selected = assets.find((a) => a.id === selectedId) ?? null;

    // On phones the details panel is below the grid: bring it into view.
    const select = (asset: MediaAsset) => {
        setSelectedId(asset.id);
        if (isMobile) requestAnimationFrame(() => document.getElementById("media-details")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };

    // Drop the selection if that file was deleted.
    useEffect(() => { if (selectedId && !selected) setSelectedId(null); }, [selectedId, selected]);

    const visible = useMemo(() => {
        const q    = query.trim().toLowerCase();
        const test = FILTERS.find((f) => f.key === filter)!.test;
        return assets.filter((a) => test(a) && (!q || a.file_name.toLowerCase().includes(q) || (a.alt_text ?? "").toLowerCase().includes(q)));
    }, [assets, filter, query]);

    const runImport = async () => {
        setImporting(true);
        try {
            const res  = await fetch(networkDefine.ADMIN_MEDIA_IMPORT_API, { method: "POST" });
            const json = await res.json().catch(() => null);

            if (!res.ok || !json?.result) {
                sileo.error({ title: "Import failed", description: json?.message ?? "Please try again." });
                return;
            }

            const result = json.data as MediaImportResult;
            setLastImport(result);
            sileo.success({
                title:       "Import finished",
                description: `${result.imported.length} uploaded, ${result.reused.length} already in the library, ${result.references} field${result.references === 1 ? "" : "s"} updated.`,
            });
            router.refresh();
        } catch {
            sileo.error({ title: "Network error", description: "Check your connection and try again." });
        } finally {
            setImporting(false);
            setImportOpen(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Media Library"
                description="Images and documents used across your portfolio. Choose them from any image field."
                actions={
                    <button type="button" className={`liquid_glass_btn ${adminStyles["btn-secondary"]}`} onClick={() => setImportOpen(true)}>
                        <AdminIcons.Refresh width={15} height={15} />
                        Import site images
                    </button>
                } />

            <div className={styles.top}>
                <StorageUsageCard
                    usage={usage}
                    breakdown={[
                        { label: "Images", files: assets.filter((a) => isImageMime(a.mime_type)).length, bytes: assets.filter((a) => isImageMime(a.mime_type)).reduce((n, a) => n + a.size_bytes, 0) },
                        { label: "PDFs",   files: assets.filter((a) => !isImageMime(a.mime_type)).length, bytes: assets.filter((a) => !isImageMime(a.mime_type)).reduce((n, a) => n + a.size_bytes, 0) },
                    ]} />
                <DashboardCard title="Upload" icon={AdminIcons.Plus}>
                    <MediaUploader onUploaded={() => router.refresh()} />
                </DashboardCard>
            </div>

            {lastImport && (lastImport.skipped.length > 0) && (
                <div className={adminStyles.error} role="status">
                    <AdminIcons.AlertCircle width={18} height={18} />
                    <p>
                        Some files weren&apos;t imported:{" "}
                        {lastImport.skipped.map((s) => `${s.path} (${s.reason})`).join("; ")}
                    </p>
                </div>
            )}

            <div className={styles.layout}>
                <DashboardCard title="Files" icon={AdminIcons.Image}>
                    <div className={styles.toolbar}>
                        <div className={styles.filters} role="group" aria-label="Filter by type">
                            {FILTERS.map(({ key, label, test }) => (
                                <button
                                    key={key}
                                    type="button"
                                    aria-pressed={filter === key}
                                    className={filter === key ? styles.selectedFilter : ""}
                                    onClick={() => setFilter(key)}>
                                    {label} <span className={styles.count}>{assets.filter(test).length}</span>
                                </button>
                            ))}
                        </div>
                        <label className={styles.search}>
                            <AdminIcons.Search width={16} height={16} />
                            <input type="search" placeholder="Search by name or alt text" aria-label="Search media" value={query} onChange={(e) => setQuery(e.target.value)} />
                        </label>
                    </div>

                    {assets.length === 0 ? (
                        <EmptyState
                            icon={AdminIcons.Image}
                            title="No files yet"
                            description={"Upload images above, or use “Import site images” to bring in the logos, photos and screenshots your portfolio already uses."} />
                    ) : visible.length === 0 ? (
                        <EmptyState compact icon={AdminIcons.Search} title="No matching files" description="Try a different search or filter." />
                    ) : (
                        <MediaGrid assets={visible} selectedId={selectedId} onSelect={select} />
                    )}
                </DashboardCard>

                <aside id="media-details" className={styles.side}>
                    {selected
                        ? <MediaDetails key={selected.id} asset={selected} onDeleted={() => { setSelectedId(null); router.refresh(); }} onChanged={() => router.refresh()} />
                        : (
                            <DashboardCard title="Details" icon={AdminIcons.FileText}>
                                <EmptyState
                                    compact
                                    icon={AdminIcons.Image}
                                    title="No file selected"
                                    description="Select a file to see its details, copy its link, add alt text, or delete it." />
                            </DashboardCard>
                        )}
                </aside>
            </div>

            <ConfirmDialog
                open={importOpen}
                title="Import site images?"
                description={<>
                    Files your content points to in <code>/public</code> (like <code>/images/logo.png</code>) are uploaded
                    here, and those projects, profile and experience fields are switched to the library copies. The originals
                    stay in your code. Safe to run again.
                </>}
                confirmLabel="Import"
                busy={importing}
                onConfirm={runImport}
                onCancel={() => setImportOpen(false)} />
        </>
    );
}
