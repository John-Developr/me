import Image from "next/image";
import Link from "next/link";

import styles from "@/styles/pages/page.module.css";

import { HomeIcons } from "@/components/icons";
import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import { useApp } from "@/lib/.context/AppContext";
import { TECH_LOGOS } from "@/config/techLogos";
import { ProjectItem } from "@/utils/types";

/**
 * "Recent Projects." card — the featured project managed in /admin/projects
 * (or the first published project when none is featured).
 */
export default function ProjectSection({ project }: { project: ProjectItem }) {
    const { isMobile } = useApp()

    return (
        <section className={styles["recent-projects"]}>
            <div className={styles.title}>
                <span className={styles.icon}>
                <HomeIcons.Category 
                 width={20} 
                 height={20} />                                                                         
                </span>
            <h3>
              Recent Projects.
            </h3>
            </div>
            <div className={styles["recent-content"]}>
                <ProjectDetail project={project} isMobile={isMobile} />
                <div className={styles["recent-image"]}>
                    {!isMobile && project.image && (
                        <ProjectImage project={project} />
                    )}
                    <Action project={project} />
                </div>
            </div>
            <br />
            <div className={styles["see-more"]}>
                <Link href="/projects">
                    <HomeIcons.ArrowTopRightCircle 
                     width={15} 
                     height={15} />
                    See More                            
                </Link>
            </div>
        </section>
    )
}

function ProjectDetail({ project, isMobile } : { project: ProjectItem; isMobile: boolean }) {
    return (
        <div className={styles["recent-detail"]}>
            <section className={styles["name-intro"]}>
                <h1>{project.name}</h1>
                {project.tagline && <h2>{project.tagline}</h2>}
            </section>
            {isMobile && project.image && (
                <section className={styles["recent-image"]}>
                    <ProjectImage project={project} />
                </section>
            )}
            {project.description && (
                <section className={styles["about-auth"]}>
                    <h3>Introduction</h3>
                    <p>{project.description}</p>
                </section>
            )}
            {project.tech.length > 0 && (
                <section className={styles["tech-used"]}>
                    <h4>Built With</h4>
                    <ul>
                        {project.tech.map((name) => (
                            <li key={name}>
                                {TECH_LOGOS[name] && (
                                    <Image
                                        src={TECH_LOGOS[name]}
                                        width={14}
                                        height={14}
                                        alt=""
                                        className={styles.avatar}/>
                                )}
                                {name}
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

function ProjectImage({ project }: { project: ProjectItem }) {
    return (
        <section className={styles["recent-image-content"]}>
            <div className={styles["recent-bullets"]}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div>
                <Image
                    src={project.image!}
                    width={250}
                    height={170}
                    alt={`${project.name} screenshot`}
                    className={styles.avatar}/>
            </div>
        </section>
    )
}

function Action({ project }: { project: ProjectItem }) {
    if (project.links.length === 0) return null;

    return (
        <div className={styles["recent-action"]}>
            {project.links.map((link) => (
                <a 
                    key={link.href}
                    href={link.href}
                    className="liquid_glass_btn"
                    target="_blank" 
                    rel="noopener noreferrer">
                    {link.kind === "source" && (
                        <HomeIcons.Github 
                        width={21} 
                        height={18} />
                    )}
                    {link.label}
                    {link.kind === "live" && (
                        <ArrowRightV2 
                            style={{ transform: "rotate(-46grad)" }}
                            width={18} 
                            height={18} />
                    )}
                </a>
            ))}
        </div>
    )
}
