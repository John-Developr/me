import styles from "@/styles/pages/page.module.css";

import { HomeIcons } from "@/components/icons";
import { useApp } from "@/lib/.context/AppContext";

export default function BlogSection() {
    const { blogs } = useApp();

    console.log(blogs)

    return (
        <section className={styles.blog}>
            <div className={styles.title}>
                <HomeIcons.Document
                 width={20} 
                 height={20} />
                <h3>Recent Blog post.</h3>
            </div>
            <div className={styles["card-container"]}>
                {blogs.length > 0 && 
                    blogs.map((blog, index) => (
                    <>
                        <div className={styles.card} key={blog.id}>
                            <h3 className={styles.title}>{blog.title}</h3>
                            <div className={styles["date-time"]}>
                               {new Date(blog.generated_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
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
                        {index !== blogs.length - 1 && (
                            <hr className={styles["card-divider"]} />
                        )}
                    </>
                ))}
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