"use client";

import Link from "next/link";
import { signOut } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Membership } from "@/lib/types";

function getRoleLabel(role: Membership["role"]) {
  switch (role) {
    case "super_admin":
      return "슈퍼어드민";
    case "admin":
      return "어드민";
    default:
      return "뷰어";
  }
}

export function HomeAccountShell({ membership }: { membership: Membership | null }) {
  if (membership) {
    return (
      <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[320px]">
        <Card className="rounded-[28px] border-border bg-gradient-to-br from-card to-secondary p-5 shadow-[0_14px_40px_rgba(143,95,89,0.1)]">
          <CardContent className="p-0">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              환영합니다
            </p>
            <strong className="mt-2 block text-[clamp(1.75rem,7vw,2.4rem)] font-semibold tracking-[-0.06em] text-foreground">
              {membership.full_name}님
            </strong>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground sm:text-base">
              @{membership.username} · {getRoleLabel(membership.role)}
            </span>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="min-h-12 w-full rounded-full bg-gradient-to-r from-accent to-primary shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5"
                render={<Link href="/dashboard" />}
              >
                대시보드
              </Button>
              {membership.role === "super_admin" ? (
                <Button
                  variant="outline"
                  className="min-h-12 w-full rounded-full transition hover:-translate-y-0.5"
                  render={<Link href="/admin" />}
                >
                  승인 관리
                </Button>
              ) : null}
            </div>
            <form action={signOut} className="mt-3">
              <Button
                variant="outline"
                className="min-h-12 w-full rounded-full transition hover:-translate-y-0.5"
                type="submit"
              >
                로그아웃
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
      <Button
        variant="outline"
        className="min-h-12 w-full rounded-full transition hover:-translate-y-0.5 lg:w-auto"
        render={<Link href="/login" />}
      >
        회원가입 / 로그인
      </Button>
      <Button
        className="min-h-12 w-full rounded-full bg-gradient-to-r from-accent to-primary shadow-[0_10px_24px_rgba(198,132,99,0.18)] transition hover:-translate-y-0.5 lg:w-auto"
        render={<Link href="/dashboard" />}
      >
        보드 열기
      </Button>
    </div>
  );
}
