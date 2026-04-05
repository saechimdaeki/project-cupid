"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CupidLogo } from "@/components/cupid-logo";

type LoginErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LoginError({ error, reset }: LoginErrorProps) {
  useEffect(() => {
    console.error("[login] route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50 px-4 py-10">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />

      <div className="relative z-[1] flex w-full max-w-md flex-col items-center gap-8 text-center">
        <div className="flex size-11 items-center justify-center rounded-[20px] border border-border/40 bg-card/70 text-primary shadow-sm">
          <CupidLogo size={24} />
        </div>

        <div className="flex w-full flex-col items-center gap-4 rounded-[28px] border border-border/40 bg-card/80 p-8 shadow-md backdrop-blur-sm">
          <h2 className="text-foreground">로그인 화면을 불러오지 못했어요</h2>
          <p className="text-[15px] leading-7 text-muted-foreground">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">오류 코드: {error.digest}</p>
          ) : null}

          <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={reset} className="rounded-full">
              다시 시도
            </Button>
            <Button variant="outline" className="rounded-full" render={<Link href="/" />}>
              홈으로
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
