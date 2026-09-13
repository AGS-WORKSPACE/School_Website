import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/providers/theme-provider";
import { publicEmergencyBanners } from "@/data/emergency-banners";
import { EmergencyBanner } from "@/components/common/emergency-banner";
import { AnalyticsConsentBanner } from "@/components/common/analytics-consent-banner";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        {publicEmergencyBanners.map((message) => <EmergencyBanner key={message.id} message={message} />)}
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <AnalyticsConsentBanner />
    </ThemeProvider>
  );
}
