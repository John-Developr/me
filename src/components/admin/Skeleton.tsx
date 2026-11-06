import { CSSProperties } from "react";
import styles from "@/styles/pages/admin.module.css";

interface SkeletonProps {
    width?:  CSSProperties["width"];
    height?: CSSProperties["height"];
    radius?: CSSProperties["borderRadius"];
    className?: string;
}

/** Shimmering placeholder block (uses the --skeleton-* tokens). */
export default function Skeleton({ width = "100%", height = 14, radius = 6, className }: SkeletonProps) {
    return (
        <span
            className={`${styles.skeleton} ${className ?? ""}`}
            style={{ width, height, borderRadius: radius }}
            aria-hidden="true" />
    );
}
