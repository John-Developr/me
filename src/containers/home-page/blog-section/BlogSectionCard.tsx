import styles from "@/styles/pages/page.module.css";

import { useRouter } from "next/dist/client/components/navigation";

import { formatDate } from "@/utils/general/stringHelpers";
import { AIBlogResponse } from "@/utils/types";

const BlogSectionCard = ({ blog }: { blog: AIBlogResponse }) => {
    const router = useRouter();

    return (
        <div
            className={styles.card} 
            onClick={() => router.push(`/blog/${blog.slug}`)}>
            <h3 className={styles.title}>{blog.title}</h3>
            <div className={styles["date-time"]}>
                {formatDate(blog.generated_at)}
                <span>•</span>
                {blog.reading} min read
            </div>
            <p className={styles["short-intro"]}>{blog.excerpt}</p>
            <ul className={styles.group}>
                {blog.tags.map((tag, tagIndex) => (
                    <li key={tagIndex}>{tag}</li>
                ))}
            </ul>
        </div>
    )
}

export default BlogSectionCard;