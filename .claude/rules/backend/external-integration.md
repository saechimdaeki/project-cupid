---
paths:
  - "backend/**/external/**"
  - "backend/**/integration/**"
  - "backend/**/lookup/**"
---

# 외부 시스템 연동 규칙

## 원칙

외부 시스템(중앙 DB, 서드파티 API 등)과의 연동은 반드시 **인터페이스 기반 이중 구현 패턴**을 따른다.
운영 환경 전환 시 API 코드 수정 없이 구현체 교체만으로 동작해야 한다.

## 패턴: 인터페이스 기반 이중 구현

```
{Domain}LookupService (인터페이스)
├── Mock{Domain}LookupServiceImpl   <- Phase 1: 로컬 DB/Mock 데이터
└── Real{Domain}LookupServiceImpl   <- Phase 2: 운영 시스템 (@Primary로 전환)
```

### 구현 규칙

1. **인터페이스 정의**: `{Domain}LookupService` — 조회 메서드만 선언
2. **Mock 구현체**: `@Service` — 로컬 DB 또는 하드코딩 데이터
3. **운영 구현체**: `@Service` + `@Primary` — 외부 시스템 직접 연동
4. **전환 방법**: 운영 구현체에 `@Primary` 추가하면 자동 전환, API 코드 수정 불필요

## 체크리스트

### 1. 데이터 출처

- **로컬 DB 스냅샷을 직접 사용하고 있지 않은가?**
  → 화면 표시용이면 LookupService를 통한 실시간 조회 우선
  → 성능상 캐싱이 필요하면 별도 캐시 레이어 추가
- **로컬 저장이 꼭 필요한 경우**: FK 연결, 이력 보관, 오프라인 대응 등 명확한 사유 필요

### 2. 인터페이스 준수

- **LookupService 인터페이스를 통해 호출하는가?**
  → 구현체 직접 참조 금지 (`MockXxxServiceImpl` import 금지)
- **Controller/Service에서 인터페이스 타입으로 주입하는가?**

```java
// 올바른
private final CompanyLookupService companyLookupService;

// 금지
private final MockCompanyLookupServiceImpl mockService;
```

### 3. null/에러 처리

- 외부 시스템 코드가 null인 경우를 처리하는가?
- 외부 시스템 장애 시 fallback이 있는가?

### 4. API 설계

- Phase 전환 시 API 코드 수정이 필요 없는가?
- 구현체 교체만으로 동작해야 함

## 주석 규칙 (필수)

외부 시스템 연동 코드에는 반드시 **Phase 정보와 전환 방법**을 주석으로 남긴다.

### 인터페이스

```java
/**
 * 기업 DB 조회 서비스.
 *
 * Phase 1: MockCompanyLookupServiceImpl (로컬 DB)
 * Phase 2: RealCompanyLookupServiceImpl (@Primary 추가로 전환)
 */
public interface CompanyLookupService { ... }
```

### Mock 구현체

```java
/**
 * 기업 DB Mock 구현.
 *
 * TODO(Phase 2): RealCompanyLookupServiceImpl에 @Primary 추가 후 이 클래스 제거
 */
@Service
public class MockCompanyLookupServiceImpl implements CompanyLookupService { ... }
```

### Controller/API 엔드포인트

```java
/**
 * 기업 정보 조회 (실시간).
 *
 * TODO(Phase 2): 외부 DB 연동 시 변경 불필요 (LookupService 구현체만 교체)
 */
@GetMapping("/company")
public ApiResponse<CompanyInfo> company(...) { ... }
```

### 주석 핵심 원칙

1. **Phase 번호 명시**: 현재 어느 Phase인지
2. **전환 방법 명시**: `TODO(Phase N):` 태그로 전환 시 해야 할 일 기록
3. **변경 불필요 명시**: 전환 시 수정 불필요한 코드에도 "변경 불필요" 주석
4. **제거 대상 명시**: Mock 구현체 등 전환 후 제거할 코드에 `TODO` + "제거" 명시
