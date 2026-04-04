# Project Cupid — Typography System

> Pretendard Variable (--font-body)
> 마지막 업데이트: 2026-04-05

---

## 1. 헤딩 스케일

`globals.css`에서 `h1`~`h4` 태그에 직접 오버라이딩. 별도 클래스 불필요.

| 태그 | 크기 | 행간 | 자간 | 굵기 |
|------|------|------|------|------|
| `h1` | `clamp(2.4rem, 8vw, 4.2rem)` | 0.92 | -0.06em | 600 |
| `h2` | `clamp(1.6rem, 5vw, 2.4rem)` | 1.1 | -0.04em | 600 |
| `h3` | `1.25rem` (20px) | 1.3 | -0.03em | 600 |
| `h4` | `1rem` (16px) | 1.4 | -0.02em | 600 |

- `h1`, `h2`는 `clamp()`로 자동 반응형
- `h3`, `h4`는 고정 크기 (모바일에서도 충분)
- 모든 헤딩에 `font-family: var(--headline)` 적용됨

```tsx
// 그냥 태그만 쓰면 됨
<h1 className="text-foreground">매칭 대시보드</h1>
<h2 className="text-foreground">소개 이력</h2>
```

---

## 2. 본문 스케일

본문은 Tailwind 유틸리티 조합으로 사용.

| 용도 | 크기 | 행간 | Tailwind 클래스 |
|------|------|------|-----------------|
| 긴 설명 | 15px | 1.75 | `text-[15px] leading-7` |
| 일반 본문 | 14px | 1.7 | `text-sm leading-6` |
| 보조/힌트 | 13px | 1.6 | `text-[13px] leading-5` |
| 타임스탬프/메타 | 12px | 1.5 | `text-xs` |
| 라벨/뱃지 | 11px | 1.4 | `text-[11px] font-semibold tracking-[0.2em] uppercase` |

> 최소 폰트 사이즈: **12px** (`text-xs` 이상). 라벨(11px)은 uppercase + 넓은 자간으로 가독성 보완.

---

## 3. 적용 규칙

### 헤딩 — 태그 자체에 스타일 내장

```tsx
// 올바른 예: 태그만 쓰면 크기/행간/자간 자동 적용
<h1>페이지 타이틀</h1>
<h2>섹션 제목</h2>

// Tailwind로 크기 덮어쓰기도 가능 (예외적 상황)
<h2 className="text-2xl">고정 크기 제목</h2>
```

### 본문 — Tailwind 유틸리티

```tsx
<p className="text-sm leading-6 text-muted-foreground">일반 본문</p>
<p className="text-[15px] leading-7 text-foreground">긴 설명</p>
<span className="text-xs text-muted-foreground">2026-04-05</span>
<span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">LABEL</span>
```

### 수치/통계 — 인라인 허용

```tsx
<span className="text-3xl font-semibold tracking-[-0.04em] text-foreground">128</span>
```

---

## 4. font-weight 규칙

| 굵기 | Tailwind | 용도 |
|------|----------|------|
| 400 | `font-normal` | 본문, 설명, 힌트 |
| 500 | `font-medium` | 버튼, 캡션, 인풋 라벨 |
| 600 | `font-semibold` | 헤딩(h1~h4), 라벨, 카드 이름, 수치 |
| 700 | `font-bold` | 사용하지 않음 (Pretendard에서 600과 차이 미미) |

> `font-bold` 금지. 강조가 필요하면 `font-semibold`를 사용.

---

## 5. 텍스트 색상 조합

| 요소 | 색상 클래스 |
|------|------------|
| 헤딩 (h1~h4) | `text-foreground` |
| 일반 본문 | `text-foreground` 또는 `text-muted-foreground` |
| 보조 텍스트, 힌트 | `text-muted-foreground` |
| 라벨, 캡션 | `text-muted-foreground` |
| 비활성/placeholder | `text-muted-foreground` (opacity로 구분 시 `text-muted-foreground/60`) |
| 링크 | `text-primary` + `hover:text-primary/80` |
| 에러 메시지 | `text-destructive` |

```tsx
// 올바른 예
<h2 className="text-foreground">섹션 제목</h2>
<p className="text-sm leading-6 text-muted-foreground">보조 설명</p>
<a className="text-primary hover:text-primary/80">링크</a>

// 금지: 하드코딩 색상
<h2 className="text-slate-800">...</h2>
<p className="text-[#8a7a80]">...</p>
```

---

## 6. 말줄임 (Truncation)

| 방식 | Tailwind | 용도 |
|------|----------|------|
| 한 줄 말줄임 | `truncate` | 카드 제목, 테이블 셀 |
| 여러 줄 말줄임 | `line-clamp-2` / `line-clamp-3` | 카드 설명, 리스트 본문 |

```tsx
// 한 줄: 카드 제목
<h3 className="truncate">김준성 — 서울 강남구 소프트웨어 엔지니어</h3>

// 두 줄: 카드 설명
<p className="line-clamp-2 text-sm text-muted-foreground">
  긴 설명 텍스트...
</p>
```

> `overflow-hidden text-ellipsis whitespace-nowrap` 직접 조합 대신 `truncate` 사용.

---

## 7. 링크 텍스트

```tsx
// 인라인 링크: 밑줄 + hover 색상
<a className="text-primary underline underline-offset-4 hover:text-primary/80">
  자세히 보기
</a>

// 네비게이션/버튼형 링크: 밑줄 없음 (Button render prop 사용)
<Button variant="link" render={<Link href="/dashboard" />}>
  대시보드
</Button>
```

---

## 8. 금지 사항

### 12px 미만 사용 금지

- **최소 폰트 사이즈: 12px** (`text-xs` 이상)
- 유일한 예외: 라벨/뱃지(`text-[11px]`)는 `uppercase` + `tracking-[0.2em]`과 반드시 함께 사용
- `text-[10px]`, `text-[9px]` 등 절대 사용 금지 — 모바일 가독성 보장 불가

```tsx
// 금지: 12px 미만
<span className="text-[10px]">...</span>
<span className="text-[9px]">...</span>

// 허용: 11px는 uppercase + 넓은 자간과 함께만
<span className="text-[11px] font-semibold uppercase tracking-[0.2em]">LABEL</span>

// 올바른 예: 최소 12px
<span className="text-xs">2026-04-05</span>
```

### 기타 금지 항목

```tsx
// 금지: h1~h4에 크기/행간/자간 직접 지정 (태그에 이미 내장)
<h2 className="text-2xl font-semibold tracking-[-0.04em] leading-tight">

// 올바른 예: 색상만 지정
<h2 className="text-foreground">
```

```tsx
// 금지: heading 태그 없이 시각적 헤딩
<div className="text-2xl font-semibold">제목</div>

// 올바른 예: 시맨틱 태그
<h2>제목</h2>
```

```tsx
// 금지: 라벨에 제각각 tracking 값
<span className="text-[11px] tracking-[0.32em]">
<span className="text-[11px] tracking-[0.16em]">

// 올바른 예: 통일된 tracking
<span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
```
