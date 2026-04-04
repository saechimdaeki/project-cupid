---
paths:
  - "lib/data.ts"
  - "lib/**/*-actions.ts"
  - "types/supabase.ts"
---

# 데이터 패칭 & 뮤테이션 패턴

## 기술 스택

- **Supabase** (`@supabase/supabase-js`, `@supabase/ssr`) — 유일한 데이터 소스
- **Server Components** — 기본 데이터 패칭 방식
- **Server Actions** — 뮤테이션 처리
- **Supabase 생성 타입** (`types/supabase.ts`) — DB 타입 안전성
- axios, TanStack Query 없음

## Supabase 생성 타입

`any` 타입으로 row를 받지 않는다. Supabase CLI로 타입을 생성해서 사용한다.

```bash
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```

```typescript
// 금지
function mapCandidate(row: any): Candidate { ... }

// 올바른 예
import type { Tables } from "@/types/supabase";

function mapCandidate(row: Tables<"cupid_candidates">): Candidate {
  return {
    id: row.id,
    full_name: row.full_name,
    // ...
  };
}
```

## 읽기 쿼리 패턴 (`lib/data.ts`)

```typescript
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/supabase";
import type { Candidate } from "@/types/domain";

export async function getCandidates(): Promise<Candidate[]> {
  const supabase = await createClient();

  if (!supabase) {
    return mockCandidates; // 개발/데모 환경 폴백
  }

  const { data, error } = await supabase
    .from("cupid_candidates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return mockCandidates;
  }

  return data.map(mapCandidate);
}
```

### 병렬 쿼리

같은 페이지에서 여러 쿼리가 필요하면 `Promise.all()`로 병렬 실행한다.

```typescript
// app/profiles/[id]/page.tsx
const [candidate, photos, matchRecords] = await Promise.all([
  getCandidateById(id),
  getCandidatePhotos(id),
  getMatchRecords(id),
]);
```

### 반환 타입 명시

모든 `lib/data.ts` 함수는 반환 타입을 명시한다.

```typescript
// 금지: 반환 타입 없음
export async function getCandidates() { ... }

// 올바른 예
export async function getCandidates(): Promise<Candidate[]> { ... }
export async function getCandidateById(id: string): Promise<Candidate | null> { ... }
```

## 뮤테이션 패턴 (Server Actions)

```typescript
// lib/admin-actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { error: string } | { success: true };

export async function approveMembership(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  if (!supabase) return { error: "연결 실패" };

  const userId = formData.get("user_id") as string;

  const { error } = await supabase
    .from("cupid_memberships")
    .update({ status: "approved" })
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { success: true };
}
```

### revalidatePath vs revalidateTag

단순 경로 무효화는 `revalidatePath`, 세밀한 캐시 제어가 필요하면 `revalidateTag`:

```typescript
// 단순 경로 무효화 (일반적인 경우)
revalidatePath("/candidates");

// 태그 기반 (여러 페이지에 걸쳐 무효화할 때)
revalidateTag("candidates");
// 데이터 패칭 시: unstable_cache(fn, keys, { tags: ["candidates"] })
```

## 페이지에서 데이터 패칭

```tsx
// app/candidates/page.tsx
import { getCandidates } from "@/lib/data";
import { CandidateList } from "@/components/candidate-list";

export default async function CandidatesPage() {
  const candidates = await getCandidates();
  return <CandidateList candidates={candidates} />;
}
```

## 금지 사항

1. Client Component에서 `lib/data.ts` 함수 직접 호출 금지 (서버 전용)
2. Client Component에서 Supabase 직접 쿼리 금지 (인증 제외)
3. `any`로 row 타입 처리 금지 → Supabase 생성 타입 사용
4. 반환 타입 없는 `lib/data.ts` 함수 금지
5. N+1 쿼리 금지 → `Promise.all()` 또는 단일 쿼리로 처리
