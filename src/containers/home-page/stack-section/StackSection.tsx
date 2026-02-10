import Image from "next/image";
import Link from "next/link";

import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";

export default function StackSection() {
    return (
        <section className={styles["tech-stack"]}>
            <div className={styles.title}>
                <span className={styles.icon}>
                    <HomeIcons.Star 
                     width={20} 
                     height={20} />
                </span>
                <h3>Tech Stack.</h3>
            </div>
            <ul className={styles["tech-container"]}>
                <li className={styles["tech-list"]}>
                    <Image
                     src="/images/tech/react.png"
                     width={25}
                     height={25}
                     alt="Avatar"
                     className={styles["tech-image"]} />
                    <div className={styles["tech-detail"]}> 
                    <h5>React / React Native</h5>
                    <p>building scalable web and native applications.</p>
                    </div>  
                </li>
                <li className={styles["tech-list"]}>
                    <Image
                        src="/images/tech/next.png"
                        width={25}
                        height={25}
                        alt="Avatar"
                        className={styles["tech-image"]}/>
                    <div className={styles["tech-detail"]}> 
                        <h5>Next JS</h5>
                        <p>React framework for fast, SEO-friendly web.</p>
                    </div>  
                </li>
                <li className={styles["tech-list"]}>
                    <Image
                     src="/images/tech/figma.png"
                     width={25}
                     height={25}
                     alt="Avatar"
                     className={styles["tech-image"]} />
                    <div className={styles["tech-detail"]}> 
                        <h5>Figma</h5>
                        <p>A cloud-based design tool for UI/UX.</p>
                    </div>  
                </li>
                <li className={styles["tech-list"]}>
                    <Image
                     src="/images/tech/chatgpt.png"
                     width={25}
                     height={25}
                     alt="Avatar"
                     className={styles["tech-image"]} />
                    <div className={styles["tech-detail"]}> 
                        <h5>ChatGPT</h5>
                        <p>An AI chatbot for assistant.</p>
                    </div>  
                </li>
                <li className={styles["tech-list"]}>
                    <Image
                     src="/images/tech/node.png"
                     width={25}
                     height={25}
                     alt="Avatar"
                     className={styles["tech-image"]} />
                    <div className={styles["tech-detail"]}> 
                        <h5>Node JS</h5>
                        <p>Used to build APIs, servers, and real-time apps.</p>
                    </div>  
                </li>
                <li className={styles["tech-list"]}>
                    <Image
                     src="/images/tech/supabase.png"
                     width={25}
                     height={25}
                     alt="Avatar"
                     className={styles["tech-image"]} />
                    <div className={styles["tech-detail"]}> 
                        <h5>Supabase</h5>
                        <p>Backend platform with database and auth.</p>
                    </div>  
                </li>
            </ul>
            <div className={styles["see-more"]}>
                <Link href="/tech-stack">
                    <HomeIcons.ArrowTopRightCircle 
                     width={15} 
                     height={15} />
                    See more
                </Link>
            </div>
        </section>
    )
}