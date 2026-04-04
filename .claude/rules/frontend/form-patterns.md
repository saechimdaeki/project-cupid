---
paths:
  - "frontend/src/**/*Form*.tsx"
  - "frontend/src/**/*Dialog*.tsx"
  - "frontend/src/**/*Modal*.tsx"
---

# 폼 패턴

## 라이브러리

- **react-hook-form** — 폼 상태 관리
- **zod** — 스키마 검증
- **@hookform/resolvers/zod** — RHF + Zod 연동

## 폼 작성 구조

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// 1. Zod 스키마 정의
const userFormSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  email: z.string().email("이메일 형식이 올바르지 않습니다"),
  phone: z.string().optional(),
});

// 2. 스키마에서 타입 추론
type UserFormValues = z.infer<typeof userFormSchema>;

// 3. Props
interface UserFormProps {
  defaultValues?: Partial<UserFormValues>;
  onSubmit: (data: UserFormValues) => void;
  isPending?: boolean;
}

// 4. 폼 컴포넌트
export function UserForm({ defaultValues, onSubmit, isPending }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </form>
    </Form>
  );
}
```

## 폼 + Service 연동

```tsx
"use client";

import { UserForm } from "./user-form";
import useUser from "@/service/user/useUser";

export function UserCreateDialog() {
  const { mutate: create, isPending } = useUser.useCreate();

  return (
    <Dialog>
      <DialogContent>
        <UserForm
          onSubmit={(data) => create(data)}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
```

## 규칙

1. 폼 검증은 **반드시** Zod 스키마로 정의
2. 타입은 `z.infer<typeof schema>`로 추론 (수동 타입 정의 금지)
3. 폼 컴포넌트는 `onSubmit` prop으로 제출 처리를 외부에 위임
4. `isPending` 상태를 받아 중복 제출 방지
5. shadcn/ui의 `Form`, `FormField`, `FormMessage` 사용
6. 에러 메시지는 Zod 스키마에 정의
