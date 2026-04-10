# Project Cupid — CLAUDE.md

프라이빗 매칭 워크스페이스. 소개팅 주선자가 후보를 관리하고, 매칭 흐름을 기록하며, 과거 이력을 추적하는 내부 운영 도구.

## 기술 스택

| 항목       | 내용                                      |
| ---------- | ----------------------------------------- |
| 프레임워크 | Next.js 15 (App Router)                   |
| 언어       | TypeScript                                |
| DB / Auth  | Supabase (`@supabase/ssr`)                |
| 스타일     | Tailwind CSS v4 (`@import "tailwindcss"`) |
| 배포       | Vercel (예정)                             |

외부 상태 관리 라이브러리 없음. TanStack Query, Zustand, Redux 없음.

## 디렉토리 구조

```
app/           # Next.js App Router 페이지
components/    # UI 컴포넌트
lib/           # 데이터 함수, Server Actions, 유틸
types/         # 도메인 타입 (types/domain.ts)
supabase/      # 스키마, 마이그레이션
```

## 핵심 도메인

- **Candidate** — 소개 후보자. 상태: `active → matched → coupled → graduated`
- **MatchRecord** — 매칭 이력. 결과: `intro_sent → first_meeting → dating → couple / closed`
- **Membership** — 운영자 계정. 역할: `super_admin / admin / viewer`

## DB 규칙

- 모든 테이블 prefix: `cupid_` (예: `cupid_candidates`, `cupid_match_records`)
- Supabase Storage 버킷: `sogaeting`
- 이미지는 Storage path로 저장 → 조회 시 signed URL 변환 (현재 TTL: 24시간)
- 리스트/보드/모달에서는 원본 대신 transform이 적용된 썸네일 URL을 우선 사용

## 데이터 패칭 패턴

- **읽기**: `lib/data.ts`의 서버 전용 함수 → Server Component에서 호출
- **쓰기**: `lib/*-actions.ts`의 Server Actions (`"use server"`)
- **Supabase 연결 실패 시**: `lib/mock-data.ts`의 목 데이터로 폴백 (앱이 죽지 않음)

## 인증/인가

- **인증(Authentication)**: `middleware.ts`에서 세션 리프레시 + 미인증 사용자 리다이렉트
- **인가(Authorization)**: `lib/permissions.ts`의 `getCurrentMembership()`, `requireApprovedMembership()`, `requireMembershipRole()` — 페이지/레이아웃에서 호출
- `cache()` (React)로 동일 요청 내 중복 호출 방지

## 타입 시스템

타입 파일이 세 곳이다:

| 파일                | 용도                            | 상태                     |
| ------------------- | ------------------------------- | ------------------------ |
| `types/domain.ts`   | 앱 도메인 타입 (camelCase 필드) | **정본**                 |
| `types/supabase.ts` | Supabase CLI 생성 DB row 타입   | 자동 생성                |
| `lib/types.ts`      | 구 타입 (snake_case 필드)       | **레거시 → 점진적 이관** |

새 코드는 `types/domain.ts`를 사용한다. `lib/types.ts`는 레거시이며 `types/domain.ts`로 이관 예정.

## 개발 명령어

```bash
npm run dev        # 개발 서버
npm run build      # 빌드
npm run typecheck  # 타입 체크 (tsc --noEmit)
npm run lint       # ESLint
```

## 주의사항

- `params`는 Next.js 15에서 `Promise<{ id: string }>` — 반드시 `await params`
- Tailwind v4는 `@import "tailwindcss"` 문법 사용 (v3와 다름)
- `"use client"` 는 트리 말단 컴포넌트에만 — 상위 컴포넌트가 클라이언트가 되면 하위 전체가 번들에 포함됨
- 동적 Tailwind 클래스 조합 금지 (`bg-${color}-500` 형태 — 빌드 시 purge됨)

## Rules 위치

`.claude/rules/` 에 상세 규칙 있음:

- `api-patterns.md` — Supabase 쿼리 & Server Actions
- `common-conventions.md` — TypeScript, 네이밍
- `feature-architecture.md` — 디렉토리 구조, 의존성 방향
- `form-patterns.md` — React Hook Form, Zod, Server Actions
- `page-patterns.md` — App Router 페이지 패턴
- `ui-components.md` — 컴포넌트 작성, 색상 시스템
