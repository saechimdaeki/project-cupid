---
paths:
  - "frontend/src/components/**/*.tsx"
---

# UI 컴포넌트 패턴

## UI 라이브러리

- **shadcn/ui** (Radix UI 기반) — 기본 UI 컴포넌트
- **Tailwind CSS** — 스타일링
- **lucide-react** — 아이콘

## 컴포넌트 디렉토리 구조

```
frontend/src/components/
├── ui/                    # shadcn/ui 컴포넌트 (자동 생성, 직접 수정 가능)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── common/                # 프로젝트 공용 컴포넌트
│   ├── DataTable/
│   │   ├── DataTable.tsx
│   │   ├── DataTablePagination.tsx
│   │   └── DataTableToolbar.tsx
│   └── SearchFilter.tsx
└── {area}/                # 영역별 전용 컴포넌트
    └── sidebar/
        ├── index.ts
        ├── app-sidebar.tsx
        └── profile-dropdown.tsx
```

## 컴포넌트 모듈 분리 규칙

복합 컴포넌트(100줄 이상, 훅/서브컴포넌트/설정 데이터 포함)는 **기능 단위 폴더**로 분리한다.

### 폴더 구조

```
{component-name}/
├── index.ts                 # barrel export (public API만 노출)
├── {component-name}.tsx     # 메인 컴포넌트
├── {sub-component}.tsx      # 서브 컴포넌트 (1파일 1컴포넌트)
├── use-{hook-name}.ts       # 커스텀 훅 (반드시 별도 파일)
└── {component-name}-config.ts  # 설정/상수/타입 (순수 로직, React 미포함)
```

### 분리 기준

| 대상 | 분리 여부 | 파일 위치 |
|------|----------|----------|
| 커스텀 훅 (`use*`) | **항상 분리** | `use-{name}.ts` |
| 서브 컴포넌트 (50줄 이상) | 분리 | `{name}.tsx` |
| 타입/인터페이스 (공유) | 설정 파일에 포함 | `{component}-config.ts` 등 |
| 네비/설정/상수/헬퍼 | 분리 (순수 로직) | `{component}-config.ts` |
| 작은 헬퍼 컴포넌트 (<50줄) | 메인 파일에 유지 | — |

### 핵심 원칙

- **훅은 항상 별도 파일** — 컴포넌트와 훅을 같은 파일에 두지 않음
- **순수 로직은 `.ts` 파일로** — React 의존 없는 타입/상수/헬퍼는 `.ts` (not `.tsx`)
- **index.ts는 public API만** — 내부 서브컴포넌트는 노출하지 않음
- **단일 컴포넌트는 폴더 불필요** — 100줄 이하 단순 컴포넌트는 단일 파일 유지

## 컴포넌트 작성 규칙

### 선언 스타일: `function` 선언 사용

```tsx
// 좋은 예
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}

export default function DashboardPage() {
  return <div>Dashboard</div>;
}

// 나쁜 예 — const 화살표 함수 사용 금지
export const UserCard = ({ user }: UserCardProps) => { ... };
```

### 기본 원칙

- **서버 컴포넌트가 기본**, 클라이언트 기능이 필요할 때만 `"use client"` 선언
- `"use client"`가 필요한 경우: 이벤트 핸들러, useState, useEffect, 브라우저 API
- props는 **interface**로 정의 (type 말고)
- 컴포넌트 파일 하나에 컴포넌트 하나 (헬퍼 컴포넌트는 같은 파일 가능)

### 컴포넌트 파일 구조

```tsx
"use client"; // 필요한 경우만

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 1. Props 인터페이스
interface UserCardProps {
  user: UserType;
  onSelect?: (id: number) => void;
  className?: string;
}

// 2. 컴포넌트
export function UserCard({ user, onSelect, className }: UserCardProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <h3 className="font-medium">{user.name}</h3>
      {onSelect && (
        <Button size="sm" onClick={() => onSelect(user.id)}>
          선택
        </Button>
      )}
    </div>
  );
}
```

### 조건부 렌더링

```tsx
// 좋은 예: 얼리 리턴
if (!data) return null;
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;

return <div>{/* 정상 렌더링 */}</div>;
```

```tsx
// 나쁜 예: 중첩 삼항
return isLoading ? <Skeleton /> : error ? <Error /> : data ? <Content /> : null;
```

## shadcn/ui 사용 규칙

1. `@/components/ui/`에 설치된 컴포넌트를 **우선 사용** — 직접 HTML 태그 사용 금지
2. 커스텀 필요하면 해당 파일을 **직접 수정** (shadcn은 코드 소유 방식)
3. `cn()` 유틸로 className 병합
4. shadcn에 없는 컴포넌트만 직접 구현

```tsx
// 좋은 예: @/components/ui/ 에서 import
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

// 나쁜 예: 직접 HTML 태그 사용
<button className="rounded bg-blue-500 px-4 py-2 text-white">클릭</button>
<input type="text" className="border rounded px-3 py-2" />
<table className="w-full">...</table>
```

## 테마 색상

### CSS 변수 기반 — 직접 Tailwind 색상 클래스 사용 금지

> `bg-blue-500`, `text-red-600` 등 Tailwind 기본 팔레트를 직접 사용하지 않는다.
> 반드시 **CSS 변수 기반 시맨틱 토큰**만 사용한다.

```tsx
// 좋은 예: 시맨틱 토큰 사용
<Badge className="bg-success-muted text-success border-success-border">승인</Badge>
<span className="text-warning">주의</span>

// 나쁜 예: 직접 Tailwind 색상 — 테마 전환 불가, 일관성 깨짐
<Badge className="bg-emerald-100 text-emerald-700">승인</Badge>
<span className="text-amber-500">주의</span>
```

### 허용되는 예외

| 허용 항목 | 예시 | 사유 |
|-----------|------|------|
| `black`/`white` | `text-black`, `bg-white` | 고정 색상 (테마 무관) |
| `inherit`/`current`/`transparent` | `text-inherit`, `bg-transparent` | CSS 기본값 |

## 반응형 (모바일 대응)

모든 UI는 모바일에서도 정상 동작해야 한다. Tailwind의 모바일 퍼스트 원칙을 따른다.

```tsx
// 좋은 예: 모바일 1열 → sm 이상 2열
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

// 좋은 예: 모바일에서 세로 정렬 → sm 이상 가로 정렬
<div className="flex flex-col sm:flex-row gap-2">

// 나쁜 예: 모바일 고려 없는 고정 그리드
<div className="grid grid-cols-3 gap-4">
```

## 가독성 & 폰트 크기 규칙

### 최소 폰트 크기: 12px

모든 텍스트는 최소 12px(`text-xs`) 이상이어야 한다.

```tsx
// 좋은 예
<span className="text-xs">보조 텍스트</span>       // 12px
<span className="text-sm">본문 텍스트</span>        // 14px

// 나쁜 예: 10px 이하 절대 금지
<span className="text-[10px]">작은 텍스트</span>
```

### 색상 대비 규칙

- **정보성 텍스트는 기본 `text-foreground` 사용** — 사용자가 읽어야 하는 정보
- `text-muted-foreground`는 **장식/보조 요소에만** — placeholder, 빈 상태 안내문 등
- **opacity 수식어 금지** — `text-muted-foreground/50` 같은 추가 opacity 적용 금지

## 로딩 컴포넌트

API 응답을 기다리는 모든 UI에는 **반드시 로딩 표시**를 한다. "조용한 대기"는 금지.

### 로딩 필수 규칙

1. **API 호출 대기 시 반드시 로딩 표시**
2. **useSuspenseQuery → Suspense fallback 필수**
3. **useMutation → 제출 중 로딩 필수** — `<Button isLoading={isPending}>` 등
4. **loading.tsx → Skeleton 조합** — 실제 페이지 레이아웃을 모방

## 규칙 요약

1. 컴포넌트는 **반드시** `function` 선언 사용
2. UI 컴포넌트는 **반드시** `@/components/ui/`의 shadcn/ui 우선 사용
3. `className` prop을 지원하고 `cn()`으로 병합
4. 비즈니스 로직은 컴포넌트에 넣지 않는다 (훅으로 분리)
5. 이벤트 핸들러 props는 `on` 접두사 (`onClick`, `onSelect`, `onSubmit`)
6. boolean props는 `is`/`has` 접두사 (`isLoading`, `hasError`)
7. 리스트 렌더링 시 **반드시** 고유한 `key` 사용 (index 금지)
8. **모든 UI는 모바일 대응** — `grid-cols-2` 대신 `grid-cols-1 sm:grid-cols-2` 사용
9. **폰트 최소 크기 12px** — `text-[10px]` 이하 금지
10. **API 응답 대기 시 반드시 로딩 표시**
