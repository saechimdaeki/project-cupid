import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  if (membership) {
    if (membership.status === "approved") {
      redirect("/dashboard");
    }
    redirect("/pending");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50">
      <SakuraRain petalCount={56} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />

      <header className="fixed inset-x-0 top-0 z-10 border-b border-border/30 bg-card/30 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-8 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-[20px] border border-border/40 bg-card/70 text-sm font-semibold text-primary shadow-sm">
              C
            </div>
            <div>
              <strong className="block text-sm font-semibold text-foreground sm:text-base">
                Project Cupid
              </strong>
              <span className="block text-[13px] leading-5 text-muted-foreground">
                프라이빗 매칭 스튜디오
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-10 rounded-full border-border px-5 text-sm font-medium text-foreground transition hover:bg-secondary"
            render={<Link href="/login" />}
          >
            로그인
          </Button>
        </div>
      </header>

      <div className="relative z-[1] mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 pb-20 pt-24 sm:gap-20 sm:px-8 lg:px-16">
        <LandingHero />
        <LandingTrust />
        <LandingPreview />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingInventory />
        <LandingFooterCta />
      </div>
    </main>
  );
}
