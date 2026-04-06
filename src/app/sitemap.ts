import { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    return [
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
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ];
};

export default sitemap;