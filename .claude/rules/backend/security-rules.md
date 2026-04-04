---
paths:
  - "backend/**/auth/**"
  - "backend/**/security/**"
  - "backend/**/config/SecurityConfig.java"
  - "backend/**/filter/**"
---

# 인증/보안 규칙

## 절대 금지

- 비밀번호/토큰을 로그에 출력하지 않는다
- JWT Secret을 하드코딩하지 않는다 (환경변수/설정파일 사용)
- 인증 없는 엔드포인트를 만들지 않는다 (의도적 제외는 주석 필수)

## 필수

- 토큰 검증 실패 시 401 반환
- 권한 부족 시 403 반환
- 민감 정보는 응답에서 제외 (password, secret 등)

## IDOR 방지

- 리소스 접근 시 단일 ID 조회 금지 → 반드시 소유자/테넌트 ID와 함께 WHERE 조건
- 예: `WHERE user_id = #{userId} AND tenant_id = #{tenantId}` 패턴 필수
- Controller → Service → Mapper 모든 레이어에 소유자 ID 전달

## JWT 설계

- 토큰 Claims 필수: `sub`, `role`, `exp`
- 멀티테넌트 시 URL의 테넌트 ID와 JWT의 테넌트 ID 일치 검증

## CORS

- 개발: localhost 허용
- 운영: 실제 도메인만 허용으로 변경 필요

## SQL Injection 방지

- MyBatis `${}` 사용 금지 → `#{}` 사용
- JPA에서 native query에 문자열 결합 금지 → 파라미터 바인딩 사용

## XSS 방지

- 사용자 입력을 HTML에 직접 출력하지 않는다
- React의 JSX는 기본적으로 escape 처리됨
- `dangerouslySetInnerHTML` 사용 시 반드시 sanitize 처리

## CSRF

- API 서버(JWT 기반)는 stateless이므로 CSRF 토큰 불필요
- 세션 기반 인증 사용 시 CSRF 보호 필수

## 기타

- 파일 업로드 시 확장자/크기 검증 필수
- Rate limiting 적용 (인증 시도, API 호출)
- 에러 메시지에 시스템 내부 정보 노출 금지
