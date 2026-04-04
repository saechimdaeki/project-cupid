import Link from "next/link";
import { CupidLogo } from "@/components/cupid-logo";
import { SakuraRain } from "@/components/sakura-rain";
import { LoginForm } from "@/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50 px-4 py-10">
      <SakuraRain petalCount={40} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />

      <div className="relative z-[1] flex w-full max-w-md flex-col items-center gap-8">
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

        <LoginForm initialMessage={message} />
      </div>
    </main>
  );
}
