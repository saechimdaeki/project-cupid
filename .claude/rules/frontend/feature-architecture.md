---
paths:
  - "frontend/src/features/**/*"
  - "frontend/src/app/**/*.tsx"
---

# Feature 아키텍처

## 레이어 구조

```
app/          <- 페이지 엔트리 (라우팅 + 레이아웃만, 로직 금지)
features/     <- 비즈니스 기능 단위 (폼, 플로우, 복합 UI)
components/   <- 공용 UI 컴포넌트
lib/          <- 공용 유틸리티
```

### 의존성 방향 (단방향)

```
app -> features -> components/ui, lib
```

- `app/`은 `features/`를 import할 수 있지만, 반대는 불가
- `features/` 간 직접 import 금지 — 필요하면 상위에서 조합

## Feature 디렉토리 구조

### 간단한 Feature (대부분의 기능)

API 호출, 상태 관리, 다단계 플로우 등 **로직이 있는 모든 기능**에 사용한다.

```
frontend/src/features/
├── {area}/                          # 영역별 그룹핑
│   └── registration/                # 기능 단위
│       ├── _components/             # feature 전용 UI 컴포넌트
│       │   ├── registration-flow.tsx
│       │   ├── step-indicator.tsx
│       │   └── terms-step.tsx
│       ├── _hooks/                  # feature 전용 커스텀 훅
│       │   └── use-registration-flow.ts
│       └── index.ts                 # Public API
└── common/                          # 공통 기능 (영역 무관)
```

### 복합 Feature (폼 스키마 합성)

복합 폼, 다중 섹션 스키마 합성 등 **Zod 스키마가 필요한 기능**에 사용한다.

```
features/{area}/product-create/
├── components/                      # feature 전용 UI 컴포넌트
│   ├── basic-info-section.tsx
│   └── pricing-section.tsx
├── schemas/                         # Zod 스키마 + 타입 + 기본값
│   ├── basic-info.schema.ts
│   └── pricing.schema.ts
├── view/                            # 조합 레이어 (스키마 + 컴포넌트 합성)
│   └── product-create.tsx
├── hooks/                           # feature 전용 커스텀 훅
├── types/                           # feature 전용 타입 (스키마 외)
├── lib/                             # feature 전용 유틸리티
└── index.ts                         # Public API
```

### 디렉토리 가이드

| 디렉토리 | 역할 | 필요 조건 |
|----------|------|----------|
| `index.ts` | 외부 공개 API | **항상 필요** |
| `_components/` | feature 전용 UI | **항상 필요** |
| `_hooks/` | 커스텀 훅 | 필요시 |
| `view/` | 스키마 + 컴포넌트 조합 | 복합 폼에서만 |
| `schemas/` | Zod 스키마 + 타입 + 기본값 | 복합 폼에서만 |
| `types/` | 스키마 외 타입 | 필요시 |
| `lib/` | 유틸리티 | 필요시 |

> 간단한 Feature는 `_components/` + `_hooks/` + `index.ts`만으로 충분하다.

## Schema 파일 패턴

각 스키마 파일은 **Zod 스키마 + 추론 타입 + 기본값**을 함께 export한다.

```ts
// schemas/basic-info.schema.ts
import { z } from "zod";

export const basicInfoSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  description: z.string(),
});

export type BasicInfoValues = z.infer<typeof basicInfoSchema>;

export const basicInfoDefaults: BasicInfoValues = {
  name: "",
  description: "",
};
```

## View 조합 패턴

`view/`에서 스키마와 컴포넌트를 합성하여 완성된 기능을 만든다.

```tsx
// view/product-create.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";

import { basicInfoSchema, basicInfoDefaults } from "../schemas/basic-info.schema";
import { pricingSchema, pricingDefaults } from "../schemas/pricing.schema";
import { BasicInfoSection } from "../components/basic-info-section";
import { PricingSection } from "../components/pricing-section";

// 스키마 합성 — z.merge() 대신 spread 사용
const formSchema = z.object({
  ...basicInfoSchema.shape,
  ...pricingSchema.shape,
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  ...basicInfoDefaults,
  ...pricingDefaults,
};

export function ProductCreate() {
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <BasicInfoSection />
        <PricingSection />
      </form>
    </Form>
  );
}
```

## Section 컴포넌트 패턴

각 섹션은 **자기 스키마 타입**으로 `useFormContext`를 사용한다 (전체 폼 타입 import 불필요).

```tsx
// components/basic-info-section.tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { BasicInfoValues } from "../schemas/basic-info.schema";

export function BasicInfoSection() {
  const { control } = useFormContext<BasicInfoValues>();
  // control로 필드 렌더링...
}
```

## index.ts 패턴

외부에 노출할 것만 re-export한다.

```ts
// index.ts
export { ProductCreate } from "./view/product-create";
```

## 페이지에서의 사용

```tsx
// app/.../product/create/page.tsx
import { PageHeader } from "@/components/common/page-header";
import { ProductCreate } from "@/features/product-create";

export default function ProductCreatePage() {
  return (
    <div className="p-4 sm:p-8 space-y-10">
      <PageHeader title="상품 등록" description="새로운 상품을 등록합니다." />
      <ProductCreate />
    </div>
  );
}
```

## 규칙

1. **영역별 그룹핑** — `features/{area}/` 하위에 기능 단위 폴더
2. **index.ts가 Public API** — 외부에서는 `index.ts`를 통해서만 import
3. **view가 조합 레이어** — 스키마/컴포넌트/훅을 합성하는 유일한 장소
4. **스키마 합성은 spread** — `z.object({ ...a.shape, ...b.shape })` 사용, `z.merge()` 금지
5. **Section은 자기 타입만** — `useFormContext<SectionType>()`, 전체 폼 타입 참조 금지
6. **feature 간 직접 import 금지** — 공유가 필요하면 상위 레이어로 추출
7. **파일명 kebab-case** — `basic-info-section.tsx`, `pricing.schema.ts`
8. **로직이 있으면 무조건 Feature** — API 호출, 상태 관리 등 로직이 있으면 `features/`에 배치
