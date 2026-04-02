
사람의 결을 읽고, 가장 좋은 타이밍에 인연을 잇기 위한 프라이빗 매칭 워크스페이스입니다.

`Project Cupid`는 소개를 “등록하고 끝내는” 도구가 아니라,  
누구를 먼저 소개할지, 어떤 흐름이 이어지고 있는지,  
어떤 인연이 조용히 무르익고 있는지를 함께 살피기 위한 내부 운영 보드입니다.

## 이 프로젝트는 무엇인가요?

- 승인된 운영자만 접근할 수 있는 소개팅 매칭 보드입니다.
- 후보 등록, 사진 관리, 상태 이동, 매칭 진행, 커플 성사 흐름을 한곳에서 다룹니다.
- 단순 리스트보다 `분위기`, `타이밍`, `흐름`을 같이 보는 데 초점을 둡니다.

## 이런 흐름으로 사용합니다

1. 후보를 등록합니다.
2. 조건과 인상을 함께 보며 소개 우선순위를 정합니다.
3. 매칭 진행중, 커플완성, 졸업/보관 상태로 흐름을 관리합니다.

<img width="1465" height="695" alt="image" src="https://github.com/user-attachments/assets/a2994ed0-4982-4834-aefe-c49db7c5d0ec" />

4. 타임라인에 기록을 남기며 다음 판단의 감각을 쌓아갑니다.


<img width="1495" height="752" alt="image" src="https://github.com/user-attachments/assets/45f890d1-2e86-4e00-b73b-c5825a5fa769" />


## 주요 화면

- `/` 메인 랜딩
- `/login` 로그인 / 회원가입
- `/pending` 승인 대기 안내
- `/dashboard` 운영 대시보드
- `/profiles/[id]` 후보 상세
- `/profiles/[id]/edit` 후보 수정
- `/candidates/new` 새 후보 등록
- `/admin` 승인 / 권한 관리
- `/timeline` 전체 매칭 타임라인

## 승인 안내

이 서비스는 승인된 계정만 사용할 수 있습니다.

회원가입 후 승인은  
`saechimdaeki`에게 카톡이나 개인 연락으로 요청하시면 됩니다.

## 현재 상태

- 내부용 프라이빗 MVP
- 실제 운영 흐름을 정리하기 위한 보드
- 공개 서비스라기보다, 승인된 사용자만 사용하는 워크스페이스

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

기본 환경변수는 `.env.local`에 넣어야 합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

Supabase 스키마와 정책은 저장소 루트 기준 아래 파일을 기준으로 맞춥니다.

- `supabase/schema.sql`

## 메모

- 이 저장소는 개인정보가 포함될 수 있는 소개/매칭 흐름을 다루므로, 시크릿과 실제 운영 데이터는 절대 저장소에 커밋하면 안 됩니다.
- 매칭 기록은 운영을 돕는 보조 정보이며, 어떤 결과도 보장하지 않습니다.

## 사용 범위

Private / Internal Use Only
