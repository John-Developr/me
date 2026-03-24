import Link from "next/link";
import ReactMarkdown from "react-markdown";

import styles from "@/styles/pages/blog.module.css";

import HrHorizontal from "@/components/hr/HrHorizontal";
import SkeletonImage from "@/components/custom/SkeletonImage";
import BlogDetailShareWith from "./BlogDetailShareWith";

import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import { formatDate } from "@/utils/general/stringHelpers";
import { useAnimateIn } from "@/hooks/useAnimateIn";
import { AIBlogResponse } from "@/utils/types";

interface BlogDetailMainProps {
  blog: AIBlogResponse;
}

const BlogDetailMain = ({ blog }: BlogDetailMainProps) => {
  const blogHeader  = useAnimateIn<HTMLDivElement>({ delay: 60,  duration: 600 });
  const blogContent = useAnimateIn<HTMLDivElement>({ delay: 120, duration: 600 });

  return (
    <main className={styles.blogDetail}>

      <div className={styles["blog-header"]} ref={blogHeader.ref} style={blogHeader.style}>
        <Link href="/blog" className={styles["back-to-blogs"]}>
          <span>
            <ArrowRightV2
              width={15}
              height={15}
              style={{ transform: "scaleX(-1)" }}
            />
          </span>
          View All Blogs
        </Link>

        <section className={styles["author-info"]}>
          <div className={styles["author-profile"]}>
            <SkeletonImage
              path="/images/Avatar.png"
              className={styles.avatar}
              width={50}
              height={50}
              alt="Avatar"
            />
          </div>
          <div className={styles["author-name-date"]}>
            <h2>John Carlo A. Ylanan</h2>
            <p>
              <span>Published on&nbsp;{formatDate(blog.generated_at)}</span>
              <span>{blog.reading} mins read</span>
            </p>
          </div>
        </section>

        <section>
          <h1>{blog.title}</h1>
          <p className={styles.excerpt}>{blog.excerpt}</p>
        </section>
      </div>

      <div className={styles["blog-content"]} ref={blogContent.ref} style={blogContent.style}>
        <HrHorizontal spacingH={0} spacingV={30} thickness={1} />

        <section className={styles.content}>
          <ReactMarkdown>{blog.content || ""}</ReactMarkdown>
        </section>

        <section>
          <ul className={styles.group}>
            {blog.tags.map((tag, tagIdx) => (
              <li key={tagIdx}>{tag}</li>
            ))}
          </ul>
        </section>

        <BlogDetailShareWith />
      </div>
    </main>
  );
}

export default BlogDetailMain;