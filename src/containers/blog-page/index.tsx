'use client';

import React from "react";

import styles from "@/styles/pages/blog.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";

import BlogCard from "@/containers/blog-page/BlogCard";
import PageIntro from "@/components/header/PageIntro";

import Filter from "@/components/icons/Filter";
import SortUp from "@/components/icons/SortUp";
import SortDown from "@/components/icons/SortDown";

import { useApp } from "@/lib/.context/AppContext";

export default function BlogPage() {
    const { blogs } = useApp();

    const changeActive = (e: React.MouseEvent<HTMLButtonElement>) => {
        const buttons = document.querySelectorAll(`.${styles["filter-sort"]} button`);
        buttons.forEach((btn) => btn.classList.remove(styles.active));
        e.currentTarget.classList.add(styles.active);
    };
    
    return (
        <>
            <Header />  
            <PageIntro 
                subtitle="Latests" 
                title="Blog Posts." 
                intro="Dive into a space where technology, learning, future trends, and life insights converge. 
                       Here, I share practical tips, thought-provoking ideas, and personal experiences to inspire developers, learners, and curious minds alike. 
                       Whether you're exploring the latest in web & mobile development, seeking study strategies, or reflecting on life and innovation, there's something here for you."
            />
            <HrHorizontal 
                spacingH={0} 
                spacingV={0} 
                thickness={1} />
            <main>
                <div className={styles["filter-sort"]}>
                    <section>
                        <button className={styles.active} onClick={changeActive}>All</button>
                        <button onClick={changeActive}>Tech</button>
                        <button onClick={changeActive}>Study</button>
                        <button onClick={changeActive}>Life</button>
                        <button onClick={changeActive}>Future</button>
                    </section>
                    <button className={styles.sort}>
                        <SortUp width={20} height={20} />
                    </button>
                </div>
                <div className={styles.blog}>
                    <BlogCard all={blogs?.all} />
                </div> 
            </main>
            <Footer />
        </>
    );
}