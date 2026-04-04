# Project Cupid — UI Tokens

> 마지막 업데이트: 2026-04-05

---

## 1. Spacing (간격)

### 컴포넌트 내부 패딩

| 용도 | 값 | Tailwind |
|------|-----|----------|
| 소형 카드, 뱃지 | 8px / 12px | `p-2` / `p-3` |
| 일반 카드, 패널 | 16px | `p-4` |
| 대형 카드, 섹션 | 20px ~ 24px | `p-5` / `p-6` |
| 페이지 프레임 | 16px (모바일) → 24px (데스크톱) | `px-4 sm:px-6` |

### 요소 간 간격 (gap)

| 용도 | 값 | Tailwind |
|------|-----|----------|
| 인라인 요소 (아이콘+텍스트) | 4px ~ 6px | `gap-1` / `gap-1.5` |
| 폼 필드 사이 | 16px | `gap-4` |
| 카드 그리드 | 16px | `gap-4` |
| 섹션 사이 | 24px ~ 32px | `gap-6` / `gap-8` |
| 페이지 섹션 간 | 40px ~ 48px | `mt-10` / `mt-12` |

> 임의 값(`gap-[18px]`, `mt-[22px]`) 금지. Tailwind 4px 단위 스케일 사용.

---

## 2. Border Radius

| 용도 | 값 | Tailwind |
|------|-----|----------|
| 뱃지, 태그 | 999px (pill) | `rounded-full` |
| 버튼 (pill형) | 999px | `rounded-full` |
| 인풋 필드 | 12px | `rounded-xl` |
| 일반 카드, 패널 | 16px | `rounded-2xl` |
| 대형 카드, 모달 | 28px | `rounded-[28px]` |
| 아바타, 썸네일 | 12px | `rounded-xl` |

```tsx
// 올바른 예
<Card className="rounded-2xl">...</Card>
<Button className="rounded-full">확인</Button>
<Input className="rounded-xl" />

// 금지: 임의 radius
<div className="rounded-[14px]">  // 스케일에 없는 값
<div className="rounded-[22px]">  // 16px 또는 28px 사용
```

---

## 3. Shadow

| 용도 | Tailwind |
|------|----------|
| 호버 시 미세 부양 | `shadow-sm` |
| 일반 카드 | `shadow-md` |
| 모달, 드롭다운 | `shadow-lg` |
| 히어로 카드, 플로팅 버튼 | `shadow-xl` |
| 앱 셸 패널 | `var(--shell-shadow)` |

```tsx
// 올바른 예
<Card className="shadow-md">...</Card>
<Dialog className="shadow-lg">...</Dialog>

// 금지: 커스텀 box-shadow 인라인
<div style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
```

> 상태별 그림자 변화는 `hover:shadow-md` 등 Tailwind 유틸리티로.

---

## 4. Z-Index

| 레이어 | 값 | Tailwind | 용도 |
|--------|-----|----------|------|
| 기본 | auto | — | 일반 콘텐츠 |
| 스티키 헤더 | 10 | `z-10` | 고정 네비게이션 |
| 드롭다운, 팝오버 | 20 | `z-20` | Select, Popover |
| 사이드 패널 | 30 | `z-30` | Sheet, Drawer |
| 모달 배경 | 40 | `z-40` | Dialog 오버레이 |
| 모달 콘텐츠 | 50 | `z-50` | Dialog, 플로팅 UI |
| 토스트/알림 | 50 | `z-50` | Sonner toast |

```tsx
// 올바른 예
<div className="fixed inset-0 z-40 bg-black/30">  // 오버레이
<div className="relative z-50">  // 모달

// 금지: 임의 z-index
<div className="z-[999]">
<div style={{ zIndex: 100 }}>
```

---

## 5. Transition / Animation

| 용도 | Tailwind | 비고 |
|------|----------|------|
| 기본 인터랙션 (hover, focus) | `transition` | 150ms, ease 기본값 |
| 색상/배경 전환 | `transition-colors` | 부드러운 색상 변화만 |
| 전체 프로퍼티 | `transition-all` | transform 포함 시 |
| 버튼 press 효과 | `active:translate-y-px` | Button에 내장 |
| 호버 스케일 | `hover:scale-[1.03]` | 플로팅 버튼 등 |

```tsx
// 올바른 예
<button className="transition hover:bg-muted">...</button>
<div className="transition-all hover:scale-[1.03] hover:shadow-lg">...</div>

// 금지: 인라인 transition
<div style={{ transition: "all 0.3s ease" }}>
```

> duration 커스텀이 필요하면 `duration-200`, `duration-300` 사용. 임의 값 금지.

---

## 6. 아이콘

| 용도 | 크기 | Tailwind |
|------|------|----------|
| 인라인 (버튼 내부) | 16px | `size-4` (Button 내장) |
| 소형 독립 | 16px | `size-4` |
| 기본 독립 | 20px | `size-5` |
| 대형 (빈 상태 등) | 24px | `size-6` |
| 히어로/일러스트 | 32px+ | `size-8` 이상 |

```tsx
// Button 내부 아이콘: 자동 size-4
<Button><PlusIcon /> 추가</Button>

// 독립 아이콘
<CheckIcon className="size-5 text-primary" />

// 금지: w/h 별도 지정
<Icon className="w-4 h-4" />  // size-4 사용
<Icon className="w-[18px] h-[18px]" />  // 스케일에 없는 값
```

> `w-4 h-4` 대신 `size-4` 사용. 아이콘 색상은 `text-*`로 지정.
