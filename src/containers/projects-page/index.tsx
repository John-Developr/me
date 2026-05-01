'use client'

import React, { useMemo } from "react";

import styles from "@/styles/pages/projects.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import PageIntro from "@/components/header/PageIntro";

export default function ProjectsPage() {
    const heights = useMemo(() => {
        const baseHeights = [250, 290, 400, 360]; // your 4 different heights

        return Array.from({ length: 10 }).map(() => {
            const randomIndex = Math.floor(Math.random() * baseHeights.length);
            return baseHeights[randomIndex];
        });
    }, []);

    return (
        <>
            <Header />  
            <PageIntro 
                subtitle="Showcases"
                title="My Work"
                intro="Each of these projects shows how I solve problems, write code, and use technologies, frameworks, and tools to make applications that work well and can handle a lot of users."
            />
            <main className={styles.main}>
                <HrHorizontal 
                    spacingH={0} 
                    spacingV={0} 
                    thickness={1} />

                <br />
                <div className={styles.sort}>
                    <span>Sort by:</span>
                    <select>
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="most-popular">Most Popular</option>
                    </select>
                </div>
                <div className={styles.list}>
                    {heights.map((h, index) => (
                        <div
                            key={index}
                            className={styles.card}
                            style={{ height: `${h}px` }}>
                            Card {index + 1}
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}