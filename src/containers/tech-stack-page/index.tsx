'use client'

import React, { useMemo } from "react";

import styles from "@/styles/pages/techStack.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import PageIntro from "@/components/header/PageIntro";

export default function TechStackPage() {

     const heights = useMemo(() => {
        return Array.from({ length: 10 }).map(
            () => Math.floor(Math.random() * 201) + 350
            // 350–550 (inclusive)
        );
    }, []);

    return (
        <>
            <Header />  
            <PageIntro 
                subtitle="Technologies & Tools" 
                title="stack" 
                intro="A curated collection of tools, frameworks, and technologies I use to build modern, scalable, and high-performing applications. 
                    From frontend to backend, mobile to web, each piece of this stack reflects my approach to writing clean, efficient, and maintainable code."
            />
            <main className={styles.main}>
                <HrHorizontal 
                    spacingH={0} 
                    spacingV={0} 
                    thickness={1} />

                <br />
                <i>This content is currently being updated. Please check back soon.</i>
            </main>
            <Footer />
        </>
    );
}