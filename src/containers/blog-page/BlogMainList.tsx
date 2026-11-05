'use client'

import React, { useRef, useState } from "react"

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
import { fetchJsonCached, getCached } from "@/utils/general/fetchCache";

interface BlogMainListProps {
  category: BlogCategoryEnum;
  sort:     BlogSortEnum;
  state:    fetchState;
  setState: (state: fetchState) => void;
}

/**
 * Builds the blog list endpoint for a category/sort combination.
 * Shared with BlogPage so it can read the cache for its initial state.
 */
export const getBlogListUrl = (category: BlogCategoryEnum, sort: BlogSortEnum): string => {
  const query = new URLSearchParams();
  if (category && category !== BlogCategoryEnum.All) query.append("category", category);
  if (sort) query.append("sort", sort);

  return `${networkDefine.BLOG_API}?${query.toString()}`;
};

type BlogListResponse = { blogs: AIBlogResponse[] };

const BlogMainList = ({ category, sort, state, setState }: BlogMainListProps) => {
  const url          = getBlogListUrl(category, sort);
  const isFirstFetch = useRef(true);

  // Cached results render instantly (no skeleton) when returning to this page.
  const [blogList, setBlogList] = useState<AIBlogResponse[]>(
    () => getCached<BlogListResponse>(url)?.blogs || []
  );

  // Debounce only rapid filter/sort clicks — never the first load or cached views.
  const debounceDelay = isFirstFetch.current || getCached(url) ? 0 : 500;

  useDebounce(() => {
    isFirstFetch.current = false;
    fetchBlogList();
  }, [category, sort], debounceDelay);

  const fetchBlogList = async () => {
    const cached = getCached<BlogListResponse>(url);

    if (cached) {
      setBlogList(cached.blogs || []);
      setState(FetchStateEnum.success);
    }

    try {
      // Always refresh in the background so view counts stay current.
      const data     = await fetchJsonCached<BlogListResponse>(url, { fresh: true });
      const newBlogs = data.blogs || [];
      
      setBlogList(newBlogs);
      setState(FetchStateEnum.success);

    } catch (error) {
      console.error("Error fetching blogs:", error);
      if (!cached) setState(FetchStateEnum.error);
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