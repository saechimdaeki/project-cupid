## shadcn/ui 도입 및 UI 통일 기획

### 배경 및 목적

현재 35개 컴포넌트가 모두 직접 구현되어 있고, 색상과 스타일이 중구난방이다:

- **색상 하드코딩**: `#725861`, `#e8d8cf`, `#b46d59` 같은 hex 값이 컴포넌트 곳곳에 산재
- **CSS 변수 vs Tailwind 혼재**: 셸은 CSS 변수(`--panel`, `--gold`), 컴포넌트는 Tailwind 팔레트, 일부는 인라인 hex — 3가지 체계가 공존
- **폼/버튼/모달 스타일 불일치**: `auth-forms.tsx`의 인풋 스타일, `form-submit-button.tsx`의 버튼, `match-detail-modal.tsx`의 모달이 각각 다른 패턴
- **`cn()` 유틸 미존재**: 규칙에는 `lib/cn.ts` 사용이 명시되어 있으나 실제 파일이 없음

shadcn/ui를 도입하면:
1. **Button, Input, Dialog, Badge, Card 등 기본 컴포넌트**를 일관된 디자인으로 통일
2. **CSS 변수 기반 테마 시스템**이 자동 구성되어 색상 관리가 체계화됨
3. 컴포넌트를 직접 소유하므로(node_modules가 아닌 소스 복사) **커스터마이징 자유도 유지**

### 사용 시나리오

운영자 관점에서 달라지는 것은 없다. 시각적 일관성이 향상되어 "같은 서비스 안에 있다"는 느낌을 준다.

개발자 관점:
1. 새 컴포넌트 추가 시 `npx shadcn@latest add <component>` → 바로 사용
2. 색상 변경 시 CSS 변수 한 곳만 수정 → 전체 반영
3. 기존 커스텀 컴포넌트를 shadcn 기반으로 점진적 교체

### 범위 결정

**포함** (이번에 하는 것):
- shadcn/ui 초기 설정 (tailwind v4 호환)
- CSS 변수 기반 색상 시스템 구축 (기존 warm beige 톤 유지)
- `lib/cn.ts` 생성 (clsx + tailwind-merge)
- 기본 컴포넌트 설치: Button, Input, Label, Dialog, Badge, Card, Select, Textarea
- 기존 `status-badge.tsx` → shadcn Badge 기반으로 교체
- 기존 `form-submit-button.tsx` → shadcn Button 기반으로 교체
- 기존 `auth-forms.tsx` 인풋 → shadcn Input 기반으로 교체
- 기존 `match-detail-modal.tsx` → shadcn Dialog 기반으로 교체
- 기존 `candidate-card.tsx` → shadcn Card 기반으로 교체

**제외** (이번에 하지 않는 것):
- 랜딩 페이지 컴포넌트 교체 (sakura, parallax 등 — 커스텀 애니메이션이라 shadcn과 무관)
- `app-shell.tsx`, `global-nav.tsx` 교체 (레이아웃 셸은 이미 CSS 변수 체계로 잘 동작)
- 다크모드 추가 (현재 라이트 모드 only — 별도 기획 필요)
- 전체 컴포넌트 일괄 교체 (점진적으로 진행)

### 엣지 케이스 & 예외 처리

- **Tailwind v4 호환성**: shadcn/ui는 기본적으로 Tailwind v3 기준. v4에서는 `@import "tailwindcss"` 문법이고, `tailwind.config.ts` 대신 CSS 기반 설정. shadcn init 시 v4 호환 옵션 사용 필요
- **기존 CSS 변수 충돌**: shadcn이 생성하는 `--background`, `--foreground` 등 변수와 기존 `--bg`, `--text` 변수가 공존해야 함. 기존 변수는 유지하되 점진적으로 shadcn 변수로 이관
- **기존 globals.css 보존**: 랜딩 페이지 애니메이션 등 커스텀 CSS가 많으므로, shadcn CSS 변수를 기존 파일에 추가하는 방식으로 진행
- **컴포넌트 의존성**: `candidate-card.tsx`를 바꾸면 이를 사용하는 `dashboard-flow-board.tsx` 등도 영향받음 → props 인터페이스는 유지

### 도메인 영향 분석

도메인 모델(Candidate, MatchRecord, Membership)에는 변경 없음. 순수 UI 레이어 작업.

- DB 변경: 없음
- 타입 변경: 없음
- Server Actions 변경: 없음
- 데이터 레이어 변경: 없음

### 구현 범위

**Phase 1: 기반 설정**
- [ ] `npx shadcn@latest init` 실행 (Tailwind v4 호환 설정)
- [ ] `lib/cn.ts` 생성 (clsx + tailwind-merge)
- [ ] CSS 변수 색상 시스템 구축 — 기존 warm beige 톤을 shadcn 변수 체계로 매핑
  - `--background`: `#fdf7f3` (현재 body 배경)
  - `--foreground`: `#2a1b21` (현재 body color)
  - `--primary`: rose 계열 (서비스 주요 액센트)
  - `--secondary`: amber/gold 계열
  - `--muted`, `--accent`, `--destructive` 등
- [ ] `components.json` 설정 (shadcn 컴포넌트 경로: `components/ui/`)

**Phase 2: 기본 컴포넌트 설치**
- [ ] `npx shadcn@latest add button input label badge card dialog select textarea`
- [ ] 설치된 컴포넌트의 색상을 프로젝트 톤에 맞게 조정

**Phase 3: 기존 컴포넌트 교체 (점진적)**
- [ ] `components/status-badge.tsx` → `components/ui/badge.tsx` 기반으로 리팩토링
- [ ] `components/form-submit-button.tsx` → `components/ui/button.tsx` 기반으로 리팩토링
- [ ] `components/auth-forms.tsx` → shadcn Input/Label 적용
- [ ] `components/match-detail-modal.tsx` → shadcn Dialog 적용
- [ ] `components/candidate-card.tsx` → shadcn Card 적용

**Phase 4: 하드코딩 색상 정리**
- [ ] 컴포넌트 내 하드코딩 hex 값을 CSS 변수 또는 Tailwind 클래스로 교체
- [ ] `globals.css`의 기존 `--bg`, `--panel` 등 변수를 shadcn 변수 체계와 정리/통합

### 색상 매핑 초안

현재 서비스의 따뜻한 베이지/로즈 톤을 살려서:

```
shadcn 변수            →  값 (기존 톤 기반)
--background           →  #fdf7f3 (warm cream)
--foreground           →  #2a1b21 (dark brown)
--card                 →  #ffffff
--card-foreground      →  #2a1b21
--primary              →  #b46d55 (warm rose — 현재 랜딩 액센트)
--primary-foreground   →  #fff8f5
--secondary            →  #f8efea (light beige)
--secondary-foreground →  #5c3d45
--muted                →  #f3ebe6
--muted-foreground     →  #99a3b5
--accent               →  #c7a56a (gold — 현재 --gold)
--accent-foreground    →  #2a1b21
--destructive          →  #ef4444
--border               →  #e8d8cf
--input                →  #e8d8cf
--ring                 →  #b46d55
```

### 결정 필요 사항

1. **컴포넌트 설치 경로**: `components/ui/` 에 shadcn 컴포넌트를 두면, 기존 `components/` 의 커스텀 컴포넌트와 자연스럽게 분리됨. 이 구조가 괜찮은지?

2. **색상 톤**: 위 색상 매핑 초안이 현재 서비스 분위기와 맞는지? 특별히 바꾸고 싶은 톤이 있는지?

3. **Phase 3 우선순위**: 어떤 컴포넌트부터 교체하고 싶은지? 아니면 위 순서대로 진행해도 되는지?

4. **기존 셸 CSS 변수(`--bg`, `--panel` 등)**: shadcn 변수와 병행 유지할지, 아예 shadcn 체계로 통합할지?
