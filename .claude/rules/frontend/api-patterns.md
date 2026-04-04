---
paths:
  - "frontend/src/lib/api/**/*.ts"
  - "frontend/src/service/**/*.ts"
  - "frontend/src/service/**/*.types.ts"
---

# API & Service Layer Patterns

## Service 디렉토리 구조

모든 서비스 모듈은 반드시 이 구조를 따른다:

```
frontend/src/service/
├── user/
│   ├── UserService.ts              # API 호출 (axios)
│   ├── user.options.ts             # Query factory (@lukemorales/query-key-factory)
│   ├── user.types.ts               # 요청/응답 TypeScript 타입
│   └── useUser.ts                  # React hooks (useQuery/useMutation)
```

## Query Factory 패턴

`@lukemorales/query-key-factory`로 쿼리 키 관리:

```typescript
// user.options.ts
import { createQueryKeys } from '@lukemorales/query-key-factory';
import UserService from './UserService';

const userQueryFactory = createQueryKeys('user', {
  list: (params: UserListReqType) => ({
    queryKey: [params],
    queryFn: () => UserService.fetchList(params),
  }),
  detail: (id: number) => ({
    queryKey: [id],
    queryFn: () => UserService.fetchDetail(id),
  }),
});

export default userQueryFactory;
```

## React Hook 패턴

TanStack Query를 감싸는 커스텀 훅. **GET 요청은 `useSuspenseQuery`를 기본 사용**한다.

```typescript
// useUser.ts
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userQueryFactory from './user.options';
import UserService from './UserService';
import type { UserListReqType, CreateUserReqType } from './user.types';

const useUser = {
  // GET → useSuspenseQuery (기본)
  useFetchList: (params: UserListReqType) => {
    return useSuspenseQuery({
      ...userQueryFactory.list(params),
    });
  },

  useFetchDetail: (id: number) => {
    return useSuspenseQuery({
      ...userQueryFactory.detail(id),
    });
  },

  // POST/PUT/DELETE → useMutation + invalidate
  useCreate: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: CreateUserReqType) =>
        UserService.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: userQueryFactory.list._def,
        });
      },
    });
  },

  useUpdate: (id: number) => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: UpdateUserReqType) =>
        UserService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: userQueryFactory.list._def,
        });
        queryClient.invalidateQueries({
          queryKey: userQueryFactory.detail(id).queryKey,
        });
      },
    });
  },

  useDelete: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => UserService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: userQueryFactory.list._def,
        });
      },
    });
  },
};

export default useUser;
```

## API Service 구현

```typescript
// UserService.ts
import axios from '@/lib/api/client';
import type { UserListReqType, UserDetailResType } from './user.types';

const UserService = {
  fetchList: async (params: UserListReqType) => {
    const { data } = await axios.get('/api/users', { params });
    return data;
  },

  fetchDetail: async (id: number): Promise<UserDetailResType> => {
    const { data } = await axios.get(`/api/users/${id}`);
    return data;
  },

  create: async (payload: CreateUserReqType) => {
    const { data } = await axios.post('/api/users', payload);
    return data;
  },

  update: async (id: number, payload: UpdateUserReqType) => {
    const { data } = await axios.put(`/api/users/${id}`, payload);
    return data;
  },

  delete: async (id: number) => {
    const { data } = await axios.delete(`/api/users/${id}`);
    return data;
  },
};

export default UserService;
```

## 타입 정의

```typescript
// user.types.ts

// 요청 타입
export interface UserListReqType {
  page?: number;
  size?: number;
  search?: string;
}

export interface CreateUserReqType {
  name: string;
  email: string;
}

export interface UpdateUserReqType extends CreateUserReqType {
  id: number;
}

// 응답 타입
export interface UserListResType {
  items: UserType[];
  total: number;
  page: number;
}

export interface UserType {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export type UserDetailResType = UserType;
```

## 컴포넌트에서 사용

`useSuspenseQuery`를 쓰면 컴포넌트는 로딩/에러 분기 없이 **데이터만 다룬다**. 로딩/에러 UI는 부모의 `Suspense`/`ErrorBoundary`가 처리.

```tsx
'use client';
import useUser from '@/service/user/useUser';

// 데이터 컴포넌트 — isLoading/isError 체크 없음
export function UserList() {
  const { data } = useUser.useFetchList({ page: 1 });
  const { mutate: create, isPending } = useUser.useCreate();

  return (
    <div>
      {data.items.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

```tsx
// 부모 컴포넌트 — Suspense + ErrorBoundary로 감싸기
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserPage() {
  return (
    <ErrorBoundary FallbackComponent={SectionErrorFallback}>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <UserList />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### `useQuery` 예외 사용

조건부 활성화(`enabled`)가 필요하거나 suspense 없이 처리해야 할 특수한 경우만 `useQuery` 사용 가능. 이 경우 **반드시 `isLoading`과 `isError`를 함께 처리**한다.

```tsx
// 예외: 조건부 쿼리 (id가 있을 때만 실행)
const { data, isLoading, isError } = useQuery({
  ...detailQueryFactory(id),
  enabled: !!id,
});

if (isLoading) return <Skeleton className="h-20 w-full" />;
if (isError) return <p className="text-sm text-destructive">불러오지 못했습니다.</p>;
```

## 규칙

1. 쿼리 키는 **반드시** query factory 패턴 사용, 문자열 하드코딩 금지
2. GET 요청은 **반드시 `useSuspenseQuery`** 사용 (기본). 변경 요청은 **반드시** `useMutation`
3. `useSuspenseQuery`를 쓰는 컴포넌트는 **반드시 부모에서 `Suspense` + `ErrorBoundary`로 감싼다**
4. mutation 성공 후 **반드시** 관련 쿼리 invalidate
5. 요청/응답 타입은 **반드시** `*.types.ts`에 정의
6. `any` 타입 사용 금지
7. axios 인스턴스는 `@/lib/api/client`에서 가져오기 (직접 import 금지)
8. **API 응답 피드백 필수**: mutation(POST/PUT/DELETE) 호출 후 **반드시** 성공/실패 toast 또는 다이얼로그를 표시한다. "조용한 호출"은 금지. `sonner`의 `toast.success()` / `toast.error()` 사용.
9. `useSuspenseQuery`가 불가능한 경우(조건부 쿼리 등)에만 `useQuery` 사용 — 이 경우 반드시 `isLoading`과 `isError`를 함께 처리한다.
