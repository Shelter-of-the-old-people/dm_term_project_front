import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { DeveloperProfileSection } from './DeveloperProfileSection'
import '../../project-apply/ui/project-apply-page.css'
import {
  getClientApplicationById,
  getClientProjectApplicants,
  getClientProjectById,
  getClientProjects,
  getDeveloperApplicationById,
  getDeveloperApplications,
  getProjectById,
} from '@/entities/project'
import type {
  ClientApplicantPage,
  ClientApplicationDetail,
  ClientProjectDetail,
  ClientProjectSummary,
  DeveloperApplicationDetail,
  DeveloperApplicationSummary,
  ProjectDetail,
} from '@/entities/project'
import { useSessionUser } from '@/shared/lib'
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
  item: {
    application: DeveloperApplicationDetail
    project: ProjectDetail | null
  } | null
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

const APPLICANT_PAGE_SIZE = 2
const currencyFormatter = new Intl.NumberFormat('ko-KR')

function formatEmploymentType(type: 'outsourcing' | 'resident') {
  return type === 'outsourcing' ? '도급외주' : '상주(기간제)'
}

function formatEmploymentTypeShort(type: 'outsourcing' | 'resident') {
  return type === 'outsourcing' ? '도급' : '기간제 상주'
}

function formatProjectDetailEmploymentType(type: ProjectDetail['type']) {
  return type === 'budget' ? '도급외주' : '상주(기간제)'
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

function formatDateTime(value: string) {
  return value.includes('T') ? value.replace('T', ' ').slice(0, 16) : value
}

function formatProjectBudget(project: ProjectDetail) {
  if (project.type === 'budget') {
    if (project.quoteLow !== project.quoteHigh) {
      return `${currencyFormatter.format(project.quoteLow)} ~ ${currencyFormatter.format(project.quoteHigh)}만원`
    }

    return `${currencyFormatter.format(project.quoteHigh)}만원`
  }

  return `${currencyFormatter.format(project.averageEstimate)}만원 / 월`
}

function formatApplyBudgetLabel(project: ProjectDetail | null, application: DeveloperApplicationDetail) {
  const isBudgetProject = project ? project.type === 'budget' : application.employmentType === 'outsourcing'
  return isBudgetProject ? '예상비용' : '월임금'
}

function formatApplyProjectBudget(project: ProjectDetail | null, application: DeveloperApplicationDetail) {
  if (project) {
    return formatProjectBudget(project)
  }

  return formatEstimateAmount(application.estimateAmount, application.employmentType)
}

function formatApplyDeadlineMetric(label: string) {
  if (!label) {
    return ''
  }

  return label.endsWith('일') ? label : `${label}일`
}

function formatApplyDeadlineValue(project: ProjectDetail | null, application: DeveloperApplicationDetail) {
  if (project) {
    return `${project.deadline} ${formatApplyDeadlineMetric(project.deadlineLabel)}`.trim()
  }

  return `${application.deadline} ${formatApplyDeadlineMetric(application.deadlineLabel)}`.trim()
}

function formatApplyPostedAtDisplay(date: string) {
  return date.replaceAll('-', '.')
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
  const [developerSearchKeyword, setDeveloperSearchKeyword] = useState('')
  const [isDeveloperDetailModalOpen, setIsDeveloperDetailModalOpen] = useState(false)
  const [isClientDetailModalOpen, setIsClientDetailModalOpen] = useState(false)
  const [isClientApplicationSheetVisible, setIsClientApplicationSheetVisible] = useState(false)
  const [isDeveloperApplicationSheetVisible, setIsDeveloperApplicationSheetVisible] = useState(false)
  const [isDeveloperApplicationSheetHighlighted, setIsDeveloperApplicationSheetHighlighted] =
    useState(false)

  const [developerListState, setDeveloperListState] = useState<DeveloperListState>({
    isLoading: false,
    errorMessage: null,
    items: [],
  })
  const [selectedDeveloperApplicationId, setSelectedDeveloperApplicationId] = useState<number | null>(
    null,
  )
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

  const filteredDeveloperItems = useMemo(() => {
    const keyword = developerSearchKeyword.trim().toLowerCase()
    if (!keyword) {
      return developerListState.items
    }

    return developerListState.items.filter((item) =>
      item.projectTitle.toLowerCase().includes(keyword),
    )
  }, [developerListState.items, developerSearchKeyword])

  const filteredClientProjects = clientProjectListState.items

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
      setIsDeveloperDetailModalOpen(false)
      setIsDeveloperApplicationSheetVisible(false)
      setIsDeveloperApplicationSheetHighlighted(false)
      return
    }

    let cancelled = false

    async function loadDeveloperApplications() {
      setDeveloperListState({
        isLoading: true,
        errorMessage: null,
        items: [],
      })
      setSelectedDeveloperApplicationId(null)
      setDeveloperDetailState({
        isLoading: false,
        errorMessage: null,
        item: null,
      })
      setIsDeveloperDetailModalOpen(false)
      setIsDeveloperApplicationSheetVisible(false)
      setIsDeveloperApplicationSheetHighlighted(false)

      try {
        const items = await getDeveloperApplications()
        if (cancelled) {
          return
        }

        setDeveloperListState({
          isLoading: false,
          errorMessage: null,
          items,
        })

      } catch (error) {
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
      }
    }
    void loadDeveloperApplications()

    return () => {
      cancelled = true
    }
  }, [sessionUser])

  useEffect(() => {
    if (!isDeveloperDetailModalOpen && !isClientDetailModalOpen) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (isDeveloperDetailModalOpen) {
          handleCloseDeveloperDetailModal()
        }

        if (isClientDetailModalOpen) {
          handleCloseClientDetailModal()
        }
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isClientDetailModalOpen, isDeveloperDetailModalOpen])

  useEffect(() => {
    if (!isDeveloperApplicationSheetHighlighted) {
      return
    }

    const timeout = window.setTimeout(() => {
      setIsDeveloperApplicationSheetHighlighted(false)
    }, 1600)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [isDeveloperApplicationSheetHighlighted])

  useEffect(() => {
    if (!sessionUser || sessionUser.role !== 'client') {
      setIsClientDetailModalOpen(false)
      setIsClientApplicationSheetVisible(false)
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

    async function loadClientProjectsList() {
      setIsClientDetailModalOpen(false)
      setIsClientApplicationSheetVisible(false)
      setClientProjectListState({
        isLoading: true,
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

      try {
        const items = await getClientProjects()
        if (cancelled) {
          return
        }

        setClientProjectListState({
          isLoading: false,
          errorMessage: null,
          items,
        })
      } catch (error) {
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
      }
    }

    void loadClientProjectsList()

    return () => {
      cancelled = true
    }
  }, [sessionUser])

  async function handleSelectDeveloperApplication(applicationId: number) {
    if (
      selectedDeveloperApplicationId === applicationId &&
      developerDetailState.item?.application.applicationId === applicationId
    ) {
      setIsDeveloperDetailModalOpen(true)
      return
    }

    setSelectedDeveloperApplicationId(applicationId)
    setIsDeveloperApplicationSheetVisible(false)
    setIsDeveloperApplicationSheetHighlighted(false)
    setIsDeveloperDetailModalOpen(true)
    setDeveloperDetailState({
      isLoading: true,
      errorMessage: null,
      item: null,
    })

    try {
      const application = await getDeveloperApplicationById(applicationId)
      let project: ProjectDetail | null = null

      try {
        project = await getProjectById(application.projectId)
      } catch {
        project = null
      }

      setDeveloperDetailState({
        isLoading: false,
        errorMessage: null,
        item: {
          application,
          project,
        },
      })
    } catch (error) {
      setDeveloperDetailState({
        isLoading: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : '지원서 상세 내용을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        item: null,
      })
    }
  }

  function handleCloseDeveloperDetailModal() {
    setIsDeveloperDetailModalOpen(false)
    setIsDeveloperApplicationSheetVisible(false)
    setIsDeveloperApplicationSheetHighlighted(false)
  }

  function handleClickDeveloperApplicationSheet() {
    setIsDeveloperApplicationSheetVisible(true)
    setIsDeveloperApplicationSheetHighlighted(true)

    window.requestAnimationFrame(() => {
      const applicationSheet = document.getElementById('developer-application-sheet')
      applicationSheet?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (applicationSheet instanceof HTMLElement) {
        applicationSheet.focus()
      }
    })
  }

  function handleCloseClientDetailModal() {
    setIsClientDetailModalOpen(false)
    setIsClientApplicationSheetVisible(false)
  }

  function handleBackToClientProjectOverview() {
    setIsClientApplicationSheetVisible(false)
  }

  async function handleSelectClientProject(projectId: number) {
    if (selectedClientProjectId === projectId && clientProjectDetailState.item?.id === projectId) {
      setIsClientDetailModalOpen(true)
      return
    }

    setIsClientDetailModalOpen(true)
    setIsClientApplicationSheetVisible(false)
    setSelectedClientProjectId(projectId)
    setClientProjectDetailState({
      isLoading: true,
      errorMessage: null,
      item: null,
    })
    setClientApplicantState({
      isLoading: true,
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

    try {
      const [projectDetail, applicantPage] = await Promise.all([
        getClientProjectById(projectId),
        getClientProjectApplicants(projectId, 1, APPLICANT_PAGE_SIZE),
      ])

      setClientProjectDetailState({
        isLoading: false,
        errorMessage: null,
        item: projectDetail,
      })
      setClientApplicantState({
        isLoading: false,
        isLoadingMore: false,
        errorMessage: null,
        page: applicantPage.page,
        totalPages: applicantPage.totalPages,
        hasNext: applicantPage.hasNext,
        items: applicantPage.items,
      })
    } catch (error) {
      setClientProjectDetailState({
        isLoading: false,
        errorMessage:
          error instanceof Error ? error.message : '프로젝트 상세 정보를 불러오지 못했습니다.',
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

    setClientApplicantState((current) => ({
      ...current,
      isLoadingMore: true,
      errorMessage: null,
    }))

    try {
      const applicantPage = await getClientProjectApplicants(
        selectedClientProjectId,
        clientApplicantState.page + 1,
        APPLICANT_PAGE_SIZE,
      )

      setClientApplicantState((current) => ({
        isLoading: false,
        isLoadingMore: false,
        errorMessage: null,
        page: applicantPage.page,
        totalPages: applicantPage.totalPages,
        hasNext: applicantPage.hasNext,
        items: [...current.items, ...applicantPage.items],
      }))
    } catch (error) {
      setClientApplicantState((current) => ({
        ...current,
        isLoadingMore: false,
        errorMessage:
          error instanceof Error ? error.message : '지원자 목록을 더 불러오지 못했습니다.',
      }))
    }
  }

  async function handleSelectClientApplication(applicationId: number) {
    setIsClientApplicationSheetVisible(true)

    if (
      selectedClientApplicationId === applicationId &&
      clientApplicationDetailState.item?.applicationId === applicationId
    ) {
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
        errorMessage:
          error instanceof Error ? error.message : '지원서 상세 내용을 불러오지 못했습니다.',
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
          description="마이페이지는 로그인한 사용자만 이용할 수 있습니다."
          actionHref="/m0/s02"
          actionLabel="로그인 페이지로 이동"
        />
      </PageShell>
    )
  }

  return sessionUser.role === 'developer' ? (
    <PageShell>
      <section className="overflow-hidden rounded-[8px] border border-[#ececec] bg-page shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
        <div className="border-b border-[#efefef] bg-white px-6">
          <div className="flex flex-wrap gap-8">
            <WorkspaceTab
              isActive={developerTab === 'projects'}
              onClick={() => setDeveloperTab('projects')}
            >
              프로젝트관리
            </WorkspaceTab>
            <WorkspaceTab
              isActive={developerTab === 'profile'}
              onClick={() => setDeveloperTab('profile')}
            >
              프로필관리
            </WorkspaceTab>
          </div>
        </div>

        {developerTab === 'projects' ? (
          <div>
            <div className="flex flex-col gap-4 border-b border-line px-6 py-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-11 items-center justify-center rounded-full border border-[#2e3135] px-7 text-[15px] font-semibold text-[#2e3135]">
                  전체 프로젝트
                </span>
              </div>

              <SearchInput
                value={developerSearchKeyword}
                placeholder="제목을 검색하세요."
                onChange={setDeveloperSearchKeyword}
              />
            </div>

            <div className="border-b border-line px-6">
              <div className="flex gap-8 overflow-x-auto">
                <span className="relative inline-flex pb-4 pt-5 text-[15px] font-semibold text-[#ff7a00] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#ff7a00] after:content-['']">
                  전체({filteredDeveloperItems.length})
                </span>
              </div>
            </div>

            {developerListState.isLoading ? (
              <InlineState>지원한 프로젝트 목록을 불러오는 중입니다.</InlineState>
            ) : null}
            {developerListState.errorMessage ? (
              <InlineState tone="error">{developerListState.errorMessage}</InlineState>
            ) : null}
            {!developerListState.isLoading &&
            !developerListState.errorMessage &&
            filteredDeveloperItems.length === 0 ? (
              <InlineState>조건에 맞는 지원 프로젝트가 없습니다.</InlineState>
            ) : null}

            {!developerListState.isLoading &&
            !developerListState.errorMessage &&
            filteredDeveloperItems.length > 0 ? (
              <div>
                {filteredDeveloperItems.map((item) => {
                  const isActive =
                    isDeveloperDetailModalOpen && selectedDeveloperApplicationId === item.applicationId

                  return (
                    <article
                      key={item.applicationId}
                      className={`border-b border-line px-6 py-5 ${
                        isActive ? 'bg-[#fcfcfc]' : 'bg-page'
                      }`}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-[#ff8b2b] px-4 text-[14px] font-semibold text-[#ff8b2b]">
                            지원
                          </span>
                          <p className="truncate text-[16px] font-semibold text-ink">{item.projectTitle}</p>
                        </div>

                        <InlineMeta label="견적" value={formatEstimateAmount(item.estimateAmount, item.employmentType)} />
                        <InlineMeta label="지원자수" value={`${item.applicationCount}명 지원`} />
                        <InlineMeta label="과업일수" value={formatTaskDays(item)} />

                        <button
                          type="button"
                          onClick={() => void handleSelectDeveloperApplication(item.applicationId)}
                          className={`inline-flex h-11 shrink-0 items-center justify-center rounded-[4px] border px-5 text-sm font-semibold ${
                            isActive
                              ? 'border-[#ff8b2b] bg-[#fff7ef] text-[#ff8b2b]'
                              : 'border-line bg-page text-dim'
                          }`}
                        >
                          상세열기
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : null}

            {!isDeveloperDetailModalOpen && developerDetailState.isLoading ? (
              <InlineState>지원서 상세 내용을 불러오는 중입니다.</InlineState>
            ) : null}
            {!isDeveloperDetailModalOpen && developerDetailState.errorMessage ? (
              <InlineState tone="error">{developerDetailState.errorMessage}</InlineState>
            ) : null}
          </div>
        ) : (
          <DeveloperProfileSection />
        )}
      </section>
      {isDeveloperDetailModalOpen ? (
        <DetailModal onClose={handleCloseDeveloperDetailModal}>
          {developerDetailState.isLoading ? (
            <InlineState>지원서 상세 내용을 불러오는 중입니다.</InlineState>
          ) : developerDetailState.errorMessage ? (
            <InlineState tone="error">{developerDetailState.errorMessage}</InlineState>
          ) : developerDetailState.item ? (
            isDeveloperApplicationSheetVisible ? (
              <DeveloperApplicationReadonlyCard
                project={developerDetailState.item.project}
                item={developerDetailState.item.application}
                isHighlighted={isDeveloperApplicationSheetHighlighted}
              />
            ) : (
              <DeveloperProjectSummaryCard
                project={developerDetailState.item.project}
                application={developerDetailState.item.application}
                onClickApplication={handleClickDeveloperApplicationSheet}
              />
            )
          ) : (
            <InlineState>상세 내용을 불러오지 못했습니다.</InlineState>
          )}
        </DetailModal>
      ) : null}
    </PageShell>
  ) : (
    <PageShell>
      <section className="overflow-hidden rounded-[8px] border border-[#ececec] bg-page shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap gap-8 border-b border-[#efefef] bg-white px-6">
          <WorkspaceTab href="/m4/regProject">프로젝트 의뢰하기</WorkspaceTab>
          <WorkspaceTab isActive>프로젝트 관리</WorkspaceTab>
        </div>

        {clientProjectListState.isLoading ? (
          <InlineState>프로젝트 목록을 불러오는 중입니다.</InlineState>
        ) : null}
        {clientProjectListState.errorMessage ? (
          <InlineState tone="error">{clientProjectListState.errorMessage}</InlineState>
        ) : null}
        {!clientProjectListState.isLoading &&
        !clientProjectListState.errorMessage &&
        filteredClientProjects.length === 0 ? (
          <InlineState>조건에 맞는 프로젝트가 없습니다.</InlineState>
        ) : null}

        {!clientProjectListState.isLoading &&
        !clientProjectListState.errorMessage &&
        filteredClientProjects.length > 0 ? (
          <div className="overflow-x-auto px-6 py-6">
            <table className="min-w-full border-separate border-spacing-0 overflow-hidden rounded-[10px] border border-[#e9e9e9] bg-white text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <thead>
                <tr>
                  <TableHeaderCell>프로젝트명</TableHeaderCell>
                  <TableHeaderCell>예상 금액</TableHeaderCell>
                  <TableHeaderCell>계약 형태</TableHeaderCell>
                  <TableHeaderCell>지원자 수</TableHeaderCell>
                  <TableHeaderCell>모집 마감일</TableHeaderCell>
                  <TableHeaderCell>D day</TableHeaderCell>
                  <TableHeaderCell className="w-[110px] text-center">상세보기</TableHeaderCell>
                </tr>
              </thead>
              <tbody>
                {filteredClientProjects.map((item) => {
                  const isActive =
                    isClientDetailModalOpen && selectedClientProjectId === item.id

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isActive ? 'bg-[#fff8ef]' : 'bg-page hover:bg-[#fffdf9]'
                      }`}
                    >
                      <TableBodyCell>{item.title}</TableBodyCell>
                      <TableBodyCell>{formatClientProjectBudget(item)}</TableBodyCell>
                      <TableBodyCell>{formatEmploymentTypeShort(item.employmentType)}</TableBodyCell>
                      <TableBodyCell>{item.applicationCount}명</TableBodyCell>
                      <TableBodyCell>{item.deadline}</TableBodyCell>
                      <TableBodyCell>{item.deadlineLabel}</TableBodyCell>
                      <TableBodyCell className="text-center">
                        <button
                          type="button"
                          onClick={() => void handleSelectClientProject(item.id)}
                          className="inline-flex h-9 min-w-[78px] items-center justify-center rounded-full border border-[#ff8b2b] bg-[#fff7ef] px-4 text-[14px] font-semibold text-[#ff8b2b] transition hover:bg-[#fff0dc]"
                        >
                          상세
                        </button>
                      </TableBodyCell>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
      {isClientDetailModalOpen ? (
        <DetailModal onClose={handleCloseClientDetailModal}>
          {isClientApplicationSheetVisible ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBackToClientProjectOverview}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#dddddd] bg-page px-4 text-[14px] font-semibold text-dim transition hover:border-[#ff8b2b] hover:text-[#ff8b2b]"
                >
                  지원자 목록으로
                </button>
                {clientApplicationDetailState.item ? (
                  <p className="text-[13px] text-pale">
                    지원자 {clientApplicationDetailState.item.developerName}
                  </p>
                ) : null}
              </div>

              {clientApplicationDetailState.isLoading ? (
                <section className="rounded-[4px] border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                  <InlineState>지원서 상세 내용을 불러오는 중입니다.</InlineState>
                </section>
              ) : null}
              {clientApplicationDetailState.errorMessage ? (
                <section className="rounded-[4px] border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                  <InlineState tone="error">{clientApplicationDetailState.errorMessage}</InlineState>
                </section>
              ) : null}
              {clientApplicationDetailState.item && clientProjectDetailState.item ? (
                <ClientApplicationReadonlyCard
                  project={clientProjectDetailState.item}
                  item={clientApplicationDetailState.item}
                />
              ) : null}
            </section>
          ) : (
            <section className="rounded-[10px] border border-[#ececec] bg-page shadow-[0_1px_8px_rgba(0,0,0,0.05)]">
              {clientProjectDetailState.isLoading ? (
                <InlineState>프로젝트 상세 정보를 불러오는 중입니다.</InlineState>
              ) : null}
              {clientProjectDetailState.errorMessage ? (
                <InlineState tone="error">{clientProjectDetailState.errorMessage}</InlineState>
              ) : null}
              {clientProjectDetailState.item ? (
                <div className="px-7 py-7">
                  <ClientProjectSummarySection item={clientProjectDetailState.item} />

                  <div className="mt-8 rounded-[10px] border border-[#ededed] bg-white p-6">
                    <h3 className="text-[16px] font-semibold text-ink">
                      {`지원자 리스트 (${clientProjectDetailState.item.applicationCount}명)`}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="mt-5 min-w-full border-separate border-spacing-0 overflow-hidden rounded-[10px] border border-[#e9e9e9] bg-white text-left">
                        <thead>
                          <tr>
                            <TableHeaderCell>순번</TableHeaderCell>
                            <TableHeaderCell>예상 금액</TableHeaderCell>
                            <TableHeaderCell>지원일(고용형태)</TableHeaderCell>
                            <TableHeaderCell className="w-[110px] text-center">상세보기</TableHeaderCell>
                          </tr>
                        </thead>
                        <tbody>
                          {clientApplicantState.items.map((item, index) => (
                            <tr key={item.applicationId} className="bg-page transition-colors hover:bg-[#fffdf9]">
                              <TableBodyCell>{index + 1}</TableBodyCell>
                              <TableBodyCell>
                                {formatEstimateAmount(item.expectedAmount, item.employmentType)}
                              </TableBodyCell>
                              <TableBodyCell>
                                <div className="space-y-1">
                                  <div>{formatDateTime(item.createdAt)}</div>
                                  <div className="text-[12px] text-[#666]">
                                    {formatEmploymentTypeShort(item.employmentType)}
                                  </div>
                                </div>
                              </TableBodyCell>
                              <TableBodyCell className="text-center">
                                <button
                                  type="button"
                                  onClick={() => void handleSelectClientApplication(item.applicationId)}
                                  className="inline-flex h-9 min-w-[78px] items-center justify-center rounded-full border border-[#ff8b2b] bg-[#fff7ef] px-4 text-[14px] font-semibold text-[#ff8b2b] transition hover:bg-[#fff0dc]"
                                >
                                  상세
                                </button>
                              </TableBodyCell>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {clientApplicantState.isLoading ? (
                      <InlineState>지원자 목록을 불러오는 중입니다.</InlineState>
                    ) : null}
                    {clientApplicantState.errorMessage ? (
                      <InlineState tone="error">{clientApplicantState.errorMessage}</InlineState>
                    ) : null}

                    {clientApplicantState.hasNext ? (
                      <div className="mt-6 flex justify-center">
                        <button
                          type="button"
                          onClick={() => void handleLoadMoreClientApplicants()}
                          disabled={clientApplicantState.isLoadingMore}
                          className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-full bg-[#ff8b2b] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ff7a00] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {clientApplicantState.isLoadingMore ? '불러오는 중...' : '더보기'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>
          )}
        </DetailModal>
      ) : null}
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
      <main className={`mx-auto px-5 py-16 ${compact ? 'max-w-[720px]' : 'max-w-[1280px]'}`}>{children}</main>
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
    <section className="rounded-[4px] border border-line bg-page p-8 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-3 text-base leading-7 text-dim">{description}</p>
      {actionHref && actionLabel ? (
        <a
          href={actionHref}
          className="mt-8 inline-flex h-11 items-center justify-center rounded-[4px] bg-[#39b9ea] px-6 text-sm font-semibold text-white"
        >
          {actionLabel}
        </a>
      ) : null}
    </section>
  )
}

function WorkspaceTab({
  children,
  isActive = false,
  onClick,
  href,
}: {
  children: ReactNode
  isActive?: boolean
  onClick?: () => void
  href?: string
}) {
  const className = `relative inline-flex h-[56px] items-center justify-center whitespace-nowrap text-[15px] font-semibold transition-colors ${
    isActive
      ? "text-[#ff7a00] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#ff7a00] after:content-['']"
      : 'text-[#7b7b7b] hover:text-ink'
  }`

  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  }

  if (!onClick) {
    return <span className={className}>{children}</span>
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}

function SearchInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex h-11 w-full max-w-[320px] items-center rounded-[4px] border border-line bg-page px-4">
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full text-[14px] text-ink outline-none placeholder:text-pale"
      />
      <span className="ml-3 text-[18px] text-pale">⌕</span>
    </div>
  )
}

function InlineState({
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

function InlineMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-[15px] text-[#333] xl:shrink-0">
      <span className="text-pale">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  )
}

function ProjectSummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line p-6 xl:p-7">
      <p className="text-[13px] text-pale">{label}</p>
      <p className="mt-3 text-[15px] font-semibold text-ink">{value}</p>
    </div>
  )
}

function DeveloperProjectSummaryCard({
  project,
  application,
  onClickApplication,
}: {
  project: ProjectDetail | null
  application: DeveloperApplicationDetail
  onClickApplication: () => void
}) {
  const title = project?.title ?? application.projectTitle

  return (
    <section className="rounded-[4px] border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
        <h3 className="text-[20px] font-semibold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onClickApplication}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#ff8b2b] px-6 text-[15px] font-semibold text-white"
        >
          나의 지원서
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3">
        <ProjectSummaryCell
          label="모집방식"
          value={project ? formatProjectDetailEmploymentType(project.type) : formatEmploymentType(application.employmentType)}
        />
        <ProjectSummaryCell
          label="예상기간"
          value={project ? `${project.averagePeriodDays}일` : `${application.expectedDurationDays}일`}
        />
        <ProjectSummaryCell
          label="예상비용"
          value={project ? formatProjectBudget(project) : formatEstimateAmount(application.estimateAmount, application.employmentType)}
        />
        <ProjectSummaryCell label="지원자" value={`${application.applicationCount}명`} />
        <ProjectSummaryCell label="분야" value={project ? project.categories.join(', ') : '-'} />
        <ProjectSummaryCell label="기획 상태" value={project?.planningStatus ?? '-'} />
        <ProjectSummaryCell label="예상 킥오프" value={project?.kickoffSchedule ?? '-'} />
        <ProjectSummaryCell label="미팅 희망지역" value={project?.meetingLocation ?? '-'} />
        <ProjectSummaryCell
          label="모집 마감일"
          value={project ? `${project.deadline} ${project.deadlineLabel}` : `${application.deadline} ${application.deadlineLabel}`}
        />
      </div>
    </section>
  )
}

function ReadonlyApplySectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="project-apply-section-title">{children}</h2>
}

function ReadonlyApplySummaryRows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="project-apply-summary-list">
      {rows.map(([label, value]) => (
        <div key={`${label}-${value}`} className="project-apply-summary-list__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ReadonlyApplyField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="project-apply-field">
      <div className="project-apply-field__header">
        <label className="project-apply-field__label">{label}</label>
      </div>
      {hint ? <p className="project-apply-field__hint">{hint}</p> : null}
      {children}
    </section>
  )
}

function ReadonlyApplyHelperText({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'alert'
}) {
  return (
    <p className={`project-apply-helper-text${tone === 'alert' ? ' project-apply-helper-text--alert' : ''}`}>
      {children}
    </p>
  )
}

function ReadonlyApplyUnitInput({
  value,
  unit,
  placeholder,
}: {
  value: string
  unit: string
  placeholder: string
}) {
  return (
    <div className="project-apply-unit-input project-apply-unit-input--readonly">
      <input
        value={value}
        readOnly
        placeholder={placeholder}
        className="project-apply-unit-input__input"
      />
      <span className="project-apply-unit-input__unit">{unit}</span>
    </div>
  )
}

function ReadonlyApplySelectValue({
  value,
  placeholder,
}: {
  value: string
  placeholder: string
}) {
  return (
    <div className="project-apply-select project-apply-select--readonly">
      {value || placeholder}
    </div>
  )
}

function ReadonlyApplyTextArea({
  value,
  placeholder,
}: {
  value: string
  placeholder: string
}) {
  return (
    <textarea
      value={value}
      readOnly
      placeholder={placeholder}
      className="project-apply-textarea project-apply-textarea--readonly"
    />
  )
}

function DeveloperApplicationReadonlyCard({
  project,
  item,
  isHighlighted,
}: {
  project: ProjectDetail | null
  item: DeveloperApplicationDetail
  isHighlighted: boolean
}) {
  const descriptionParts = []
  if (project?.postedAt) {
    descriptionParts.push(`등록일 ${formatApplyPostedAtDisplay(project.postedAt)}`)
  }
  descriptionParts.push(
    `${formatApplyBudgetLabel(project, item)} ${formatApplyProjectBudget(project, item)}`,
  )

  return (
    <section
      id="developer-application-sheet"
      tabIndex={-1}
      className={`project-apply-card outline-none transition ${
        isHighlighted
          ? 'border-[#ff8b2b] ring-4 ring-[rgba(255,139,43,0.18)]'
          : 'border-line'
      }`}
    >
      <header className="project-apply-card__header">
        <h3 className="project-apply-card__title">{project?.title ?? item.projectTitle}</h3>
        <p className="project-apply-card__description">{descriptionParts.join(' · ')}</p>
      </header>

      <section className="project-apply-summary">
        <ReadonlyApplySectionTitle>요약</ReadonlyApplySectionTitle>
        <ReadonlyApplySummaryRows
          rows={[
            ['모집 마감일', formatApplyDeadlineValue(project, item)],
            ['예상 킥오프 일정', project?.kickoffSchedule ?? '-'],
            [
              '고용형태',
              project ? formatProjectDetailEmploymentType(project.type) : formatEmploymentType(item.employmentType),
            ],
            ['프로젝트 분야', project ? project.categories.join(',') : '-'],
            ['진행 분류', project?.progressType ?? '-'],
            ['기획 상태', project?.planningStatus ?? '-'],
            ['미팅 희망 지역', project?.meetingLocation ?? '-'],
          ]}
        />
      </section>

      <section className="project-apply-form-section">
        {item.employmentType === 'outsourcing' ? (
          <div className="project-apply-form">
            <ReadonlyApplyField label="작업기간" hint="실제 진행 가능한 합리적인 기간을 제안해주세요.">
              <ReadonlyApplyUnitInput
                value={item.workDays ? String(item.workDays) : ''}
                unit="일"
                placeholder="숫자만 입력"
              />
            </ReadonlyApplyField>

            <ReadonlyApplyField
              label="지원 금액"
              hint="작업 기간과 투입 범위를 고려해 진행 가능한 금액을 제안해주세요."
            >
              <ReadonlyApplyUnitInput
                value={item.bidAmount ? String(item.bidAmount) : ''}
                unit="만원"
                placeholder="만원 단위로 입력"
              />
              <ReadonlyApplyHelperText tone="alert">
                * 만원 단위로 작성하고, 프리모아 이용료 10%를 포함하여 입력합니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>

            <ReadonlyApplyField
              label="지원 내용"
              hint="프로젝트 이해도, 작업 범위, 일정, 구현 방식을 중심으로 작성해주세요."
            >
              <ReadonlyApplyTextArea
                value={item.content}
                placeholder={`<프로젝트 진행 제안>
프로젝트 이해도, 작업 범위, 일정 계획을 중심으로 작성해주세요.

<관련 경험 및 강점>
유사한 프로젝트 경험과 본 프로젝트에 적합한 강점을 작성해주세요.`}
              />
              <ReadonlyApplyHelperText tone="alert">
                * 이메일, 전화번호 등 직접 연락처를 공유하여 거래를 유도할 경우 서비스 이용에 제재를 받을 수 있습니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>
          </div>
        ) : (
          <div className="project-apply-form">
            <ReadonlyApplyField
              label="지원 금액"
              hint="기술구분, 연차구분, 인원수, 임금을 순서대로 입력해주세요."
            >
              <div className="space-y-3">
                {item.onsiteLines.map((line) => (
                  <div
                    key={`${line.position}-${line.sortOrder}`}
                    className="project-apply-grid project-apply-grid--resident"
                  >
                    <ReadonlyApplySelectValue value={line.position} placeholder="기술구분" />
                    <ReadonlyApplySelectValue value={line.careerLevel} placeholder="연차구분" />
                    <ReadonlyApplyUnitInput
                      value={String(line.headcount)}
                      unit="명"
                      placeholder="인원수"
                    />
                    <ReadonlyApplyUnitInput
                      value={String(line.monthlyWage)}
                      unit="만원"
                      placeholder="임금"
                    />
                  </div>
                ))}
              </div>
              <ReadonlyApplyHelperText tone="alert">
                * 인원 및 임금은 만원 단위로 기입하고, 상주 프로젝트는 월임금 기준으로 입력합니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>

            <ReadonlyApplyField
              label="지원 내용"
              hint="실제 투입 가능 시점, 관련 경험, 작업 방식을 중심으로 작성해주세요."
            >
              <ReadonlyApplyTextArea
                value={item.content}
                placeholder={`<투입 가능 시점>
프로젝트에 참여 가능한 시점과 근무 형태를 구체적으로 작성해주세요.

<관련 경험 및 작업 방식>
해당 역할, 작업 경험, 프로젝트 기여 방안을 작성해주세요.`}
              />
              <ReadonlyApplyHelperText tone="alert">
                * 이메일, 전화번호 등 직접 연락처를 공유하여 거래를 유도할 경우 서비스 이용에 제재를 받을 수 있습니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>
          </div>
        )}
      </section>
    </section>
  )
}

function ClientApplicationReadonlyCard({
  project,
  item,
}: {
  project: ClientProjectDetail
  item: ClientApplicationDetail
}) {
  const descriptionParts = [
    `지원자 ${item.developerName}`,
    `지원일 ${formatDateTime(item.createdAt)}`,
    formatEmploymentType(item.employmentType),
  ]

  if (item.employmentType === 'outsourcing') {
    if (item.bidAmount) {
      descriptionParts.push(`지원 금액 ${currencyFormatter.format(item.bidAmount)}만원`)
    }
    if (item.workDays) {
      descriptionParts.push(`작업기간 ${item.workDays}일`)
    }
  } else {
    descriptionParts.push(`제안 인원 ${item.headcount}명`)
  }

  return (
    <section className="project-apply-card">
      <header className="project-apply-card__header">
        <h3 className="project-apply-card__title">{project.title}</h3>
        <p className="project-apply-card__description">{descriptionParts.join(' · ')}</p>
      </header>

      <section className="project-apply-summary">
        <ReadonlyApplySectionTitle>요약</ReadonlyApplySectionTitle>
        <ReadonlyApplySummaryRows
          rows={[
            ['모집 마감일', `${project.deadline} ${project.deadlineLabel}`],
            ['예상 킥오프 일정', project.kickoffSchedule],
            ['고용형태', formatEmploymentType(project.employmentType)],
            ['프로젝트 분야', project.categories.join(',')],
            ['진행 분류', project.progressType],
            ['기획 상태', project.planningStatus],
            ['미팅 희망 지역', project.meetingLocation],
          ]}
        />
      </section>

      <section className="project-apply-form-section">
        {item.employmentType === 'outsourcing' ? (
          <div className="project-apply-form">
            <ReadonlyApplyField label="작업기간" hint="실제 진행 가능한 합리적인 기간을 제안해주세요.">
              <ReadonlyApplyUnitInput
                value={item.workDays ? String(item.workDays) : ''}
                unit="일"
                placeholder="숫자만 입력"
              />
            </ReadonlyApplyField>

            <ReadonlyApplyField
              label="지원 금액"
              hint="작업 기간과 투입 범위를 고려해 진행 가능한 금액을 제안해주세요."
            >
              <ReadonlyApplyUnitInput
                value={item.bidAmount ? String(item.bidAmount) : ''}
                unit="만원"
                placeholder="만원 단위로 입력"
              />
              <ReadonlyApplyHelperText tone="alert">
                * 만원 단위로 작성하고, 프리모아 이용료 10%를 포함하여 입력합니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>

            <ReadonlyApplyField
              label="지원 내용"
              hint="프로젝트 이해도, 작업 범위, 일정, 구현 방식을 중심으로 작성해주세요."
            >
              <ReadonlyApplyTextArea
                value={item.content}
                placeholder={`<프로젝트 진행 제안>
프로젝트 이해도, 작업 범위, 일정 계획을 중심으로 작성해주세요.

<관련 경험 및 강점>
유사한 프로젝트 경험과 본 프로젝트에 적합한 강점을 작성해주세요.`}
              />
              <ReadonlyApplyHelperText tone="alert">
                * 이메일, 전화번호 등 직접 연락처를 공유하여 거래를 유도할 경우 서비스 이용에 제재를 받을 수 있습니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>
          </div>
        ) : (
          <div className="project-apply-form">
            <ReadonlyApplyField
              label="지원 금액"
              hint="기술구분, 연차구분, 인원수, 임금을 순서대로 입력해주세요."
            >
              {item.onsiteLines.length > 0 ? (
                <div className="space-y-3">
                  {item.onsiteLines.map((line) => (
                    <div
                      key={`${line.position}-${line.sortOrder}`}
                      className="project-apply-grid project-apply-grid--resident"
                    >
                      <ReadonlyApplySelectValue value={line.position} placeholder="기술구분" />
                      <ReadonlyApplySelectValue value={line.careerLevel} placeholder="연차구분" />
                      <ReadonlyApplyUnitInput
                        value={String(line.headcount)}
                        unit="명"
                        placeholder="인원수"
                      />
                      <ReadonlyApplyUnitInput
                        value={String(line.monthlyWage)}
                        unit="만원"
                        placeholder="임금"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[4px] border border-line bg-[#fafafa] px-4 py-4 text-[13px] text-dim">
                  등록된 상주 제안 정보가 없습니다.
                </div>
              )}
              <ReadonlyApplyHelperText tone="alert">
                * 인원 및 임금은 만원 단위로 기입하고, 상주 프로젝트는 월임금 기준으로 입력합니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>

            <ReadonlyApplyField
              label="지원 내용"
              hint="실제 투입 가능 시점, 관련 경험, 작업 방식을 중심으로 작성해주세요."
            >
              <ReadonlyApplyTextArea
                value={item.content}
                placeholder={`<투입 가능 시점>
프로젝트에 참여 가능한 시점과 근무 형태를 구체적으로 작성해주세요.

<관련 경험 및 작업 방식>
해당 역할, 작업 경험, 프로젝트 기여 방안을 작성해주세요.`}
              />
              <ReadonlyApplyHelperText tone="alert">
                * 이메일, 전화번호 등 직접 연락처를 공유하여 거래를 유도할 경우 서비스 이용에 제재를 받을 수 있습니다.
              </ReadonlyApplyHelperText>
            </ReadonlyApplyField>
          </div>
        )}
      </section>
    </section>
  )
}

function DetailModal({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(17,24,39,0.55)] px-5 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-[calc(100vh-64px)] w-full max-w-[1180px] overflow-y-auto rounded-[12px] border border-[#ececec] bg-[#fbfbfb] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-[20px] font-semibold text-ink">상세열기</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dddddd] bg-page text-[20px] text-dim transition hover:border-[#ff8b2b] hover:text-[#ff8b2b]"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function TableHeaderCell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <th
      className={`border-b border-[#ededed] bg-[#fcfcfc] px-4 py-4 text-[14px] font-semibold text-[#555] ${className}`}
    >
      {children}
    </th>
  )
}

function TableBodyCell({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <td className={`border-b border-[#f1f1f1] px-4 py-4 text-[14px] text-[#222] align-top ${className}`}>
      {children}
    </td>
  )
}

function ClientProjectSummarySection({ item }: { item: ClientProjectDetail }) {
  return (
    <section>
      <ReadonlyApplySectionTitle>요약</ReadonlyApplySectionTitle>
      <ReadonlyApplySummaryRows
        rows={[
          ['모집 마감일', `${item.deadline} ${item.deadlineLabel}`],
          ['예상 킥오프 일정', item.kickoffSchedule],
          ['고용형태', formatEmploymentType(item.employmentType)],
          ['프로젝트 분야', item.categories.join(', ')],
          ['진행 분류', item.progressType],
          ['기획 상태', item.planningStatus],
          ['미팅 희망 지역', item.meetingLocation],
        ]}
      />
    </section>
  )
}
