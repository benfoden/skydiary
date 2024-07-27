import { type MetadataRoute } from "next";
import { api } from "~/trpc/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogPosts = await api.blogPost.getAll();

  const staticRoutes = [
    {
      url: "https://skydiary.app",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 1,
      alternates: {
        languages: {
          en: "https://skydiary.app/en",
          ja: "https://skydiary.app/ja",
        },
      },
    },
    {
      url: "https://skydiary.app/about",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: "https://skydiary.app/en/about",
          ja: "https://skydiary.app/ja/about",
        },
      },
    },
    {
      url: "https://skydiary.app/pricing",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: "https://skydiary.app/en/pricing",
          ja: "https://skydiary.app/ja/pricing",
        },
      },
    },
  ];

  const blogPostRoutes = blogPosts.map((post) => ({
    url: `https://skydiary.app/blog/${post.urlStub}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
    alternates: {
      languages: {
        en: `https://skydiary.app/en/blog/${post.urlStub}`,
        ja: `https://skydiary.app/ja/blog/${post.urlStub}`,
      },
    },
  }));

  return [...staticRoutes, ...blogPostRoutes];
}
