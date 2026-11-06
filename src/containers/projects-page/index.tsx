'use client'

import React from "react";

import styles from "@/styles/pages/projects.module.css";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import PageIntro from "@/components/header/PageIntro";
import Category from "@/components/icons/Category";
import Calendar from "@/components/icons/Calendar";
import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import PageCta from "@/components/cta/PageCta";
import SectionTitle from "@/components/header/SectionTitle";
import { useSiteProfile } from "@/lib/.context/SiteProfileContext";

import FeaturedProject from "./FeaturedProject";
import ProjectCard from "./ProjectCard";
import { ProjectItem } from "@/utils/types";

interface ProjectsPageProps {
    featured: ProjectItem | null;
    projects: ProjectItem[];
}

export default function ProjectsPage({ featured, projects }: ProjectsPageProps) {
    const { bookingUrl } = useSiteProfile();

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

                {featured && <FeaturedProject project={featured} />}

                {projects.length > 0 && (
                    <section aria-labelledby="more-projects-title">
                        <SectionTitle
                            id="more-projects-title"
                            title={featured ? "More Projects." : "Projects."}
                            icon={Category} />

                        <div className={styles.grid}>
                            {projects.map((project, index) => (
                                <ProjectCard
                                    key={project.slug}
                                    project={project}
                                    index={index} />
                            ))}
                        </div>
                    </section>
                )}

                <PageCta
                    id="projects-cta-title"
                    title="Have a project in mind?"
                    text="Open for freelance projects, collaborations, and full-time opportunities."
                    actions={[
                        {
                            label:   "Let's Work Together",
                            href:    "/contact",
                            variant: "primary",
                            icon:    <ArrowRightV2 width={16} height={16} />,
                            iconEnd: true,
                        },
                        ...(bookingUrl ? [{
                            label:    "Schedule a Call",
                            href:     bookingUrl,
                            variant:  "secondary" as const,
                            external: true,
                            icon:     <Calendar width={16} height={16} />,
                        }] : []),
                    ]} />
            </main>
            <Footer />
        </>
    );
}
