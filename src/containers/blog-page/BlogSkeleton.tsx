import React from "react";
import styles from "@/styles/pages/blog.module.css";

interface BlogCardSkeletonProps {
  count?: number;
}

const TAG_WIDTHS = [64, 82, 56, 48];

/**
 * Loading placeholder for the blog list. Same markup and classes as
 * BlogCard; each `.bone` sits inside the real element (h3, date line,
 * excerpt, views, tags, Read More) so it takes that text's line height
 * and the card keeps its size when the posts arrive.
 */
const BlogCardSkeleton = ({ count = 3 }: BlogCardSkeletonProps) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={styles["blog-card"]} aria-hidden="true">
          <section>
            <h3 className={styles.title}><i className={styles.bone} style={{ width: `${78 - index * 9}%` }} /></h3>
            <div className={styles["date-time"]}><i className={styles.bone} style={{ width: 190 }} /></div>
            <p className={styles["short-intro"]}>
              <i className={styles.bone} style={{ width: "100%" }} />
              <i className={styles.bone} style={{ width: `${70 - index * 8}%` }} />
            </p>
            <p className={styles.views}><i className={styles.bone} style={{ width: 60 }} /></p>
            <ul className={styles.group}>
              {TAG_WIDTHS.map((w, j) => (
                <li key={j}><i className={styles.bone} style={{ width: w }} /></li>
              ))}
            </ul>
            <span className={styles["read-more"]}><i className={styles.bone} style={{ width: 80 }} /></span>
          </section>
        </div>
      ))}
    </>
  );
};

export default BlogCardSkeleton;
