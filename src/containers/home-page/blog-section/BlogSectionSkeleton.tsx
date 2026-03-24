import React from "react";
import style from "@/styles/pages/page.module.css";

interface BlogSectionSkeletonProps {
  count?: number;
}

const BlogSectionSkeleton = ({ count = 2 }: BlogSectionSkeletonProps) => {
  return (
    <div className={style["blog-section-skeleton"]}>
        {/* cards */}
        {[...Array(count)].map((_, index) => (
            <React.Fragment key={index}>
                <div key={index} className={style["card-skeleton"]}>
                <div className={style["card-title-skeleton"]} />

                <div className={style["card-date-read-skeleton"]} />

                <div className={style["card-excerpt-skeleton"]} />
                <div className={style["card-excerpt-skeleton"]} />

                <div className={style["card-tags-skeleton"]}>
                    {[...Array(3)].map((_, tagIndex) => (
                        <div key={tagIndex} className={style["tag-skeleton"]} />
                    ))}
                </div>
            </div>
            {index !== (count - 1) && (
                <hr className={style["card-divider"]} />
            )}
            </React.Fragment>
        ))}
    </div>
  );
};

export default BlogSectionSkeleton;
