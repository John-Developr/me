import React from "react";

import Link from "next/link";

import styles from "@/styles/pages/blog.module.css";
import SkeletonImage from "@/components/custom/SkeletonImage";
import HrHorizontal from "@/components/hr/HrHorizontal";
import { formatDate } from "@/utils/general/stringHelpers";

import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import { AIBlogResponse } from "@/utils/types";

export default function BlogCard({ all }: { all: AIBlogResponse[] | undefined}) {
  return (
    <>
      {all && all.length > 0 && all.map((blog, idx) => (
        <React.Fragment key={idx}>
          <div className={styles.card}>
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
              <h3 className={styles.title}>{blog.title}</h3>
              <div className={styles["date-time"]}>
                Posted on{" "}
                {formatDate(blog.generated_at)}
                <span> • </span>
                {blog.reading} mins read
              </div>
              <p className={styles["short-intro"]}>{blog.excerpt}</p>
              <p className={styles.views}>1.2k Views</p>
              <ul className={styles.group}>
                {blog.tags.map((tag, tagIdx) => (
                  <li key={tagIdx}>{tag}</li>
                ))}
              </ul>
              <Link href={`/blog/${blog.slug}`} className={styles["read-more"]}>
                Read Blog
                <ArrowRightV2 height={15} width={15} />
              </Link>
            </section>
          </div>

          {idx !== (all.length - 1) && (
            <HrHorizontal 
              spacingH={30} 
              spacingV={10} 
              thickness={0.5} 
            />
          )}
        </React.Fragment>
      ))}
    </>
  );
}