import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://clawdslist.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/api/v1/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
