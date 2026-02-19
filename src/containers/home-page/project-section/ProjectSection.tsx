import Image from "next/image";

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";
import { useApp } from "@/lib/.context/AppContext";


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
                {!isMobile && (
                    <ProjectImage isMobile={isMobile} />
                )}
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
                    <Image
                    src="/images/featured.png"
                    width={250}
                    height={220}
                    alt="Avatar"
                    className={styles.avatar}/>
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
                <h4>Technologies</h4>
                <ul>
                    <li>
                        <Image
                            src="/images/tech/next.png"
                            width={14}
                            height={14}
                            alt="Avatar"
                            className={styles.avatar}/>
                            Next JS
                    </li>
                    <li>
                        <Image
                            src="/images/tech/typescript.png"
                            width={14}
                            height={14}
                            alt="Avatar"
                            className={styles.avatar}/>
                        TypeScript
                    </li>
                    <li>
                        <Image
                            src="/images/tech/node.png"
                            width={14}
                            height={14}
                            alt="Avatar"
                            className={styles.avatar}/>
                        Node JS
                    </li>
                </ul>
            </section>
            {isMobile && (
               <Action />
            )}
        </div>
    )
}

function ProjectImage({ isMobile } : { isMobile: boolean }) {
    return (
        <div className={styles["recent-image"]}>
            <Image
                src="/images/featured.png"
                width={250}
                height={220}
                alt="Avatar"
                className={styles.avatar}/>
            {!isMobile && (
               <Action />
            )}
        </div>
    )
}

function Action() {
    return (
        <div className={styles["recent-action"]}>
            <button>
                <HomeIcons.Link 
                    width={18} 
                    height={18} />
                Open projects
            </button>
            <button>
                <HomeIcons.GithubFaceV 
                    width={21} 
                    height={16} />
            </button>
        </div>
    )
}