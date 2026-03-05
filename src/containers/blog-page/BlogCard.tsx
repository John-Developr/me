import React from "react";
import Link from "next/link";
import styles from "@/styles/pages/blog.module.css";
import SkeletonImage from "@/components/custom/SkeletonImage";
import HrHorizontal from "@/components/hr/HrHorizontal";
import { formatDate } from "@/utils/general/stringHelpers";
import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import { AIBlogResponse } from "@/utils/types";
import { useAnimateIn } from "@/hooks/useAnimateIn";

// ─────────────────────────────────────────────────────────────────────────────
// Each card gets its own hook instance so refs and delays are independent
// ─────────────────────────────────────────────────────────────────────────────

interface BlogCardItemProps {
  item: AIBlogResponse;
  index: number;
}

const BlogCardItem = ({ item, index }: BlogCardItemProps) => {
  const { ref, style } = useAnimateIn<HTMLDivElement>({
    delay: 100 + index * 80, // 100ms, 180ms, 260ms, ...
    duration: 600,
  });

  return (
    <div className={styles.card} ref={ref} style={style}>
      <section>
        <SkeletonImage
          path="/images/Avatar.png"
          className={styles.avatar}
          width={40}
          height={40}
          alt="Avatar"
        />
      </section>
      <section>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles["date-time"]}>
          Posted on {formatDate(item.generated_at)}
          <span> • </span>
          {item.reading} mins read
        </div>
        <p className={styles["short-intro"]}>{item.excerpt}</p>
        <p className={styles.views}>1.2k Views</p>
        <ul className={styles.group}>
          {item.tags.map((tag, tagIdx) => (
            <li key={tagIdx}>{tag}</li>
          ))}
        </ul>
        <Link href={`/blog/${item.slug}`} className={styles["read-more"]}>
          Read More
          <ArrowRightV2 height={12} width={12} />
        </Link>
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────────────────────

export default function BlogCard({ all }: { all: AIBlogResponse[] | undefined }) {
  if (!all || all.length === 0) return null;

  return (
    <>
      {all.map((item, idx) => (
        <React.Fragment key={idx}>
          <BlogCardItem item={item} index={idx} />
          {idx !== all.length - 1 && (
            <HrHorizontal spacingH={30} spacingV={10} thickness={0.5} />
          )}
        </React.Fragment>
      ))}
    </>
  );
}