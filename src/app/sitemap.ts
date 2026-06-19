import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { GUIDES } from "@/lib/content/guides";
import { LOCALES, lp } from "@/lib/i18n-routing";

type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

// Localized public paths (rendered under /en and /fr).
const LOCALIZED: { path: string; priority: number; changeFrequency: ChangeFreq }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" },
  { path: "/guides", priority: 0.8, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  ...GUIDES.map((g) => ({
    path: `/guides/${g.slug}`,
    priority: 0.7,
    changeFrequency: "monthly" as ChangeFreq,
  })),
];

// Single-URL public paths (not localized in the URL).
const STATIC: { path: string; priority: number; changeFrequency: ChangeFreq }[] = [
  { path: "/report-example", priority: 0.8, changeFrequency: "monthly" },
  { path: "/signup", priority: 0.5, changeFrequency: "yearly" },
  { path: "/login", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cgv", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localized: MetadataRoute.Sitemap = LOCALIZED.flatMap((r) =>
    LOCALES.map((lang) => ({
      url: `${SITE_URL}${lp(lang, r.path)}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
      alternates: {
        languages: {
          en: `${SITE_URL}${lp("en", r.path)}`,
          fr: `${SITE_URL}${lp("fr", r.path)}`,
        },
      },
    })),
  );

  const staticEntries: MetadataRoute.Sitemap = STATIC.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [...localized, ...staticEntries];
}
