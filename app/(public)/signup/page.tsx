import Link from "next/link";
import { CupidLogo } from "@/components/cupid-logo";
import { SakuraRain } from "@/components/sakura-rain";
import { SignupForm } from "@/components/signup-form";
import { SignupInfo } from "@/components/signup-info";

export default async function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50 px-4 py-10 lg:py-16">
      <SakuraRain petalCount={40} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />

      <div className="relative z-[1] flex w-full max-w-4xl flex-col items-center gap-8">
        <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
          <div className="flex size-11 items-center justify-center rounded-[20px] border border-border/40 bg-card/70 text-primary shadow-sm">
            <CupidLogo size={24} />
          </div>
          <div>
            <strong className="block text-sm font-semibold text-foreground sm:text-base">
              Project Cupid
            </strong>
            <span className="block text-[13px] leading-5 text-muted-foreground">
              사랑이 피어나는 스튜디오
            </span>
          </div>
        </Link>

        <div className="w-full text-center">
          <h2 className="text-foreground">사랑이 피어나는 스튜디오</h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-[15px] leading-7 text-muted-foreground">
            믿을 수 있는 지인만 등록하고, 승인된 운영자가 비공개로 매칭을 설계하는 공간입니다. 더
            따뜻하고 신중한 연결을 위해 만들어졌습니다.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <SignupInfo />
          </div>
          <div className="order-1 lg:order-2">
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
