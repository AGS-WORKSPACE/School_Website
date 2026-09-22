import type { Metadata } from "next";
import { fontDisplay, fontSans } from "@/lib/fonts";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

export const metadata: Metadata = {
  icons: { icon: "/brand/nau-logo.png", apple: "/brand/nau-logo.png" },
  title: {
    default: "LMS · Nnamdi Azikiwe University",
    template: "%s · LMS · Nnamdi Azikiwe University",
  },
  description:
    "The Nnamdi Azikiwe University learning management system: discover faculties, browse courses and sign in to learn.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${fontSans.variable} ${fontDisplay.variable} antialiased`}>
      <body className="flex min-h-screen flex-col bg-white text-foreground">
        <SiteHeader />
        <main id="main-content" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
