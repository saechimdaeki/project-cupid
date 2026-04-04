---
paths:
  - "components/**/*form*.tsx"
  - "components/**/*dialog*.tsx"
  - "components/**/*modal*.tsx"
  - "lib/**/*-actions.ts"
  - "lib/schemas/**/*"
---

# 폼 패턴

## 기술 스택

- **React Hook Form** — 폼 상태 관리
- **Zod** — 스키마 검증 (서버/클라이언트 공유)
- **Server Actions** — 뮤테이션 처리
- **`useFormStatus`** (React 19) — HTML form action 기반 pending 상태 (단순 폼용)

## Zod 스키마 (`lib/schemas/`)

검증 스키마는 `lib/schemas/`에 도메인별로 분리한다. 서버와 클라이언트에서 동일한 스키마를 공유한다.

```typescript
// lib/schemas/candidate.ts
import { z } from "zod";

export const createCandidateSchema = z.object({
  fullName: z.string().min(1, "이름을 입력해주세요").max(50),
  gender: z.enum(["male", "female"]),
  birthYear: z.number().int().min(1960).max(2010),
  occupation: z.string().optional(),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
```

### 스키마 네이밍

| 파일 | 내용 |
|------|------|
| `lib/schemas/candidate.ts` | 후보자 관련 스키마 |
| `lib/schemas/match.ts` | 매칭 관련 스키마 |
| `lib/schemas/admin.ts` | 관리자 관련 스키마 |

## Server Action 작성

Server Action에서 Zod로 서버 검증한다. `formData`가 아닌 **파싱된 객체**를 받는다.

```typescript
// lib/candidate-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createCandidateSchema, type CreateCandidateInput } from "@/lib/schemas/candidate";

type ActionResult = { error: string } | { success: true };

export async function createCandidate(
  input: CreateCandidateInput,
): Promise<ActionResult> {
  const parsed = createCandidateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  if (!supabase) return { error: "연결 실패" };

  const { error } = await supabase
    .from("cupid_candidates")
    .insert({
      full_name: parsed.data.fullName,
      gender: parsed.data.gender,
      birth_year: parsed.data.birthYear,
      occupation: parsed.data.occupation ?? null,
    });

  if (error) return { error: error.message };

  revalidatePath("/candidates");
  return { success: true };
}
```

> 클라이언트에서 이미 Zod 검증을 했더라도, **서버에서 반드시 재검증**한다.

## React Hook Form + Server Action 연동

```tsx
// components/candidate-create-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { createCandidateSchema, type CreateCandidateInput } from "@/lib/schemas/candidate";
import { createCandidate } from "@/lib/candidate-actions";

export function CandidateCreateForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateCandidateInput>({
    resolver: zodResolver(createCandidateSchema),
  });

  function onSubmit(data: CreateCandidateInput) {
    startTransition(async () => {
      const result = await createCandidate(data);
      if ("error" in result) {
        setError("root", { message: result.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="fullName">이름</Label>
        <Input
          id="fullName"
          {...register("fullName")}
          className="mt-1"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
```

### 핵심 흐름

```
사용자 입력 → RHF + Zod (클라이언트 검증) → Server Action + Zod (서버 재검증) → Supabase
```

## 에러 처리

### 서버 에러 → `setError("root", ...)`로 폼에 인라인 표시

```typescript
// 금지: 에러를 redirect query param으로 처리
if (!valid) redirect("/login?message=에러");

// 올바른 예: 반환값으로 전달 → 폼에서 setError로 표시
const result = await createCandidate(data);
if ("error" in result) {
  setError("root", { message: result.error });
}
```

> 예외: `signOut`, 로그인 성공 후 페이지 이동 등 **탐색이 목적**인 경우는 `redirect()` 사용.

### 필드별 서버 에러

서버에서 특정 필드 에��를 반환하려면:

```typescript
// Server Action
type ActionResult =
  | { error: string; field?: string }
  | { success: true };

// 클라이언트
if ("error" in result) {
  if (result.field) {
    setError(result.field as keyof CreateCandidateInput, { message: result.error });
  } else {
    setError("root", { message: result.error });
  }
}
```

## 단순 폼 (HTML form action + `useFormStatus`)

필드 1~2개의 단순한 폼(검색, 로그인 등)은 RHF 없이 HTML form action을 사용해도 된다.

```tsx
// components/form-submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

type FormSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function FormSubmitButton({ children, className }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className={cn("rounded-lg", className)}>
      {pending ? "처리 중..." : children}
    </Button>
  );
}
```

## 비-form 뮤테이션 (버튼 클릭)

Server Action을 form 없이 호출하는 경우 `useTransition`을 사용한다.

```tsx
"use client";

import { useTransition } from "react";
import { updateCandidateStatus } from "@/lib/candidate-actions";

type StatusChangeButtonProps = {
  candidateId: string;
  newStatus: CandidateStatus;
  onComplete: () => void;
};

export function StatusChangeButton({ candidateId, newStatus, onComplete }: StatusChangeButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await updateCandidateStatus(candidateId, newStatus);
      if ("success" in result) onComplete();
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? "처리 중..." : "변경"}
    </Button>
  );
}
```

## 규칙

1. 뮤테이션은 **반드시 Server Action** (`"use server"` 파일에 정의)
2. 검증 스키마는 **`lib/schemas/`에 Zod로 정의** — 서버/클라이언트 공유
3. **RHF + Zod**가 기본 폼 패턴 — 단순 폼(1~2 필드)만 HTML form action 허용
4. Server Action은 **파싱된 객체**를 받고, **서버에서 Zod 재검증** 필수
5. 반환 타입: `{ error: string } | { success: true }` — `any` 금지
6. **에러는 `redirect()` 금지** — `setError()`로 인라인 표시
7. RHF 폼의 pending은 **`useTransition`**, HTML form action의 pending은 **`useFormStatus`**
8. 뮤테이션 성공 후 **반드시 `revalidatePath()`** 호출
9. `useState` + `setIsPending(true/false)` 수동 관리 패턴 금지
