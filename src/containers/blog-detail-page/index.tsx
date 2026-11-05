'use client'

import { useEffect, useState } from "react";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

import BlogDetailSkeleton from "./BlogDetailSkeleton";
import BlogDetailMain from "./BlogDetailMain";

import Page404 from "@/containers/404-page";

import { networkDefine } from "@/config/networkDefine";
import { AIBlogResponse } from "@/utils/types";
import { fetchJsonCached, getCached } from "@/utils/general/fetchCache";

interface BlogDetailResponse {
  blog:    AIBlogResponse;
  result?: boolean;
}

interface BlogDetailPageProps {
  slug:         string;
  /** Post rendered on the server; undefined if the server lookup failed. */
  initialBlog?: AIBlogResponse;
}

export default function BlogDetailPage({ slug, initialBlog }: BlogDetailPageProps) {
    // Server-rendered post first; otherwise a previously opened article from the in-memory cache.
    const cached  = getCached<BlogDetailResponse>(networkDefine.BLOG_DETAIL_API(slug));
    const initial = initialBlog ?? cached?.blog ?? null;

    const [blog,       setBlog]       = useState<AIBlogResponse | null>(initial);
    const [isLoading,  setIsLoading]  = useState(!initial);

    useEffect(() => {
        if (!slug) {
            return
        }

        // Always hit the API once per article per tab: it counts the view,
        // and loads the post if the server couldn't.
        const fetchBlog = async () => {
            try {
                const { blog, result } = await fetchJsonCached<BlogDetailResponse>(networkDefine.BLOG_DETAIL_API(slug));

                if (result === false) {
                    setBlog(null);
                    return;
                }

                setBlog(blog);
            } catch (error) {
                console.error("Error fetching blog:", error);
                // Keep the server-rendered post if the view-count request fails.
                if (!initialBlog) setBlog(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlog();
    }, [slug, initialBlog]);

    if (!isLoading && !blog) {
        return <Page404 />;
    }

    return (
        <>
            <Header />
                {isLoading           ? <BlogDetailSkeleton />         : null}
                {!isLoading && blog  ? <BlogDetailMain blog={blog} /> : null}
            <Footer />
        </>
    );
}