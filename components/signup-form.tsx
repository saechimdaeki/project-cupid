"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { signUpWithPassword } from "@/lib/auth-actions";
import { signupSchema, type SignupInput } from "@/lib/schemas/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function SignupForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: "", fullName: "", password: "" },
  });

  function onSubmit(data: SignupInput) {
    startTransition(async () => {
      const result = await signUpWithPassword(data);
      if (result && "error" in result) {
        if (result.field) {
          setError(result.field as keyof SignupInput, { message: result.error });
          toast.error(result.error);
        } else {
          toast.error(result.error);
        }
      }
    });
  }

  function onInvalid(formErrors: FieldErrors<SignupInput>) {
    const firstMessage =
      formErrors.username?.message ??
      formErrors.fullName?.message ??
      formErrors.password?.message;
    if (firstMessage) toast.error(firstMessage);
  }

  return (
    <Card className="w-full rounded-[28px] border-border/50 bg-card/80 p-5 shadow-xl backdrop-blur-lg sm:p-6">
      <CardContent className="p-0">
        <div>
          <h2 className="text-foreground">함께할 준비가 되셨나요</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            가입 요청을 보내면 관리자 승인 후 매칭 보드에 입장할 수 있습니다.
          </p>
        </div>

        <form className="mt-6" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.username ? true : undefined}>
              <FieldLabel htmlFor="signup-username">아이디</FieldLabel>
              <Input
                id="signup-username"
                className="h-12 rounded-xl border-border/50 bg-card/60"
                placeholder="junseong"
                autoComplete="username"
                aria-invalid={errors.username ? true : undefined}
                {...register("username")}
              />
              <FieldError errors={errors.username ? [errors.username] : undefined} />
            </Field>

            <Field data-invalid={errors.fullName ? true : undefined}>
              <FieldLabel htmlFor="signup-full-name">이름</FieldLabel>
              <Input
                id="signup-full-name"
                className="h-12 rounded-xl border-border/50 bg-card/60"
                placeholder="김준성"
                autoComplete="name"
                aria-invalid={errors.fullName ? true : undefined}
                {...register("fullName")}
              />
              <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
            </Field>

            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="signup-password">비밀번호</FieldLabel>
              <Input
                id="signup-password"
                className="h-12 rounded-xl border-border/50 bg-card/60"
                type="password"
                placeholder="6자 이상"
                autoComplete="new-password"
                aria-invalid={errors.password ? true : undefined}
                {...register("password")}
              />
              <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            <Button className="mt-2 h-12 rounded-full" type="submit" disabled={isPending}>
              {isPending ? "가입 요청 중..." : "가입 요청하기"}
            </Button>
          </FieldGroup>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              로그인
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
