import React from "react";
import Link from "next/link";

import styles from "@/styles/pages/page.module.css";

import { HomeIcons } from "@/components/icons";

import BlogSectionList from "./BlogSectionList";

export default function BlogSection() {
    return (
        <section className={styles.blog}>
            <div className={styles.title}>
                <HomeIcons.Document
                 width={20} 
                 height={20} />
                <h3>Recent Blog post.</h3>
            </div>
            <div className={styles["card-container"]}>
                <BlogSectionList />
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