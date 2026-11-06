'use client'

import Image from "next/image";

import Styles from "@/styles/general/component.module.css";

import { useTechLogos } from "@/lib/.context/TechLogosContext";

interface TechChipsProps {
    items:      string[];
    ariaLabel?: string;
}

/**
 * Badge-style chips for tech names. Shows the tool's logo from the Skills
 * admin when it has one, otherwise text only.
 */
export default function TechChips({ items, ariaLabel }: TechChipsProps) {
    const logos = useTechLogos();
    if (items.length === 0) return null;

    return (
        <ul className={Styles["tech-chips"]} aria-label={ariaLabel}>
            {items.map((name) => {
                const logo = logos[name];

                return (
                    <li key={name}>
                        {logo && (
                            <Image
                                src={logo}
                                width={14}
                                height={14}
                                alt="" />
                        )}
                        {name}
                    </li>
                );
            })}
        </ul>
    );
}
