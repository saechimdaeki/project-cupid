---
paths:
  - "frontend/src/app/**/*.tsx"
---

# 페이지 패턴

## 핵심 원칙: app = 배치, features = 로직

**`app/`에는 레이아웃/배치 코드만 둔다.** 로직이 있는 컴포넌트는 `features/`에 둔다. 페이지는 Feature를 import하여 배치만 한다.

```tsx
// app/.../registration/page.tsx — 배치만
import { RegistrationFlow } from "@/features/registration";

export default function RegistrationPage() {
  return <RegistrationFlow />;
}
```

### Co-location 패턴 (레이아웃 보조만)

`app/` 하위 `_components/`에는 **레이아웃 보조 컴포넌트만** 둔다 (로직 없는 순수 배치/스타일 래퍼). 로직이 있으면 `features/`로 이동한다.

### 어떤 패턴을 쓸까?

| 상황 | 패턴 | 예시 |
|------|------|------|
| 복합 폼/스키마 합성 | Feature | 등록 폼 |
| 다단계 플로우 | Feature | 회원가입, 신청 |
| API 호출/상태 관리가 있는 UI | Feature | 목록 테이블, 설정 폼 |
| 여러 페이지에서 재사용 가능한 기능 | Feature | 공통 대시보드 위젯 |
| 로직 없는 배치/스타일 래퍼 | Co-location | 페이지 전용 레이아웃 래퍼 |

### Import 경로

```tsx
// Feature (@ alias)
import { UserCreate } from "@/features/user-create";

// 페이지 전용 co-located (상대경로)
import { StatsCard } from "./_components/stats-card";

// 공유 컴포넌트 (@ alias)
import { PageHeader } from "@/components/common/page-header";
```

## 페이지 작성 패턴

### 서버 컴포넌트 페이지 (기본)

```tsx
// page.tsx — 서버 컴포넌트 (기본)
import { PageHeader } from "@/components/common/page-header";
import { UserListTable } from "./_components/user-list-table";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <PageHeader title="사용자 목록" description="사용자를 관리합니다" />
      <UserListTable
        initialPage={Number(params.page) || 1}
        initialSearch={params.search}
      />
    </div>
  );
}
```

## 로딩/에러 UI

### loading.tsx

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

### error.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 p-12">
      <h2 className="text-lg font-bold">오류가 발생했습니다</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
```

## Suspense + ErrorBoundary 패턴

**`useSuspenseQuery`를 사용하는 모든 데이터 패칭 컴포넌트는 반드시 `ErrorBoundary` > `Suspense` 순으로 감싼다.**

```tsx
// page.tsx — 서버 컴포넌트
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="대시보드" />

      {/* 통계 영역: 독립적으로 로딩 */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <StatsSummary />
        </Suspense>
      </ErrorBoundary>

      {/* 테이블 영역: 독립적으로 로딩 */}
      <ErrorBoundary FallbackComponent={SectionErrorFallback}>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <UserListTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

### 사용 기준

| 상황 | 방법 |
|------|------|
| 전체 페이지 로딩 | `loading.tsx` |
| `useSuspenseQuery` 사용 컴포넌트 | **`ErrorBoundary` > `Suspense`로 감싸기 필수** |
| 페이지 내 독립 영역 로딩 | `<Suspense fallback={...}>` |
| 전체 페이지 에러 | `error.tsx` |
| 페이지 내 독립 섹션 에러 격리 | `<ErrorBoundary>` |

## 규칙

1. 페이지 컴포넌트는 `export default function` 사용
2. 데이터 페칭 가능하면 **서버 컴포넌트**로 (SSR)
3. 인터랙티브 기능이 많으면 **클라이언트 컴포넌트**로
4. 로직이 있는 컴포넌트는 `features/`에 배치, `app/`에는 배치만
5. 페이지 전용 레이아웃 래퍼만 `_components/`에 co-locate (로직 금지)
6. 공용 컴포넌트는 `components/`에 배치
7. `searchParams`로 URL 기반 상태 관리 (페이지네이션, 검색, 필터)
8. 각 주요 경로에 `loading.tsx`, `error.tsx` 배치
9. 순서: `<ErrorBoundary>` > `<Suspense>` > 비동기 컴포넌트
