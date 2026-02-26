'use client'

import React from "react";
import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";
import Image from "next/image";

export default function ExperienceSection() {
    const calculateDuration = React.useMemo(() => (dateString: string): string => {
        const start: Date = new Date(dateString);
        const now: Date = new Date();

        // Total difference in milliseconds
        const diffMs: number = now.getTime() - start.getTime();
        const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Less than a month → show days
        if (diffDays < 30)
            return `For ${diffDays} day${diffDays !== 1 ? "s" : ""}`;

        // Calculate years and months
        let years: number = now.getFullYear() - start.getFullYear();
        let months: number = now.getMonth() - start.getMonth();

        // Adjust months if current day < start day
        if (now.getDate() < start.getDate()) {
            months--;
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        // Less than 1 year → show months
        if (years <= 0)
            return `For ${months} month${months !== 1 ? "s" : ""} now`;

        // 1 year or more → show years
        return `For ${years} year${years !== 1 ? "s" : ""} now`;
    }, []);

    return (
        <section className={styles.experience}>
            <div className={styles.title}>
                <HomeIcons.Work 
                    width={20} 
                    height={20} />
                <h3>Experience.</h3>
            </div>
            <ul className={styles["list-exp"]}>
                <li className={styles["has-sub"]}>
                    <div className={styles["ex-name-date-profile"]}>
                        <Image
                            src="/images/company/Forty.png"
                            width={25}
                            height={25}
                            alt="Company Logo" />
                        <section>
                            <h4>Forty Degrees Celsius, Inc.</h4>
                            <p className={styles["ex-date"]}>07 / 2023 - Present</p>
                        </section>
                    </div>
                    <ul>
                        <li>
                            <p className={styles["ex-pos"]}>iOS Developer</p>
                            <p className={styles["ex-date"]}>{calculateDuration("2024-01-01")}</p>
                        </li>
                        <li>
                            <p className={styles["ex-pos"]}>Web Developer</p>
                            <p className={styles["ex-date"]}>For 6 months</p>
                        </li>
                    </ul>
                </li>
                <li className={styles["no-sub"]}>
                    <div className={styles["ex-name-date-profile"]}>
                        <Image
                            src="/images/company/Proweaver.png"
                            width={25}
                            height={25}
                            alt="Company Logo" />
                        <section>
                            <h4>Proweaver, Inc.</h4>  
                            <p className={styles["ex-pos"]}>Full Stack Developer</p>
                            <p className={styles["ex-date"]}>07 / 2021 - 07 / 2023</p>
                        </section>
                    </div>
                </li>
                <li className={styles["no-sub"]}>
                    <div className={styles["ex-name-date-profile"]}>
                        <Image
                            src="/images/company/UC.png"
                            width={25}
                            height={25}
                            alt="Company Logo" />
                        <section>
                            <h4>University of Cebu - Main</h4>  
                            <p className={styles["ex-pos"]}>BS Information Technology</p>
                            <p className={styles["ex-date"]}>07 / 2015 - 07 / 2021</p>
                        </section>
                    </div>
                </li>
                <li className={styles["no-sub"]}>
                    <div className={styles["ex-name-date-profile"]}>
                        <Image
                            src="/images/company/CodeTag.png"
                            width={25}
                            height={25}
                            alt="Company Logo" />
                        <section>
                            <h4>Hello wordl! </h4>  
                            <p className={styles["ex-pos"]}>Wrote my first line of code</p>
                            <p className={styles["ex-date"]}>06 / 2015</p>
                        </section>
                    </div>
                </li>
            </ul>
        </section>
    )
}