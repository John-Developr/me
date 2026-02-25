'use client';

import React, { useCallback, useState, useRef } from "react";

import styles from "@/styles/pages/blog.module.css";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import HrHorizontal from "@/components/hr/HrHorizontal";

import BlogCard from "@/containers/blog-page/BlogCard";
import PageIntro from "@/components/header/PageIntro";

import SortUp from "@/components/icons/SortUp";
import SortDown from "@/components/icons/SortDown";

import { useApp } from "@/lib/.context/AppContext";
import { AIBlogResponse, BlogCategoryEnum } from "@/utils/types";
import { debounce } from "@/utils/general/helpers";

enum SortEnum {
    asc = "asc",
    desc = "desc"
}

export default function BlogPage() {
    const { blogs, setBlogs } = useApp();

    const debouncedFetchBlogs = useRef(
        debounce((
            category: BlogCategoryEnum | "All",
            sortOrder: SortEnum,
            onDone?: (blogs: AIBlogResponse[]) => void
        ) => {
            fetchBlogs({ category, sort: sortOrder }, onDone);
        }, 300)
    ).current;
    
    const [sort, setSort] = useState<SortEnum>(SortEnum.desc);
    const [categories, setCategories] = React.useState<
        { name: BlogCategoryEnum | "All"; active: boolean }[]
    >(() => [
        { name: "All", active: true }, // default active
        { name: BlogCategoryEnum.Tech, active: false },
        { name: BlogCategoryEnum.Study, active: false },
        { name: BlogCategoryEnum.Life, active: false },
        { name: BlogCategoryEnum.Future, active: false },
    ]);

    const fetchBlogs = useCallback(
        async (
            params: { category?: BlogCategoryEnum | "All"; sort?: SortEnum },
            onDone?: (blogs: AIBlogResponse[]) => void // optional callback
        ) => {
            if (!setBlogs) return;

            const query = new URLSearchParams();
            if (params.category) query.append("category", params.category);
            if (params.sort) query.append("sort", params.sort);

            try {
                const response = await fetch(`/api/blog?${query.toString()}`);
                if (!response.ok) throw new Error("Failed to fetch blogs.");

                const data = await response.json();
                const newBlogs: AIBlogResponse[] = data.blogs || [];

                setBlogs({
                    recent: blogs?.recent || [],
                    all: newBlogs,
                });

                if (onDone) 
                    onDone(newBlogs);
                
            } catch (error) {
                console.error("Error fetching blogs:", error);
            }
        },
        [setBlogs]
    );

    const handleCategoryChange = (category: BlogCategoryEnum | "All") => {
        const activeCategory: BlogCategoryEnum | "All" = categories.find((cat) => cat.active)?.name ?? "All";

        if (activeCategory === category) 
            return;

        debouncedFetchBlogs(category, sort, () => {
            setCategories((prev) =>
                prev.map((cat) => ({
                    ...cat,
                    active: cat.name === category,
                }))
            );
        });
    };

    const handleSortToggle = () => {
        const newSort: SortEnum = sort === SortEnum.asc ? SortEnum.desc : SortEnum.asc;
        const activeCategory: BlogCategoryEnum | "All" = categories.find((cat) => cat.active)?.name ?? "All";

        debouncedFetchBlogs(activeCategory, newSort, () => {
            setSort(newSort);
        });
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
                        {categories.map((cat) => (
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
                            ${sort === SortEnum.asc ? styles["active-sort"] : ""}
                        `} 
                        onClick={handleSortToggle}>
                        {sort === SortEnum.asc ? <SortUp width={20} height={20} /> : <SortDown width={20} height={20} />}
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