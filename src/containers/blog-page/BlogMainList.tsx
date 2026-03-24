'use client'

import React, { useState } from "react"

import BlogCard from "./BlogCard";
import BlogCardSkeleton from "./BlogSkeleton";
import EmptyBlog from "./BlogEmpty";

import { 
  AIBlogResponse, 
  BlogCategoryEnum, 
  fetchState, 
  BlogSortEnum,
  FetchStateEnum
} from "@/utils/types";

import { networkDefine } from "@/config/networkDefine";
import { useDebounce } from "@/hooks/useDebounce";

interface BlogMainListProps {
  category: BlogCategoryEnum;
  sort:     BlogSortEnum;
  state:    fetchState;
  setState: (state: fetchState) => void;
}

const BlogMainList = ({ category, sort, state, setState }: BlogMainListProps) => {
  const [blogList, setBlogList] = useState<AIBlogResponse[]>([]);

  useDebounce(() => {
    fetchBlogList();
  }, [category, sort], 500);

  const fetchBlogList = async () => {
    try {
      const query = new URLSearchParams();
      if (category && category !== BlogCategoryEnum.All) query.append("category", category);
      if (sort) query.append("sort", sort);

      const response = await fetch(`${networkDefine.BLOG_API}?${query.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch blogs.");

      const data: { blogs: AIBlogResponse[] } = await response.json();
      const newBlogs: AIBlogResponse[]         = data.blogs || [];
      
      setBlogList(newBlogs);
      setState(FetchStateEnum.success);

    } catch (error) {
      console.error("Error fetching blogs:", error);
      setState(FetchStateEnum.error);
    }
  };

  if (state === FetchStateEnum.loading) return <BlogCardSkeleton count={3} />;
  if (state === FetchStateEnum.error || blogList.length === 0) return <EmptyBlog category={category} />;

  return (
    <>
      {blogList.map((item, idx) => (
        <React.Fragment key={item.id ?? idx}>
          <BlogCard item={item} index={idx} />
        </React.Fragment>
      ))}
    </>
  );
}

export default BlogMainList;