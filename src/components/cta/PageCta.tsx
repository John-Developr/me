'use client'

import Link from "next/link";
import { ReactNode } from "react";

import Styles from "@/styles/general/component.module.css";

import { useAnimateIn } from "@/hooks/useAnimateIn";

export interface PageCtaAction {
    label:     string;
    href:      string;
    variant:   "primary" | "secondary";
    external?: boolean;   // opens in a new tab
    icon?:     ReactNode;
    iconEnd?:  boolean;   // icon after the label (default: before)
}

interface PageCtaProps {
    id:      string;      // used for aria-labelledby
    title:   string;
    text:    string;
    actions: PageCtaAction[];
}

/**
 * Closing call-to-action card for inner pages (Projects, Tech Stack):
 * title + one line on the left, action buttons on the right
 * (stacked on mobile).
 */
export default function PageCta({ id, title, text, actions }: PageCtaProps) {
    const { ref, style } = useAnimateIn<HTMLElement>({ delay: 120, duration: 600 });

    return (
        <section ref={ref} style={style} className={Styles["page-cta"]} aria-labelledby={id}>
            <div>
                <h2 id={id}>{title}</h2>
                <p>{text}</p>
            </div>
            <div className={Styles["action-links"]}>
                {actions.map((action) => {
                    const className = `liquid_glass_btn ${Styles["action-button"]} ${Styles[`action-${action.variant}`]}`;
                    const content = (
                        <>
                            {!action.iconEnd && action.icon}
                            {action.label}
                            {action.iconEnd && action.icon}
                        </>
                    );

                    return action.external ? (
                        <a
                            key={action.href}
                            href={action.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${action.label} (opens in a new tab)`}
                            className={className}>
                            {content}
                        </a>
                    ) : (
                        <Link key={action.href} href={action.href} className={className}>
                            {content}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
