'use client'

import { ComponentType, SVGProps } from "react";

import Styles from "@/styles/general/component.module.css";

import { useAnimateIn } from "@/hooks/useAnimateIn";

interface SectionTitleProps {
    id:     string;   // referenced by the section's aria-labelledby
    title:  string;   // house style: ends with a period, e.g. "More Projects."
    icon:   ComponentType<SVGProps<SVGSVGElement>>;
    delay?: number;   // entrance animation delay (ms)
}

/**
 * Section heading for inner pages: 20px icon + short title,
 * matching the home cards' title rows.
 */
export default function SectionTitle({ id, title, icon: Icon, delay = 100 }: SectionTitleProps) {
    const { ref, style } = useAnimateIn<HTMLDivElement>({ delay, duration: 600 });

    return (
        <div ref={ref} style={style} className={Styles["section-title"]}>
            <Icon width={20} height={20} aria-hidden="true" />
            <h2 id={id}>{title}</h2>
        </div>
    );
}
