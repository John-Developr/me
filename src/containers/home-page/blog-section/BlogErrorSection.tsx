import styles from "@/styles/pages/page.module.css";

const BlogErrorSection = () => {
    return (
        <div className={styles["error-section"]}>
           {/* Icon */}
            <div className={styles["container"]}>
                <div className={styles["icon"]}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.2"/>
                        <line x1="14" y1="8" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="14" cy="19" r="1.2" fill="currentColor"/>
                    </svg>
                </div>

                <h2 className={styles["title"]}>Something went wrong</h2>
                <p className={styles["description"]}>We couldn't load the blog posts. This might be a server issue.</p>
                <p className={styles["hint"]}>Please try again later or refresh the page.</p>
            </div>
        </div>
    )
}

export default BlogErrorSection;