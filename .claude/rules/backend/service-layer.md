---
paths:
  - "backend/**/service/**"
  - "backend/**/service/impl/**"
---

# Service 레이어 규칙

## 구조

- interface + impl 분리 필수: `service/XxxService.java` + `service/impl/XxxServiceImpl.java`
- `@Service` 어노테이션은 impl 클래스에만
- `@RequiredArgsConstructor` 생성자 주입 (필드 `@Autowired` 금지)

## 트랜잭션 (강제)

- **클래스 레벨에 `@Transactional(readOnly = true)` 기본 적용** — 읽기 메서드에 개별 어노테이션 나열 금지
- 쓰기 메서드(insert/update/delete)에만 `@Transactional` 개별 오버라이드
- Controller에 `@Transactional` 금지

```java
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)  // 클래스 레벨 기본
public class UserServiceImpl implements UserService {

    @Override
    @Transactional  // 쓰기만 개별 오버라이드
    public void insertUser(UserCreateRequest request) { ... }

    @Override  // 읽기 — 클래스 레벨 상속이므로 어노테이션 불필요
    public UserVO selectUser(Long id) { ... }
}
```

## 메서드 시그니처 패턴

```java
// 목록 조회: SearchRequest -> PageResponse<VO>
PageResponse<UserVO> selectUserList(UserSearchRequest request);

// 상세 조회: ID -> VO (없으면 BusinessException)
UserVO selectUser(Long userId);

// 등록: CreateRequest -> VO (등록 결과)
UserVO insertUser(UserCreateRequest request);

// 수정: ID + UpdateRequest -> VO (수정 결과)
UserVO updateUser(Long userId, UserUpdateRequest request);

// 삭제: ID (없으면 BusinessException)
void deleteUser(Long userId);
```

## DTO -> 도메인 변환 패턴 (강제)

- **Service에서 setter 호출, 기본값 설정, 상태 초기화 절대 금지**
- DTO -> 도메인 변환은 **도메인 팩토리 메서드** (`Domain.from(request)`)에서 수행
- 기본값/초기 상태 설정도 도메인 팩토리 메서드 내부에서 처리

```java
// 올바른: 도메인이 자기 자신을 생성하고 기본값도 설정
@Override
@Transactional
public UserVO insertUser(UserCreateRequest request) {
    UserVO vo = UserVO.from(request);  // 도메인 팩토리 (기본값 포함)
    userMapper.insertUser(vo);
    return userMapper.selectUser(vo.getUserId());
}

// 금지: Service에서 setter로 기본값 설정
vo.setStatus(UserStatus.ACTIVE);  // -> 도메인 팩토리에서 해야 함
```

## 비즈니스 로직 위치 (대원칙 — 최우선)

- **비즈니스 로직(검증, 상태 변경, 계산, 변환)은 반드시 도메인 모델에 위치**
- Service는 도메인 메서드를 **호출**만 한다. 직접 구현하지 않는다.
- Service에 허용되는 것: Mapper 호출, 도메인 메서드 호출, 트랜잭션 경계, 예외 조회(not found)
- **Service에 금지되는 것**:
  - **setter 절대 금지** (`vo.setXxx(...)`)
  - `if (status == XXX)` 같은 비즈니스 조건 분기
  - 데이터 변환 로직 (Map -> List, JSON 직렬화 등)
  - `new DomainObject(...)` 또는 `.builder()...build()` 직접 조립
  - private 헬퍼에 비즈니스 로직 숨기기

```java
// 올바른: 도메인이 검증
user.validateStatusChange(newStatus, reason);  // 도메인 메서드
userMapper.updateStatus(...);

// 금지: Service에서 검증
if (status == UserStatus.REJECTED && (reason == null || reason.isBlank())) {
    throw new BusinessException(ErrorCode.INVALID_INPUT, "사유는 필수입니다.");
}
```

## Service 책임 범위 (강제)

- **Service = 오케스트레이션 레이어**: 도메인 호출 순서 조율 + 트랜잭션 경계만 담당
- 복잡한 데이터 조합/변환/그루핑 로직은 Service에 직접 작성 **금지**
  → 도메인 객체 또는 Response DTO의 `static of()` 팩토리 메서드로 추출
- **Service 메서드 본문이 30줄을 초과하면** → 도메인 위임 또는 클래스 분리 검토 필수

```java
// 금지: Service에서 70줄 절차적 조합
List<TimeSlot> slots = mapper.selectSlots();
Map<Long, List<Long>> blockedMap = blockedList.stream()
    .collect(Collectors.groupingBy(...));
// ... 60줄 변환 로직

// 올바른: Response DTO가 조합 책임
var slots = mapper.selectSlots();
var users = mapper.selectUsers();
return ScheduleResponse.of(slots, users);
```

## 메서드 네이밍

- 조회: `selectXxx`, `selectXxxList`
- 등록: `insertXxx`
- 수정: `updateXxx`
- 삭제: `deleteXxx`

## 메서드 인자 규칙 (강제)

- 메서드 인자가 **3개를 초과**하면 → 전용 Request/Command 객체로 묶어서 전달
- Service 메서드 시그니처: 최대 2-3개 인자 (ID + Request DTO 패턴)

## Service 코드 작성 전 체크리스트 (강제)

1. **setter 호출**: `vo.setXxx(...)` 가 있는가? → **절대 금지**
2. **if/else 분기**: 비즈니스 조건 분기가 있는가? → 도메인 검증 메서드로 이동
3. **new/builder**: 도메인 객체를 직접 조립하고 있는가? → 도메인 팩토리 메서드 사용
4. **private 헬퍼**: private 메서드에 비즈니스 로직이 있는가? → 도메인으로 이동
5. **데이터 변환**: stream 변환이 있는가? → 도메인 메서드로 이동
6. **기본값 설정**: 초기 상태/기본값을 Service에서 설정하는가? → 도메인 팩토리에서 설정
7. **메서드 길이**: 30줄 초과하는가? → 도메인 위임 또는 클래스 분리

**위반 발견 시**: 즉시 도메인으로 이동시킨다. "나중에 리팩토링"은 허용하지 않는다.
