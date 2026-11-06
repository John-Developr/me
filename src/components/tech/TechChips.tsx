import Image from "next/image";

import Styles from "@/styles/general/component.module.css";

import { TECH_LOGOS } from "@/config/techLogos";

interface TechChipsProps {
    items:      string[];
    ariaLabel?: string;
}

/**
 * Badge-style chips for tech names. Shows the logo from TECH_LOGOS
 * when one exists, otherwise text only.
 */
export default function TechChips({ items, ariaLabel }: TechChipsProps) {
    if (items.length === 0) return null;

    return (
        <ul className={Styles["tech-chips"]} aria-label={ariaLabel}>
            {items.map((name) => {
                const logo = TECH_LOGOS[name];

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
