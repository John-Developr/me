import { MetadataRoute } from "next";
import BlogService from "@/lib/.services/blogService";
import { BASE_URL } from "@/config/siteUrl";

// Rebuild at most hourly so new posts appear without a redeploy.
export const revalidate = 3600;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
    const baseUrl = BASE_URL;

    const pages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/tech-stack`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ];

    // Blog posts — if the database is unreachable, still serve the static pages.
    try {
        const posts = await new BlogService().getSitemapEntries();

        return [
            ...pages,
            ...posts.map((post) => ({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: new Date(post.generated_at),
                changeFrequency: "yearly" as const,
                priority: 0.6,
            })),
        ];
    } catch {
        return pages;
    }
};

export default sitemap;
