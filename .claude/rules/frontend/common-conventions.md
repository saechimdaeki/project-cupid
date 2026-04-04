---
paths:
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.tsx"
---

# 공통 컨벤션

## TypeScript

### 타입 정의
- 컴포넌트 props → `interface` 사용
- 유니온/교차 타입, 유틸리티 타입 → `type` 사용
- API 요청/응답 → `interface` 사용
- `any` 사용 금지 → `unknown`으로 대체 후 타입 가드

```typescript
// 좋은 예
interface UserCardProps {
  user: UserType;
  onSelect?: (id: number) => void;
}

type Status = "pending" | "approved" | "rejected";
type UserWithOrders = UserType & { orders: OrderType[] };

// 나쁜 예
type UserCardProps = { ... }; // interface 사용
const data: any = response;     // unknown 사용
```

### Null 처리
```typescript
// 좋은 예: Optional chaining + Nullish coalescing
const name = user?.name ?? "미지정";

// 나쁜 예
const name = user && user.name ? user.name : "미지정";
```

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | kebab-case | `user-card.tsx` |
| 훅 파일 | camelCase + use 접두사 | `useUser.ts` |
| 유틸 파일 | kebab-case | `format.ts` |
| 페이지 폴더 | kebab-case | `user-info/` |
| 타입 파일 | kebab-case + .types | `user.types.ts` |
| 상수 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| 컴포넌트 | PascalCase | `UserCard` |
| 함수/변수 | camelCase | `fetchList`, `isLoading` |
| 타입/인터페이스 | PascalCase + 접미사 | `UserType`, `ListReqType` |
| 이벤트 핸들러 | handle 접두사 | `handleSubmit`, `handleSelect` |

### 타입 접미사 규칙
```typescript
interface UserType { ... }            // 엔티티
interface UserListReqType { ... }     // 요청
interface UserListResType { ... }     // 응답
interface UserCardProps { ... }       // Props
```

### map 콜백 변수명
```typescript
// 좋은 예: 의미 있는 이름
users.map((user) => <UserCard user={user} />)
statuses.map((status) => <Badge>{status.label}</Badge>)

// 나쁜 예: 약어 금지
users.map((u) => <UserCard user={u} />)
statuses.map((s) => <Badge>{s.label}</Badge>)
```

## Import 정리

순서:
```typescript
// 1. React/Next.js
import { useState } from "react";
import Link from "next/link";

// 2. 외부 라이브러리
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// 3. 내부 컴포넌트/유틸 (@ alias)
import { Button } from "@/components/ui/button";
import useUser from "@/service/user/useUser";

// 4. 타입 (type-only import)
import type { UserType } from "@/service/user/user.types";

// 5. 상대 경로 (같은 폴더)
import { UserListTable } from "./user-list-table";
```

## 에러 처리

```typescript
// API 에러는 서비스 레이어에서 타입 처리
// 컴포넌트에서는 TanStack Query의 error 사용

// 좋은 예
const { data, error, isLoading } = useUser.useFetchList(params);
if (error) return <ErrorMessage error={error} />;

// 나쁜 예: try-catch를 컴포넌트에서 직접
try {
  const data = await fetch("/api/...");
} catch (e) { ... }
```

## 주석

```typescript
// 좋은 예: WHY를 설명
// 도메인별로 동적 설정이 필요하므로 런타임에 결정
export const dynamic = "force-dynamic";

// 나쁜 예: WHAT을 설명 (코드 자체로 알 수 있음)
// 유저를 가져온다
const user = useUser();
```

## 변경 용이성 / 모듈화 원칙

> 요구사항이 언제든 변경될 수 있다.
> 모든 기능은 **"어디를 고치면 되는지" 즉시 파악 가능**하도록 설계한다.

### 계층 분리 — 각 파일은 하나의 역할만 담당한다
- **UI 컴포넌트** (`*.tsx`): 화면에 무엇을 보여줄지만 결정. 비즈니스 로직 금지.
- **API Route / helpers** (`route.ts`, `helpers.ts`): 서버 로직만 담당. UI 관심사 금지.
- **설정값** (`constants.ts`): 하드코딩 대신 상수로 한 곳에 모은다. 값만 바꾸면 전체 반영.
- **Provider** (`*Provider.tsx`): 상태 전달만 담당. 비즈니스 로직 금지.
- **서비스/훅** (`use*.ts`): 데이터 fetch + 상태 관리. UI와 분리.

### 변경 시 영향 범위를 최소화한다
- 설정값(쿠키명, 경로, 만료시간 등)은 **한 파일(constants)에 모아** 관리한다.
- 외부 연동(API, 더미 데이터)은 **한 파일(helpers 또는 service)에 격리**하여 교체 시 그 파일만 수정한다.
- 새 기능 추가 시 **기존 파일 수정을 최소화**하고, 새 파일을 생성하는 방향으로 설계한다.

### 이식성을 고려한다
- 기능 모듈(인증, 이벤트 등)은 `lib/{모듈명}/` 디렉토리에 모아 **폴더 단위로 복사 가능**하게 유지한다.
- 외부 의존성은 최소한으로 유지한다.
- 프로젝트 특화 값(도메인, 쿠키명 등)은 constants에만 있어야 하며, 컴포넌트 코드에 직접 쓰지 않는다.

## 금지 사항

1. `any` 타입 사용 금지
2. `console.log` 커밋 금지 (디버깅용은 사용 후 제거)
3. 인라인 스타일 (`style={}`) 사용 금지 → Tailwind 사용
4. `!important` 사용 금지
5. `index`를 리스트 `key`로 사용 금지
6. `var` 사용 금지 → `const` 기본, 재할당 필요시 `let`
7. map 콜백에서 1글자 약어 변수명 금지
