---
paths:
  - "components/**/*.tsx"
---

# UI 컴포넌트 패턴

## 기술 스택

- **Tailwind CSS v4** (`@import "tailwindcss"`) — 스타일링
- **`cn()` 유틸** (`lib/cn.ts`) — className 병합
- shadcn/ui 없음 — 모든 컴포넌트 직접 구현

## className 병합: `cn()` 사용

`clsx` + `tailwind-merge` 조합의 `cn()` 유틸을 사용한다. template literal 직접 합치기 금지.

```typescript
// lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// 올바른 예: cn()으로 병합
import { cn } from "@/lib/cn";

export function CandidateCard({ candidate, className }: CandidateCardProps) {
  return (
    <div className={cn("rounded-xl border p-4", className)}>
      {candidate.full_name}
    </div>
  );
}

// 금지: template literal 직접 합치기
<div className={`rounded-xl border p-4 ${className ?? ""}`}>
```

## 색상 시스템

### 컴포넌트 레이어 — Tailwind 시맨틱 팔레트 사용

컴포넌트의 시각적 색상은 **Tailwind 팔레트**를 직접 사용한다.
상태별 색상은 `lib/status-ui.ts`에 switch문으로 모아 관리한다.

```typescript
// lib/status-ui.ts — 상태 색상의 단일 진실 공급원
export function getStatusBadgeClass(status: CandidateStatus) {
  switch (status) {
    case "active":  return "border-rose-100 bg-rose-50 text-rose-600";
    case "matched": return "border-blue-100 bg-blue-50 text-blue-600";
    case "couple":  return "border-emerald-100 bg-emerald-50 text-emerald-600";
    // ...
  }
}
```

> switch 안에서는 **완전한 클래스명**만 사용 — Tailwind가 스캔할 수 없는 동적 조합 금지

```typescript
// 금지: 동적 조합 (Tailwind가 빌드에서 제거함)
return `border-${color}-100 bg-${color}-50`;

// 올바른 예: 완전한 클래스명
return "border-rose-100 bg-rose-50";
```

### 레이아웃/셸 레이어 — CSS 변수 사용

`app-shell.tsx`, `global-nav.tsx` 등 **앱 프레임 컴포넌트**에서는 `globals.css` CSS 변수를 사용한다.

```
--bg, --bg-elevated    배경
--panel, --panel-soft  패널 표면
--line, --line-strong  구분선
--text, --muted        텍스트
--gold, --rose         브랜드 액센트
```

```tsx
// 앱 셸/네비게이션에서만
<nav className="bg-[var(--panel)] border-b border-[var(--line)]">
```

## 컴포넌트 작성 규칙

### 선언 스타일: `function` 선언 사용

```tsx
// 올바른 예
export function CandidateCard({ candidate }: CandidateCardProps) {
  return <div>{candidate.full_name}</div>;
}

// 금지 — 화살표 함수
export const CandidateCard = ({ candidate }: CandidateCardProps) => { ... };
```

### 기본 원칙

- **Server Component 기본** — 이벤트 핸들러/훅 필요 시에만 `"use client"` 선언
- props는 `type`으로 정의 (`interface` 금지)
- 컴포넌트 파일 하나에 컴포넌트 하나 (50줄 이하 헬퍼는 같은 파일 가능)

### 컴포넌트 파일 구조

```tsx
"use client"; // 필요한 경우만

import { cn } from "@/lib/cn";
import type { Candidate } from "@/lib/types";

type CandidateCardProps = {
  candidate: Candidate;
  onSelect?: (id: string) => void;
  className?: string;
};

export function CandidateCard({ candidate, onSelect, className }: CandidateCardProps) {
  return (
    <div className={cn("rounded-xl border border-rose-100/50 bg-white/95 p-4", className)}>
      <h3 className="font-semibold text-slate-800">{candidate.full_name}</h3>
      <p className="text-sm text-slate-500">{candidate.occupation}</p>
    </div>
  );
}
```

### 조건부 렌더링

```tsx
// 올바른 예: 얼리 리턴
if (!candidate) return null;
return <div>{/* 정상 렌더링 */}</div>;

// 금지: 중첩 삼항
return isLoading ? <Loading /> : error ? <Error /> : data ? <Content /> : null;
```

## 컴포넌트 모듈 분리

100줄 이상 복합 컴포넌트는 폴더로 분리:

```
components/
├── candidate-card.tsx           # 단일 파일 (간단)
└── dashboard-flow-board/        # 폴더 (복잡)
    ├── index.ts                 # barrel export
    ├── dashboard-flow-board.tsx # 메인
    ├── flow-column.tsx          # 서브 컴포넌트
    └── use-flow-board.ts        # 커스텀 훅 (항상 별도 파일)
```

## 반응형

모바일 퍼스트:

```tsx
// 올바른 예
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// 금지: 모바일 미고려
<div className="grid grid-cols-3 gap-4">
```

## 규칙 요약

1. 컴포넌트는 **반드시** `function` 선언 사용
2. className 병합은 **반드시** `cn()` 사용 (template literal 금지)
3. 상태별 색상은 **`lib/status-ui.ts`에만** 정의 (컴포넌트에서 직접 switch 금지)
4. 동적 Tailwind 클래스 조합 금지 (`bg-${color}-500` 형태)
5. 비즈니스 로직은 컴포넌트에서 분리
6. 이벤트 핸들러 props는 `on` 접두사
7. boolean props는 `is`/`has` 접두사
8. 리스트 `key`는 고유값 사용 (index 금지)
9. **모든 UI는 모바일 대응**
10. **폰트 최소 12px** (`text-xs` 이상)
