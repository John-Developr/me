import React, { useEffect, useState } from "react";

import styles from "@/styles/pages/page.module.css";

import { networkDefine } from "@/config/networkDefine";
import { AIBlogResponse, BlogCategoryEnum, fetchState, FetchStateEnum } from "@/utils/types";

import BlogSectionCard from "./BlogSectionCard";
import BlogSectionSkeleton from "./BlogSectionSkeleton";
import BlogEmptySection from "./BlogEmptySection";
import BlogErrorSection from "./BlogErrorSection";

interface BlogsSectionState {
  blogList:   AIBlogResponse[];
  state:      fetchState;
}

const initialState: BlogsSectionState = {
  blogList:   [],
  state:      FetchStateEnum.loading
};

const BlogSectionList = () => {
    const [blogsRecent, setBlogsRecent] = useState<BlogsSectionState>(initialState);
    
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await fetch(networkDefine.BLOG_RECENT_API);
                if (!response.ok) throw new Error("Failed to fetch blogs.");
        
                const data: { blogs: AIBlogResponse[] } = await response.json();
                const newBlogs: AIBlogResponse[]         = data.blogs || [];

                setBlogsRecent({ blogList: newBlogs, state: FetchStateEnum.success });
            } catch (error) {
                console.error("Error fetching recent blogs:", error);
                setBlogsRecent({ blogList: [], state: FetchStateEnum.error });
            }
        }

        fetchBlogs();
    }, []);

    if (blogsRecent.state === FetchStateEnum.loading) return <BlogSectionSkeleton count={2} />;
    if (blogsRecent.state === FetchStateEnum.error) return <BlogErrorSection />;
    if (blogsRecent.blogList.length === 0) return <BlogEmptySection />;

    return (
        <>
            {blogsRecent.blogList.map((blog, index) => (
                <React.Fragment key={blog.id}>
                    <BlogSectionCard blog={blog} />
                    {index < blogsRecent.blogList.length - 1 && <hr className={styles["card-divider"]} />}
                </React.Fragment>
            ))}
        </>
    )
}

export default BlogSectionList;