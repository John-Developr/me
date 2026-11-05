import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import BlogDetailSkeleton from "@/containers/blog-detail-page/BlogDetailSkeleton";

/**
 * Instant route-level fallback: shown the moment a blog link is clicked,
 * while the page itself loads. Mirrors the container's own loading state.
 */
export default function BlogDetailLoading() {
  return (
    <>
      <Header />
      <BlogDetailSkeleton />
      <Footer />
    </>
  );
}
