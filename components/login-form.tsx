"use client";

import Link from "next/link";
import { signInWithPassword } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LoginFormProps = {
  initialMessage?: string;
};

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

export function LoginForm({ initialMessage }: LoginFormProps) {
  const message = initialMessage ?? "";

  return (
    <Card className="w-full rounded-[28px] border-border/50 bg-card/80 p-5 shadow-xl backdrop-blur-lg sm:p-6">
      <CardContent className="p-0">
        <div>
          <h2 className="text-foreground">
            다시 오셨군요
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            승인된 계정으로 매칭 보드에 입장하세요.
          </p>
        </div>

        {message ? (
          <Alert className="mt-5 rounded-2xl">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}

        <form className="mt-6 grid gap-4" action={signInWithPassword}>
          <FieldShell label="아이디">
            <Input
              className="h-12 rounded-xl border-border/50 bg-card/60"
              name="username"
              placeholder="junseong"
              required
              minLength={4}
              maxLength={20}
              pattern="[a-z0-9._-]{4,20}"
            />
          </FieldShell>
          <FieldShell label="비밀번호">
            <Input
              className="h-12 rounded-xl border-border/50 bg-card/60"
              name="password"
              type="password"
              placeholder="비밀번호 입력"
              required
            />
          </FieldShell>

          <Button className="mt-2 h-12 rounded-full" type="submit">
            로그인
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
              회원가입
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
