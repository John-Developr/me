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
  slug: string;
}

export default function BlogDetailPage({ slug }: BlogDetailPageProps) {
    // A previously opened article renders instantly from the in-memory cache.
    const cached = getCached<BlogDetailResponse>(networkDefine.BLOG_DETAIL_API(slug));

    const [blog,       setBlog]       = useState<AIBlogResponse | null>(cached?.blog ?? null);
    const [isLoading,  setIsLoading]  = useState(!cached);

    useEffect(() => {
        if (!slug) {
            return
        }

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
                setBlog(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

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