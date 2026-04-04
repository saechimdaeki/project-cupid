---
paths:
  - "frontend/messages/**/*.json"
  - "frontend/src/i18n/**/*"
---

# 다국어(i18n) 메시지 규칙

## 메시지 파일 (`messages/*.json`)

### 키 네이밍 규칙

```
{area}.{feature}.{element}
{area}.{feature}.{sub}.{element}
```

**예시:**

```
common.button.save          -> "저장"
common.error.required       -> "필수 입력 항목입니다"
admin.user.list.title       -> "사용자 목록"
admin.nav.dashboard         -> "대시보드"
```

### 키 정렬 기준

1. **네비게이션** (`nav`) -> 가장 먼저
2. **feature 단위** 알파벳순
3. **각 feature 내부**: `title` -> `description` -> `empty` -> 나머지 알파벳순

### common 내부 순서

```json
{
  "common": {
    "button": {},
    "label": {},
    "status": {},
    "error": {},
    "confirm": {},
    "pagination": {}
  }
}
```

## t() 적용 시 원본 주석 표기

하드코딩 텍스트를 `t()` 호출로 교체할 때, **원본 텍스트를 주석으로 남겨야** 한다.
코드에서 원본 텍스트로 검색할 수 없게 되므로, 주석이 유일한 검색 수단이 된다.

```tsx
// 좋은 예: 원본 텍스트를 주석으로 표기
<Button>{t("common.button.save")}</Button>           {/* 저장 */}
<p>{t("admin.user.list.empty")}</p>                  {/* 등록된 사용자가 없습니다 */}

// 속성값에 적용할 때
<Input
  placeholder={t("common.button.search")} // 검색
/>
```

### 주석 생략 가능한 경우

- 키 이름만으로 의미가 명확한 짧은 단어: `t("common.button.save")` 등
- 단, **문장형** 텍스트는 **반드시 주석 필수**

## 다국어 파일 동기화

- 기준 언어 파일이 타입 소스 (키 추가/삭제는 기준 파일에서)
- 나머지 언어 파일은 동일한 키 구조 유지
- 번역이 안 된 키는 기준 언어 값을 임시로 넣고 별도 추적

## 키 추가 시 체크리스트

1. 기준 파일에 키 추가 (올바른 위치에 정렬)
2. 나머지 언어 파일에도 동일 키 추가
3. 키 경로가 기존 네이밍 패턴과 일치하는지 확인
4. 중복 키 없는지 확인 (같은 의미의 키가 이미 있는지)

## 금지 사항

- 최상위 키 순서 변경 금지
- 하드코딩 텍스트 금지 — 반드시 `t("key")` 사용
- 1개 언어 파일만 수정하고 나머지 누락 금지
- 문장형 텍스트를 `t()`로 교체할 때 원본 주석 누락 금지
