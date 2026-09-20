import type { Metadata } from "next";
import { siteConfig } from "@/constants/site";

interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  kind?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}

export function generatePageMetadata({ title, description, path, image, kind = "website", publishedTime, authors, noIndex = false }: SEOOptions): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image ? (image.startsWith("http") ? image : `${siteConfig.url}${image}`) : undefined;

  return {
    title,
    description: description ?? siteConfig.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: description ?? siteConfig.description,
      url,
      siteName: siteConfig.name,
      type: kind,
      locale: "en_NG",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
      ...(kind === "article" ? { publishedTime, authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description: description ?? siteConfig.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export function absoluteUrl(path = "") {
  return `${siteConfig.url}${path}`;
}

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  icons: { icon: "/brand/nau-logo.png", apple: "/brand/nau-logo.png" },
  title: {
    default: `${siteConfig.name} (NAU) — Federal University in Nigeria`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [
    "Nnamdi Azikiwe University",
    "NAU",
    "UNIZIK",
    "federal university Nigeria",
    "medicine",
    "dentistry",
    "nursing",
    "pharmacy",
    "public health",
    "Awka",
    "Anambra",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} (NAU)`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} (NAU)`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};
