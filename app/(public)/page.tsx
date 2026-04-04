import { BottomNav } from "@/components/bottom-nav";
import { GlobalNav } from "@/components/global-nav";
import { SakuraRain } from "@/components/sakura-rain";
import { LandingHero } from "@/components/landing-hero";
import { LandingTrust } from "@/components/landing-trust";
import { LandingPreview } from "@/components/landing-preview";
import { LandingFeatures } from "@/components/landing-features";
import { LandingHowItWorks } from "@/components/landing-how-it-works";
import { LandingInventory } from "@/components/landing-inventory";
import { LandingFooterCta } from "@/components/landing-footer-cta";
import { getCurrentMembership } from "@/lib/permissions";

export default async function HomePage() {
  const membership = await getCurrentMembership();
  const isLoggedIn = membership?.status === "approved";

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50">
      <SakuraRain petalCount={56} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />

      <GlobalNav membership={isLoggedIn ? membership : null} />

      <div className="relative z-[1] mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 pb-20 pt-24 sm:gap-20 sm:px-8 lg:px-16">
        <LandingHero isLoggedIn={isLoggedIn} />
        <LandingTrust />
        <LandingPreview />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingInventory />
        <LandingFooterCta isLoggedIn={isLoggedIn} />
      </div>
      {isLoggedIn && membership ? <BottomNav role={membership.role} /> : null}
    </main>
  );
}
