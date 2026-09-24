/**
 * Адрес сайта для абсолютных ссылок (Open Graph, robots.txt, sitemap.xml).
 *
 * Порядок: свой домен из NEXT_PUBLIC_SITE_URL → продовый домен Vercel
 * (VERCEL_PROJECT_PRODUCTION_URL) → адрес конкретного деплоя (VERCEL_URL) →
 * localhost. Так демо-версия на Vercel получает корректные абсолютные ссылки
 * без ручной настройки, а на боевом домене достаточно одной переменной.
 */

function withHttps(host?: string | null): string | null {
  if (!host) return null;
  const clean = host.replace(/^https?:\/\//, "").replace(/\/+$/, "");
  return clean ? `https://${clean}` : null;
}

export const siteUrl: string =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  withHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
  withHttps(process.env.VERCEL_URL) ||
  "http://localhost:3210";
