'use client'

import Image from "next/image";

import { HomeIcons } from "@/components/icons";
import { TimelineGroup } from "@/utils/types";
import styles from "@/styles/pages/page.module.css";

/** Company/school logo, or the same left offset when there isn't one. */
function Logo({ src }: { src: string | null }) {
    if (!src) return <span className={styles["no-image"]} aria-hidden="true" />;
    return <Image src={src} width={25} height={25} alt="" />;
}

/**
 * "Experience." card — the career timeline managed in /admin/experience.
 * Several roles at one company render as a group with per-role durations;
 * everything else is a single entry with its date range.
 */
export default function ExperienceSection({ groups }: { groups: TimelineGroup[] }) {
    if (groups.length === 0) return null;

    return (
        <section className={styles.experience}>
            <div className={styles.title}>
                <HomeIcons.Work 
                    width={20} 
                    height={20} />
                <h3>Experience.</h3>
            </div>
            <ul className={styles["list-exp"]}>
                {groups.map((group) => group.roles.length > 1 ? (
                    <li key={group.key} className={styles["has-sub"]}>
                        <div className={styles["ex-name-date-profile"]}>
                            <Logo src={group.logoUrl} />
                            <section>
                                <h4>{group.company}</h4>
                                <p className={styles["ex-date"]}>{group.dateLabel}</p>
                            </section>
                        </div>
                        <ul>
                            {group.roles.map((role) => (
                                <li key={role.key}>
                                    <p className={styles["ex-pos"]}>{role.position}</p>
                                    <p className={styles["ex-date"]}>{role.durationLabel}</p>
                                </li>
                            ))}
                        </ul>
                    </li>
                ) : (
                    <li key={group.key} className={styles["no-sub"]}>
                        <div className={styles["ex-name-date-profile"]}>
                            <Logo src={group.logoUrl} />
                            <section>
                                <h4>{group.company}</h4>
                                <p className={styles["ex-pos"]}>{group.roles[0].position}</p>
                                <p className={styles["ex-date"]}>{group.roles[0].dateLabel}</p>
                            </section>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
