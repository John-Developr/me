import Image from "next/image";
import Link from "next/link";

import { HomeIcons } from "@/components/icons";
import { TechTool } from "@/utils/types";
import styles from "@/styles/pages/page.module.css";

/** How many core tools the home card shows (the rest are on /tech-stack). */
const HOME_LIMIT = 8;

/** "Tech Stack." card — the Core Stack tools managed in /admin/skills. */
export default function StackSection({ tools }: { tools: TechTool[] }) {
    if (tools.length === 0) return null;

    return (
        <section className={styles["tech-stack"]}>
            <div className={styles.title}>
                <span className={styles.icon}>
                    <HomeIcons.Star 
                     width={20} 
                     height={20} />
                </span>
                <h3>Tech Stack.</h3>
            </div>
            <ul className={styles["tech-container"]}>
                {tools.slice(0, HOME_LIMIT).map((tool) => (
                    <li key={tool.name} className={styles["tech-list"]}>
                        {tool.logo && (
                            <Image
                             src={tool.logo}
                             width={25}
                             height={25}
                             alt=""
                             className={styles["tech-image"]} />
                        )}
                        <div className={styles["tech-detail"]}> 
                            <h5>{tool.name}</h5>
                            <p>{tool.description}</p>
                        </div>  
                    </li>
                ))}
            </ul>
            <div className={styles["see-more"]}>
                <Link href="/tech-stack">
                    <HomeIcons.ArrowTopRightCircle 
                     width={15} 
                     height={15} />
                    See more
                </Link>
            </div>
        </section>
    )
}
