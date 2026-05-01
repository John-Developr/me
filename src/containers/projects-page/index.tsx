'use client'

import React from "react";

import styles from "@/styles/pages/projects.module.css";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import PageIntro from "@/components/header/PageIntro";

export default function ProjectsPage() {
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
                <i>This content is currently being updated. Please check back soon.</i>
            </main>
            <Footer />
        </>
    );
}