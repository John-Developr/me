import React, { useEffect, useState } from "react";

import styles from "@/styles/pages/page.module.css";

import { networkDefine } from "@/config/networkDefine";
import { AIBlogResponse, fetchState, FetchStateEnum } from "@/utils/types";
import { fetchJsonCached, getCached } from "@/utils/general/fetchCache";

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
    // Returning to home shows the cached list instantly, then refreshes quietly.
    const [blogsRecent, setBlogsRecent] = useState<BlogsSectionState>(() => {
        const cached = getCached<{ blogs: AIBlogResponse[] }>(networkDefine.BLOG_RECENT_API);
        return cached ? { blogList: cached.blogs || [], state: FetchStateEnum.success } : initialState;
    });
    
    useEffect(() => {
        const fetchBlogs = async () => {
            const hasCache = !!getCached(networkDefine.BLOG_RECENT_API);

            try {
                const data = await fetchJsonCached<{ blogs: AIBlogResponse[] }>(
                    networkDefine.BLOG_RECENT_API, 
                    { fresh: true }
                );
                const newBlogs: AIBlogResponse[] = data.blogs || [];

                setBlogsRecent({ blogList: newBlogs, state: FetchStateEnum.success });
            } catch (error) {
                console.error("Error fetching recent blogs:", error);
                // Keep showing cached data if the background refresh fails.
                if (!hasCache) setBlogsRecent({ blogList: [], state: FetchStateEnum.error });
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