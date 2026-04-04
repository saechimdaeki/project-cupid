---
paths:
  - "app/**/*.{ts,tsx}"
  - "components/**/*.{ts,tsx}"
  - "lib/**/*.{ts,tsx}"
  - "types/**/*.ts"
---

# 공통 컨벤션

## TypeScript

### 타입 정의: `type`으로 통일

`interface` 사용 금지. 프로젝트 전체에서 `type`으로 통일한다.

```typescript
// 올바른 예
type CandidateCardProps = {
  candidate: Candidate;
  onSelect?: (id: string) => void;
};

type CandidateStatus = "active" | "matched" | "couple";

// 금지
interface CandidateCardProps { ... }  // interface 사용 금지
```

### `any` 금지

`any` 타입 사용 금지. Supabase row 타입은 `api-patterns.md`의 Supabase 생성 타입 규칙을 따른다.

### Null 처리

```typescript
// 올바른 예
const name = candidate?.full_name ?? "미지정";

// 금지
const name = candidate && candidate.full_name ? candidate.full_name : "미지정";
```

## 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | kebab-case | `candidate-card.tsx` |
| 훅 파일 | camelCase + use 접두사 | `useFlowBoard.ts` |
| 유틸/액션 파일 | kebab-case | `candidate-actions.ts` |
| 상수 | UPPER_SNAKE_CASE | `SIGNED_URL_TTL_SECONDS` |
| 컴포넌트 | PascalCase | `CandidateCard` |
| 함수/변수 | camelCase | `getCandidates`, `isPending` |
| 타입 | PascalCase | `Candidate`, `MatchRecord` |
| 이벤트 핸들러 | handle 접두사 | `handleSubmit`, `handleSelect` |

### map 콜백 변수명

```typescript
// 올바른 예: 의미 있는 이름
candidates.map((candidate) => <CandidateCard candidate={candidate} />)

// 금지: 약어
candidates.map((c) => <CandidateCard candidate={c} />)
```

## Import 순서

```typescript
// 1. React/Next.js
import { useState, useActionState } from "react";
import Link from "next/link";

// 2. 외부 라이브러리
import { cn } from "@/lib/cn";

// 3. 내부 컴포넌트/유틸 (@ alias)
import { CandidateCard } from "@/components/candidate-card";
import { getCandidates } from "@/lib/data";

// 4. 타입 (type-only import)
import type { Candidate } from "@/types/domain";

// 5. 상대 경로
import { FlowColumn } from "./flow-column";
```

## 계층 분리 원칙

`feature-architecture.md` 참조. 요약:

- `app/` → 데이터 패칭 + 배치만
- `components/` → 렌더링만
- `lib/` → 로직, Server Actions, 유틸
- `types/` → 타입 정의

## 주석

```typescript
// 올바른 예: WHY
// Supabase 연결 불가 시 목 데이터 폴백 — 앱이 죽지 않도록
if (!supabase) return mockCandidates;

// 금지: WHAT (코드로 알 수 있음)
// 데이터를 가져온다
const data = await getCandidates();
```

## 금지 사항

1. `any` 타입 사용 금지
2. `interface` 사용 금지 → `type`으로 통일
3. `console.log` 커밋 금지
4. 인라인 스타일 (`style={}`) 금지
5. `index`를 리스트 `key`로 사용 금지
6. `var` 사용 금지
7. map 콜백에서 1글자 약어 변수명 금지
8. Client Component에서 Supabase 직접 쿼리 금지 (인증 제외)
