import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { DeveloperProfileSection } from './DeveloperProfileSection'
import {
  getClientApplicationById,
  getClientProjectApplicants,
  getClientProjectById,
  getClientProjects,
  getDeveloperApplicationById,
  getDeveloperApplications,
} from '@/entities/project'
import type {
  ClientApplicantPage,
  ClientApplicationDetail,
  ClientProjectDetail,
  ClientProjectSummary,
  DeveloperApplicationDetail,
  DeveloperApplicationSummary,
} from '@/entities/project'
import { clearSessionUser, useSessionUser } from '@/shared/lib'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

type DeveloperListState = {
  isLoading: boolean
  errorMessage: string | null
  items: DeveloperApplicationSummary[]
}

type DeveloperDetailState = {
  isLoading: boolean
  errorMessage: string | null
  item: DeveloperApplicationDetail | null
}

type ClientProjectListState = {
  isLoading: boolean
  errorMessage: string | null
  items: ClientProjectSummary[]
}

type ClientProjectDetailState = {
  isLoading: boolean
  errorMessage: string | null
  item: ClientProjectDetail | null
}

type ClientApplicantState = {
  isLoading: boolean
  isLoadingMore: boolean
  errorMessage: string | null
  page: number
  totalPages: number
  hasNext: boolean
  items: ClientApplicantPage['items']
}

type ClientApplicationDetailState = {
  isLoading: boolean
  errorMessage: string | null
  item: ClientApplicationDetail | null
}

type DeveloperMyPageTab = 'projects' | 'profile'

const currencyFormatter = new Intl.NumberFormat('ko-KR')

function formatEmploymentType(type: 'outsourcing' | 'resident') {
  return type === 'outsourcing' ? '도급' : '상주'
}

function formatEstimateAmount(amount: number | null, type: 'outsourcing' | 'resident') {
  if (!amount) {
    return '-'
  }

  return type === 'outsourcing'
    ? `${currencyFormatter.format(amount)}만원`
    : `${currencyFormatter.format(amount)}만원 / 월`
}

function formatTaskDays(item: DeveloperApplicationSummary) {
  if (item.workDays) {
    return `${item.workDays}일`
  }

  return `${item.expectedDurationDays}일`
}

function formatDate(value: string) {
  return value.includes('T') ? value.replace('T', ' ').slice(0, 16) : value
}

function formatClientProjectBudget(project: ClientProjectSummary) {
  if (project.employmentType === 'outsourcing') {
    if (project.budgetMin && project.budgetMax && project.budgetMin !== project.budgetMax) {
      return `${currencyFormatter.format(project.budgetMin)} ~ ${currencyFormatter.format(project.budgetMax)}만원`
    }

    const amount = project.budgetMax ?? project.budgetMin
    return amount ? `${currencyFormatter.format(amount)}만원` : '-'
  }

  return project.monthlyWage ? `${currencyFormatter.format(project.monthlyWage)}만원 / 월` : '-'
}

export function MyPagePage() {
  const sessionUser = useSessionUser()
  const [developerTab, setDeveloperTab] = useState<DeveloperMyPageTab>('projects')
  const [developerListState, setDeveloperListState] = useState<DeveloperListState>({
    isLoading: false,
    errorMessage: null,
    items: [],
  })
  const [selectedDeveloperApplicationId, setSelectedDeveloperApplicationId] = useState<number | null>(null)
  const [developerDetailState, setDeveloperDetailState] = useState<DeveloperDetailState>({
    isLoading: false,
    errorMessage: null,
    item: null,
  })

  const [clientProjectListState, setClientProjectListState] = useState<ClientProjectListState>({
    isLoading: false,
    errorMessage: null,
    items: [],
  })
  const [selectedClientProjectId, setSelectedClientProjectId] = useState<number | null>(null)
  const [clientProjectDetailState, setClientProjectDetailState] = useState<ClientProjectDetailState>({
    isLoading: false,
    errorMessage: null,
    item: null,
  })
  const [clientApplicantState, setClientApplicantState] = useState<ClientApplicantState>({
    isLoading: false,
    isLoadingMore: false,
    errorMessage: null,
    page: 0,
    totalPages: 0,
    hasNext: false,
    items: [],
  })
  const [selectedClientApplicationId, setSelectedClientApplicationId] = useState<number | null>(null)
  const [clientApplicationDetailState, setClientApplicationDetailState] =
    useState<ClientApplicationDetailState>({
      isLoading: false,
      errorMessage: null,
      item: null,
    })

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== 'developer') {
      setDeveloperListState({
        isLoading: false,
        errorMessage: null,
        items: [],
      })
      setSelectedDeveloperApplicationId(null)
      setDeveloperDetailState({
        isLoading: false,
        errorMessage: null,
        item: null,
      })
      return
    }

    let cancelled = false

    setDeveloperListState({
      isLoading: true,
      errorMessage: null,
      items: [],
    })

    void getDeveloperApplications()
      .then((items) => {
        if (cancelled) {
          return
        }

        setDeveloperListState({
          isLoading: false,
          errorMessage: null,
          items,
        })
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setDeveloperListState({
          isLoading: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : '지원한 프로젝트 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          items: [],
        })
      })

    return () => {
      cancelled = true
    }
  }, [sessionUser])

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== 'client') {
      setClientProjectListState({
        isLoading: false,
        errorMessage: null,
        items: [],
      })
      setSelectedClientProjectId(null)
      setClientProjectDetailState({
        isLoading: false,
        errorMessage: null,
        item: null,
      })
      setClientApplicantState({
        isLoading: false,
        isLoadingMore: false,
        errorMessage: null,
        page: 0,
        totalPages: 0,
        hasNext: false,
        items: [],
      })
      setSelectedClientApplicationId(null)
      setClientApplicationDetailState({
        isLoading: false,
        errorMessage: null,
        item: null,
      })
      return
    }

    let cancelled = false

    setClientProjectListState({
      isLoading: true,
      errorMessage: null,
      items: [],
    })

    void getClientProjects()
      .then((items) => {
        if (cancelled) {
          return
        }

        setClientProjectListState({
          isLoading: false,
          errorMessage: null,
          items,
        })
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setClientProjectListState({
          isLoading: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : '등록한 프로젝트 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          items: [],
        })
      })

    return () => {
      cancelled = true
    }
  }, [sessionUser])

  async function handleSelectDeveloperApplication(applicationId: number) {
    if (
      selectedDeveloperApplicationId === applicationId &&
      developerDetailState.item?.applicationId === applicationId
    ) {
      setSelectedDeveloperApplicationId(null)
      setDeveloperDetailState({
        isLoading: false,
        errorMessage: null,
        item: null,
      })
      return
    }

    setSelectedDeveloperApplicationId(applicationId)
    setDeveloperDetailState({
      isLoading: true,
      errorMessage: null,
      item: null,
    })

    try {
      const item = await getDeveloperApplicationById(applicationId)
      setDeveloperDetailState({
        isLoading: false,
        errorMessage: null,
        item,
      })
    } catch (error) {
      setDeveloperDetailState({
        isLoading: false,
        errorMessage:
          error instanceof Error ? error.message : '지원서 상세를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        item: null,
      })
    }
  }

  async function loadClientApplicants(projectId: number, page: number, append: boolean) {
    setClientApplicantState((current) => ({
      ...current,
      isLoading: !append,
      isLoadingMore: append,
      errorMessage: null,
      ...(append ? {} : { items: [], page: 0, totalPages: 0, hasNext: false }),
    }))

    try {
      const applicantPage = await getClientProjectApplicants(projectId, page, 2)
      setClientApplicantState((current) => ({
        isLoading: false,
        isLoadingMore: false,
        errorMessage: null,
        page: applicantPage.page,
        totalPages: applicantPage.totalPages,
        hasNext: applicantPage.hasNext,
        items: append ? [...current.items, ...applicantPage.items] : applicantPage.items,
      }))
    } catch (error) {
      setClientApplicantState((current) => ({
        ...current,
        isLoading: false,
        isLoadingMore: false,
        errorMessage:
          error instanceof Error ? error.message : '지원자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      }))
    }
  }

  async function handleSelectClientProject(projectId: number) {
    setSelectedClientProjectId(projectId)
    setSelectedClientApplicationId(null)
    setClientApplicationDetailState({
      isLoading: false,
      errorMessage: null,
      item: null,
    })
    setClientProjectDetailState({
      isLoading: true,
      errorMessage: null,
      item: null,
    })

    try {
      const item = await getClientProjectById(projectId)
      setClientProjectDetailState({
        isLoading: false,
        errorMessage: null,
        item,
      })
      await loadClientApplicants(projectId, 1, false)
    } catch (error) {
      setClientProjectDetailState({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : '프로젝트 상세를 불러오지 못했습니다.',
        item: null,
      })
      setClientApplicantState({
        isLoading: false,
        isLoadingMore: false,
        errorMessage: null,
        page: 0,
        totalPages: 0,
        hasNext: false,
        items: [],
      })
    }
  }

  async function handleLoadMoreClientApplicants() {
    if (!selectedClientProjectId || !clientApplicantState.hasNext || clientApplicantState.isLoadingMore) {
      return
    }

    await loadClientApplicants(selectedClientProjectId, clientApplicantState.page + 1, true)
  }

  async function handleSelectClientApplication(applicationId: number) {
    if (
      selectedClientApplicationId === applicationId &&
      clientApplicationDetailState.item?.applicationId === applicationId
    ) {
      setSelectedClientApplicationId(null)
      setClientApplicationDetailState({
        isLoading: false,
        errorMessage: null,
        item: null,
      })
      return
    }

    setSelectedClientApplicationId(applicationId)
    setClientApplicationDetailState({
      isLoading: true,
      errorMessage: null,
      item: null,
    })

    try {
      const item = await getClientApplicationById(applicationId)
      setClientApplicationDetailState({
        isLoading: false,
        errorMessage: null,
        item,
      })
    } catch (error) {
      setClientApplicationDetailState({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : '지원서 상세를 불러오지 못했습니다.',
        item: null,
      })
    }
  }

  if (sessionUser === undefined) {
    return (
      <PageShell compact>
        <StatusSection
          title="세션을 확인하는 중입니다."
          description="로그인 상태를 확인한 뒤 마이페이지를 표시합니다."
        />
      </PageShell>
    )
  }

  if (!sessionUser) {
    return (
      <PageShell compact>
        <StatusSection
          title="로그인이 필요합니다."
          description="마이페이지는 로그인 이후에만 확인할 수 있습니다."
          actionHref="/m0/s02"
          actionLabel="로그인 페이지로 이동"
        />
      </PageShell>
    )
  }

  return sessionUser.role === 'developer' ? (
    <PageShell>
      <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div className="flex items-center gap-3">
            <TabButton isActive={developerTab === 'projects'} onClick={() => setDeveloperTab('projects')}>
              프로젝트 관리
            </TabButton>
            <TabButton isActive={developerTab === 'profile'} onClick={() => setDeveloperTab('profile')}>
              프로필 관리
            </TabButton>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/m4/s41?page=1"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#39b9ea] px-4 text-sm font-semibold text-white"
            >
              프로젝트 보러가기
            </a>
            <LogoutButton />
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-[14px] font-medium text-[#39b9ea]">
            {developerTab === 'projects' ? '지원한 프로젝트 보기' : '개발자 프로필 관리'}
          </p>
          <h1 className="mt-2 text-[28px] font-bold text-ink">
            {developerTab === 'projects'
              ? `${sessionUser.name}님의 프로젝트 지원 내역`
              : `${sessionUser.name}님의 개발자 프로필`}
          </h1>
          <p className="mt-3 text-[14px] leading-7 text-dim">
            {developerTab === 'projects'
              ? '지원한 프로젝트 목록과 제출한 지원서를 한 화면에서 확인할 수 있습니다.'
              : '지원 가능 분야와 근무 정보, 소개 문구와 프로필 이미지를 직접 관리할 수 있습니다.'}
          </p>
        </div>
      </section>

      {developerTab === 'projects' ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[18px] font-semibold text-ink">지원한 프로젝트 목록</h2>
            </div>

            {developerListState.isLoading ? (
              <CenteredState>지원한 프로젝트 목록을 불러오는 중입니다.</CenteredState>
            ) : null}
            {developerListState.errorMessage ? (
              <CenteredState tone="error">{developerListState.errorMessage}</CenteredState>
            ) : null}
            {!developerListState.isLoading &&
            !developerListState.errorMessage &&
            developerListState.items.length === 0 ? (
              <CenteredState>아직 지원한 프로젝트가 없습니다.</CenteredState>
            ) : null}

            {!developerListState.isLoading &&
            !developerListState.errorMessage &&
            developerListState.items.length > 0 ? (
              <div className="divide-y divide-line">
                {developerListState.items.map((item) => {
                  const isActive = selectedDeveloperApplicationId === item.applicationId

                  return (
                    <article
                      key={item.applicationId}
                      className={`px-6 py-5 transition ${isActive ? 'bg-[#f7fbff]' : 'bg-page'}`}
                    >
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.8fr)_1fr_0.9fr_0.9fr_0.8fr] md:items-center">
                        <div className="min-w-0">
                          <p className="text-[13px] text-pale">{formatEmploymentType(item.employmentType)}</p>
                          <h3 className="mt-1 truncate text-[16px] font-semibold text-ink">{item.projectTitle}</h3>
                        </div>
                        <MobileCell
                          label="견적"
                          value={formatEstimateAmount(item.estimateAmount, item.employmentType)}
                        />
                        <MobileCell label="지원자 수" value={`${item.applicationCount}명`} />
                        <MobileCell label="과업일수" value={formatTaskDays(item)} />
                        <button
                          type="button"
                          onClick={() => void handleSelectDeveloperApplication(item.applicationId)}
                          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-page px-4 text-sm font-semibold text-dim"
                        >
                          {isActive ? '닫기' : '상세보기'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </section>

          <aside className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[18px] font-semibold text-ink">내 지원서</h2>
              <p className="mt-2 text-[13px] leading-6 text-dim">
                목록에서 프로젝트를 선택하면 제출한 지원서 상세를 확인할 수 있습니다.
              </p>
            </div>

            {developerDetailState.isLoading ? <CenteredState>지원서 상세를 불러오는 중입니다.</CenteredState> : null}
            {developerDetailState.errorMessage ? (
              <CenteredState tone="error">{developerDetailState.errorMessage}</CenteredState>
            ) : null}
            {!developerDetailState.isLoading && !developerDetailState.errorMessage && !developerDetailState.item ? (
              <CenteredState>목록에서 프로젝트를 선택해주세요.</CenteredState>
            ) : null}
            {developerDetailState.item ? <DeveloperApplicationDetailPanel item={developerDetailState.item} /> : null}
          </aside>
        </section>
      ) : (
        <div className="mt-6">
          <DeveloperProfileSection />
        </div>
      )}
    </PageShell>
  ) : (
    <PageShell>
      <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <TabButton isActive>프로젝트 관리</TabButton>
          <div className="flex flex-wrap gap-3">
            <a
              href="/m4/regProject"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#39b9ea] px-4 text-sm font-semibold text-white"
            >
              프로젝트 등록하기
            </a>
            <LogoutButton />
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-[14px] font-medium text-[#39b9ea]">의뢰 프로젝트 관리</p>
          <h1 className="mt-2 text-[28px] font-bold text-ink">{sessionUser.name}님의 프로젝트 목록</h1>
          <p className="mt-3 text-[14px] leading-7 text-dim">
            등록한 프로젝트 요약, 지원자 리스트, 지원서 상세를 한 화면에서 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[18px] font-semibold text-ink">등록한 프로젝트 목록</h2>
            </div>

            {clientProjectListState.isLoading ? <CenteredState>프로젝트 목록을 불러오는 중입니다.</CenteredState> : null}
            {clientProjectListState.errorMessage ? (
              <CenteredState tone="error">{clientProjectListState.errorMessage}</CenteredState>
            ) : null}
            {!clientProjectListState.isLoading &&
            !clientProjectListState.errorMessage &&
            clientProjectListState.items.length === 0 ? (
              <CenteredState>등록한 프로젝트가 없습니다.</CenteredState>
            ) : null}

            {!clientProjectListState.isLoading &&
            !clientProjectListState.errorMessage &&
            clientProjectListState.items.length > 0 ? (
              <div className="divide-y divide-line">
                {clientProjectListState.items.map((item) => {
                  const isActive = selectedClientProjectId === item.id

                  return (
                    <article
                      key={item.id}
                      className={`px-6 py-5 transition ${isActive ? 'bg-[#f7fbff]' : 'bg-page'}`}
                    >
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.8fr)_1fr_0.9fr_0.8fr_0.9fr_0.8fr] md:items-center">
                        <div className="min-w-0">
                          <h3 className="truncate text-[16px] font-semibold text-ink">{item.title}</h3>
                        </div>
                        <MobileCell label="예상 금액" value={formatClientProjectBudget(item)} />
                        <MobileCell label="계약 형태" value={formatEmploymentType(item.employmentType)} />
                        <MobileCell label="지원자 수" value={`${item.applicationCount}명`} />
                        <MobileCell label="마감 일정" value={`${item.deadline} ${item.deadlineLabel}`} />
                        <button
                          type="button"
                          onClick={() => void handleSelectClientProject(item.id)}
                          className="inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-page px-4 text-sm font-semibold text-dim"
                        >
                          {isActive ? '새로고침' : '상세보기'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : null}
          </section>

          <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[18px] font-semibold text-ink">프로젝트 상세 및 지원자 목록</h2>
            </div>

            {clientProjectDetailState.isLoading ? <CenteredState>프로젝트 상세를 불러오는 중입니다.</CenteredState> : null}
            {clientProjectDetailState.errorMessage ? (
              <CenteredState tone="error">{clientProjectDetailState.errorMessage}</CenteredState>
            ) : null}
            {!clientProjectDetailState.isLoading &&
            !clientProjectDetailState.errorMessage &&
            !clientProjectDetailState.item ? (
              <CenteredState>프로젝트를 선택하면 상세와 지원자 목록이 표시됩니다.</CenteredState>
            ) : null}

            {clientProjectDetailState.item ? (
              <div className="px-6 py-6">
                <div className="rounded-sm border border-line bg-[#fafafa] px-4 py-4">
                  <h3 className="text-[20px] font-semibold text-ink">{clientProjectDetailState.item.title}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoCard
                      label="모집 마감일"
                      value={`${clientProjectDetailState.item.deadline} ${clientProjectDetailState.item.deadlineLabel}`}
                    />
                    <InfoCard label="예상 킥오프" value={clientProjectDetailState.item.kickoffSchedule} />
                    <InfoCard
                      label="고용형태"
                      value={formatEmploymentType(clientProjectDetailState.item.employmentType)}
                    />
                    <InfoCard
                      label="프로젝트 분야"
                      value={clientProjectDetailState.item.categories.join(', ')}
                    />
                    <InfoCard label="진행 분류" value={clientProjectDetailState.item.progressType} />
                    <InfoCard label="기획 상태" value={clientProjectDetailState.item.planningStatus} />
                    <InfoCard label="미팅 희망 지역" value={clientProjectDetailState.item.meetingLocation} />
                    <InfoCard label="지원자 수" value={`${clientProjectDetailState.item.applicationCount}명`} />
                  </div>
                  <ContentBlock title="업무 내용" value={clientProjectDetailState.item.workDescription} />
                  <ContentBlock title="프로젝트 진행 방식" value={clientProjectDetailState.item.workMethod} />
                </div>

                <div className="mt-6 rounded-sm border border-line bg-page">
                  <div className="border-b border-line px-4 py-3">
                    <h4 className="text-[16px] font-semibold text-ink">지원자 리스트</h4>
                    <p className="mt-1 text-[12px] text-pale">페이지 크기 2, 더보기 방식</p>
                  </div>

                  {clientApplicantState.isLoading ? <CenteredState>지원자 목록을 불러오는 중입니다.</CenteredState> : null}
                  {clientApplicantState.errorMessage ? (
                    <CenteredState tone="error">{clientApplicantState.errorMessage}</CenteredState>
                  ) : null}
                  {!clientApplicantState.isLoading &&
                  !clientApplicantState.errorMessage &&
                  clientApplicantState.items.length === 0 ? (
                    <CenteredState>아직 지원한 개발자가 없습니다.</CenteredState>
                  ) : null}

                  {!clientApplicantState.isLoading &&
                  !clientApplicantState.errorMessage &&
                  clientApplicantState.items.length > 0 ? (
                    <div className="space-y-3 px-4 py-4">
                      {clientApplicantState.items.map((item, index) => (
                        <div
                          key={item.applicationId}
                          className="rounded-sm border border-line bg-[#fafafa] px-4 py-4"
                        >
                          <div className="grid gap-3 md:grid-cols-[0.4fr_1fr_1fr_1fr_0.8fr] md:items-center">
                            <MobileCell label="순번" value={String(index + 1)} />
                            <MobileCell
                              label="예상 금액"
                              value={formatEstimateAmount(item.expectedAmount, item.employmentType)}
                            />
                            <MobileCell
                              label="지원일"
                              value={`${formatDate(item.createdAt)} (${formatEmploymentType(item.employmentType)})`}
                            />
                            <MobileCell label="개발자" value={item.developerName} />
                            <button
                              type="button"
                              onClick={() => void handleSelectClientApplication(item.applicationId)}
                              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-line bg-page px-4 text-sm font-semibold text-dim"
                            >
                              {selectedClientApplicationId === item.applicationId ? '닫기' : '상세보기'}
                            </button>
                          </div>
                        </div>
                      ))}

                      {clientApplicantState.hasNext ? (
                        <button
                          type="button"
                          onClick={() => void handleLoadMoreClientApplicants()}
                          disabled={clientApplicantState.isLoadingMore}
                          className="inline-flex h-11 items-center justify-center rounded-md border border-line bg-page px-5 text-sm font-semibold text-dim disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {clientApplicantState.isLoadingMore ? '불러오는 중...' : '더보기'}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-[18px] font-semibold text-ink">지원서 상세</h2>
            <p className="mt-2 text-[13px] leading-6 text-dim">
              지원자 리스트에서 상세보기를 누르면 해당 개발자의 지원서를 볼 수 있습니다.
            </p>
          </div>

          {clientApplicationDetailState.isLoading ? <CenteredState>지원서 상세를 불러오는 중입니다.</CenteredState> : null}
          {clientApplicationDetailState.errorMessage ? (
            <CenteredState tone="error">{clientApplicationDetailState.errorMessage}</CenteredState>
          ) : null}
          {!clientApplicationDetailState.isLoading &&
          !clientApplicationDetailState.errorMessage &&
          !clientApplicationDetailState.item ? (
            <CenteredState>지원자 상세보기를 선택해주세요.</CenteredState>
          ) : null}
          {clientApplicationDetailState.item ? (
            <ClientApplicationDetailPanel item={clientApplicationDetailState.item} />
          ) : null}
        </aside>
      </section>
    </PageShell>
  )
}

function PageShell({
  children,
  compact = false,
}: {
  children: ReactNode
  compact?: boolean
}) {
  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <SiteHeader />
      <main className={`mx-auto px-5 py-16 ${compact ? 'max-w-[720px]' : 'max-w-[1120px]'}`}>{children}</main>
      <SiteFooter />
    </div>
  )
}

function StatusSection({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <section className="rounded-md border border-line bg-page p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-3 text-base leading-7 text-dim">{description}</p>
      {actionHref && actionLabel ? (
        <a
          href={actionHref}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#39b9ea] px-6 text-sm font-semibold text-white"
        >
          {actionLabel}
        </a>
      ) : null}
    </section>
  )
}

function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => {
        void clearSessionUser().finally(() => {
          window.location.assign('/')
        })
      }}
      className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-page px-4 text-sm font-semibold text-dim"
    >
      로그아웃
    </button>
  )
}

function TabButton({
  children,
  isActive = false,
  onClick,
}: {
  children: ReactNode
  isActive?: boolean
  onClick?: () => void
}) {
  const className = `inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold ${
    isActive ? 'bg-[#39b9ea] text-white' : 'border border-line bg-page text-dim'
  }`

  if (!onClick) {
    return <span className={className}>{children}</span>
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}

function CenteredState({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'error'
}) {
  return (
    <div
      className={`px-6 py-12 text-center text-[14px] ${
        tone === 'error' ? 'text-[#ba4545]' : 'text-dim'
      }`}
    >
      {children}
    </div>
  )
}

function MobileCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-pale md:hidden">{label}</p>
      <p className="text-[14px] font-medium text-ink">{value}</p>
    </div>
  )
}

function DeveloperApplicationDetailPanel({ item }: { item: DeveloperApplicationDetail }) {
  return (
    <div className="px-6 py-6">
      <div className="rounded-sm border border-line bg-[#fafafa] px-4 py-4">
        <p className="text-[13px] text-pale">지원한 프로젝트 요약</p>
        <h3 className="mt-2 text-[18px] font-semibold text-ink">{item.projectTitle}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoCard label="고용형태" value={formatEmploymentType(item.employmentType)} />
          <InfoCard label="견적" value={formatEstimateAmount(item.estimateAmount, item.employmentType)} />
          <InfoCard label="지원자 수" value={`${item.applicationCount}명`} />
          <InfoCard label="마감 정보" value={item.deadlineLabel} />
        </div>
      </div>

      <div className="mt-5 rounded-sm border border-line bg-page">
        <div className="border-b border-line px-4 py-3">
          <h4 className="text-[16px] font-semibold text-ink">내가 제출한 지원서 내용</h4>
          <p className="mt-1 text-[12px] text-pale">지원일 {formatDate(item.createdAt)}</p>
        </div>

        {item.employmentType === 'outsourcing' ? (
          <div className="space-y-4 px-4 py-4">
            <InfoCard label="작업기간" value={item.workDays ? `${item.workDays}일` : '-'} />
            <InfoCard
              label="지원 금액"
              value={item.bidAmount ? `${currencyFormatter.format(item.bidAmount)}만원` : '-'}
            />
            <ContentBlock title="지원 내용" value={item.content} />
          </div>
        ) : (
          <div className="space-y-4 px-4 py-4">
            {item.onsiteLines.map((line) => (
              <div key={`${line.position}-${line.sortOrder}`} className="rounded-sm border border-line bg-[#fafafa] px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard label="기술구분" value={line.position} />
                  <InfoCard label="연차구분" value={line.careerLevel} />
                  <InfoCard label="인원수" value={`${line.headcount}명`} />
                  <InfoCard label="임금" value={`${currencyFormatter.format(line.monthlyWage)}만원`} />
                </div>
              </div>
            ))}
            <ContentBlock title="지원 내용" value={item.content} />
          </div>
        )}
      </div>

      <a
        href={`/m4/s41v?projectId=${item.projectId}`}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md border border-line bg-page px-5 text-sm font-semibold text-dim"
      >
        프로젝트 상세보기
      </a>
    </div>
  )
}

function ClientApplicationDetailPanel({ item }: { item: ClientApplicationDetail }) {
  return (
    <div className="px-6 py-6">
      <div className="rounded-sm border border-line bg-[#fafafa] px-4 py-4">
        <p className="text-[13px] text-pale">지원자 정보</p>
        <h3 className="mt-2 text-[18px] font-semibold text-ink">{item.developerName}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <InfoCard label="고용형태" value={formatEmploymentType(item.employmentType)} />
          <InfoCard label="지원일" value={formatDate(item.createdAt)} />
          <InfoCard label="인원수" value={`${item.headcount}명`} />
          <InfoCard label="프로젝트 번호" value={String(item.projectId)} />
        </div>
      </div>

      <div className="mt-5 rounded-sm border border-line bg-page">
        <div className="border-b border-line px-4 py-3">
          <h4 className="text-[16px] font-semibold text-ink">지원서 내용</h4>
        </div>

        {item.employmentType === 'outsourcing' ? (
          <div className="space-y-4 px-4 py-4">
            <InfoCard label="작업기간" value={item.workDays ? `${item.workDays}일` : '-'} />
            <InfoCard
              label="지원 금액"
              value={item.bidAmount ? `${currencyFormatter.format(item.bidAmount)}만원` : '-'}
            />
            <ContentBlock title="지원 내용" value={item.content} />
          </div>
        ) : (
          <div className="space-y-4 px-4 py-4">
            {item.onsiteLines.map((line) => (
              <div key={`${line.position}-${line.sortOrder}`} className="rounded-sm border border-line bg-[#fafafa] px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoCard label="기술구분" value={line.position} />
                  <InfoCard label="연차구분" value={line.careerLevel} />
                  <InfoCard label="인원수" value={`${line.headcount}명`} />
                  <InfoCard label="임금" value={`${currencyFormatter.format(line.monthlyWage)}만원`} />
                </div>
              </div>
            ))}
            <ContentBlock title="지원 내용" value={item.content} />
          </div>
        )}
      </div>
    </div>
  )
}

function ContentBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-5">
      <p className="text-[13px] text-pale">{title}</p>
      <p className="mt-2 rounded-sm border border-line bg-page px-4 py-4 text-[14px] leading-7 text-dim">
        {value}
      </p>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-line bg-page px-4 py-4">
      <p className="text-[12px] text-pale">{label}</p>
      <p className="mt-2 text-[14px] font-semibold text-ink">{value}</p>
    </div>
  )
}
