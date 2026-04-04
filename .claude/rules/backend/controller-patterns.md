---
paths:
  - "backend/**/web/**"
  - "backend/**/*Controller.java"
---

# Controller 패턴 규칙

## 핵심 원칙: Thin Controller

Controller는 라우팅 + 위임만 수행. 모든 메서드가 1줄 (`return ApiResponse.ok(service.xxx())`).
- 비즈니스 로직, null 체크, 예외 처리 일절 금지
- **Domain -> Response DTO 변환도 Service에서 수행** (Controller에서 `.stream().map()`, `Response.from()` 금지)
- 검증: `@Valid` + DTO의 `jakarta.validation` 어노테이션
- 예외: `GlobalExceptionHandler`가 전역 처리

## 구조

- `@RestController` + `@RequestMapping("/api/...")`
- `@RequiredArgsConstructor` 생성자 주입
- Service 인터페이스 타입으로 주입 (impl 직접 참조 금지)

## URL 패턴

- RESTful: GET(조회), POST(등록), PUT(수정), DELETE(삭제)
- PathVariable: 파라미터명이 URL 변수명과 동일하면 `@PathVariable Long id` (중복 선언 금지)

## 응답 규칙

- 항상 공통 응답 래퍼로 반환 (예: `ApiResponse<T>`)
- 성공: `ApiResponse.ok(data)` 또는 `ApiResponse.ok("message", data)`
- 페이징: `ApiResponse<PageResponse<T>>`
- 에러: `GlobalExceptionHandler`가 자동 반환

## 파라미터 패턴

### 목록 조회 (검색/페이징)

SearchRequest DTO에 Spring 자동 바인딩 — `@RequestParam` 나열 금지:

```java
// 올바른 패턴 — Spring이 query params를 DTO에 자동 바인딩
@GetMapping
public ApiResponse<PageResponse<UserVO>> list(UserSearchRequest request) {
    return ApiResponse.ok(userService.selectUserList(request));
}

// 금지 패턴 — @RequestParam 나열
@GetMapping
public ApiResponse<...> list(@RequestParam String keyword, @RequestParam String status,
                             @RequestParam int page, @RequestParam int size) { }
```

### 등록/수정

`@Valid` + `@RequestBody` + Request DTO:

```java
@PostMapping
public ApiResponse<UserVO> create(@Valid @RequestBody UserCreateRequest request) {
    return ApiResponse.ok("등록되었습니다.", userService.insertUser(request));
}
```

### 상세/삭제

```java
@GetMapping("/{userId}")
public ApiResponse<UserVO> detail(@PathVariable Long userId) {
    return ApiResponse.ok(userService.selectUser(userId));
}
```

## @PathVariable 규칙 (강제)

- `@RequestMapping` 등에 선언한 PathVariable은 메서드 본문에서 **반드시 사용**해야 한다
- 미사용 PathVariable이 있으면 → URL에서 제거하거나 Service에 전달하도록 수정
- **멀티테넌트 ID는 보안상 항상 Service까지 전달 필수** — URL에만 있고 무시하면 IDOR 취약점

## 금지 사항

- Controller에 비즈니스 로직 금지 (if/else, 상태 체크, 기본값 설정 등)
- Controller에서 Domain -> Response 변환 금지 (`.stream().map()` 등) → Service가 Response DTO 반환
- Controller에서 Mapper/Repository 직접 호출 금지
- Controller에 `@Transactional` 금지
- 예외 직접 catch 금지
- null 체크 후 에러 응답 직접 반환 금지
- `@RequestBody DomainVO` 금지 → Request DTO 사용
- 여러 `@RequestParam`을 나열하여 수동 매핑 금지 → SearchRequest 자동 바인딩
- `Map<String, String>` body 파싱 금지 → 타입 안전한 DTO 사용

## Controller 코드 작성 전 체크리스트

1. **`@PathVariable`**: URL 변수명 = Java 파라미터명이면 name 생략
2. **`@RequestBody`**: 도메인 VO를 직접 받고 있지 않은가? → Request DTO 사용
3. **`@RequestBody Map<...>`**: Map으로 받고 있지 않은가? → 타입 안전한 DTO 사용
4. **메서드 본문**: 변환 로직이 있지 않은가? → Service로 이동
5. **메서드 본문**: if/else, null 체크 등이 있지 않은가? → Service로 이동
6. **메서드 길이**: 1줄(`return ApiResponse.ok(...)`)인가? 2줄 이상이면 규칙 위반 가능성 확인
