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

```
app/
├── page.tsx              # 랜딩 (공개)
├── login/page.tsx        # 로그인
├── pending/page.tsx      # 승인 대기
├── dashboard/page.tsx    # 대시보드 (인증 필요)
├── candidates/page.tsx   # 후보 목록
├── profiles/[id]/page.tsx
├── timeline/page.tsx
└── admin/page.tsx
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

```tsx
// app/candidates/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-2xl bg-rose-50"
        />
      ))}
    </div>
  );
}
```

실제 레이아웃을 모방하는 Skeleton을 쓴다. "로딩 중..." 텍스트만 표시하는 것은 금지.

## 에러 UI (`error.tsx`)

```tsx
// app/candidates/error.tsx
"use client"; // error.tsx는 반드시 클라이언트 컴포넌트

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 p-12 text-center">
      <p className="text-lg font-semibold text-slate-800">오류가 발생했습니다</p>
      <p className="text-sm text-slate-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg border border-rose-200 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
      >
        다시 시도
      </button>
    </div>
  );
}
```

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

## 인증 보호

페이지 컴포넌트에서 직접 인증 체크 금지. 미들웨어(`middleware.ts`)에서 처리한다.

```typescript
// middleware.ts
// 보호된 경로는 미들웨어에서 일괄 처리
// 페이지 컴포넌트는 이미 인증된 상태라고 가정
```

## 규칙

1. 페이지는 `export default async function` (서버 컴포넌트)
2. `params`는 반드시 `await` — `Promise<{ id: string }>` 타입
3. 여러 데이터 패칭은 `Promise.all()` 병렬 실행
4. 페이지에 UI 로직 금지 — 컴포넌트에 위임
5. 주요 경로에 `loading.tsx`, `error.tsx` 배치
6. `loading.tsx`는 Skeleton으로 실제 레이아웃 모방
7. 데이터 없음은 `notFound()` 호출 + `not-found.tsx`로 처리
8. 인증 체크는 미들웨어에서 — 페이지에서 직접 체크 금지
