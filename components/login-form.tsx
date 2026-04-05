"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signInWithPassword } from "@/server/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  function handleLogin(data: LoginInput) {
    startTransition(async () => {
      const result = await signInWithPassword(data);
      if (result && "error" in result) {
        toast.error(result.error);
        if (result.field) {
          setError(result.field as keyof LoginInput, { message: result.error });
        }
      }
      // 성공 시 Server Action 내부에서 redirect("/dashboard")
    });
  }

  function handleInvalid(formErrors: FieldErrors<LoginInput>) {
    const firstMessage =
      formErrors.username?.message ?? formErrors.password?.message;
    if (firstMessage) toast.error(firstMessage);
  }

  return (
    <Card className="w-full rounded-[28px] border-border/50 bg-card/80 p-5 shadow-xl backdrop-blur-lg sm:p-6">
      <CardContent className="p-0">
        <div>
          <h2 className="text-foreground">다시 오셨군요</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            승인된 계정으로 매칭 보드에 입장하세요.
          </p>
        </div>

        <form className="mt-6" onSubmit={handleSubmit(handleLogin, handleInvalid)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.username ? true : undefined}>
              <FieldLabel htmlFor="login-username">아이디</FieldLabel>
              <Input
                id="login-username"
                className="h-12 rounded-xl border-border/50 bg-card/60"
                placeholder="junseong"
                autoComplete="username"
                aria-invalid={errors.username ? true : undefined}
                {...register("username")}
              />
              <FieldError errors={errors.username ? [errors.username] : undefined} />
            </Field>

            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="login-password">비밀번호</FieldLabel>
              <Input
                id="login-password"
                className="h-12 rounded-xl border-border/50 bg-card/60"
                type="password"
                placeholder="비밀번호 입력"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                {...register("password")}
              />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            <Button className="mt-2 h-12 rounded-full" type="submit" disabled={isPending}>
              {isPending ? "로그인 중..." : "로그인"}
            </Button>
          </FieldGroup>
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
