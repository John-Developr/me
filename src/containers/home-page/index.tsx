'use client';

import styles from "@/styles/pages/page.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

// Sections
import DetailSection from "./detail-section/DetailSection";
import AboutSection from "./about-section/AboutSection";
import StackSection from "./stack-section/StackSection";
import ExperienceSection from "./experience-section/ExperienceSeciton";
import ProjectSection from "./project-section/ProjectSection";
import ConnectionSection from "./connect-section/ConnectSection";
import BlogSection from "./blog-section/BlogSection";

import { useApp } from "@/lib/.context/AppContext";

export default function HomePage() {
    const { isMobile } = useApp();

    return (
        <>
            <Header />

            <section className={styles.first}>
                <DetailSection />
            </section>

            <section className={styles.second}>
                <SecondContent isMobile={isMobile} />
            </section>

            <section className={styles.third}>
                <ProjectSection />
            </section>

            <section className={styles.fourth}>
                <ConnectionSection />
                <BlogSection />
            </section>

            <Footer />
        </>
    );
}

function SecondContent({ isMobile } : {isMobile : boolean}) {
    if (isMobile) {
        return (
            <>
            <section className={styles["left-content"]}>
                <AboutSection />
                <ExperienceSection />
            </section>

            <section className={styles["right-content"]}>
                <StackSection />
            </section>
            </>
        )
    }

    return (
        <>
        <section className={styles["left-content"]}>
            <AboutSection />
            <StackSection />
        </section>

        <section className={styles["right-content"]}>
            <ExperienceSection />
        </section>
        </>
    )
}
