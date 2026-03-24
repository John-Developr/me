import styles from "@/styles/pages/blog.module.css";

interface EmptyBlogProps {
  category?: string;
}

const EmptyBlog = ({ category }: EmptyBlogProps) => {
  return (
    <div className={styles["empty-blog"]}>
      <div className={styles.container}>
        <p className={styles.description}>
            {category && category !== "All"
            ? (<span>There are no blog posts in the "<b>{category}</b>" category yet.</span>)
            : (<span>No blog posts available at the moment.</span>)}
        </p>
        <p className={styles.hint}>Check back soon &mdash; more posts are on the way.</p>
      </div>
    </div>
  );
}

export default EmptyBlog;