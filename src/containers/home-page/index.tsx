'use client'

import styles from "@/styles/pages/page.module.css";
import { useAnimateIn } from "@/hooks/useAnimateIn";
import { useApp } from "@/lib/.context/AppContext";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import DetailSection from "./detail-section/DetailSection";
import AboutSection from "./about-section/AboutSection";
import StackSection from "./stack-section/StackSection";
import ExperienceSection from "./experience-section/ExperienceSection";
import ProjectSection from "./project-section/ProjectSection";
import ConnectionSection from "./connect-section/ConnectSection";
import BlogSection from "./blog-section/BlogSection";
import { ProjectItem, PublicProfile, TechTool, TimelineGroup } from "@/utils/types";

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

interface HomePageProps {
  profile:    PublicProfile;
  experience: TimelineGroup[];
  /** Featured project for "Recent Projects."; the card is hidden when there is none. */
  project:    ProjectItem | null;
  /** Core Stack tools for the "Tech Stack." card. */
  coreTools:  TechTool[];
}

export default function HomePage({ profile, experience, project, coreTools }: HomePageProps) {
  const { isMobile } = useApp();

  return (
    <>
      <Header />

      <AnimatedSection className={styles.first} delay={50}>
        <DetailSection profile={profile} />
      </AnimatedSection>

      <AnimatedSection className={styles.second} delay={150}>
        <SecondContentSections isMobile={isMobile} bio={profile.bio} experience={experience} coreTools={coreTools} />
      </AnimatedSection>

      {project && (
        <AnimatedSection className={styles.third} delay={220}>
          <ProjectSection project={project} />
        </AnimatedSection>
      )}

      <AnimatedSection className={styles.fourth} delay={280}>
        <ConnectionSection profile={profile} />
        <BlogSection />
      </AnimatedSection>

      <Footer />
    </>
  );
}

interface SecondContentProps {
  isMobile:   boolean;
  bio:        string[];
  experience: TimelineGroup[];
  coreTools:  TechTool[];
}

const SecondContentSections = ({ isMobile, bio, experience, coreTools }: SecondContentProps) => {
    if (isMobile) {
        return (
          <>
              <section className={styles["left-content"]}>
                  <AboutSection bio={bio} />
                  <ExperienceSection groups={experience} />
              </section>

              <section className={styles["right-content"]}>
                  <StackSection tools={coreTools} />
              </section>
          </>
        )
    }

    return (
      <>
          <section className={styles["left-content"]}>
              <AboutSection bio={bio} />
              <StackSection tools={coreTools} />
          </section>

          <section className={styles["right-content"]}>
              <ExperienceSection groups={experience} />
          </section>
      </>
    )
}