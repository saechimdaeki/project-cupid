"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { findUsernamesByFullName } from "@/server/actions/auth";
import { findUsernameSchema, type FindUsernameInput } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FindUsernameDialog() {
  const [isPending, startTransition] = useTransition();
  const [foundUsernames, setFoundUsernames] = useState<string[] | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FindUsernameInput>({
    resolver: zodResolver(findUsernameSchema),
    defaultValues: { fullName: "" },
  });

  function handleFindUsername(data: FindUsernameInput) {
    setFoundUsernames(null);
    startTransition(async () => {
      const result = await findUsernamesByFullName(data);
      if ("error" in result) {
        toast.error(result.error);
        if (result.field) {
          setError(result.field as keyof FindUsernameInput, { message: result.error });
        }
        return;
      }

      setFoundUsernames(result.usernames);
      if (result.usernames.length === 0) {
        toast.message("해당 이름으로 가입된 아이디가 없습니다.");
      }
    });
  }

  function handleInvalid(formErrors: FieldErrors<FindUsernameInput>) {
    const firstMessage = formErrors.fullName?.message;
    if (firstMessage) toast.error(firstMessage);
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="link"
            className="h-auto gap-1.5 px-0 text-sm font-medium"
          />
        }
      >
        <Search className="size-3.5" />
        아이디 찾기
      </DialogTrigger>
      <DialogContent className="rounded-[24px] p-5 sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg">아이디 찾기</DialogTitle>
          <DialogDescription>
            가입할 때 입력한 이름과 일치하는 아이디를 마스킹해서 보여드립니다.
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-2"
          onSubmit={handleSubmit(handleFindUsername, handleInvalid)}
          noValidate
        >
          <FieldGroup>
            <Field data-invalid={errors.fullName ? true : undefined}>
              <FieldLabel htmlFor="find-username-full-name">이름</FieldLabel>
              <Input
                id="find-username-full-name"
                className="h-12 rounded-xl border-border/50 bg-card/60"
                placeholder="김준성"
                autoComplete="name"
                aria-invalid={errors.fullName ? true : undefined}
                {...register("fullName")}
              />
              <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
            </Field>

            <Button className="h-11 rounded-full" type="submit" disabled={isPending}>
              {isPending ? "조회 중..." : "이름으로 찾기"}
            </Button>
          </FieldGroup>
        </form>

        {foundUsernames ? (
          <div className="rounded-2xl border border-border/50 bg-muted/35 p-4">
            {foundUsernames.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-foreground">
                  해당 이름으로 가입된 아이디입니다.
                </p>
                <ul className="mt-3 space-y-2">
                  {foundUsernames.map((username, index) => (
                    <li
                      key={`${username}-${index}`}
                      className="rounded-xl border border-border/40 bg-background/70 px-3 py-2 font-mono text-sm text-foreground"
                    >
                      {username}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                해당 이름으로 가입된 아이디가 없습니다. 가입할 때 입력한 이름을 다시 확인해주세요.
              </p>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
