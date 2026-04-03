"use client";

import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PendingStatusGuard } from "@/components/pending-status-guard";
import { SakuraRain } from "@/components/sakura-rain";
import type { Membership } from "@/lib/types";

type PendingInviteViewProps = {
  membership: Membership;
  contactLabel: string;
  pendingMessage: string | null;
};

const LOGIN_STORAGE_KEY = "isLoggedIn";
const ROLE_STORAGE_KEY = "userRole";
const NAME_STORAGE_KEY = "userName";

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
    try {
      window.localStorage.removeItem(LOGIN_STORAGE_KEY);
      window.localStorage.removeItem(ROLE_STORAGE_KEY);
      window.localStorage.removeItem(NAME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  };

  const steps = [
    {
      title: "회원가입 완료",
      body: "아이디와 이름으로 접근 요청이 등록되었습니다.",
    },
    {
      title: "운영진 승인",
      body: "담당자가 권한 범위를 확인한 뒤 승인을 진행합니다.",
    },
    {
      title: "프라이빗 보드 입장",
      body: "승인이 완료되면 매물 보드와 상세 이력을 이용하실 수 있어요.",
    },
  ] as const;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50 text-slate-800">
      <SakuraRain petalCount={56} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />
      <PendingStatusGuard />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/50 bg-white/30 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 px-4 py-3 md:gap-4 md:px-8 lg:px-12">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-3xl border border-white/60 bg-white/70 text-sm font-semibold text-rose-500 shadow-[0_8px_30px_rgb(244,114,182,0.12)]">
              C
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-sm font-semibold tracking-[-0.02em] text-slate-800 sm:text-base">
                Project Cupid
              </strong>
              <span className="block truncate text-xs text-slate-500">사랑이 피어나는 스튜디오</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-2 py-1.5 shadow-[0_8px_30px_rgb(244,114,182,0.1)] backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-orange-100 text-sm font-semibold text-slate-700">
              {displayName.slice(0, 1)}
            </div>
            <p className="hidden text-sm font-medium text-slate-600 md:block">
              <span className="text-slate-800">{displayName}</span>님, 곧 만나요 💌
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 px-2 text-sm font-medium text-slate-500 transition hover:text-rose-500"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center overflow-x-hidden px-4 pb-24 pt-28 md:px-8 lg:px-12">
        <div className="w-full max-w-xl rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur-md sm:p-10">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400/90">
            Private invitation
          </p>
          <h1 className="mt-3 text-center text-2xl font-bold tracking-[-0.03em] text-slate-800">
            승인 대기 중입니다 💌
          </h1>
          <p className="mt-5 text-center text-sm leading-7 text-slate-500 sm:text-[15px]">
            가입이 완료되었습니다!{" "}
            <span className="font-semibold text-slate-700">{contactLabel}</span> 님에게 카톡이나 개인
            연락으로 승인을 요청해 주세요. 승인 완료 후 프라이빗 보드에 입장하실 수 있습니다.
          </p>

          {pendingMessage ? (
            <div
              className="mt-5 rounded-2xl border border-rose-100/80 bg-rose-50/70 px-4 py-3 text-center text-sm leading-6 text-slate-600"
              role="status"
            >
              {pendingMessage}
            </div>
          ) : null}

          <ol className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-4">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col items-center gap-3 rounded-2xl border border-rose-100/40 bg-white/50 px-3 py-4 text-center"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
                  {index + 1}
                </span>
                <strong className="text-sm font-semibold text-slate-800">{step.title}</strong>
                <span className="text-xs leading-5 text-slate-500">{step.body}</span>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-rose-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgb(244,114,182,0.35)] transition hover:bg-rose-600"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
