import type { Metadata } from "next";
import { fontDisplay, fontMono, fontSans } from "@/lib/fonts";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@tau/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  icons: { icon: "/brand/nau-logo.png", apple: "/brand/nau-logo.png" },
  title: {
    default: "Identity and Access · NAU",
    template: "%s · Identity and Access · NAU",
  },
  description:
    "Identity, access and delegated authority for Nnamdi Azikiwe University.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
