---
paths:
  - "backend/**/exception/**"
  - "backend/**/*Controller.java"
  - "backend/**/service/impl/**"
---

# 예외 처리 규칙

## 아키텍처

```
Service -> throw BusinessException(ErrorCode.XXX)
                    |
GlobalExceptionHandler (@RestControllerAdvice)
                    |
ApiResponse.error(code, message) -> HTTP 400/500
```

## ErrorCode enum

- 형식: `{도메인코드}{순번}`
- `(String code, String message)` 생성자

```java
public enum ErrorCode {
    // 공통
    INVALID_INPUT("C001", "잘못된 입력입니다."),

    // 사용자
    USER_NOT_FOUND("U001", "사용자를 찾을 수 없습니다."),
    USER_NOT_EDITABLE("U002", "수정할 수 없는 상태입니다."),
    USER_INVALID_STATUS_TRANSITION("U003", "허용되지 않는 상태 변경입니다."),

    // 도메인 추가 시 코드 확장
    // ORDER_NOT_FOUND("O001", "주문을 찾을 수 없습니다."),
}
```

## BusinessException

- `RuntimeException` 상속
- 생성자 2개: `BusinessException(ErrorCode)`, `BusinessException(ErrorCode, String detail)`
- detail 제공 시 기본 메시지 대신 detail 사용

## GlobalExceptionHandler

- `@RestControllerAdvice`
- 처리 순서:
  1. `BusinessException` → 400 + ErrorCode 메시지
  2. `MethodArgumentNotValidException` (@Valid 실패) → 400 + 필드별 메시지
  3. `IllegalArgumentException`/`IllegalStateException` → 400 (레거시 호환)
  4. `Exception` → 500 + 일반 메시지

## Service에서의 예외 사용 패턴

```java
// 리소스 조회 실패
UserVO user = userMapper.selectUser(userId);
if (user == null) {
    throw new BusinessException(ErrorCode.USER_NOT_FOUND);
}

// 비즈니스 규칙 위반
if (!existing.getStatus().isEditable()) {
    throw new BusinessException(ErrorCode.USER_NOT_EDITABLE);
}

// 상태 전이 검증
if (!existing.getStatus().canTransitTo(newStatus)) {
    throw new BusinessException(ErrorCode.USER_INVALID_STATUS_TRANSITION,
            String.format("상태 변경 불가: %s -> %s", existing.getStatus(), newStatus));
}
```

## 필수 규칙

- Service에서 비즈니스 예외: `throw new BusinessException(ErrorCode.XXX)`
- Controller에서 예외 catch 금지 → GlobalExceptionHandler로 위임
- null 반환 대신 BusinessException throw
- 스택 트레이스를 API 응답에 노출 금지
- 예외 삼킴(swallow) 금지, 최소 `log.error()` 기록

## 금지 사항

- `IllegalArgumentException`/`IllegalStateException` 직접 throw 금지 → `BusinessException` 사용
- Controller에서 `try-catch` 금지
- Controller에서 null 체크 후 에러 응답 직접 반환 금지
