## 랜딩 페이지 리디자인 기획

### 배경 및 목적

현재 랜딩 페이지는 운영 도구의 대시보드 진입점에 가깝다. 로그인 상태 분기, mock 데이터 프리뷰, 관리자 네비게이션 등이 뒤섞여 있어 "이 서비스가 뭔지" 전달이 약하다.

미인증 사용자가 처음 왔을 때 **서비스가 뭔지 이해하고 → 가입하고 싶게** 만드는 프로모션 페이지로 바꾼다.

### 사용 시나리오

1. 미인증 사용자가 `/` 접속
2. 서비스 소개를 읽고 가치를 이해
3. CTA 버튼("시작하기" 등)으로 `/login` 이동
4. (이미 로그인된 사용자는 `/dashboard`로 리다이렉트)

### 범위 결정

**포함**:
- 랜딩 페이지 UI 전면 교체 (프로모션/소개 페이지)
- 로그인 사용자 → `/dashboard` 리다이렉트 처리
- Server Component 전환 (클라이언트 인증 로직 제거)

**제외**:
- 로그인/회원가입 페이지 변경 (기존 유지)
- 별도 마케팅 페이지(/about, /pricing 등) 신설
- 애니메이션 효과 (사쿠라 비 등) — 심플하게 시작, 추후 추가 가능

### 페이지 구성 (섹션)

#### 1. Hero 섹션
- 서비스 한 줄 소개 (헤드라인 + 서브 카피)
- CTA 버튼: "시작하기" → `/login`

#### 2. 서비스 특징 섹션
- 3~4개 핵심 가치 카드
  - 예: "프라이빗 매칭", "체계적 이력 관리", "승인 기반 운영", "매칭 흐름 추적"

#### 3. 작동 방식 섹션
- 3단계 프로세스 설명
  - 예: "가입 신청 → 관리자 승인 → 매칭 시작"

#### 4. Footer CTA
- 마지막 가입 유도 문구 + CTA 버튼 반복

### 엣지 케이스 & 예외 처리

| 상황 | 처리 |
|------|------|
| 이미 로그인 + 승인된 사용자 | `/dashboard`로 redirect |
| 로그인 + 미승인 사용자 | `/pending`으로 redirect |
| Supabase 연결 불가 | 랜딩 페이지 그대로 표시 (서비스 소개는 DB 불필요) |

### 도메인 영향 분석

- DB 변경 없음
- 도메인 타입 변경 없음
- `lib/preview-scene.ts`의 `homePreviewCandidates` — 더 이상 랜딩에서 사용 안 함 (dashboard에서만 사용)

### 구현 범위

**UI 레이어**
- [ ] `app/(public)/page.tsx` — Server Component로 전환, 로그인 상태면 redirect
- [ ] `components/landing-hero.tsx` — Hero 섹션
- [ ] `components/landing-features.tsx` — 서비스 특징 카드
- [ ] `components/landing-how-it-works.tsx` — 작동 방식 섹션
- [ ] `components/landing-footer-cta.tsx` — 하단 CTA

**정리 대상 (랜딩에서 제거)**
- [ ] ~~`components/sakura-rain.tsx`~~ — 유지 (핵심 배경 요소)
- [ ] `components/splash-intro.tsx` — 사용처 확인 후 판단
- [ ] `components/home-account-shell.tsx` / `lazy-home-account-shell.tsx` — 랜딩에서 사용 제거

### 결정 완료

1. **톤앤매너** — 로즈/핑크 톤 유지
2. **카피 방향** — 간접적 표현. 핵심 메시지: "지인들을 프라이빗하게 등록하고 매칭하는 스튜디오"
3. **비주얼** — 기존 에셋만 활용 (mock 후보 사진, SakuraRain 배경 유지)
4. **SakuraRain** — 하트/꽃잎 떨어지는 배경은 핵심 요소, 반드시 유지
