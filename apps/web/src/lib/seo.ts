import type { Metadata } from "next";
import { siteConfig } from "@/constants/site";

interface SEOOptions {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}

export function generatePageMetadata({ title, description, path, image }: SEOOptions): Metadata {
  const url = path ? `${siteConfig.url}${path}` : siteConfig.url;

  return {
    title: `${title} | ${siteConfig.shortName}`,
    description: description ?? siteConfig.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: description ?? siteConfig.description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_NG",
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description: description ?? siteConfig.description,
      images: image ? [image] : undefined,
    },
  };
}

export const siteMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} (TAU) — Medical University in Nigeria`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [
    "Transatlantic University",
    "TAU",
    "medical university Nigeria",
    "medicine",
    "dentistry",
    "nursing",
    "pharmacy",
    "public health",
    "Umuchukwu",
    "Anambra",
    "Dr Godwin Maduka",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} (TAU)`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} (TAU)`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};
