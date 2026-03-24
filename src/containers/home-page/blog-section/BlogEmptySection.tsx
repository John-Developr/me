import styles from "@/styles/pages/page.module.css";

const BlogEmptySection = () => {
    return (
        <div className={styles["empty-section"]}>
            <div className={styles["container"]}>
                <h2 className={styles["title"]}>No blog posts yet</h2>
                <p className={styles["description"]}>
                    There are no blog posts available at the moment.
                </p>
                <p className={styles["hint"]}>
                    Check back later for new content!
                </p>
            </div>
        </div>
    );
};

export default BlogEmptySection;