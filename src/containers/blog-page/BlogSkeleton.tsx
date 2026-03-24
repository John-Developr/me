
import React from "react";
import styles from "@/styles/pages/blog.module.css";

interface BlogCardSkeletonProps {
  count?: number;
}

const BlogCardSkeleton = ({ count = 3 }: BlogCardSkeletonProps) => {
    return (
        <div className={styles["blog-skeleton"]}>
            {[...Array(count)].map((_, index) => (
                <React.Fragment key={index}>
                    <div className={styles.card}>
                        {/* Title */}
                        <div className={styles.title} />

                        {/* Meta: date + read time */}
                        <div className={styles.meta}>
                            <div className={styles["meta-item"]} />
                            <div className={styles.dot} />
                            <div className={`${styles["meta-item"]} ${styles["meta-short"]}`} />
                        </div>

                        {/* Excerpt lines */}
                        <div className={styles.line} />
                        <div className={styles.line} />
                        <div className={`${styles.line} ${styles["line-short"]}`} />

                        {/* Views */}
                        <div className={`${styles["meta-item"]} ${styles.views}`} />

                        {/* Tags */}
                        <div className={styles.tags}>
                            {[...Array(4)].map((_, j) => (
                                <div key={j} className={styles.tag} />
                            ))}
                        </div>

                        {/* Read More */}
                        <div className={styles["read-more"]} />
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}

export default BlogCardSkeleton;