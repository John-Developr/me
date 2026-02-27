import Image from "next/image";

import styles from "@/styles/pages/page.module.css";

import { HomeIcons } from "@/components/icons";
import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import { useApp } from "@/lib/.context/AppContext";
import { networkDefine } from "@/config/networkDefine";

export default function ProjectSection() {
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
                <ProjectDetail isMobile={isMobile} />
                <div className={styles["recent-image"]}>
                    {!isMobile && (
                        <ProjectImage />
                    )}
                    <Action />
                </div>
            </div>
            <br />
            <div className={styles["see-more"]}>
                <a href="#">
                    <HomeIcons.ArrowTopRightCircle 
                     width={15} 
                     height={15} />
                    See More                            
                </a>
            </div>
        </section>
    )
}

function ProjectDetail({ isMobile } : { isMobile: boolean }) {
    return (
        <div className={styles["recent-detail"]}>
            <section className={styles["name-intro"]}>
                <h1>Gordon Bostic</h1>
                <h2>Book Author of Poetic Novels</h2>
            </section>
            {isMobile && (
                <section className={styles["recent-image"]}>
                    <ProjectImage />
                </section>
            )}
            <section className={styles["about-auth"]}>
                <h3>Introduction</h3>
                <p>
                    Gordon Bostic is a multi-talented individual who has successfully pursued careers in both technology and writing. 
                    Born in West Virginia, he grew up in Virginia, which likely contributed to his appreciation for both natural landscapes and human experiences.
                </p>
            </section>
            <section className={styles["tech-used"]}>
                <h4>Built With</h4>
                <ul>
                    <li>
                        <Image
                            src="/images/tech/next.png"
                            width={14}
                            height={14}
                            alt="Next JS"
                            className={styles.avatar}/>
                            Next JS
                    </li>
                    <li>
                        <Image
                            src="/images/tech/typescript.png"
                            width={14}
                            height={14}
                            alt="TypeScript"
                            className={styles.avatar}/>
                        TypeScript
                    </li>
                    <li>
                        <Image
                            src="/images/tech/node.png"
                            width={14}
                            height={14}
                            alt="Node JS"
                            className={styles.avatar}/>
                        Node JS
                    </li>
                </ul>
            </section>
        </div>
    )
}

function ProjectImage() {
    return (
        <section className={styles["recent-image-content"]}>
            <div className={styles["recent-bullets"]}>
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div>
                <Image
                    src="/images/Featured.png"
                    width={250}
                    height={170}
                    alt="Featured Project"
                    className={styles.avatar}/>
            </div>
        </section>
    )
}

function Action() {
    return (
        <div className={styles["recent-action"]}>
            <a 
                href={networkDefine.GORDON_PROJECTS_URL} 
                target="_blank" 
                rel="noopener noreferrer">
                    Open Live Site
                <ArrowRightV2 
                    style={{ transform: "rotate(-46grad)" }}
                    width={18} 
                    height={18} />
            </a>
            <a 
                href={networkDefine.GORDON_GITHUB_URL} 
                target="_blank" 
                rel="noopener noreferrer">
                    <HomeIcons.Github 
                    width={21} 
                    height={18} />
                    View Source Code
            </a>
        </div>
    )
}