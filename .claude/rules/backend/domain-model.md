---
paths:
  - "backend/**/domain/**"
  - "backend/**/dto/**"
  - "backend/**/enums/**"
---

# 도메인 모델 규칙

## 계층 분리 (VO / DTO / Enum)

### VO = 도메인 모델 (DB <-> Java 매핑)

- 위치: `domain/` 패키지
- DB 테이블 필드 + 집계 필드(JOIN/서브쿼리)만 포함
- 검색/페이징 파라미터(keyword, page, size 등) 포함 금지
- `@Getter` + `@Setter` 사용 (`@Data` 사용 금지)
- 상태/유형 필드는 반드시 enum 타입

```java
@Getter
@Setter
public class UserVO {
    private Long userId;
    private String name;
    private UserStatus status;  // enum 타입 필수
    private Integer orderCount; // 집계 필드 OK
}
```

### DTO = API 입출력 (Request / Response)

- 위치: 각 도메인의 `dto/` 패키지
- Controller <-> Service 경계에서 사용
- Request DTO: `@Getter` + `@Setter`, 필요시 `@Valid` + `jakarta.validation` 어노테이션
- Service에서 DTO -> VO 변환 (`toVO()` 헬퍼 또는 도메인 팩토리 메서드)

```
user/dto/
  UserCreateRequest.java
  UserUpdateRequest.java
  UserSearchRequest.java     // extends PageRequest
```

### Enum = 코드성 상수

- 위치: `domain/enums/` 패키지
- String 하드코딩 대신 enum 필수
- 비즈니스 로직(상태 전이, 판별 등)을 enum 메서드로 캡슐화

```java
public enum UserStatus {
    ACTIVE, SUSPENDED, WITHDRAWN;

    private static final Map<UserStatus, Set<UserStatus>> TRANSITIONS = Map.of(
        ACTIVE,    Set.of(SUSPENDED, WITHDRAWN),
        SUSPENDED, Set.of(ACTIVE, WITHDRAWN),
        WITHDRAWN, Set.of()
    );

    public boolean canTransitTo(UserStatus target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public boolean isEditable() { return this != WITHDRAWN; }
}
```

## 검색/페이징 분리

### PageRequest (공통 베이스)

```java
@Getter @Setter
public class PageRequest {
    private Integer page = 1;
    private Integer size = 10;
    private String sortField;
    private String sortDir = "desc";

    public int getOffset() { return (getPage() - 1) * getLimit(); }
    public int getLimit()  { return Math.min(size != null && size > 0 ? size : 10, 100); }
}
```

### 도메인별 SearchRequest

```java
@Getter @Setter
@EqualsAndHashCode(callSuper = true)
public class UserSearchRequest extends PageRequest {
    private String keyword;
    private UserStatus status;  // enum 필터
}
```

## Lombok 규칙

- `@Getter` + `@Setter` 사용 (ORM 매핑용으로 유지)
- **Service에서 setter 직접 호출 금지** → 도메인 메서드로 상태 변경
- `@Data` 사용 금지 (자동 `@EqualsAndHashCode`, `@ToString` 위험)
- `@RequiredArgsConstructor` — Service, Controller에서 생성자 주입용
- `@Builder` — 도메인 팩토리 메서드 내부에서만 사용, 외부 직접 호출 금지

## ID 타입 규칙

- 모든 ID 필드(PK, FK)는 `long` (primitive) 또는 `Long` (wrapper) 사용
- nullable FK는 `Long` 사용
- `int`/`Integer`는 ID에 절대 사용 금지
- 카운트, 순서, 우선순위 등 비-ID 정수는 `int` 허용

## 빌더 패턴 — 도메인 팩토리 메서드

- **외부(Service/Controller)에서 `.builder()`로 도메인 객체를 직접 조립하지 않는다**
- 도메인 객체 생성은 **도메인 클래스 자체의 팩토리 메서드**로 캡슐화

```java
// 올바른: 도메인이 스스로 생성
public class UserVO {
    public static UserVO from(UserCreateRequest req) {
        return defaults()
                .name(req.getName())
                .email(req.getEmail())
                .status(UserStatus.ACTIVE)  // 기본값도 여기서
                .build();
    }
}

// Service
UserVO vo = UserVO.from(request);
userMapper.insertUser(vo);
```

```java
// 금지: Service에서 builder 직접 조립
UserVO user = UserVO.builder()
        .name(request.getName())
        .status(UserStatus.ACTIVE)
        .build();
```

- 예외: 테스트 코드에서는 `.builder()` 직접 사용 허용

## 도메인 조합 객체 패턴 (강제)

- 여러 엔티티를 조합하여 Response를 만드는 로직은 **Response DTO의 `static of()` 팩토리 메서드**에 위치
- Service가 raw 데이터를 넘기면 DTO가 그루핑/필터링/변환 책임
- **금지**: Service에서 `stream().collect(Collectors.groupingBy(...))` + 60줄 변환 로직

```java
// 올바른: Response DTO가 조합 책임
public record ScheduleResponse(
    List<String> dates,
    List<SlotInfo> slots,
    List<UserRow> rows
) {
    public static ScheduleResponse of(
            List<TimeSlot> slots, List<User> users, List<Meeting> meetings) {
        // 그루핑, 필터링, 변환 로직을 여기서 수행
    }
}

// Service는 단순 위임
return ScheduleResponse.of(slots, users, meetings);
```

## 도메인 비즈니스 메서드 패턴

도메인 모델은 **자신의 데이터에 대한 모든 비즈니스 로직**을 소유한다:

### 1. 검증 메서드 — `validate*()`

```java
public void validateStatusChange(UserStatus newStatus, String reason) {
    if (newStatus == UserStatus.SUSPENDED && (reason == null || reason.isBlank())) {
        throw new BusinessException(ErrorCode.INVALID_INPUT, "사유는 필수입니다.");
    }
}
```

### 2. 팩토리 메서드 — `from()`, `forCreate()`, `forUpdate()`

- 기본값, 초기 상태, 데이터 변환을 팩토리 내부에서 처리

### 3. 상태 변경 메서드

```java
public void activate() { this.status = UserStatus.ACTIVE; }
public void suspend(String reason) {
    validateStatusChange(UserStatus.SUSPENDED, reason);
    this.status = UserStatus.SUSPENDED;
    this.suspendReason = reason;
}
```

**원칙**: "이 로직이 도메인 데이터를 다루는가?" → Yes면 도메인에 위치.

## 금지 사항

- VO에 검색/페이징 파라미터 혼합 금지
- String으로 상태/유형 관리 금지 → enum 필수
- Controller에서 VO를 `@RequestBody`로 직접 수신 금지 → Request DTO 사용
- `@Data` 사용 금지
- **Service에서 도메인 setter 호출 금지** → 도메인 메서드 사용
- **Service에서 비즈니스 if/else 금지** → 도메인 검증 메서드 사용
