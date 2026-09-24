import type { MetadataRoute } from "next";

/** Домен подставляется при деплое: NEXT_PUBLIC_SITE_URL=https://example.kz */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3210";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /* Панель заявок и API в поиске не нужны */
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
