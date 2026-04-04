---
paths:
  - "app/**/*"
  - "components/**/*"
  - "lib/**/*"
  - "types/**/*"
---

# 아키텍처 구조

## 디렉토리 레이아웃

```
app/           # 라우팅 + 페이지 (Next.js App Router)
components/    # 모든 UI 컴포넌트
lib/           # 데이터 접근, 유틸, 타입, Server Actions
types/         # Supabase 생성 타입 (types/supabase.ts)
supabase/      # Supabase 설정, 마이그레이션
public/        # 정적 에셋
```

## 의존성 방향 (단방향)

```
app/ → components/ → lib/
```

- `app/`은 Server Component로 데이터 패칭 후 `components/`에 props로 전달
- `components/`는 `lib/`의 유틸/타입/Server Actions를 import 가능
- `components/`끼리 직접 import 가능 (순환 참조 금지)
- `lib/`은 `components/`, `app/`을 import 금지

## app/ — 페이지 레이어

**역할: 데이터 패칭 + 레이아웃 조립만.** 비즈니스 로직, 조건 분기, 데이터 변환은 `lib/data.ts`에서 처리한다.

```tsx
// app/candidates/page.tsx — 이게 전부여야 한다
import { getCandidates } from "@/lib/data";
import { CandidateList } from "@/components/candidate-list";

export default async function CandidatesPage() {
  const candidates = await getCandidates();
  return <CandidateList candidates={candidates} />;
}
```

## components/ — UI 레이어

**역할: 렌더링만.** props를 받아서 UI를 그린다. 직접 Supabase 쿼리 금지.

- 파일명: **kebab-case** (`candidate-card.tsx`)
- 컴포넌트명: **PascalCase** (`CandidateCard`)
- 100줄 이상 복합 컴포넌트는 폴더로 분리

```
components/
├── candidate-card.tsx           # 단일 파일
└── dashboard-flow-board/        # 폴더 (복잡한 컴포넌트)
    ├── index.ts
    ├── dashboard-flow-board.tsx
    ├── flow-column.tsx
    └── use-flow-board.ts        # 커스텀 훅 (항상 별도 파일)
```

## lib/ — 로직 레이어

```
lib/
├── data.ts                   # Supabase 읽기 쿼리 (서버 전용)
├── auth-actions.ts           # 인증 Server Actions
├── admin-actions.ts          # 관리자 Server Actions
├── candidate-image-actions.ts
├── types.ts                  # 레거시 타입 → types/domain.ts로 이관 예정
├── schemas/                  # Zod 검증 스키마 (서버/클라이언트 공유)
│   ├── candidate.ts
│   ├── match.ts
│   └── admin.ts
├── cn.ts                     # className 병합 유틸
├── match-flow-columns.ts     # 칸반 컬럼 설정
├── status-ui.ts              # 상태별 Tailwind 클래스 (단일 진실 공급원)
├── role-utils.ts             # 역할 유틸리티
├── permissions.ts            # 권한 체크
├── mock-data.ts              # 목 데이터 (폴백용)
├── supabase/
│   ├── server.ts             # 서버 클라이언트
│   └── client.ts             # 클라이언트
└── env.ts                    # 환경변수
```

## 타입 관리

타입 출처가 세 곳이다. 역할을 혼동하지 않는다:

| 위치 | 내용 | 용도 | 상태 |
|------|------|------|------|
| `types/domain.ts` | 앱 도메인 타입 (camelCase) | 컴포넌트 props, 비즈니스 로직 | **정본** |
| `types/supabase.ts` | Supabase CLI 생성 타입 | DB row 타입, `mapXxx()` 함수 인자 | 자동 생성 |
| `lib/types.ts` | 구 타입 (snake_case) | — | **레거시 → `types/domain.ts`로 이관** |

```typescript
// lib/data.ts
import type { Tables } from "@/types/supabase";    // DB row 타입
import type { Candidate } from "@/types/domain";    // 앱 도메인 타입 (정본)

function mapCandidate(row: Tables<"cupid_candidates">): Candidate { ... }
```

## `"use client"` 최소화 원칙

클라이언트 컴포넌트는 **트리의 말단**에 둔다. 상위 컴포넌트가 `"use client"`가 되면 그 하위 전체가 클라이언트 번들에 포함된다.

```tsx
// 잘못된 예: 상위 레이아웃이 "use client"
"use client";
export function CandidateLayout({ children }) {
  const [open, setOpen] = useState(false);
  return <div>{children}</div>; // children까지 모두 클라이언트 번들
}

// 올바른 예: 인터랙션 부분만 분리
// candidate-layout.tsx (서버)
export function CandidateLayout({ children }) {
  return <div>{children}<OpenButton /></div>;
}

// open-button.tsx (클라이언트)
"use client";
export function OpenButton() {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(true)}>열기</button>;
}
```

## 규칙

1. **Server Component 기본** — `"use client"`는 이벤트 핸들러/훅 필요 시에만
2. **`"use client"` 트리 말단 배치** — 상위 컴포넌트가 클라이언트가 되지 않도록
3. **데이터 패칭은 app/ 레이어** — components/는 props로 받기만
4. **뮤테이션은 Server Actions** — `lib/*-actions.ts`에 정의
5. **도메인 타입은 `types/domain.ts`** — 컴포넌트 내 로컬 타입 재정의 금지
6. **features/ 폴더 없음** — app/components/lib 3계층 구조 사용
