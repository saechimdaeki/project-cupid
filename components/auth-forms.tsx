"use client";

import Link from "next/link";
import { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth-actions";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AuthFormsProps = {
  initialMessage?: string;
};

type AuthTab = "signin" | "signup";

function FieldShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function AuthForms({ initialMessage }: AuthFormsProps) {
  const [tab, setTab] = useState<AuthTab>("signin");
  const message = initialMessage ?? "";

  return (
    <Card className="rounded-[28px] border-border p-5 shadow-lg sm:p-6">
      <CardContent className="p-0">
        <div className="inline-flex rounded-full bg-secondary p-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              tab === "signin" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition",
              tab === "signup" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
            )}
          >
            회원가입
          </button>
        </div>

        <div className="mt-5">
          {tab === "signin" ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">Sign In</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                승인된 계정으로 보드에 입장하세요
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                승인된 계정만 대시보드와 매칭 운영 화면에 접근할 수 있습니다.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">Sign Up</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                가입 요청을 보내고 승인 대기열에 등록하세요
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                id, 이름, 비밀번호만 입력하면 슈퍼어드민 검토를 위한 가입 요청이 생성됩니다.
              </p>
            </>
          )}
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            {message}
          </div>
        ) : null}

        {tab === "signin" ? (
          <form className="mt-6 grid gap-4" action={signInWithPassword}>
            <FieldShell label="id">
              <Input
                className="h-12 rounded-xl"
                name="username"
                placeholder="junseong"
                required
                minLength={4}
                maxLength={20}
                pattern="[a-z0-9._-]{4,20}"
              />
            </FieldShell>
            <FieldShell label="password">
              <Input
                className="h-12 rounded-xl"
                name="password"
                type="password"
                placeholder="비밀번호 입력"
                required
              />
            </FieldShell>

            <Button className="mt-2 h-12 rounded-full text-sm font-semibold" type="submit">
              로그인
            </Button>
          </form>
        ) : (
          <form className="mt-6 grid gap-4" action={signUpWithPassword}>
            <FieldShell label="id">
              <Input
                className="h-12 rounded-xl"
                name="username"
                placeholder="junseong"
                required
                minLength={4}
                maxLength={20}
                pattern="[a-z0-9._-]{4,20}"
              />
            </FieldShell>
            <FieldShell label="이름">
              <Input className="h-12 rounded-xl" name="fullName" placeholder="김준���" required minLength={2} />
            </FieldShell>
            <FieldShell label="password">
              <Input
                className="h-12 rounded-xl"
                name="password"
                type="password"
                placeholder="6자 이상"
                required
                minLength={6}
              />
            </FieldShell>

            <Button className="mt-2 h-12 rounded-full text-sm font-semibold" type="submit">
              ��입 요청하기
            </Button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" className="h-10 rounded-full" render={<Link href="/" />}>
            랜딩으로 돌아가기
          </Button>
          <Button variant="outline" className="h-10 rounded-full" render={<Link href="/pending" />}>
            승인 대기 페이지
          </Button>
        </div>

        <div className="mt-6 rounded-2xl bg-muted px-4 py-4 text-sm leading-6 text-muted-foreground">
          가입 후 `cupid_memberships`에 `username + full_name + pending`으로 등록되고, 슈퍼어드민이
          `viewer` 또는 `admin` 권한을 승인하면 보드 접근이 열립니다.
        </div>
      </CardContent>
    </Card>
  );
}
