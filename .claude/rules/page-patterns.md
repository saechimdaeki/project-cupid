---
paths:
  - "app/**/*.tsx"
  - "app/**/page.tsx"
  - "app/**/layout.tsx"
  - "app/**/loading.tsx"
  - "app/**/error.tsx"
---

# 페이지 패턴

## 핵심 원칙: 페이지 = 데이터 패칭 + 배치

페이지는 `lib/data.ts` 함수를 호출하고 컴포넌트에 넘기는 것이 전부다. UI 로직, 조건 분기, 데이터 변환을 페이지에 쓰지 않는다.

```tsx
// app/candidates/page.tsx
import { getCandidates } from "@/lib/data";
import { CandidateList } from "@/components/candidate-list";

export default async function CandidatesPage() {
  const candidates = await getCandidates();
  return <CandidateList candidates={candidates} />;
}
```

## 라우팅 구조

권한 수준별 Route Group으로 분리. Route Group은 URL에 영향 없음.

```
app/
├── layout.tsx, globals.css
│
├── (public)/                           # 인증 불필요
│   ├── page.tsx                        # / 랜딩
│   ├── login/page.tsx                  # /login
│   ├── auth/continue/page.tsx          # /auth/continue
│   └── pending/page.tsx                # /pending
│
├── (member)/                           # 승인된 멤버 (viewer 이상)
│   ├── dashboard/page.tsx              # /dashboard
│   └── timeline/page.tsx               # /timeline
│
├── (admin)/                            # 관리자 (admin, super_admin)
│   ├── candidates/new/page.tsx         # /candidates/new
│   └── profiles/[id]/
│       ├── page.tsx                    # /profiles/:id
│       └── edit/page.tsx               # /profiles/:id/edit
│
└── (super-admin)/                      # 최고 관리자 (super_admin)
    └── admin/page.tsx                  # /admin
```

## 서버 컴포넌트 페이지 (기본)

```tsx
// app/profiles/[id]/page.tsx
import { getCandidateById, getMatchRecords, getCandidatePhotos } from "@/lib/data";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params; // Next.js 15: params는 Promise

  // 병렬 패칭
  const [candidate, photos, matchRecords] = await Promise.all([
    getCandidateById(id),
    getCandidatePhotos(id),
    getMatchRecords(id),
  ]);

  if (!candidate) {
    return <p className="p-8 text-sm text-slate-500">후보를 찾을 수 없습니다.</p>;
  }

  return <ProfileView candidate={candidate} photos={photos} matchRecords={matchRecords} />;
}
```

> **`params`는 반드시 `await`** — Next.js 15부터 `Promise<{ id: string }>` 타입

## 로딩 UI (`loading.tsx`)

페이지 단위 Streaming을 활용한다. React Suspense가 자동으로 적용된다.
**데이터 패칭이 있는 세그먼트에는 `loading.tsx`를 배치한다.** 데이터 패칭이 없는 정적 페이지는 생략 가능.

```tsx
// app/candidates/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidatesLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}
```

**규칙**
- 실제 레이아웃 크기/간격을 모방한다. "로딩 중..." 텍스트만 표시하는 것은 금지.
- Skeleton은 `components/ui/skeleton.tsx`의 `Skeleton` 컴포넌트를 재사용한다. 별도 placeholder 컴포넌트를 새로 만들지 않는다.
- `loading.tsx`에 무거운 클라이언트 컴포넌트(애니메이션, 차트 등)를 넣지 않는다 — fallback은 가볍게 유지한다.
- 함수명은 `<Route>Loading` (예: `DashboardLoading`, `LoginLoading`).

## 에러 UI (`error.tsx`)

렌더/데이터 패칭 중 throw된 예외를 세그먼트 경계에서 잡는다. React Error Boundary로 감싸진다.

```tsx
// app/candidates/error.tsx
"use client"; // error.tsx는 반드시 클라이언트 컴포넌트

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type CandidatesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CandidatesError({ error, reset }: CandidatesErrorProps) {
  useEffect(() => {
    console.error("[candidates] route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 p-12 text-center">
      <h2 className="text-foreground">오류가 발생했습니다</h2>
      <p className="text-sm text-muted-foreground">잠시 후 다시 시도해 주세요.</p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">오류 코드: {error.digest}</p>
      ) : null}
      <Button variant="outline" onClick={reset} className="rounded-full">
        다시 시도
      </Button>
    </div>
  );
}
```

**규칙**
- `"use client"` 필수. props 타입은 `{ error: Error & { digest?: string }; reset: () => void }` (interface 금지).
- 함수명은 `<Route>Error` (예: `LoginError`, `DashboardError`).
- `useEffect`에서 `console.error`로 로깅한다 — 프로덕션에서 관찰 가능성 확보.
- `error.message`를 사용자에게 그대로 노출하지 않는다. 내부 정보가 유출될 수 있다. 사용자 친화 메시지 + 필요 시 `error.digest`만 노출.
- `reset()` 버튼과 복귀 링크(홈/상위 경로) 두 가지 액션을 제공한다.
- **형제 `layout.tsx`의 에러는 잡지 못한다.** 레이아웃까지 감싸려면 부모 세그먼트에 `error.tsx`를 둔다.
- Server Action 실패 같은 **폼 내부 에러**는 `setError()`로 인라인 표시 — `error.tsx`로 올리지 않는다 (`form-patterns.md` 참조).

## Suspense 바운더리 — 파일 레벨 vs 컴포넌트 레벨

Suspense 배치는 두 가지 층위로 결정한다.

| 층위 | 사용 상황 | 방법 |
|------|-----------|------|
| **파일 레벨 (`loading.tsx`)** | 세그먼트 전체가 한 덩어리로 스트리밍되어도 무방 | `loading.tsx` 배치만으로 충분 |
| **컴포넌트 레벨 (`<Suspense>`)** | 헤더/네비는 즉시 보이고, 느린 데이터 영역만 스트리밍하고 싶을 때 | 페이지에서 Promise를 하위 서버 컴포넌트에 넘기고 `<Suspense>`로 래핑 |

### 컴포넌트 레벨 Suspense 예시

```tsx
// app/(member)/dashboard/page.tsx
import { Suspense } from "react";
import { GlobalNav } from "@/components/global-nav";
import { requireApprovedMembership } from "@/lib/permissions";
import { DashboardMain } from "./_components/dashboard-main";
import { DashboardStreamingSkeleton } from "./_components/dashboard-streaming-skeleton";

export default async function DashboardPage() {
  const membership = await requireApprovedMembership(); // 빠른 체크는 await

  return (
    <>
      <GlobalNav membership={membership} />
      <Suspense fallback={<DashboardStreamingSkeleton />}>
        {/* DashboardMain 내부에서 무거운 데이터 패칭 */}
        <DashboardMain membership={membership} />
      </Suspense>
    </>
  );
}
```

**판단 기준**
- 페이지 최상단에 **즉시 보여줄 UI(네비게이션, 헤더 등)가 있다** → 컴포넌트 레벨 `<Suspense>` 사용
- 데이터 패칭이 **여러 독립 영역**으로 나뉜다 → 영역별로 `<Suspense>` 분리해 각각 스트리밍
- 그 외 단순 페이지 → `loading.tsx`만으로 충분

### Not Found vs Error 우선순위

`notFound()` 호출 시 `error.tsx`가 아닌 `not-found.tsx`가 렌더된다. 도메인적 "없음"과 예외를 구분한다:
- **데이터 없음** → `notFound()` + `not-found.tsx`
- **예외/쿼리 실패** → throw → `error.tsx`

## Not Found (`not-found.tsx`)

`notFound()`를 호출하는 경로에는 `not-found.tsx`를 둔다.

```tsx
// app/profiles/[id]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 p-12 text-center">
      <p className="text-lg font-semibold text-slate-800">후보를 찾을 수 없습니다</p>
      <Link href="/candidates" className="text-sm text-rose-500 underline">
        목록으로 돌아가기
      </Link>
    </div>
  );
}
```

```typescript
// lib/data.ts 또는 page.tsx
import { notFound } from "next/navigation";

const candidate = await getCandidateById(id);
if (!candidate) notFound(); // not-found.tsx를 렌더링
```

## 인증/인가 보호 (2계층)

| 레이어 | 책임 | 위치 |
|--------|------|------|
| **인증(Authentication)** | 세션 리프레시 + 미인증 사용자 리다이렉트 | `middleware.ts` |
| **인가(Authorization)** | 역할 기반 권한 체크 (`admin`, `viewer` 등) | 페이지/레이아웃 |

미들웨어는 Edge Runtime에서 실행되므로 쿠키 기반 세션 갱신과 라우트 게이트에 적합하다.
역할/승인 상태 등 DB 조회가 필요한 권한 체크는 페이지에서 처리한다.

```typescript
// middleware.ts — 인증 게이트
// 세션 리프레시 + 미인증 사용자를 /login으로 리다이렉트

// app/(super-admin)/admin/page.tsx — 인가 (역할 체크)
import { requireMembershipRole } from "@/lib/permissions";

export default async function AdminPage() {
  await requireMembershipRole(["super_admin"]);
  // ...
}

// app/(member)/dashboard/page.tsx — 인가 (승인 상태 체크)
import { requireApprovedMembership } from "@/lib/permissions";

export default async function DashboardPage() {
  await requireApprovedMembership();
  // ...
}
```

## 규칙

1. 페이지는 `export default async function` (서버 컴포넌트)
2. `params`는 반드시 `await` — `Promise<{ id: string }>` 타입
3. 여러 데이터 패칭은 `Promise.all()` 병렬 실행
4. 페이지에 UI 로직 금지 — 컴포넌트에 위임
5. **데이터 패칭이 있는 모든 세그먼트에 `loading.tsx` + `error.tsx` 배치**
6. `loading.tsx`는 `components/ui/skeleton.tsx`의 `Skeleton`을 재사용해 실제 레이아웃 모방
7. `error.tsx`는 `"use client"` + `useEffect` 로깅 + `reset()` 버튼 + 복귀 링크
8. `error.message`를 사용자에게 노출 금지 — 친화 메시지 + `error.digest`만
9. 즉시 보여줄 UI가 있거나 데이터 영역이 여러 개면 **컴포넌트 레벨 `<Suspense>`** 사용
10. 데이터 없음은 `notFound()` 호출 + `not-found.tsx`로 처리 (예외와 구분)
11. **인증**은 `middleware.ts`에서, **인가**(역할/권한)는 페이지에서 처리
