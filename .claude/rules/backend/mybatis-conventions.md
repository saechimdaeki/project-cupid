---
paths:
  - "backend/**/mapper/**"
  - "backend/**/*Mapper.xml"
  - "backend/**/*Mapper.java"
---

# MyBatis 쿼리 규칙

## 필수

- `${}` 사용 금지 (SQL Injection) → `#{}` 사용
- 대량 데이터는 반드시 LIMIT/OFFSET 페이징
- INSERT 시 `useGeneratedKeys="true" keyProperty="xxx"` 사용
- **SQL에 비즈니스 로직 금지** — Mapper XML은 순수 데이터 접근만 수행. 값 계산, 조건 분기, 기본값 설정 등은 Service 레이어에서 처리 후 바인딩 변수로 전달

## 주의

- N+1 문제: 반복문 안 SELECT 여부 확인
- resultMap collection 사용 시 성능 영향 고려
- LIKE 검색 시 `%keyword%`는 인덱스 무효화 → `keyword%` 권장
- soft delete 사용 시 is_deleted 조건 누락 주의

## 파일 구조

- Mapper 인터페이스: `@Mapper` 어노테이션, `mapper/` 패키지
- Mapper XML: `resources/mapper/{area}/{Domain}Mapper.xml`
- Namespace = 인터페이스 FQCN 일치

## 네이밍

- 메서드: `selectXxxList`, `selectXxx`, `insertXxx`, `updateXxx`, `deleteXxx`
- parameterType: VO 타입 별칭 사용
- resultType: `map-underscore-to-camel-case: true` 활용

## 동적 SQL 패턴

- `<where>` + `<if>` 조합 (선택적 검색 조건)
- `<foreach>` (IN절 바인딩)
- `<choose>/<when>/<otherwise>` (조건 분기)

## 쿼리 성능 규칙

### 작성 시 필수 체크

- `SELECT *` 금지 → 필요한 컬럼만 명시
- JOIN 3개 이상 시 성능 경고 → 쿼리 분할 또는 서브쿼리 검토
- 서브쿼리보다 JOIN 우선
- ORDER BY + LIMIT 조합에 인덱스 활용 가능한지 확인
- COUNT(*) vs COUNT(column) 구분 — NULL 포함 여부 의도 확인

### 인덱스 활용

- WHERE/JOIN/ORDER BY 컬럼에 인덱스 존재 여부 확인
- 복합 인덱스 순서 = WHERE 조건 순서 (좌측 접두사 규칙)
- 함수 감싼 컬럼은 인덱스 무효화 (`DATE(created_at)` → 범위 조건으로 변경)

### 성능 검증 절차 (쿼리 추가/수정 시)

```
1. EXPLAIN 실행:
   - type: ALL → 풀 테이블 스캔 (위험, 인덱스 필요)
   - type: ref/range/const → 정상
   - rows: 1000 이상이면 주의
   - Extra: Using filesort → ORDER BY 인덱스 미활용
   - Extra: Using temporary → GROUP BY/DISTINCT 최적화 필요

2. 문제 발견 시:
   - 인덱스 추가 제안
   - 쿼리 리팩토링 (서브쿼리→JOIN, 불필요 정렬 제거 등)
```

### 안티패턴 감지

| 패턴 | 문제 | 해결 |
|------|------|------|
| `SELECT *` | 불필요 데이터 전송 | 필요 컬럼만 명시 |
| `WHERE col1 OR col2` | 인덱스 활용 어려움 | UNION ALL 분리 검토 |
| `LIKE '%keyword%'` | 풀 테이블 스캔 | `keyword%` 또는 Full-Text |
| `IN (서브쿼리)` | 최적화 약함 | JOIN으로 변환 |
| `ORDER BY RAND()` | 풀 스캔 + 정렬 | 앱단 랜덤 |
| 반복문 내 SELECT | N+1 문제 | JOIN/IN 배치로 변환 |
| `GROUP BY` + 미인덱스 컬럼 | 임시 테이블 생성 | 인덱스 추가 또는 재설계 |
