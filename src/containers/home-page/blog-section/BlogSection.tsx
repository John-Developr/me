import React from "react";
import Link from "next/link";

import styles from "@/styles/pages/page.module.css";

import { HomeIcons } from "@/components/icons";
import { useApp } from "@/lib/.context/AppContext";
import { useRouter } from "next/dist/client/components/navigation";
import { formatDate } from "@/utils/general/stringHelpers";

export default function BlogSection() {
    const router = useRouter();
    const { blogs } = useApp();

    return (
        <section className={styles.blog}>
            <div className={styles.title}>
                <HomeIcons.Document
                 width={20} 
                 height={20} />
                <h3>Recent Blog post.</h3>
            </div>
            <div className={styles["card-container"]}>
                {blogs && blogs.recent.length > 0 && 
                    blogs.recent.map((blog, index) => (
                     <React.Fragment key={index}>
                        <div 
                            key={blog.id}
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
                        {index !== (blogs.recent.length - 1) && (
                            <hr className={styles["card-divider"]} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className={styles["see-more"]}>
                <Link href="/blog">
                    <HomeIcons.ArrowTopRightCircle 
                    width={15} 
                    height={15} />
                    See More                            
                </Link>
            </div>
        </section> 
    )
}