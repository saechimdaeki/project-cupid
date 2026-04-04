"use client";

import Link from "next/link";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuthFormsProps = {
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

export function AuthForms({ initialMessage }: AuthFormsProps) {
  const message = initialMessage ?? "";

  return (
    <Card className="w-full rounded-[28px] border-border/50 bg-card/80 p-5 shadow-xl backdrop-blur-lg sm:p-6">
      <CardContent className="p-0">
        <Tabs defaultValue="signin">
          <TabsList className="rounded-full bg-secondary p-1">
            <TabsTrigger value="signin" className="rounded-full px-4 py-2 text-sm font-medium">
              로그인
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-full px-4 py-2 text-sm font-medium">
              회원가입
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sign In</p>
              <h2 className="mt-2 text-foreground">
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
          </TabsContent>

          <TabsContent value="signup">
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Sign Up</p>
              <h2 className="mt-2 text-foreground">
                함께할 준비가 되셨나요
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                가입 요청을 보내면 관리자 승인 후 매칭 보드에 입장할 수 있습니다.
              </p>
            </div>

            {message ? (
              <Alert className="mt-5 rounded-2xl">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : null}

            <form className="mt-6 grid gap-4" action={signUpWithPassword}>
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
              <FieldShell label="이름">
                <Input
                  className="h-12 rounded-xl border-border/50 bg-card/60"
                  name="fullName"
                  placeholder="김준성"
                  required
                  minLength={2}
                />
              </FieldShell>
              <FieldShell label="비밀번호">
                <Input
                  className="h-12 rounded-xl border-border/50 bg-card/60"
                  name="password"
                  type="password"
                  placeholder="6자 이상"
                  required
                  minLength={6}
                />
              </FieldShell>

              <Button className="mt-2 h-12 rounded-full" type="submit">
                가입 요청하기
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center">
          <Button variant="ghost" className="rounded-full text-sm text-muted-foreground" render={<Link href="/" />}>
            홈으로 돌아가기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
