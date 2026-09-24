import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { company, gisLink, photos, schedule } from "@/lib/company";
import { siteUrl as siteUrlFromEnv } from "@/lib/site-url";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-manrope",
});

/**
 * Домен сайта для абсолютных ссылок. Приоритет: NEXT_PUBLIC_SITE_URL →
 * домены Vercel (в том числе демо-деплой) → localhost. См. lib/site-url.ts.
 */
const siteUrl = siteUrlFromEnv;

const title = `${company.name} — автосервис в Кокшетау: ремонт стартеров, генераторов и ходовой`;
const description =
  "СТО Центр в Кокшетау: ремонт стартеров и генераторов, ремонт двигателя и ходовой части, компьютерная диагностика, развал-схождение, сварочные работы. Улица Шанырак, 6а/с. Пн–Пт 09:00–19:00, Сб 09:00–18:00. Телефон +7 (7162) 29-35-35.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: company.name,
  keywords: [
    "СТО Кокшетау",
    "автосервис Кокшетау",
    "ремонт стартеров Кокшетау",
    "ремонт генераторов Кокшетау",
    "компьютерная диагностика Кокшетау",
    "развал-схождение Кокшетау",
    "ремонт ходовой Кокшетау",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_KZ",
    siteName: company.name,
    title,
    description,
    url: "/",
    images: [
      {
        url: photos[0].src,
        width: photos[0].width,
        height: photos[0].height,
        alt: photos[0].alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [photos[0].src],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0c0f13",
  width: "device-width",
  initialScale: 1,
};

/** LocalBusiness (AutoRepair) — только подтверждённые карточкой 2ГИС данные. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  name: company.name,
  description,
  image: photos.map((p) => new URL(p.src, siteUrl).toString()),
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address.street,
    addressLocality: company.address.city,
    addressRegion: company.address.region,
    postalCode: company.address.postalCode,
    addressCountry: "KZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: company.geo.lat,
    longitude: company.geo.lon,
  },
  telephone: company.phones.map((p) => p.href.replace("tel:", "")),
  openingHoursSpecification: schedule
    .filter((d) => d.from && d.to)
    .map((d) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${d.en}`,
      opens: d.from,
      closes: d.to,
    })),
  paymentAccepted: company.payment.join(", "),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: String(company.rating.value),
    reviewCount: String(company.rating.votes),
    bestRating: "5",
  },
  sameAs: [gisLink],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className="font-sans antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
