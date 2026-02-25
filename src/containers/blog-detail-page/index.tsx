'use client';

import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/styles/pages/blog.module.css";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import SkeletonImage from "@/components/custom/SkeletonImage";
import ReactMarkdown from "react-markdown";

import { LinkedinV2 } from "@/components/icons/Linkedin";
import { FacebookV2 } from "@/components/icons/Facebook";

import { ArrowRightV2 } from "@/components/icons/ArrowRight";
import { useApp } from "@/lib/.context/AppContext";
import { formatDate } from "@/utils/general/stringHelpers";

export default function BlogDetailPage({ params }: { params: { value: string } }) {
  const { blogs } = useApp();
  
  const getParsedSlugValue = JSON.parse(params.value).slug
  const blog = blogs?.all.find((b) => b.slug === getParsedSlugValue);

  if (!blog) {
    return notFound();
  }

  return (
      <>
        <Header />
        <main className={styles.blogDetail}>
            <Link href="/blog" className={styles["back-to-blogs"]}>
                <span>
                    <ArrowRightV2 
                        width={15} 
                        height={15} 
                        style={{ transform: "scaleX(-1)" }}  /> 
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
                        <span>
                            Published on&nbsp;
                            {formatDate(blog?.generated_at)}
                        </span>
                        <span>{blog?.reading} mins read</span>
                    </p>
                </div> 
            </section>
            <section>
                <h1>{blog?.title}</h1>
                <p className={styles.excerpt}>{blog?.excerpt}</p>
            </section>
            <HrHorizontal 
                spacingH={0} 
                spacingV={30} 
                thickness={1} />
            <section className={styles.content}>
                <ReactMarkdown>{blog?.content || ""}</ReactMarkdown>
            </section>
            <section>
                <ul className={styles.group}>
                    {blog?.tags.map((tag, tagIdx) => (
                        <li key={tagIdx}>{tag}</li>
                    ))}
                </ul>
            </section>
            <ShareWith />
        </main>
        <Footer />
      </>
  );
}


const ShareWith = () => {
  const url = encodeURIComponent(window.location.href);
  const platforms: Record<"facebook" | "linkedin", string> = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}`,
  };

  return (
    <section className={styles["share-with"]}>
      <p>SHARE WITH:</p>
      <ul>
        {Object.entries(platforms).map(([name, link]) => (
          <li
            key={name}
            onClick={() => window.open(link, "_blank", "noopener,noreferrer")}
            style={{ cursor: "pointer" }}
            aria-label={`Share on ${name}`}>
            {name === "facebook" ? 
                <FacebookV2 width={20} height={20} /> : 
                <LinkedinV2 width={20} height={20} />
            }
          </li>
        ))}
      </ul>
    </section>
  );
};