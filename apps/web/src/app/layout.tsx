import type { Metadata } from "next";
import { fontDisplay, fontMono, fontSans } from "@/lib/fonts";
import { siteMetadata } from "@/lib/seo";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@tau/ui/sonner";
import "./globals.css";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
