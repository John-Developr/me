'use client'

import styles from "@/styles/pages/page.module.css";
import { useAnimateIn } from "@/hooks/useAnimateIn";
import { useApp } from "@/lib/.context/AppContext";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import DetailSection from "./detail-section/DetailSection";
import AboutSection from "./about-section/AboutSection";
import StackSection from "./stack-section/StackSection";
import ExperienceSection from "./experience-section/ExperienceSeciton";
import ProjectSection from "./project-section/ProjectSection";
import ConnectionSection from "./connect-section/ConnectSection";
import BlogSection from "./blog-section/BlogSection";

// ─────────────────────────────────────────────────────────────────────────────
// Animated section wrapper
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedSectionProps {
  className: string;
  delay: number;
  children: React.ReactNode;
}

const AnimatedSection = ({ className, delay, children }: AnimatedSectionProps) => {
  const { ref, style } = useAnimateIn<HTMLElement>({ delay, duration: 600 });
  return (
    <section className={className} ref={ref} style={style}>
      {children}
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { isMobile } = useApp();

  return (
    <>
      <Header />

      <AnimatedSection className={styles.first} delay={50}>
        <DetailSection />
      </AnimatedSection>

      <AnimatedSection className={styles.second} delay={150}>
        <SecondContent isMobile={isMobile} />
      </AnimatedSection>

      <AnimatedSection className={styles.third} delay={220}>
        <ProjectSection />
      </AnimatedSection>

      <AnimatedSection className={styles.fourth} delay={280}>
        <ConnectionSection />
        <BlogSection />
      </AnimatedSection>

      <Footer />
    </>
  );
}

const SecondContent = ({ isMobile } : {isMobile : boolean}) => {
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