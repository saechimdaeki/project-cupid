# Project Cupid — 색상 시스템

> 마지막 업데이트: 2026-04-04
> 출처: `app/globals.css` `:root` 변수

---

## 1. shadcn/ui 시맨틱 토큰 (컴포넌트용)

일반 UI 컴포넌트에서 사용하는 색상. Warm beige/rose 톤 기반.

| 토큰                     | 값         | 용도                      | Tailwind 클래스              |
| ------------------------ | ---------- | ------------------------- | ---------------------------- |
| `--background`           | `#fdf7f3`  | 페이지 배경 (크림)        | `bg-background`              |
| `--foreground`           | `#2a1b21`  | 기본 텍스트 (다크 브라운) | `text-foreground`            |
| `--card`                 | `#ffffff`  | 카드 배경                 | `bg-card`                    |
| `--card-foreground`      | `#2a1b21`  | 카드 텍스트               | `text-card-foreground`       |
| `--popover`              | `#ffffff`  | 팝오버 배경               | `bg-popover`                 |
| `--popover-foreground`   | `#2a1b21`  | 팝오버 텍스트             | `text-popover-foreground`    |
| `--primary`              | `#f43f5e`  | 주요 액션 (로즈 핑크)     | `bg-primary`, `text-primary` |
| `--primary-foreground`   | `#ffffff`  | 주요 액션 위 텍스트       | `text-primary-foreground`    |
| `--secondary`            | `#f8efea`  | 보조 배경 (따뜻한 베이지) | `bg-secondary`               |
| `--secondary-foreground` | `#5c3d45`  | 보조 텍스트 (와인 브라운) | `text-secondary-foreground`  |
| `--muted`                | `#f3ebe6`  | 비활성/배경 (연한 베이지) | `bg-muted`                   |
| `--muted-foreground`     | `#8a7a80`  | 비활성 텍스트 (회갈색)    | `text-muted-foreground`      |
| `--accent`               | `#c7a56a`  | 강조 (골드)               | `bg-accent`                  |
| `--accent-foreground`    | `#2a1b21`  | 강조 위 텍스트            | `text-accent-foreground`     |
| `--destructive`          | `#ef4444`  | 위험/삭제 (레드)          | `bg-destructive`             |
| `--border`               | `#e8d8cf`  | 테두리 (따뜻한 회색)      | `border-border`              |
| `--input`                | `#e8d8cf`  | 인풋 테두리               | `border-input`               |
| `--ring`                 | `#f43f5e`  | 포커스 링                 | `ring-ring`                  |
| `--radius`               | `0.625rem` | 기본 border-radius        | —                            |

## 2. Shell 토큰 (앱 프레임/네비게이션용)

대시보드 셸, 네비게이션 등 앱 프레임 컴포넌트 전용. 다크 톤.

### 배경

| 토큰                  | 값        | 용도                     |
| --------------------- | --------- | ------------------------ |
| `--shell-bg`          | `#0d1117` | 셸 기본 배경 (딥 네이비) |
| `--shell-bg-elevated` | `#121926` | 상위 레이어 배경         |

### 패널

| 토큰                   | 값                          | 용도                 |
| ---------------------- | --------------------------- | -------------------- |
| `--shell-panel`        | `rgba(18, 25, 38, 0.72)`    | 반투명 패널          |
| `--shell-panel-strong` | `rgba(15, 20, 30, 0.92)`    | 불투명에 가까운 패널 |
| `--shell-panel-soft`   | `rgba(255, 255, 255, 0.04)` | 미세 하이라이트      |

### 라인

| 토큰                  | 값                          | 용도        |
| --------------------- | --------------------------- | ----------- |
| `--shell-line`        | `rgba(255, 255, 255, 0.08)` | 기본 구분선 |
| `--shell-line-strong` | `rgba(255, 255, 255, 0.16)` | 강조 구분선 |

### 텍스트

| 토큰            | 값        | 용도                      |
| --------------- | --------- | ------------------------- |
| `--shell-text`  | `#f5f1eb` | 기본 텍스트 (크림 화이트) |
| `--shell-muted` | `#99a3b5` | 보조 텍스트 (블루 그레이) |

### 액센트

| 토큰                  | 값        | 용도                   |
| --------------------- | --------- | ---------------------- |
| `--shell-gold`        | `#c7a56a` | 골드 액센트            |
| `--shell-gold-strong` | `#f3d6a0` | 강한 골드 (하이라이트) |
| `--shell-rose`        | `#a66a5b` | 로즈 액센트            |
| `--shell-green`       | `#6dd3ad` | 성공/긍정              |
| `--shell-amber`       | `#f0b96e` | 경고/주의              |

### 그림자

| 토큰             | 값                                |
| ---------------- | --------------------------------- |
| `--shell-shadow` | `0 24px 80px rgba(0, 0, 0, 0.32)` |

## 3. Sidebar 토큰

| 토큰                           | 값        | Tailwind 클래스                   |
| ------------------------------ | --------- | --------------------------------- |
| `--sidebar`                    | `#f8efea` | `bg-sidebar`                      |
| `--sidebar-foreground`         | `#2a1b21` | `text-sidebar-foreground`         |
| `--sidebar-primary`            | `#f43f5e` | `bg-sidebar-primary`              |
| `--sidebar-primary-foreground` | `#ffffff` | `text-sidebar-primary-foreground` |
| `--sidebar-accent`             | `#f3ebe6` | `bg-sidebar-accent`               |
| `--sidebar-accent-foreground`  | `#5c3d45` | `text-sidebar-accent-foreground`  |
| `--sidebar-border`             | `#e8d8cf` | `border-sidebar-border`           |
| `--sidebar-ring`               | `#f43f5e` | `ring-sidebar-ring`               |

## 4. Chart 토큰

| 토큰        | 값        | 색상      |
| ----------- | --------- | --------- |
| `--chart-1` | `#f43f5e` | 로즈 핑크 |
| `--chart-2` | `#c7a56a` | 골드      |
| `--chart-3` | `#6dd3ad` | 민트 그린 |
| `--chart-4` | `#a66a5b` | 딥 로즈   |
| `--chart-5` | `#f0b96e` | 앰버      |

## 5. 컬러 팔레트 요약

```
브랜드 코어
├── 로즈 핑크      #f43f5e  (primary, ring, sidebar-primary)
├── 골드           #c7a56a  (accent, shell-gold)
└── 와인 브라운     #5c3d45  (secondary-foreground)

배경 계열 (라이트)
├── 크림           #fdf7f3  (background)
├── 따뜻한 베이지   #f8efea  (secondary, sidebar)
├── 연한 베이지     #f3ebe6  (muted, sidebar-accent)
└── 화이트         #ffffff  (card, popover)

텍스트 계열
├── 다크 브라운     #2a1b21  (foreground, card-foreground)
├── 회갈색         #8a7a80  (muted-foreground)
└── 와인 브라운     #5c3d45  (secondary-foreground)

보더/인풋
└── 따뜻한 회색     #e8d8cf  (border, input, sidebar-border)

셸 (다크)
├── 딥 네이비      #0d1117  (shell-bg)
├── 크림 화이트     #f5f1eb  (shell-text)
└── 블루 그레이     #99a3b5  (shell-muted)

상태 색상
├── 민트 그린      #6dd3ad  (shell-green, 성공)
├── 앰버           #f0b96e  (shell-amber, 경고)
└── 레드           #ef4444  (destructive, 위험)
```

## 6. 사용 규칙

| 레이어        | 사용할 토큰                                                   | 예시                        |
| ------------- | ------------------------------------------------------------- | --------------------------- |
| 일반 컴포넌트 | shadcn 시맨틱 (`text-foreground`, `bg-card`, `border-border`) | Button, Card, Input 등      |
| 앱 프레임     | Shell 변수 (`var(--shell-bg)`, `var(--shell-panel)`)          | 네비게이션, 대시보드 셸     |
| 상태 뱃지     | Tailwind 팔레트 (`rose-50`, `blue-100` 등)                    | `lib/status-ui.ts`에서 관리 |

> hex 하드코딩 금지. 반드시 CSS 변수 또는 Tailwind 시맨틱 클래스를 사용할 것.

## 7. 변경 이력

### 2026-04-04 — shadcn/ui 마이그레이션

shadcn/ui 도입하면서 CSS 변수 기반 색상 시스템으로 전환. primary(로즈 핑크)는 기존과 동일하게 유지.

| 역할                    | Before (직접 스타일링)       | After (CSS 변수)                            |
| ----------------------- | ---------------------------- | ------------------------------------------- |
| **primary** (버튼, CTA) | `bg-rose-500` (`#f43f5e`)    | `--primary: #f43f5e` (유지)                 |
| **background**          | `#ffffff` 순백               | `--background: #fdf7f3` 웜 크림             |
| **secondary**           | `bg-slate-100` 쿨 그레이     | `--secondary: #f8efea` 따뜻한 베이지        |
| **muted**               | `bg-slate-50` 쿨 그레이      | `--muted: #f3ebe6` 연한 베이지              |
| **border / input**      | `border-slate-200` 쿨 그레이 | `--border: #e8d8cf` 따뜻한 회색             |
| **텍스트**              | `text-slate-800/500`         | `--foreground/--muted-foreground` 웜 브라운 |

**변경 요약:**

- 하드코딩 Tailwind 클래스 → CSS 변수 기반 시맨틱 토큰으로 전환
- 배경/보더/텍스트가 쿨 그레이(slate)에서 웜 베이지/브라운 톤으로 변경
- primary(로즈 핑크 `#f43f5e`)는 기존과 동일 유지
