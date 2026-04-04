## 권한별 Route Group 분리 기획

### 배경 및 목적

현재 모든 페이지가 `app/` 플랫 구조에 있어 코드를 열어봐야 어떤 권한 수준인지 알 수 있다.
Route Group으로 폴더를 나누면 구조만 보고 권한 수준을 파악할 수 있다.

**이번 작업은 폴더 이동만 수행한다. 로직 변경 없음.**

### 범위 결정

**포함**: Route Group 폴더 생성 + 기존 페이지 파일 이동
**제외**: layout.tsx 권한 중앙화, 페이지 내 권한 체크 코드 제거, UI 변경 (모두 추후 작업)

### 도메인 영향 분석

- DB 변경 없음
- 로직 변경 없음
- URL 변경 없음 (Route Group은 URL에 영향 없음)

### 구현 범위 — 폴더 이동

**현재 → 이후**:

```
app/
├── layout.tsx                          # 유지
├── globals.css                         # 유지
│
├── (public)/                           # 인증 불필요
│   ├── page.tsx                        # /
│   ├── login/page.tsx                  # /login
│   ├── auth/continue/page.tsx          # /auth/continue
│   └── pending/page.tsx                # /pending
│
├── (member)/                           # 승인된 멤버 (viewer 이상)
│   ├── dashboard/page.tsx              # /dashboard
│   └── timeline/page.tsx               # /timeline
│
├── (admin)/                            # 관리자 (admin, super_admin)
│   ├── candidates/new/page.tsx         # /candidates/new
│   └── profiles/[id]/
│       ├── page.tsx                    # /profiles/:id
│       └── edit/page.tsx              # /profiles/:id/edit
│
└── (super-admin)/                      # 최고 관리자 (super_admin)
    └── admin/page.tsx                  # /admin
```
