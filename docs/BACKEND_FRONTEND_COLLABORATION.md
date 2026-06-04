# 백엔드-프론트엔드 협업 문서

이 문서는 백엔드 담당자에게 현재 프론트엔드 상황, 요구사항 우선순위, 앞으로 함께 맞춰야 할 API와 데이터 계약을 전달하기 위한 문서입니다.

기준 문서:

- `docs/TERM_PROJECT_REQUIRMENTS.md`
- `docs/FREEMOA_UI_REFERENCE.md`
- `docs/TERM_PROJECT_FRONTEND_DESIGN.md`

## 1. 현재 백엔드 상황 요약

백엔드는 현재 “인프라 뼈대는 시작됨, 핵심 서비스 기능은 아직 시작 전” 상태로 판단합니다.

### 1.1 구현된 것

- Gradle/Spring Boot 프로젝트 세팅
  - Java 21
  - Spring Web
  - JPA
  - Validation
  - H2
  - Lombok
- H2 파일 DB 설정
- 세션 쿠키 설정
- multipart 업로드 제한
- CORS 설정
- 사용자 기본 엔티티
  - `User`
  - `Role(DEVELOPER, CLIENT)`
- 공통 응답 구조
  - `ApiResponse`
  - `PageResponse`
- JPA Auditing 기반 생성/수정 시간 엔티티
- 세션 인증 기반 준비 코드
  - `SessionUser`
  - `@LoginUser`
  - `LoginUserArgumentResolver`
- 전역 예외 처리
  - `BusinessException`
  - `ErrorCode`
  - `GlobalExceptionHandler`
- 프로필 이미지 저장 서비스
  - multipart 이미지 저장
  - `/files/profile/...` 경로 반환
- 이메일/전화번호 포함 여부 검출 유틸

### 1.2 아직 미구현

- 실제 로그인/로그아웃 API
- 사용자 조회 API
- `UserRepository` 포함 모든 Repository
- 핵심 도메인 엔티티
  - `Project`
  - `Application`
  - `DeveloperProfile`
  - `Tag`
- 프로젝트 목록/필터/정렬/페이지네이션 API
- 프로젝트 상세 API
- 프로젝트 지원 API
- 지원서 조회 API
- 개발자 마이페이지 API
- 의뢰인 마이페이지 API
- 더미 데이터/시드 데이터
- 기능별 테스트

### 1.3 검증 상태

- `.\gradlew.bat test` 실행 성공
- 현재 테스트는 `contextLoads()` 1개뿐입니다.
- 테스트 로그 기준 JPA Repository는 0개 감지되었습니다.

### 1.4 백엔드 주의사항

- 요구사항 문서와 일부 한글 에러 메시지가 깨져 보인다고 했으므로, 인코딩은 UTF-8로 통일하는 것이 좋습니다.
- git 상태에 `.gitkeep` 삭제가 잡혀 있다고 했으므로, 의도한 삭제인지 확인이 필요합니다.
- 지금은 기능 구현 전이므로, 프론트와 API 계약을 먼저 맞춘 뒤 엔티티/Repository/Controller를 진행하는 것이 가장 안전합니다.

## 2. 현재 프론트엔드 상황

백엔드 쪽 기록에는 “React/Vue SPA 프론트엔드 미구현”이라고 되어 있지만, 이 프론트엔드 저장소 기준으로는 Vite React SPA 뼈대가 이미 있습니다. 다만 과제 핵심 기능은 아직 API 연결 전이며, 대부분 프리모아 랜딩 클론 UI와 mock 데이터 기반입니다.

### 2.1 기술 스택

- Vite
- React 19
- TypeScript
- Tailwind CSS 4
- lucide-react
- ESLint

### 2.2 현재 앱 구조

현재 `src/app/App.tsx`는 아래처럼 `HomePage`만 렌더링합니다.

```tsx
import { HomePage } from '@/pages/home'

export function App() {
  return <HomePage />
}
```

즉, 아직 라우팅은 없습니다.

### 2.3 현재 폴더 구조

프론트는 Feature-Sliced Design에 가까운 구조입니다.

```txt
src/
  app/
  pages/
  widgets/
  features/
  entities/
  shared/
```

현재 주요 화면/위젯:

- `pages/home`
- `widgets/site-header`
- `widgets/hero-section`
- `widgets/project-board`
- `widgets/partner-showcase`
- `widgets/portfolio-gallery`
- `widgets/review-list`
- `widgets/process-timeline`
- `widgets/site-footer`

### 2.4 현재 프로젝트 목록 구현 상태

현재 프로젝트 목록은 mock 데이터와 프론트 필터 함수로 동작합니다.

```ts
export const PROJECT_PAGE_SIZE = 4

export async function getProjects(query: ProjectQuery): Promise<ProjectPage> {
  const filtered = filterProjects(projects, query)
  const start = (query.page - 1) * query.pageSize
  const items = filtered.slice(start, start + query.pageSize)

  return {
    items,
    total: filtered.length,
    page: query.page,
    totalPages: Math.max(1, Math.ceil(filtered.length / query.pageSize)),
  }
}
```

주의: 과제 요구사항상 실제 제출 구현에서는 프론트 정렬/필터링이 인정되지 않습니다. 백엔드 API가 프로젝트 형태, 정렬, 페이지네이션을 처리해야 합니다.

### 2.5 현재 프론트 타입과 앞으로 바꿀 타입

현재 타입:

```ts
export type ProjectType = 'budget' | 'resident'
```

앞으로 백엔드와 맞출 추천 타입:

```ts
type EmploymentType = 'outsourcing' | 'resident'
```

UI 라벨:

- `outsourcing` -> `도급(원격)`
- `resident` -> `상주`

현재 `budget`이라는 이름은 요구사항의 “도급”과 의미가 어긋날 수 있어서, 백엔드와 프론트 모두 `outsourcing`으로 통일하는 것을 추천합니다.

## 3. 최우선 협업 방향

과제 배점상 가장 먼저 함께 만들어야 하는 기능은 프로젝트 목록 API입니다.

프론트가 당장 구현하고 검증할 수 있는 순서는 다음이 가장 좋습니다.

1. 세션 로그인/현재 사용자 API
2. 프로젝트 목록 API
3. 프로젝트 상세 API
4. 프로젝트 지원 API
5. 개발자 마이페이지 API
6. 의뢰인 프로젝트 생성/관리 API
7. 프로필 이미지 업로드 API 연결
8. 더미 데이터/시드 데이터 보강

이 순서가 좋은 이유:

- 기능 1, 2는 프로젝트 전체의 첫 화면이며 서버 필터/정렬/페이징 검증이 핵심입니다.
- 기능 7은 지원 후 지원자 수 증가와 개발자 마이페이지 연동이 필요합니다.
- 기능 8, 9, 10은 의뢰인 관리 화면과 지원서 데이터가 있어야 검증됩니다.
- 프로필 이미지 업로드 서비스는 이미 백엔드에 있으므로, API만 완성되면 프론트 연결이 빠릅니다.

## 4. 공통 API 규칙

### 4.1 인증

인증은 세션 기반입니다.

프론트 fetch는 항상 아래 옵션을 사용합니다.

```ts
fetch(url, {
  credentials: 'include',
})
```

백엔드는 JWT, Bearer Token, Authorization 헤더를 쓰지 않는 방향으로 유지해야 합니다.

### 4.2 응답 형식

백엔드에 이미 `ApiResponse`, `PageResponse`가 있으므로 그것을 사용합니다.

권장 구조:

```json
{
  "success": true,
  "message": "요청이 성공했습니다.",
  "data": {}
}
```

페이지 응답 권장 구조:

```json
{
  "success": true,
  "message": "요청이 성공했습니다.",
  "data": {
    "items": [],
    "page": 1,
    "size": 4,
    "totalItems": 12,
    "totalPages": 3
  }
}
```

프론트와 맞추기 위해 `items`, `page`, `size`, `totalItems`, `totalPages` 이름을 추천합니다.

### 4.3 날짜 형식

프론트는 문자열로 받는 것이 가장 단순합니다.

권장:

- 날짜: `YYYY-MM-DD`
- 날짜시간: `YYYY-MM-DD HH:mm:ss` 또는 ISO 문자열

중요 표시:

- 마감일은 `deadline`
- 등록일은 `createdAt`
- 예상 킥오프 일정은 `kickoffDate` 또는 문자열 `kickoffSchedule`

요구사항에는 지원하기/의뢰 상세 요약에 “예상 킥오프 일정”이 있으므로, 프로젝트 생성 시 해당 값을 받거나 기본값을 넣어야 합니다.

추천:

```ts
kickoffSchedule: string
```

예시:

- `미팅 후`
- `2026-06-20`
- `계약 후 7일 이내`

## 5. API 우선순위와 상세 계약

아래 API는 프론트가 붙기 쉽게 작성한 권장 계약입니다. 백엔드 구현 중 필드명이 달라질 수 있다면 먼저 공유해 주세요.

## 5.1 Auth API

### 5.1.1 로그인

```http
POST /api/login
```

요청:

```json
{
  "loginId": "developer1",
  "password": "1234"
}
```

응답:

```json
{
  "success": true,
  "message": "로그인되었습니다.",
  "data": {
    "id": 1,
    "loginId": "developer1",
    "name": "개발자 테스트",
    "role": "DEVELOPER"
  }
}
```

### 5.1.2 현재 세션 사용자

```http
GET /api/session
```

응답:

```json
{
  "success": true,
  "message": "현재 로그인 사용자입니다.",
  "data": {
    "id": 1,
    "loginId": "developer1",
    "name": "개발자 테스트",
    "role": "DEVELOPER"
  }
}
```

비로그인 응답은 `401`을 추천합니다.

### 5.1.3 로그아웃

```http
POST /api/logout
```

## 5.2 Project API

프로젝트 API는 기능 1, 2, 7, 8, 9, 10의 기반입니다.

### 5.2.1 프로젝트 목록

```http
GET /api/projects?type=all&sort=freemoa&page=1&size=4
```

쿼리:

| 이름 | 값 | 설명 |
| --- | --- | --- |
| `type` | `all`, `outsourcing`, `resident` | 전체/도급/상주 |
| `sort` | `freemoa`, `latest`, `highBudget`, `lowBudget`, `deadline` | 정렬 |
| `page` | number | 1부터 시작 |
| `size` | 4 | 프로젝트 목록은 반드시 4 |

중요:

- `type`, `sort`, `page`가 바뀔 때마다 서버에서 새 데이터를 내려줘야 합니다.
- 프론트가 받아서 정렬하면 기능 1이 인정되지 않습니다.
- `size=4` 고정 검증이 들어올 수 있습니다.

응답:

```json
{
  "success": true,
  "message": "프로젝트 목록입니다.",
  "data": {
    "items": [
      {
        "id": 1,
        "title": "상장 기업 브랜드 웹사이트 풀 리뉴얼",
        "employmentType": "outsourcing",
        "recruitStatus": "open",
        "budgetMin": 4000,
        "budgetMax": 5000,
        "monthlyWage": null,
        "expectedDurationDays": 30,
        "applicationCount": 5,
        "deadline": "2026-06-18",
        "deadlineLabel": "D-13",
        "categories": ["개발", "디자인", "기획"],
        "skills": ["홈페이지 리뉴얼", "UI/UX 디자인"],
        "createdAt": "2026-06-04",
        "summary": "홈페이지 디자인 및 개발 통합 진행..."
      }
    ],
    "page": 1,
    "size": 4,
    "totalItems": 12,
    "totalPages": 3
  }
}
```

`deadlineLabel`은 백엔드가 내려줘도 되고, 프론트가 `deadline`으로 계산해도 됩니다. 다만 정렬은 서버가 해야 합니다.

### 5.2.2 프로젝트 상세

```http
GET /api/projects/{projectId}
```

응답:

```json
{
  "success": true,
  "message": "프로젝트 상세입니다.",
  "data": {
    "id": 1,
    "title": "상장 기업 브랜드 웹사이트 풀 리뉴얼",
    "employmentType": "outsourcing",
    "recruitStatus": "open",
    "budgetMin": 4000,
    "budgetMax": 5000,
    "monthlyWage": null,
    "expectedDurationDays": 30,
    "applicationCount": 5,
    "deadline": "2026-06-18",
    "kickoffSchedule": "6월 2째주",
    "categories": ["개발", "디자인", "기획"],
    "progressType": "도급 외주 프로젝트",
    "planningStatus": "상세기획 보유",
    "meetingLocation": "온라인",
    "workDescription": "업무 내용...",
    "workMethod": "온라인 미팅 중심 진행",
    "skills": ["React", "Spring", "UI/UX"],
    "createdAt": "2026-06-04"
  }
}
```

프로젝트 상세 화면은 요약 탭만 구현합니다.

### 5.2.3 프로젝트 지원

```http
POST /api/projects/{projectId}/applications
```

도급 요청:

```json
{
  "employmentType": "outsourcing",
  "workDays": 30,
  "bidAmount": 4500,
  "headcount": 1,
  "content": "지원 내용입니다."
}
```

도급 주의:

- `headcount`는 항상 `1`입니다.
- `bidAmount`는 만원 단위입니다.
- UI에는 “프리모아 이용료 10% 포함” 문구를 표시할 예정입니다.

상주 요청:

```json
{
  "employmentType": "resident",
  "position": "개발자",
  "careerLevel": "중급",
  "headcount": 2,
  "monthlyWage": 500,
  "content": "지원 내용입니다."
}
```

백엔드 검증:

- 지원 내용에 이메일 또는 전화번호 포함 시 거절
- 이미 유틸이 있으므로 백엔드에서도 검증 권장
- 프론트에서도 동일 검증을 수행함

응답:

```json
{
  "success": true,
  "message": "지원이 완료되었습니다.",
  "data": {
    "applicationId": 1,
    "projectId": 1,
    "applicationCount": 6
  }
}
```

`applicationCount`를 응답에 포함하면 프론트가 목록/상세 지원자 수를 즉시 갱신하기 쉽습니다.

## 5.3 Developer API

### 5.3.1 개발자 프로필 조회

```http
GET /api/developer/profile
```

응답:

```json
{
  "success": true,
  "message": "개발자 프로필입니다.",
  "data": {
    "userId": 1,
    "name": "개발자 테스트",
    "imageUrl": "/files/profile/sample.png",
    "fields": ["개발", "디자인"],
    "available": true,
    "residentAvailable": true,
    "province": "경상북도",
    "city": "구미시",
    "businessType": "개인프리랜서",
    "careerYears": 3,
    "tags": ["React", "Spring", "Figma"],
    "introduction": "소개글입니다."
  }
}
```

### 5.3.2 개발자 프로필 수정

```http
PUT /api/developer/profile
```

요청:

```json
{
  "fields": ["개발", "디자인"],
  "available": true,
  "residentAvailable": true,
  "province": "경상북도",
  "city": "구미시",
  "businessType": "개인프리랜서",
  "careerYears": 3,
  "tags": ["React", "Spring", "Figma"],
  "introduction": "소개글입니다."
}
```

백엔드 검증:

- `tags`는 최대 5개
- `fields`는 개발/디자인/기획 중 하나 이상 권장

### 5.3.3 프로필 이미지 업로드

```http
POST /api/developer/profile/image
Content-Type: multipart/form-data
```

필드명:

```txt
image
```

응답:

```json
{
  "success": true,
  "message": "프로필 이미지가 업로드되었습니다.",
  "data": {
    "imageUrl": "/files/profile/uuid-file.png"
  }
}
```

중요:

- DB에는 이미지 파일 자체가 아니라 경로 또는 파일명만 저장합니다.
- 로컬 디렉토리에 실제 파일이 있어야 합니다.
- 프론트 public/assets에 저장하면 안 됩니다.

### 5.3.4 개발자가 지원한 프로젝트 목록

```http
GET /api/developer/applications
```

응답:

```json
{
  "success": true,
  "message": "지원한 프로젝트 목록입니다.",
  "data": [
    {
      "applicationId": 1,
      "projectId": 1,
      "projectTitle": "상장 기업 브랜드 웹사이트 풀 리뉴얼",
      "employmentType": "outsourcing",
      "estimateAmount": 4500,
      "applicationCount": 6,
      "workDays": 30,
      "createdAt": "2026-06-05"
    }
  ]
}
```

요구사항 표시 항목:

- 프로젝트 제목
- 견적
- 지원자 수
- 과업일수
- 상세보기 버튼

그래서 `Application` 자체보다 위와 같은 `DeveloperApplicationSummary` DTO를 추천합니다.

### 5.3.5 나의 지원서 상세

```http
GET /api/developer/applications/{applicationId}
```

응답은 도급/상주 타입에 따라 분기합니다.

```json
{
  "success": true,
  "message": "나의 지원서입니다.",
  "data": {
    "applicationId": 1,
    "projectTitle": "상장 기업 브랜드 웹사이트 풀 리뉴얼",
    "employmentType": "outsourcing",
    "workDays": 30,
    "bidAmount": 4500,
    "headcount": 1,
    "content": "지원 내용입니다.",
    "createdAt": "2026-06-05"
  }
}
```

## 5.4 Client API

### 5.4.1 프로젝트 의뢰 생성

```http
POST /api/client/projects
```

요청:

```json
{
  "title": "상장 기업 브랜드 웹사이트 풀 리뉴얼",
  "deadline": "2026-06-18",
  "employmentType": "outsourcing",
  "budgetMin": 4000,
  "budgetMax": 5000,
  "monthlyWage": null,
  "categories": ["개발", "디자인", "기획"],
  "planningStatus": "상세기획 보유",
  "meetingLocation": "온라인",
  "kickoffSchedule": "미팅 후",
  "workDescription": "업무 내용입니다.",
  "workMethod": "온라인 미팅 중심 진행",
  "skills": ["React", "Spring", "UI/UX"]
}
```

상주 프로젝트라면:

```json
{
  "employmentType": "resident",
  "budgetMin": null,
  "budgetMax": null,
  "monthlyWage": 500
}
```

요구사항상 필수 필드:

- 프로젝트명
- 모집마감일
- 고용형태
- 예산
- 프로젝트 분야
- 기획상태
- 미팅 희망 지역
- 업무내용
- 프로젝트 진행 방식
- 필요 기술 스택

추가 추천 필드:

- `kickoffSchedule`

이유: 지원하기/의뢰 상세 요약에 예상 킥오프 일정이 필요합니다.

### 5.4.2 의뢰인이 등록한 프로젝트 목록

```http
GET /api/client/projects
```

응답:

```json
{
  "success": true,
  "message": "의뢰한 프로젝트 목록입니다.",
  "data": [
    {
      "id": 1,
      "title": "상장 기업 브랜드 웹사이트 풀 리뉴얼",
      "employmentType": "outsourcing",
      "budgetMin": 4000,
      "budgetMax": 5000,
      "monthlyWage": null,
      "applicationCount": 6,
      "deadline": "2026-06-18",
      "deadlineLabel": "D-13"
    }
  ]
}
```

요구사항 표시 항목:

- 프로젝트명
- 예상 금액
- 계약 형태
- 지원자 수
- 모집 마감일
- D-day
- 상세보기 버튼

### 5.4.3 의뢰 프로젝트 상세

```http
GET /api/client/projects/{projectId}
```

응답:

```json
{
  "success": true,
  "message": "의뢰 프로젝트 상세입니다.",
  "data": {
    "id": 1,
    "title": "상장 기업 브랜드 웹사이트 풀 리뉴얼",
    "deadline": "2026-06-18",
    "kickoffSchedule": "미팅 후",
    "employmentType": "outsourcing",
    "categories": ["개발", "디자인"],
    "progressType": "도급 외주 프로젝트",
    "planningStatus": "상세기획 보유",
    "meetingLocation": "온라인"
  }
}
```

의뢰 상세 화면은 아래 두 영역으로 구성됩니다.

1. 의뢰 내용 요약
2. 지원자 리스트

### 5.4.4 지원자 리스트 더보기

```http
GET /api/client/projects/{projectId}/applications?page=1&size=2
```

중요:

- 의뢰인 지원자 리스트의 page size는 반드시 `2`입니다.
- 더 이상 데이터가 없으면 프론트에서 더보기 버튼을 숨기거나 disabled 처리해야 합니다.
- 이를 위해 `totalPages`, `page`, `hasNext` 중 하나 이상이 필요합니다.

응답:

```json
{
  "success": true,
  "message": "지원자 목록입니다.",
  "data": {
    "items": [
      {
        "applicationId": 1,
        "developerId": 1,
        "developerName": "개발자 테스트",
        "employmentType": "outsourcing",
        "expectedAmount": 4500,
        "createdAt": "2026-06-05"
      }
    ],
    "page": 1,
    "size": 2,
    "totalItems": 5,
    "totalPages": 3,
    "hasNext": true
  }
}
```

요구사항의 “지원일(고용형태)”는 프론트에서 아래처럼 표시합니다.

```txt
2026-06-05 (도급)
```

### 5.4.5 지원서 상세 열람

```http
GET /api/client/applications/{applicationId}
```

응답:

```json
{
  "success": true,
  "message": "지원서 상세입니다.",
  "data": {
    "applicationId": 1,
    "developerName": "개발자 테스트",
    "employmentType": "outsourcing",
    "workDays": 30,
    "bidAmount": 4500,
    "headcount": 1,
    "content": "지원 내용 전체입니다.",
    "createdAt": "2026-06-05"
  }
}
```

## 6. 도메인 구현 우선순위

백엔드 엔티티/Repository는 아래 순서로 진행하면 프론트가 단계적으로 붙기 쉽습니다.

### 6.1 1순위: User/Auth

필요한 것:

- `UserRepository`
- 로그인 API
- 로그아웃 API
- 세션 사용자 조회 API
- 개발자/의뢰인 테스트 계정 seed

프론트가 이 단계에서 할 수 있는 것:

- 로그인 화면 연결
- 헤더에서 로그인/마이페이지 분기
- 개발자/의뢰인 마이페이지 분기

### 6.2 2순위: Project

필요한 것:

- `Project` 엔티티
- `ProjectRepository`
- 더미 프로젝트 최소 10건 이상
- 목록 API
- 상세 API
- 서버 필터/정렬/페이지네이션

프론트가 이 단계에서 할 수 있는 것:

- 첫 화면 프로젝트 찾기 완성
- 기능 1, 2 검증
- 프로젝트 상세 화면 연결

### 6.3 3순위: Application

필요한 것:

- `Application` 엔티티
- 도급/상주 분기 필드
- 지원 생성 API
- 지원자 수 증가 처리
- 지원서 조회 API

프론트가 이 단계에서 할 수 있는 것:

- 기능 7 검증
- 개발자 마이페이지 지원 목록 연결
- 의뢰인 지원자 리스트 연결

### 6.4 4순위: DeveloperProfile/Tag/Image

필요한 것:

- `DeveloperProfile` 엔티티
- 태그 저장 구조
- 프로필 조회/수정 API
- 이미지 업로드 API와 DB 경로 저장

프론트가 이 단계에서 할 수 있는 것:

- 기능 3, 4 검증

### 6.5 5순위: Client Project Management

필요한 것:

- 의뢰 프로젝트 생성 API
- 의뢰 프로젝트 목록 API
- 의뢰 프로젝트 상세 API
- 지원자 더보기 API
- 지원서 상세 열람 API

프론트가 이 단계에서 할 수 있는 것:

- 기능 8, 9, 10 검증

## 7. 더미 데이터 요청

최소 요구:

- 개발자 계정 1개 이상
- 의뢰인 계정 1개 이상
- 프로젝트 10건 이상
- 지원서 여러 건

추천 seed:

### 7.1 사용자

```txt
developer1 / 1234 / DEVELOPER
client1 / 1234 / CLIENT
```

### 7.2 프로젝트

프로젝트는 최소 10건 이상이어야 합니다.

다양성:

- 도급 프로젝트 6건 이상
- 상주 프로젝트 4건 이상
- 최신순 검증을 위한 서로 다른 `createdAt`
- 금액 높은 순/낮은 순 검증을 위한 다양한 금액
- 마감 임박 순 검증을 위한 다양한 `deadline`
- 페이지네이션 검증을 위한 3페이지 이상 데이터
  - size=4 기준 10건이면 3페이지가 됩니다.

### 7.3 지원서

지원자 더보기 검증을 위해 특정 의뢰인 프로젝트 하나에는 지원서 3건 이상이 있으면 좋습니다.

이유:

- 지원자 리스트 size=2
- 1페이지: 2건
- 2페이지: 1건
- 2페이지에서는 더보기 버튼이 disabled 또는 hidden 되는지 검증 가능

## 8. 프론트 구현 계획과 백엔드 영향

프론트는 현재 랜딩 위젯 중심 구조이므로, 과제 기능 중심으로 아래처럼 재구성할 예정입니다.

### 8.1 라우팅

이전 설계에서는 `window.history` 기반 라우팅을 고려했지만, 백엔드 fallback 오해를 줄이기 위해 우선은 hash route를 추천합니다.

권장 프론트 경로:

```txt
/#/
/#/projects/1
/#/projects/1/apply
/#/login
/#/mypage
```

이 방식이면 Spring Boot가 `/projects/1` 같은 경로를 처리할 필요가 없습니다.

만약 BrowserRouter 방식이 필요하면 백엔드가 `/api/**`, `/files/**`를 제외한 모든 경로에 `index.html`을 반환하는 SPA fallback을 제공해야 합니다.

### 8.2 헤더

프론트 헤더는 평가에 필요한 항목 위주로 단순화할 예정입니다.

필수:

- 프로젝트 찾기
- 마이페이지 또는 로그인
- 무료 견적 의뢰
- 로그아웃

회원가입은 요구사항에서 생략이므로 구현하지 않습니다.

### 8.3 프로젝트 목록

현재 프론트 mock:

- `filterProjects()`로 프론트 정렬/필터

실제 API 연결 후:

- `GET /api/projects` 호출
- 쿼리 변경 시 서버 재요청
- 프론트는 받은 순서 그대로 렌더링

### 8.4 이미지

프로필 이미지 업로드는 프론트에서 `FormData`로 보냅니다.

```ts
const formData = new FormData()
formData.append('image', file)

fetch('/api/developer/profile/image', {
  method: 'POST',
  credentials: 'include',
  body: formData,
})
```

주의:

- 프론트에서 `Content-Type: multipart/form-data`를 직접 넣지 않습니다.
- 브라우저가 boundary를 포함해 자동 설정하게 둡니다.

## 9. 서로 꼭 맞춰야 하는 결정 사항

아래 항목은 백엔드/프론트가 다르게 구현하면 연결에서 꼬일 수 있습니다.

### 9.1 Role 이름

백엔드 현재:

```txt
DEVELOPER
CLIENT
```

프론트도 그대로 받겠습니다.

### 9.2 고용형태 이름

추천:

```txt
outsourcing
resident
```

백엔드 enum을 대문자로 하고 싶다면:

```txt
OUTSOURCING
RESIDENT
```

프론트는 매핑할 수 있습니다. 다만 API 문서에는 한 가지로 통일해 주세요.

### 9.3 프로젝트 목록 page 시작 번호

추천:

```txt
page=1부터 시작
```

Spring Page 기본은 0부터 시작하는 경우가 많지만, 프론트와 요구사항 시연에서는 1부터가 자연스럽습니다.

백엔드 내부에서 `page - 1`로 변환하는 방식을 추천합니다.

### 9.4 금액 단위

요구사항은 만원 단위입니다.

추천:

```txt
budgetMin: 4000
budgetMax: 5000
monthlyWage: 500
bidAmount: 4500
```

위 값은 모두 “만원”입니다.

### 9.5 지원서 연락처 검증

프론트와 백엔드 둘 다 검증합니다.

차단 예시:

```txt
test@example.com
010-1234-5678
01012345678
```

백엔드는 이미 이메일/전화번호 포함 여부 검출 유틸이 있으므로 지원 생성 API에서 반드시 사용하면 좋습니다.

## 10. 백엔드에게 지금 바로 요청하는 작업

가장 먼저 아래 작업을 부탁드립니다.

### 10.1 Auth

- `UserRepository`
- seed 계정
  - `developer1 / 1234 / DEVELOPER`
  - `client1 / 1234 / CLIENT`
- `POST /api/login`
- `GET /api/session`
- `POST /api/logout`

### 10.2 Project

- `Project` 엔티티
- 프로젝트 seed 10건 이상
- `GET /api/projects?type=&sort=&page=&size=4`
- `GET /api/projects/{projectId}`

이 두 API가 나오면 프론트는 기능 1, 2와 상세 화면을 바로 연결할 수 있습니다.

### 10.3 Application

- `Application` 엔티티
- `POST /api/projects/{projectId}/applications`
- 지원 내용 연락처 차단
- 지원 성공 시 지원자 수 증가
- `GET /api/developer/applications`
- `GET /api/developer/applications/{applicationId}`

여기까지 나오면 기능 5, 6, 7 검증이 가능합니다.

## 11. 검수 체크리스트

백엔드와 프론트가 함께 확인할 항목입니다.

### 기능 1

- 프로젝트 형태 변경 시 네트워크 요청 발생
- 정렬 변경 시 네트워크 요청 발생
- 응답 순서가 서버 정렬 결과인지 확인

### 기능 2

- page size가 4인지 확인
- 페이지 변경 시 네트워크 요청 발생

### 기능 3

- 태그 x 삭제 가능
- 태그 5개 초과 차단
- 프로필 필드 수정 후 DB 반영

### 기능 4

- multipart 이미지 업로드
- 서버 로컬 폴더에 파일 존재
- DB에 경로 또는 파일명 저장
- 화면이 반환 경로로 이미지 갱신

### 기능 5

- 개발자 마이페이지에 지원 프로젝트 목록 표시

### 기능 6

- 나의 지원서 버튼 클릭 시 이전 작성 내용 전체 표시

### 기능 7

- 도급/상주 폼 분기
- 지원 내용 연락처 차단
- 지원 성공 후 지원자 수 증가
- 개발자 마이페이지에 지원서 등록

### 기능 8

- 의뢰 프로젝트 필수 10개 필드 저장

### 기능 9

- 의뢰 프로젝트 상세에 요약 표시
- 지원자 리스트 더보기 size=2
- 마지막 페이지에서 더보기 hidden 또는 disabled

### 기능 10

- 지원자 상세보기 클릭 시 지원서 전체 내용 표시

## 12. 열린 질문

백엔드와 빠르게 결정해야 할 질문입니다.

1. API enum 값은 소문자 문자열(`outsourcing`)로 갈까요, 대문자 enum(`OUTSOURCING`)으로 갈까요?
2. `ApiResponse`와 `PageResponse`의 실제 필드명이 무엇인가요?
3. page 번호는 1부터 받을 수 있나요?
4. 프로젝트 생성 시 `kickoffSchedule` 필드를 추가해도 될까요?
5. 파일 접근 URL은 `/files/profile/...` 그대로 프론트에서 접근 가능한가요?
6. Spring Boot와 Vite dev server를 분리해서 개발할 때 CORS 허용 origin은 무엇인가요?
7. 최종 제출 시 React build를 Spring Boot 정적 리소스로 넣을 계획인가요, 아니면 프론트/백엔드를 따로 실행할 계획인가요?

## 13. 결론

현재 가장 중요한 것은 백엔드가 프로젝트 목록 API를 서버 필터/정렬/페이지네이션 방식으로 먼저 만들어주는 것입니다.

프론트는 그 API가 나오면 기존 mock `ProjectBoard`를 실제 API 호출로 바꾸고, 평가 기능 1, 2를 먼저 완성할 수 있습니다.

그 다음 프로젝트 상세/지원 API를 붙이면 기능 7과 개발자 마이페이지 기능 5, 6으로 자연스럽게 이어집니다.

의뢰인 기능 8, 9, 10은 프로젝트와 지원서 도메인이 어느 정도 완성된 뒤 진행하는 것이 가장 안전합니다.
