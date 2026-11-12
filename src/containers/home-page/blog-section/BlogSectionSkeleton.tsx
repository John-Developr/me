import React from "react";
import style from "@/styles/pages/page.module.css";

interface BlogSectionSkeletonProps {
  count?: number;
}

const TAG_WIDTHS = [52, 70, 44];

/**
 * Loading placeholder for the home "Recent Blog post." card. Same markup
 * and classes as BlogSectionCard (+ the divider between cards), with a
 * `.bone` inside each text element so heights match the loaded cards.
 */
const BlogSectionSkeleton = ({ count = 2 }: BlogSectionSkeletonProps) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={index}>
          <div className={`${style.card} ${style.loading}`} aria-hidden="true">
            <h3 className={style.title}><i className={style.bone} style={{ width: `${82 - index * 12}%` }} /></h3>
            <div className={style["date-time"]}><i className={style.bone} style={{ width: 120 }} /></div>
            <p className={style["short-intro"]}>
              <i className={style.bone} style={{ width: "100%" }} />
              <i className={style.bone} style={{ width: `${68 - index * 10}%` }} />
            </p>
            <ul>
              {TAG_WIDTHS.map((w, j) => (
                <li key={j}><i className={style.bone} style={{ width: w }} /></li>
              ))}
            </ul>
          </div>
          {index !== count - 1 && <hr className={style["card-divider"]} />}
        </React.Fragment>
      ))}
    </>
  );
};

export default BlogSectionSkeleton;
