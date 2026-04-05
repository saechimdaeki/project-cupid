"use client";

import Link from "next/link";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PendingStatusGuard } from "@/components/pending-status-guard";
import { SakuraRain } from "@/components/sakura-rain";
import { CupidLogo } from "@/components/cupid-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Membership } from "@/lib/types";

type PendingInviteViewProps = {
  membership: Membership;
  contactLabel: string;
  pendingMessage: string | null;
};

export function PendingInviteView({
  membership,
  contactLabel,
  pendingMessage,
}: PendingInviteViewProps) {
  const displayName = membership.full_name.trim() || membership.username;

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  };

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50 px-4 py-10 lg:py-16">
      <SakuraRain petalCount={56} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />
      <PendingStatusGuard />

      <div className="relative z-[1] flex w-full max-w-xl flex-col items-center gap-8">
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

        <Card className="w-full rounded-[28px] border-border/50 bg-card/80 p-6 shadow-xl backdrop-blur-lg sm:p-8">
          <CardContent className="p-0">
            <div className="text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Private invitation
              </p>
              <h2 className="mt-3 text-foreground">
                승인 대기 중입니다 💌
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-muted-foreground">
                가입이 완료되었습니다!
                <br />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(contactLabel);
                    toast.success("복사가 완료됐습니다.");
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold text-foreground transition hover:text-primary"
                  title="클릭하면 복사됩니다"
                >
                  {contactLabel}
                  <CopyIcon className="size-4 shrink-0 opacity-50" />
                </button> 님에게 카톡이나 개인 연락으로 승인을 요청해 주세요.
                <br />
                승인 완료 후 프라이빗 보드에 입장하실 수 있습니다.
              </p>
            </div>

            {pendingMessage ? (
              <div
                className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-center text-sm leading-6 text-muted-foreground"
                role="status"
              >
                {pendingMessage}
              </div>
            ) : null}

            <ol className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: "회원가입 완료", body: "아이디와 이름으로 접근 요청이 등록되었습니다." },
                { title: "운영진 승인", body: "담당자가 권한 범위를 확인한 뒤 승인을 진행합니다." },
                { title: "프라이빗 보드 입장", body: "승인이 완료되면 매물 보드와 상세 이력을 이용하실 수 있어요." },
              ].map((step, index) => (
                <li
                  key={step.title}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-card/50 px-4 py-5 text-center backdrop-blur-sm"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold leading-none text-white">
                    {index + 1}
                  </span>
                  <strong className="text-sm font-semibold text-foreground">{step.title}</strong>
                  <span className="text-[13px] leading-5 text-muted-foreground">{step.body}</span>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{displayName}</span>님, 곧 만나요 💌
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleLogout}
                  className="h-11 rounded-full px-6"
                >
                  로그아웃
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
