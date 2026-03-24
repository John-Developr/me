'use client'

import { useEffect, useState } from "react";

import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

import BlogDetailSkeleton from "./BlogDetailSkeleton";
import BlogDetailMain from "./BlogDetailMain";

import Page404 from "@/containers/404-page";

import { networkDefine } from "@/config/networkDefine";
import { AIBlogResponse } from "@/utils/types";

interface BlogDetailPageProps {
  slug: string;
}

export default function BlogDetailPage({ slug }: BlogDetailPageProps) {
    const [blog,       setBlog]       = useState<AIBlogResponse | null>(null);
    const [isLoading,  setIsLoading]  = useState(true);

    useEffect(() => {
        if (!slug) {
            return
        }

        const fetchBlog = async () => {
            try {
                const response  = await fetch(networkDefine.BLOG_DETAIL_API(slug));
                const { blog, result }: { blog: AIBlogResponse, result: boolean } = await response.json();

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