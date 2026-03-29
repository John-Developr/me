import { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => {
    return [
        {
            url: process.env.NEXT_PUBLIC_BASE_URL!,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: process.env.NEXT_PUBLIC_BASE_URL! + "/blog",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: process.env.NEXT_PUBLIC_BASE_URL! + "/contact",
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
    ]
}

export default sitemap