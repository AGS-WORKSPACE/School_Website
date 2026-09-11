import type { Metadata } from "next";
import { fontDisplay, fontMono, fontSans } from "@/lib/fonts";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@tau/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Identity and Access · TAU",
    template: "%s · Identity and Access · TAU",
  },
  description:
    "Identity, access and delegated authority console for the TAU university platform.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="bg-muted/40 flex min-h-full flex-col">
        <QueryProvider>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}
