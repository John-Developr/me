import { HomeIcons } from "@/components/icons";
import styles from "@/styles/pages/page.module.css";

export default function BlogSection() {
    return (
        <section className={styles.blog}>
            <div className={styles.title}>
                <HomeIcons.Document
                 width={20} 
                 height={20} />
                <h3>Recent Blog post.</h3>
            </div>
            <div className={styles["card-container"]}>
                <div className={styles.card}>
                <h3 className={styles.title}>Getting Started with Generative AI: Practical Examples and Best Practices</h3>
                <div className={styles["date-time"]}>
                    April 8, 2025
                    <span>•</span>
                    3 min read
                </div>
                <p className={styles["short-intro"]}>Generative AI, a hot topic in the tech world, is all about creating new content. Instead of just analyzing existing data, these models generate it.</p>
                <ul className={styles.group}>
                    <li>Generative AI</li>
                    <li>Programming</li>
                    <li>Web Development</li>
                    <li>+3 More</li>
                </ul>
                </div>
                <hr className={styles["card-divider"]} />
                <div className={styles.card}>
                <h3 className={styles.title}>Getting Started with Generative AI: Practical Examples and Best Practices</h3>
                <div className={styles["date-time"]}>
                    April 8, 2025
                    <span>•</span>
                    3 min read
                </div>
                <p className={styles["short-intro"]}>Generative AI, a hot topic in the tech world, is all about creating new content. Instead of just analyzing existing data, these models generate it.</p>
                <ul className={styles.group}>
                    <li>Generative AI</li>
                    <li>Programming</li>
                    <li>Web Development</li>
                    <li>+3 More</li>
                </ul>
                </div>
            </div>
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