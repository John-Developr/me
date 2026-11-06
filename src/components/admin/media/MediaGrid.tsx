'use client'

import Image from "next/image";

import { AdminIcons } from "@/components/icons/admin";
import { formatBytes, isImageMime } from "@/utils/media";
import { MediaAsset } from "@/utils/types";
import styles from "@/styles/pages/adminMedia.module.css";

interface MediaGridProps {
    assets:     MediaAsset[];
    selectedId: string | null;
    onSelect:   (asset: MediaAsset) => void;
}

/** Thumbnail grid. Each tile is a button; the selected one is outlined. */
export default function MediaGrid({ assets, selectedId, onSelect }: MediaGridProps) {
    return (
        <ul className={styles.grid}>
            {assets.map((asset) => (
                <li key={asset.id}>
                    <button
                        type="button"
                        className={`${styles.tile} ${selectedId === asset.id ? styles.selected : ""}`}
                        aria-pressed={selectedId === asset.id}
                        onClick={() => onSelect(asset)}>
                        <span className={styles.thumb}>
                            {isImageMime(asset.mime_type)
                                ? <Image src={asset.url} alt={asset.alt_text ?? ""} fill sizes="180px" />
                                : <span className={styles.doc}><AdminIcons.FileText width={26} height={26} />PDF</span>}
                            {asset.usages.length > 0 && <span className={styles["in-use"]}>In use</span>}
                        </span>
                        <span className={styles["tile-name"]} title={asset.file_name}>{asset.file_name}</span>
                        <span className={styles["tile-meta"]}>
                            {formatBytes(asset.size_bytes)}{asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    );
}
