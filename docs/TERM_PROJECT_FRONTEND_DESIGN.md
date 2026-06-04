# 텀프로젝트 프론트엔드 설계

기준 문서:

- `docs/TERM_PROJECT_REQUIRMENTS.md`
- `docs/FREEMOA_UI_REFERENCE.md`

목표는 프리모아의 공개 화면 스타일을 참고하되, 평가 요구사항 10개 기능을 빠짐없이 검증 가능한 SPA 화면으로 구현하는 것이다.

## 1. 설계 원칙

- React CSR SPA로 구현한다. SSR 프레임워크나 서버 렌더링은 사용하지 않는다.
- 인증은 세션 쿠키 기반으로 전제한다. 프론트 요청은 `credentials: 'include'`를 기본으로 둔다.
- 프로젝트 필터, 정렬, 페이지네이션은 프론트 배열 조작이 아니라 서버 API 재요청으로 처리한다.
- 프로필 이미지는 클라이언트 코드나 `public`에 두지 않는다. 사용자가 선택한 파일을 multipart/form-data로 서버에 업로드하고, 화면에는 서버가 반환한 이미지 URL 또는 경로를 사용한다.
- 현재 프로젝트의 FSD 성격 구조를 유지한다: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- 첫 화면은 마케팅 랜딩보다 프로젝트 찾기 경험을 우선한다. 프리모아 `m4/s41` 화면을 기준으로 정보 밀도 높은 리스트 UI를 만든다.

## 2. 기능 매핑

| 기능 | 요구사항 | 화면 | 핵심 구현 |
| --- | --- | --- | --- |
| 1 | 프로젝트 형태/정렬별 표시 | 프로젝트 찾기 | `GET /api/projects` 재요청 |
| 2 | 페이지네이션 size=4 | 프로젝트 찾기 | page 변경마다 서버 호출 |
| 3 | 개발자 프로필 수정 | 개발자 마이페이지 | 태그 x 삭제, 5개 초과 알림 |
| 4 | 프로필 이미지 업로드 | 개발자 마이페이지 | multipart 업로드, 서버 경로 반영 |
| 5 | 지원 프로젝트 목록 | 개발자 마이페이지 | 지원 목록 API |
| 6 | 나의 지원서 열람 | 개발자 마이페이지 | 지원서 상세 모달 |
| 7 | 프로젝트 지원 | 상세/지원하기 | 도급/상주 폼 분기, 연락처 차단 |
| 8 | 의뢰 프로젝트 생성 | 의뢰인 마이페이지 | 필수 10개 필드 등록 |
| 9 | 의뢰 프로젝트 상세/지원자 더보기 | 의뢰인 마이페이지 | 지원자 size=2 더보기 |
| 10 | 지원서 상세 열람 | 의뢰인 마이페이지 | 지원자 지원서 모달 |

## 3. 라우팅 설계

외부 라우터를 추가하지 않아도 구현 가능하게, `window.history` 기반의 얕은 클라이언트 라우터를 우선 고려한다. 필요하면 이후 `react-router-dom`으로 치환할 수 있게 페이지 경계는 명확히 나눈다.

| 경로 | 페이지 | 접근 |
| --- | --- | --- |
| `/` | `ProjectListPage` | 공통 |
| `/projects/:projectId` | `ProjectDetailPage` | 공통 |
| `/projects/:projectId/apply` | `ProjectApplyPage` | 개발자 |
| `/login` | `LoginPage` | 비로그인 |
| `/mypage` | `MyPageRouter` | 로그인 |
| `/mypage/developer` | `DeveloperMyPage` | 개발자 |
| `/mypage/client` | `ClientMyPage` | 의뢰인 |

`/mypage`는 세션의 `role`을 보고 개발자 또는 의뢰인 화면으로 분기한다. 헤더의 마이페이지 버튼도 같은 규칙으로 이동한다.

## 4. 화면 설계

### 4.1 공통 레이아웃

참고 이미지: `docs/freemoa-reference/screenshots/01-home.png`, `05-login.png`

- `AppShell`: 고정 헤더, 본문, 푸터를 감싼다.
- `SiteHeader`: 로고, 프로젝트, 파트너스, 포트폴리오 검색, 이용후기, 더보기, 로그인/마이페이지, 무료 견적 의뢰 버튼.
- 로그인 상태:
  - 개발자: `마이페이지`, `로그아웃`
  - 의뢰인: `마이페이지`, `무료 견적 의뢰`, `로그아웃`
- 비로그인 상태:
  - `로그인`, `무료 견적 의뢰`

### 4.2 프로젝트 찾기

참고 이미지: `docs/freemoa-reference/screenshots/02-project-list.png`

구성:

- 상단 검색 박스는 선택 구현이다. 평가 핵심은 프로젝트 형태/정렬/페이지다.
- 좌측 필터 패널:
  - 전체
  - 도급(원격)
  - 상주
- 상단 우측 정렬 select:
  - 프리모아 기본정렬
  - 최신 등록 순
  - 금액 높은 순
  - 금액 낮은 순
  - 마감 임박 순
- 프로젝트 카드:
  - 제목
  - 도급/기간제 상주 뱃지
  - 모집중/마감 뱃지
  - 기술 스택 chip
  - 예상 비용 또는 월 임금
  - 예상 기간
  - 지원자 수
  - 마감 D-day
- 페이지네이션:
  - page size는 `4`
  - 페이지 변경 시 `GET /api/projects?...page=&size=4` 호출

주의:

- 현재 `src/entities/project/lib/filterProjects.ts`는 mock 데이터용 프론트 정렬이다. 실제 과제 연결 단계에서는 서버 응답 확인용 mock에만 남기거나 제거한다.

### 4.3 프로젝트 상세

구성:

- 상단 요약 카드:
  - 고용형태 뱃지
  - 모집 상태 뱃지
  - 등록일
  - 프로젝트명
  - 월 임금 또는 예상 비용
  - 예상 기간
  - 지원자 수
  - 마감 D-day
  - 관련 기술
- 탭은 만들더라도 `요약`만 활성화한다.
- 개발자 로그인 상태이면 `지원하기` 버튼을 노출한다.

### 4.4 프로젝트 지원하기

구성:

- 프로젝트 요약 영역:
  - 모집 마감일
  - 예상 킥오프 일정
  - 고용형태
  - 프로젝트 분야
  - 진행 분류
  - 기획 상태
  - 미팅 희망 지역
- 도급 폼:
  - 작업기간(일)
  - 지원 금액(만원)
  - 지원 내용
  - 인원수는 hidden 또는 readonly `1`
- 상주 폼:
  - 기술구분
  - 연차구분
  - 인원수
  - 임금(만원)
  - 지원 내용
- 제출 전 연락처 검증:
  - 이메일: `\S+@\S+\.\S+`
  - 전화번호: `\d{2,3}-\d{3,4}-\d{4}` 및 숫자만 10~11자리 패턴

지원 성공 후:

- `POST /api/projects/:projectId/applications`
- 개발자 마이페이지 지원 목록에 추가
- 프로젝트 목록/상세의 지원자 수 증가

### 4.5 개발자 마이페이지

참고 이미지: `docs/freemoa-reference/screenshots/07-partner-detail.png`

탭:

- 프로젝트 관리
- 프로필 관리

프로젝트 관리:

- 지원한 프로젝트 리스트
- 표시 항목:
  - 프로젝트 제목
  - 견적
  - 지원자 수
  - 과업일수
  - 상세보기 버튼
- 상세보기 클릭 시 `나의 지원서` 버튼 노출
- `나의 지원서` 클릭 시 지원서 전체 내용 모달

프로필 관리:

- 좌측 프로필 카드와 우측 폼 구조
- 수정 필드:
  - 프로필 이미지
  - 지원분야: 개발, 디자인, 기획
  - 활동가능여부
  - 상주가능여부
  - 지역: 도/시 2단 셀렉트
  - 형태: 개인프리랜서, 팀프리랜서, 개인사업자, 법인사업자
  - 경력연차
  - 검색태그
  - 소개글
- 검색태그:
  - chip + x 버튼
  - 5개 등록 시 추가 차단 및 안내
- 이미지:
  - `POST /api/developer/profile/image`
  - `FormData` 사용
  - `Content-Type`은 브라우저가 설정하게 두고 직접 지정하지 않는다.

### 4.6 의뢰인 마이페이지

참고 이미지: `docs/freemoa-reference/screenshots/04-project-register.png`

탭:

- 프로젝트 의뢰하기
- 프로젝트 관리

프로젝트 의뢰하기:

- 필수 필드:
  - 프로젝트명
  - 모집마감일
  - 고용형태: 도급외주, 상주
  - 예산: 도급은 제작예산, 상주는 월급여
  - 프로젝트 분야: 개발, 디자인, 기획 다중 선택
  - 기획상태
  - 미팅 희망 지역
  - 업무내용
  - 프로젝트 진행 방식
  - 필요 기술 스택 다중 입력

프로젝트 관리:

- 등록한 프로젝트 리스트:
  - 프로젝트명
  - 예상 금액
  - 계약 형태
  - 지원자 수
  - 모집 마감일
  - D-day
  - 상세보기 버튼
- 상세 화면:
  - 의뢰 내용 요약
  - 지원자 리스트 테이블
- 지원자 리스트:
  - 순번
  - 예상 금액
  - 지원일 또는 고용형태
  - 상세보기 버튼
  - 더보기 버튼
- 더보기:
  - `GET /api/client/projects/:projectId/applications?page=&size=2`
  - page size는 `2`
  - 마지막 페이지면 버튼 숨김 또는 disabled
- 지원서 상세보기:
  - 지원자가 입력한 지원서 전체 내용 모달

## 5. 데이터 모델

### 5.1 User

```ts
type UserRole = 'developer' | 'client'

type User = {
  id: number
  loginId: string
  name: string
  role: UserRole
}
```

### 5.2 Project

```ts
type EmploymentType = 'outsourcing' | 'resident'
type ProjectRecruitStatus = 'open' | 'closed'
type ProjectSort = 'freemoa' | 'latest' | 'highBudget' | 'lowBudget' | 'deadline'

type Project = {
  id: number
  clientId: number
  title: string
  employmentType: EmploymentType
  recruitStatus: ProjectRecruitStatus
  budgetMin: number
  budgetMax: number
  monthlyWage?: number
  expectedDurationDays: number
  applicationCount: number
  deadline: string
  kickoffDate?: string
  categories: Array<'개발' | '디자인' | '기획'>
  planningStatus: string
  meetingLocation: string
  workDescription: string
  workMethod: string
  skills: string[]
  createdAt: string
}
```

### 5.3 DeveloperProfile

```ts
type DeveloperProfile = {
  userId: number
  imageUrl: string
  fields: Array<'개발' | '디자인' | '기획'>
  available: boolean
  residentAvailable: boolean
  province: string
  city: string
  businessType: '개인프리랜서' | '팀프리랜서' | '개인사업자' | '법인사업자'
  careerYears: number
  tags: string[]
  introduction: string
}
```

### 5.4 Application

```ts
type ApplicationBase = {
  id: number
  projectId: number
  developerId: number
  employmentType: EmploymentType
  content: string
  createdAt: string
}

type OutsourcingApplication = ApplicationBase & {
  employmentType: 'outsourcing'
  workDays: number
  bidAmount: number
  headcount: 1
}

type ResidentApplication = ApplicationBase & {
  employmentType: 'resident'
  position: '개발자' | '디자이너' | '기획자' | '기타 포지션'
  careerLevel: '초급' | '중급' | '고급'
  headcount: number
  monthlyWage: number
}

type Application = OutsourcingApplication | ResidentApplication
```

## 6. API 계약

모든 세션 인증 요청은 쿠키 기반이다.

```ts
const request = fetch(url, {
  credentials: 'include',
})
```

### 6.1 Auth

| Method | URL | 설명 |
| --- | --- | --- |
| `GET` | `/api/session` | 현재 로그인 사용자 조회 |
| `POST` | `/api/login` | 세션 로그인 |
| `POST` | `/api/logout` | 세션 로그아웃 |

### 6.2 Project

| Method | URL | 설명 |
| --- | --- | --- |
| `GET` | `/api/projects?type=&sort=&page=&size=4` | 프로젝트 목록 |
| `GET` | `/api/projects/:projectId` | 프로젝트 상세 |
| `POST` | `/api/projects/:projectId/applications` | 프로젝트 지원 |

목록 쿼리:

```ts
type ProjectListQuery = {
  type: 'all' | 'outsourcing' | 'resident'
  sort: ProjectSort
  page: number
  size: 4
}
```

목록 응답:

```ts
type PageResponse<T> = {
  items: T[]
  page: number
  size: number
  totalItems: number
  totalPages: number
}
```

### 6.3 Developer

| Method | URL | 설명 |
| --- | --- | --- |
| `GET` | `/api/developer/profile` | 프로필 조회 |
| `PUT` | `/api/developer/profile` | 프로필 기본정보 수정 |
| `POST` | `/api/developer/profile/image` | 프로필 이미지 업로드 |
| `GET` | `/api/developer/applications` | 지원한 프로젝트 목록 |
| `GET` | `/api/developer/applications/:applicationId` | 나의 지원서 상세 |

### 6.4 Client

| Method | URL | 설명 |
| --- | --- | --- |
| `POST` | `/api/client/projects` | 프로젝트 의뢰 생성 |
| `GET` | `/api/client/projects` | 의뢰한 프로젝트 목록 |
| `GET` | `/api/client/projects/:projectId` | 의뢰 프로젝트 상세 |
| `GET` | `/api/client/projects/:projectId/applications?page=&size=2` | 지원자 더보기 |
| `GET` | `/api/client/applications/:applicationId` | 지원서 상세 |

## 7. 프론트엔드 모듈 구조

현재 구조를 확장한다.

```txt
src/
  app/
    App.tsx
    router/
      Router.tsx
      routes.ts
    styles/
  pages/
    project-list/
    project-detail/
    project-apply/
    login/
    mypage/
      developer/
      client/
  widgets/
    app-shell/
    site-header/
    site-footer/
    project-search-layout/
    mypage-layout/
  features/
    auth-session/
    project-filter/
    project-apply/
    developer-profile-edit/
    developer-application-view/
    client-project-create/
    client-applicant-list/
  entities/
    user/
    project/
    application/
    developer-profile/
  shared/
    api/
    lib/
      contactValidation.ts
      date.ts
      money.ts
    ui/
      Button.tsx
      Badge.tsx
      Modal.tsx
      Pagination.tsx
      TagInput.tsx
      FormField.tsx
```

## 8. 구현 순서

### Phase A: 기반 정리

- `App`에 CSR 라우터 추가
- `AppShell`과 공통 헤더 정리
- `shared/api/request.ts` 작성
- 도메인 타입 정리: user, project, application, profile
- mock API는 실제 API와 같은 응답 형태로 맞춘다.

### Phase B: 프로젝트 찾기

- 기존 `HomePage`를 `ProjectListPage` 중심으로 재구성
- 프로젝트 형태 필터와 정렬 select 구현
- API 요청 파라미터 변경 시 page를 1로 초기화
- 페이지네이션 size=4 고정
- 프론트 정렬 로직 제거 또는 mock 전용 격리

### Phase C: 프로젝트 상세/지원

- 상세 요약 화면
- 도급/상주 지원 폼 분기
- 연락처 차단 유틸 추가
- 지원 성공 후 상세/목록 지원자 수 갱신

### Phase D: 개발자 마이페이지

- 프로젝트 관리 탭
- 지원서 상세 모달
- 프로필 관리 탭
- 태그 입력 제한
- 이미지 업로드와 미리보기

### Phase E: 의뢰인 마이페이지

- 프로젝트 의뢰 폼
- 의뢰 프로젝트 목록
- 프로젝트 상세 + 지원자 리스트
- 더보기 size=2
- 지원서 상세 모달

### Phase F: 검수

- 기능 1~10 시연 순서 작성
- 서버 로그에서 이미지 업로드 확인
- 프론트에서 정렬하지 않는지 코드 확인
- JWT 관련 코드가 없는지 확인
- 더미 프로젝트 10건 이상, 도급/상주/금액/마감일 다양성 확인

## 9. 위험 요소와 결정

- 현재 홈은 프리모아 메인 랜딩에 가까워 평가의 프로젝트 찾기 화면과 다르다. 평가 우선으로 `/`를 프로젝트 찾기 화면으로 바꾼다.
- 참여파트 분류와 지역검색은 평가 제외다. UI를 만들더라도 핵심 흐름을 방해하지 않게 하며, 우선 구현에서는 제외한다.
- 프로젝트 상세 공개 캡처는 인증 때문에 확보하지 못했다. 상세 화면은 목록 카드와 요구사항 표시 항목을 기준으로 설계한다.
- 파트너 목록 캡처에는 공식 사이트 팝업이 떠 있다. 프로필/마이페이지 스타일은 `07-partner-detail.png`를 더 신뢰한다.
- 세션 기반 인증이므로 Authorization Bearer 헤더를 쓰지 않는다.

## 10. 시연 시나리오

1. 로그인 전 `/`에서 프로젝트 4개 노출 확인.
2. 프로젝트 형태를 `도급(원격)`으로 바꾸고 서버 요청 및 결과 확인.
3. 정렬을 `금액 높은 순`으로 바꾸고 서버 요청 및 결과 확인.
4. 2페이지로 이동하고 서버 요청 및 4개 단위 확인.
5. 개발자 로그인 후 프로젝트 상세에서 도급/상주별 지원 폼 확인.
6. 지원 내용에 이메일 또는 전화번호 입력 시 제출 차단 확인.
7. 정상 지원 후 개발자 마이페이지 지원 목록과 프로젝트 지원자 수 증가 확인.
8. 개발자 프로필 태그 삭제 및 5개 초과 알림 확인.
9. 프로필 이미지 업로드 후 서버 저장 경로와 화면 이미지 갱신 확인.
10. 의뢰인 로그인 후 프로젝트 의뢰 필수 필드 등록 확인.
11. 의뢰인 프로젝트 관리에서 지원자 리스트 더보기 size=2 확인.
12. 지원자 상세보기에서 지원서 전체 내용 확인.
