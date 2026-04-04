---
paths:
  - "components/**/*Form*.tsx"
  - "components/**/*Dialog*.tsx"
  - "components/**/*Modal*.tsx"
  - "lib/**/*-actions.ts"
---

# 폼 패턴

## 기술 스택

- **Server Actions** — 뮤테이션 처리
- **`useActionState`** (React 19) — 폼 상태 관리
- **`useFormStatus`** (React 19) — 제출 pending 상태
- react-hook-form, zod 없음

## Server Action 작성

```typescript
// lib/candidate-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string } | { success: true };

export async function createCandidate(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { error: "연결 실패" };

  const fullName = formData.get("full_name") as string;
  if (!fullName?.trim()) return { error: "이름을 입력해주세요" };

  const { error } = await supabase
    .from("cupid_candidates")
    .insert({ full_name: fullName });

  if (error) return { error: error.message };

  revalidatePath("/candidates");
  return { success: true };
}
```

`useActionState`를 쓰려면 Server Action 시그니처가 `(prevState, formData)` 형태여야 한다.

## `useActionState` 기반 폼 (HTML form + action)

React 19의 `useActionState`를 사용한다. `useState` + 수동 핸들러 패턴 금지.

```tsx
// components/candidate-create-form.tsx
"use client";

import { useActionState } from "react";
import { createCandidate } from "@/lib/candidate-actions";
import { SubmitButton } from "./submit-button";

export function CandidateCreateForm() {
  const [state, action] = useActionState(createCandidate, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="text-sm font-medium text-slate-700">
          이름
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm text-slate-800"
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <SubmitButton>저장</SubmitButton>
    </form>
  );
}
```

## `useFormStatus` — SubmitButton 분리

pending 상태를 prop으로 내려보내지 않는다. `useFormStatus`를 쓰는 별도 컴포넌트로 분리한다.

```tsx
// components/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export function SubmitButton({ children, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn("rounded-lg px-4 py-2 text-sm font-medium", className)}
    >
      {pending ? "저장 중..." : children}
    </button>
  );
}
```

## 에러 처리: redirect 금지

Server Action 에서 에러를 `redirect()`로 처리하지 않는다. 반환값으로 전달해서 폼 안에 인라인으로 표시한다.

```typescript
// 금지: 에러를 redirect query param으로 처리
if (!valid) redirect("/login?message=에러");

// 올바른 예: 반환값으로 전달 → 폼에서 인라인 표시
if (!valid) return { error: "에러 메시지" };
```

> 예외: `signOut`, 로그인 성공 후 페이지 이동 등 **탐색이 목적**인 경우는 `redirect()` 사용.

## 클라이언트 전용 폼 (모달 내 단순 상태 변경)

Server Action을 form action으로 연결하기 어려운 경우(모달 내 select 등)에만 `useTransition`을 사용한다.

```tsx
"use client";

import { useTransition } from "react";
import { updateCandidateStatus } from "@/lib/candidate-actions";

type StatusChangeFormProps = {
  candidateId: string;
  currentStatus: CandidateStatus;
  onClose: () => void;
};

export function StatusChangeForm({ candidateId, currentStatus, onClose }: StatusChangeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);

  function handleSubmit() {
    startTransition(async () => {
      const result = await updateCandidateStatus(candidateId, status);
      if (!("error" in result)) onClose();
    });
  }

  return (
    <div className="space-y-4">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as CandidateStatus)}
        className="w-full rounded-lg border border-rose-100 bg-white px-3 py-2 text-sm"
      >
        <option value="active">적극검토</option>
        <option value="matched">매칭진행중</option>
        <option value="couple">커플완성</option>
      </select>

      <button onClick={handleSubmit} disabled={isPending}>
        {isPending ? "저장 중..." : "변경"}
      </button>
    </div>
  );
}
```

## 규칙

1. 뮤테이션은 **반드시 Server Action** (`"use server"` 파일에 정의)
2. Server Action 시그니처: `(prevState, formData)` — `useActionState` 대응
3. 반환 타입: `{ error: string } | { success: true }` — `any` 금지
4. **에러는 `redirect()` 금지** — 인라인으로 표시
5. HTML form의 pending은 **`useFormStatus`** 로 처리 (`isPending` prop 전달 금지)
6. 비-form 뮤테이션(버튼 클릭)은 **`useTransition`** 사용
7. 뮤테이션 성공 후 **반드시 `revalidatePath()`** 호출
8. `useState` + `setIsPending(true/false)` 수동 관리 패턴 금지
