'use client'

import React, { useCallback, useMemo, useState } from "react";

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
import FilterSortBar from "@/components/filter/FilterSortBar";
import { useSiteProfile } from "@/lib/.context/SiteProfileContext";
import { sortProjectsByYear } from "@/utils/projectSort";

import FeaturedProject from "./FeaturedProject";
import ProjectDrawer from "./ProjectDrawer";
import ProjectTile from "./ProjectTile";
import { ProjectItem, ProjectKindEnum } from "@/utils/types";

const ALL = "All";
type TypeFilter = typeof ALL | ProjectKindEnum;

interface ProjectsPageProps {
    featured: ProjectItem | null;
    projects: ProjectItem[];
}

export default function ProjectsPage({ featured, projects }: ProjectsPageProps) {
    const { bookingUrl } = useSiteProfile();
    const [selected, setSelected] = useState<ProjectItem | null>(null);
    const closeDrawer = useCallback(() => setSelected(null), []);

    // Type pills (only types that have projects) + year sort, like the blog bar.
    const [typeFilter, setTypeFilter] = useState<TypeFilter>(ALL);
    const [ascending,  setAscending]  = useState<boolean>(false);

    const typeOptions = useMemo<TypeFilter[]>(
        () => [ALL, ...Object.values(ProjectKindEnum).filter((kind) => projects.some((p) => p.kind === kind))],
        [projects],
    );

    const visibleProjects = useMemo(
        () => sortProjectsByYear(typeFilter === ALL ? projects : projects.filter((p) => p.kind === typeFilter), ascending),
        [projects, typeFilter, ascending],
    );

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

                        <FilterSortBar
                            options={typeOptions}
                            active={typeFilter}
                            onSelect={setTypeFilter}
                            ascending={ascending}
                            onToggleSort={() => setAscending((v) => !v)}
                            filterLabel="Filter projects by type"
                            sortLabel={ascending ? "Sort newest first" : "Sort oldest first"} />

                        <div className={styles.tiles}>
                            {visibleProjects.map((project, index) => (
                                <ProjectTile
                                    key={project.slug}
                                    project={project}
                                    index={index}
                                    onOpen={setSelected} />
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
            <ProjectDrawer project={selected} onClose={closeDrawer} />
            <Footer />
        </>
    );
}
