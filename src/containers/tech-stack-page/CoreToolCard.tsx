import Image from "next/image";

import styles from "@/styles/pages/techStack.module.css";

import Star from "@/components/icons/Star";
import { useAnimateIn } from "@/hooks/useAnimateIn";
import { TechTool } from "@/utils/types";

interface CoreToolCardProps {
    tool:  TechTool;
    index: number; // for the staggered entrance
}

/**
 * A featured tool in the "Core Stack." grid: logo, name, one-line description.
 */
export default function CoreToolCard({ tool, index }: CoreToolCardProps) {
    const { ref, style } = useAnimateIn<HTMLLIElement>({
        delay:    100 + index * 50, // 100ms, 150ms, 200ms, ...
        duration: 600,
    });

    return (
        <li ref={ref} style={style} className={styles.tool}>
            <span className={styles["tool-logo"]} aria-hidden="true">
                {tool.logo
                    ? <Image src={tool.logo} width={28} height={28} alt="" />
                    : <Star width={20} height={20} />}
            </span>
            <div className={styles["tool-detail"]}>
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
            </div>
        </li>
    );
}
