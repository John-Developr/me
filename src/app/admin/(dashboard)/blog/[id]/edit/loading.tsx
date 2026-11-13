import BlogFormSkeleton from "@/containers/admin-blog-form-page/BlogFormSkeleton";

/** Same layout as the edit post form, so nothing jumps when it loads. */
export default function Loading() {
  return <BlogFormSkeleton edit />;
}
