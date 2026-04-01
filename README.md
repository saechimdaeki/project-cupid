# project-cupid

소개팅 부탁하는 매물이 너무나도 많아졌다. 신뢰가는 중매쟁이들의 힘을 모아 커플을 만들자.

## What is included

- `Next.js(App Router)` 기반 웹 프론트
- `Supabase Auth + RLS` 기반 승인형 접근 제어 구조
- 슈퍼어드민 승인 대기 플로우
- 소개팅 매물 리스트 / 상세 / 매칭 이력 / 커플 및 졸업 상태 UI
- `Vercel` 배포 전제 구조

## Pages

- `/` 랜딩
- `/login` 아이디/비밀번호 로그인/회원가입
- `/pending` 승인 대기
- `/dashboard` 매물 보드
- `/profiles/[id]` 매물 상세
- `/admin` 슈퍼어드민 승인 관리

## Local setup

1. 의존성 설치

```bash
npm install
```

2. 환경변수 복사

```bash
cp .env.example .env.local
```

3. Supabase SQL 실행

- [`supabase/schema.sql`](/Users/junseongkim/Desktop/project-cupid/supabase/schema.sql)

4. 개발 서버 실행

```bash
npm run dev
```

## Important notes

- 첫 관리자 계정은 Supabase에서 직접 `cupid_memberships.status='approved'`, `role='super_admin'`로 지정해야 합니다.
- 실제 프로덕션에서는 후보자 개인정보 보호를 위해 Storage 정책, 감사 로그, 삭제 정책까지 같이 가져가는 걸 권장합니다.

## Docs

- [`docs/architecture.md`](/Users/junseongkim/Desktop/project-cupid/docs/architecture.md)
