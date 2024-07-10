import { type MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://skydiary.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
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
      changeFrequency: "monthly",
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
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          en: "https://skydiary.app/en/pricing",
          ja: "https://skydiary.app/ja/pricing",
        },
      },
    },
  ];
}
