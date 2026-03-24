// components/blog/BlogDetailSkeleton.tsx
import styles from "@/styles/pages/blog.module.css";
import HrHorizontal from "@/components/hr/HrHorizontal";

const BlogDetailSkeleton = () => {
  return (
    <main className={styles["blog-detail-skeleton"]}>

        {/* Author info */}
        <section className={styles["author-section"]}>
            <div className={styles.avatar} />
            <div className={styles["author-info"]}>
            <div className={styles["author-name"]} />
            <div className={styles["author-meta"]} />
            </div>
        </section>

        {/* Title */}
        <div className={styles["title-line-1"]} />
        <div className={styles["title-line-2"]} />

        {/* Excerpt */}
        <div className={styles["excerpt-line-1"]} />
        <div className={styles["excerpt-line-2"]} />

        {/* Divider */}
        <HrHorizontal spacingH={0} spacingV={30} thickness={1} />

        {/* Content paragraphs */}
        {[...Array(2)].map((_, i) => (
            <div key={i} className={styles.paragraph}>
            <div className={styles.line} />
            <div className={styles.line} />
            <div className={styles.line} />
            <div className={`${styles.line} ${styles["line-short"]}`} />
            </div>
        ))}

        {/* Tags */}
        <div className={styles.tags}>
            {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.tag} />
            ))}
        </div>

        {/* Share with */}
        <div className={styles["share-label"]} />
        <div className={styles["share-icons"]}>
            <div className={styles["share-icon"]} />
            <div className={styles["share-icon"]} />
        </div>

    </main>
  );
}

export default BlogDetailSkeleton;