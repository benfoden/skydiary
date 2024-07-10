import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Applebot", "Bingbot", "DuckDuckBot"],
        disallow: ["/"],
      },
    ],
    sitemap: "https://skydiary.app/sitemap.xml",
  };
}
