'use client'

import React, { useState, useMemo } from "react";

import styles from "@/styles/pages/blog.module.css";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";
import PageIntro from "@/components/header/PageIntro";
import SortUp from "@/components/icons/SortUp";
import SortDown from "@/components/icons/SortDown";

import { useAnimateIn } from "@/hooks/useAnimateIn";

import { 
    AIBlogResponse, 
    BlogCategoryEnum, 
    BlogCategoryItem, 
    BlogSortEnum, 
    fetchState, 
    FetchStateEnum 
} from "@/utils/types";


import BlogMainList from "./BlogMainList";

interface BlogsState {
  blogList:   AIBlogResponse[];
  state:      fetchState;
  sort:       BlogSortEnum;
  categories: BlogCategoryItem[];  
  error?:     string;
}

const initialState: BlogsState = {
  blogList:   [],
  state:      FetchStateEnum.loading,
  sort:       BlogSortEnum.desc,
  categories: [
    { name: BlogCategoryEnum.All,     active: true  },
    { name: BlogCategoryEnum.Tech,    active: false },
    { name: BlogCategoryEnum.Study,   active: false },
    { name: BlogCategoryEnum.Life,    active: false },
    { name: BlogCategoryEnum.Future,  active: false },
  ],
};

export default function BlogPage() {
    const [blogsStates, setBlogsStates] = useState<BlogsState>(initialState);    
    const { ref, style }                = useAnimateIn<HTMLDivElement>({ delay: 120, duration: 600 });


    const activeCategory: BlogCategoryEnum = useMemo(() => {
        return blogsStates.categories.find((cat) => cat.active)?.name ?? BlogCategoryEnum.All;
    }, [blogsStates.categories]);

    const handleCategoryChange = (category: BlogCategoryEnum) => {
        if (activeCategory === category) {
            return;
        }

        setBlogsStates((prev) => ({
            ...prev,
            state: FetchStateEnum.loading,
            categories: prev.categories.map((cat) => ({
                ...cat,
                active: cat.name === category,
            })),
        }));
    };

    const handleSortToggle = () => {
        const newSort: BlogSortEnum = 
            blogsStates.sort === BlogSortEnum.asc ? 
            BlogSortEnum.desc : 
            BlogSortEnum.asc;

        setBlogsStates((prev) => ({
            ...prev,
            sort: newSort,
            state: FetchStateEnum.loading,
        }));
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
            <main ref={ref} style={style}>
                <HrHorizontal 
                    spacingH={0} 
                    spacingV={0} 
                    thickness={1} />

                <br />

                <div className={styles["filter-sort"]}>
                    <section>
                        {blogsStates.categories.map((cat) => (
                            <button
                                key={cat.name}
                                className={cat.active ? styles.active : ""}
                                onClick={() => handleCategoryChange(cat.name)}>
                                {cat.name}
                            </button>
                        ))}
                    </section>
                    <button 
                        className={`
                            ${styles.sort} 
                            ${blogsStates.sort === BlogSortEnum.asc ? styles["active-sort"] : ""}
                        `} 
                        onClick={handleSortToggle}>
                        {blogsStates.sort === BlogSortEnum.asc ? 
                        <SortUp width={20} height={20} /> : 
                        <SortDown width={20} height={20} />}
                    </button>
                </div>
                <div className={styles.blog}>
                    <BlogMainList 
                        category={activeCategory} 
                        sort={blogsStates.sort} 
                        state={blogsStates.state}
                        setState={(newState) => {
                            setBlogsStates((prev) => ({
                                ...prev,
                                state: newState,
                            }));
                        }}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
}