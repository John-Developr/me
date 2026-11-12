import Link from "next/link";
import styles from "@/styles/pages/blog.module.css";

import HrHorizontal from "@/components/hr/HrHorizontal";
import BlogDetailShareWith from "./BlogDetailShareWith";
import { ArrowRightV2 } from "@/components/icons/ArrowRight";

const PARAGRAPHS = [[100, 100, 96, 58], [100, 98, 100, 72], [100, 94, 40]];
const TAG_WIDTHS = [70, 90, 60, 80, 54];

/**
 * Loading placeholder for a blog post. Same markup and classes as
 * BlogDetailMain (back link, author row, title, excerpt, divider, body,
 * tags, share buttons); `.bone`s inside the real elements keep every
 * line at the loaded post's height.
 */
const BlogDetailSkeleton = () => {
  return (
    <main className={styles.blogDetail} aria-busy="true" aria-label="Loading post">
      <div className={styles["blog-header"]}>
        <Link href="/blog" className={`${styles["back-to-blogs"]} liquid_glass_group`}>
          <span className="liquid_glass">
            <ArrowRightV2 width={15} height={15} style={{ transform: "scaleX(-1)" }} />
          </span>
          View All Blogs
        </Link>

        <section className={styles["author-info"]} aria-hidden="true">
          <div className={styles["author-profile"]}>
            <i className={`${styles.bone} ${styles["bone-avatar"]}`} />
          </div>
          <div className={styles["author-name-date"]}>
            <h2><i className={styles.bone} style={{ width: 240 }} /></h2>
            <p><i className={styles.bone} style={{ width: 210 }} /></p>
          </div>
        </section>

        <section aria-hidden="true">
          <h1>
            <i className={styles.bone} style={{ width: "92%" }} />
            <i className={styles.bone} style={{ width: "55%" }} />
          </h1>
          <p className={styles.excerpt}>
            <i className={styles.bone} style={{ width: "100%" }} />
            <i className={styles.bone} style={{ width: "72%" }} />
          </p>
        </section>
      </div>

      <div className={styles["blog-content"]}>
        <HrHorizontal spacingH={0} spacingV={30} thickness={1} />

        <section className={styles.content} aria-hidden="true">
          <div className={styles.prose}>
            {PARAGRAPHS.map((lines, i) => (
              <p key={i}>
                {lines.map((w, j) => <i key={j} className={styles.bone} style={{ width: `${w}%` }} />)}
              </p>
            ))}
          </div>
        </section>

        <section aria-hidden="true">
          <ul className={styles.group}>
            {TAG_WIDTHS.map((w, i) => (
              <li key={i}><i className={styles.bone} style={{ width: w }} /></li>
            ))}
          </ul>
        </section>

        <BlogDetailShareWith />
      </div>
    </main>
  );
};

export default BlogDetailSkeleton;
