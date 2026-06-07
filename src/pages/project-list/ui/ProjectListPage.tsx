import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Search } from 'lucide-react'

import { getProjects, PROJECT_PAGE_SIZE } from '@/entities/project'
import type { Project, ProjectPage, ProjectSort } from '@/entities/project'
import type { ProjectTypeFilter } from '@/features/project-filter'
import { Badge } from '@/shared/ui'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

const TYPE_OPTIONS: { label: string; value: ProjectTypeFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '도급(원격)', value: 'budget' },
  { label: '상주', value: 'resident' },
]

const SORT_OPTIONS: { label: string; value: ProjectSort }[] = [
  { label: '프리모아 기본정렬', value: 'freemoa' },
  { label: '최신 등록순', value: 'latest' },
  { label: '금액 높은 순', value: 'highBudget' },
  { label: '금액 낮은 순', value: 'lowBudget' },
  { label: '마감 임박 순', value: 'deadline' },
]

const POPULAR_KEYWORDS = ['앱플랫폼', '중개 플랫폼', '배달앱', '교육용 앱', '의료 서비스']

function readInitialPage() {
  const page = Number(new URLSearchParams(window.location.search).get('page') ?? '1')
  return Number.isFinite(page) && page > 0 ? page : 1
}

function formatProjectType(type: Project['type']) {
  return type === 'budget' ? '도급' : '상주'
}

function formatBudget(project: Project) {
  if (project.type === 'budget') {
    if (project.quoteLow === project.quoteHigh) {
      return `${project.quoteHigh.toLocaleString()}만원`
    }

    return `${project.quoteLow.toLocaleString()} ~ ${project.quoteHigh.toLocaleString()}만원`
  }

  return `${project.averageEstimate.toLocaleString()}만원 / 월`
}

function formatBudgetLabel(project: Project) {
  return project.type === 'budget' ? '예상 비용' : '월 임금'
}

function formatDeadlineLabel(project: Project) {
  if (project.deadlineDays <= 0) {
    return 'D-day'
  }

  return `D-${project.deadlineDays}`
}

function formatStatusTone(status: Project['status']) {
  if (status === '마감임박') {
    return 'orange'
  }

  if (status === '검수중') {
    return 'gray'
  }

  return 'blue'
}

function matchesSearch(project: Project, searchTerm: string) {
  if (!searchTerm.trim()) {
    return true
  }

  const normalized = searchTerm.trim().toLowerCase()
  const haystack = [
    project.title,
    project.summary,
    project.area,
    ...project.skills,
    ...project.categories,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalized)
}

export function ProjectListPage() {
  const [type, setType] = useState<ProjectTypeFilter>('all')
  const [sort, setSort] = useState<ProjectSort>('freemoa')
  const [page, setPage] = useState(readInitialPage)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectPage, setProjectPage] = useState<ProjectPage>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    setErrorMessage(null)

    void getProjects({
      type,
      sort,
      page,
      pageSize: PROJECT_PAGE_SIZE,
    })
      .then((nextPage) => {
        if (cancelled) {
          return
        }

        setProjectPage(nextPage)
        if (page > nextPage.totalPages) {
          setPage(nextPage.totalPages)
        }
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : '프로젝트 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        )
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [page, sort, type])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(page))
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
  }, [page])

  const visibleProjects = useMemo(
    () => projectPage.items.filter((project) => matchesSearch(project, searchTerm)),
    [projectPage.items, searchTerm],
  )

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-7">
        <section className="rounded-md border border-line bg-page px-8 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:items-center">
            <div>
              <h1 className="text-[30px] font-bold tracking-[-0.02em] text-ink">
                <span className="text-[#39b9ea]">프로젝트</span>를 찾아보세요.
              </h1>
              <p className="mt-4 text-[16px] leading-7 text-dim">
                진행하고자 하는 프로젝트에 적절한 견적과 분석 내용을 작성하여 지원해보세요.
              </p>
              <p className="mt-1 text-[16px] leading-7 text-dim">수주 가능성이 높아집니다.</p>
            </div>

            <div>
              <label className="block border-b-2 border-[#4fc4ee] pb-3">
                <span className="mb-3 block text-[15px] font-medium text-ink">
                  프로젝트 검색어를 입력해주세요.
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="프로젝트 검색어를 입력해주세요."
                    className="w-full border-none bg-transparent px-0 text-base text-ink outline-none placeholder:text-pale"
                  />
                  <Search size={22} className="shrink-0 text-[#39b9ea]" />
                </div>
              </label>

              <div className="mt-5 flex flex-wrap gap-2">
                {POPULAR_KEYWORDS.map((keyword) => (
                  <button
                    key={keyword}
                    type="button"
                    onClick={() => setSearchTerm(keyword)}
                    className="rounded-full border border-line bg-page px-4 py-1.5 text-[14px] text-dim transition-colors hover:border-brand hover:text-brand"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[186px_minmax(0,1fr)]">
          <aside className="self-start rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <div className="rounded-t-md bg-brand-solid px-5 py-4 text-sm font-semibold text-white">
              프로젝트 필터
            </div>
            <div className="border-b border-line px-5 py-3 text-[13px] text-dim">
              체크된 필터 항상 적용
            </div>

            <div className="px-5 py-5">
              <p className="mb-4 text-[15px] font-semibold text-ink">프로젝트 형태</p>
              <div className="space-y-3">
                {TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2.5 text-[14px] text-dim"
                  >
                    <input
                      type="radio"
                      name="project-type"
                      checked={type === option.value}
                      onChange={() => {
                        setType(option.value)
                        setPage(1)
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-3 flex justify-end">
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as ProjectSort)
                  setPage(1)
                }}
                className="h-10 rounded-md border border-line bg-page px-3 text-[13px] text-dim outline-none"
                aria-label="정렬"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="rounded-md border border-line bg-page px-5 py-12 text-center text-[14px] text-dim shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                프로젝트를 불러오는 중입니다.
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-md border border-[#ffd4d4] bg-[#fff5f5] px-5 py-12 text-center text-[14px] text-[#ba4545] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                {errorMessage}
              </div>
            ) : null}

            {!isLoading && !errorMessage ? (
              <div className="space-y-4">
                {visibleProjects.map((project) => (
                  <ProjectListCard key={project.id} project={project} />
                ))}
              </div>
            ) : null}

            {!isLoading && !errorMessage && visibleProjects.length === 0 ? (
              <div className="rounded-md border border-line bg-page px-5 py-12 text-center text-[14px] text-dim shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                표시할 프로젝트가 없습니다.
              </div>
            ) : null}

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-page text-dim disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm text-dim">
                {projectPage.page} / {projectPage.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((current) => Math.min(projectPage.totalPages, current + 1))}
                disabled={page >= projectPage.totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-page text-dim disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ProjectListCard({ project }: { project: Project }) {
  const categoryText = project.categories.join(',')

  return (
    <a
      href={`/m4/s41v?projectId=${project.id}`}
      className="block rounded-md border border-line bg-page p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] font-semibold leading-8 text-ink">{project.title}</h2>
          <p className="mt-2 text-[14px] text-[#ff8a35]">{categoryText}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="orange">{formatProjectType(project.type)}</Badge>
          <Badge tone={formatStatusTone(project.status)}>{project.status}</Badge>
          <span className="text-[#cfcfcf]">
            <Heart size={18} />
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-sm border border-[#e6e6e6] bg-page px-2.5 py-1 text-[12px] text-dim"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-sm bg-[#fafafa] px-4 py-4 text-[14px] text-dim">
        <div className="grid gap-3 sm:grid-cols-4 sm:divide-x sm:divide-[#e6e6e6]">
          <StatCell label={formatBudgetLabel(project)} value={formatBudget(project)} />
          <StatCell label="예상기간" value={`${project.averagePeriodDays}일`} />
          <StatCell label="지원자수" value={`${project.applicants}명`} />
          <StatCell label="마감일정" value={formatDeadlineLabel(project)} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div>
          <p className="text-[13px] leading-7 text-dim">
            ※ 프로젝트 요약 : {project.summary} · 회사 위치 : {project.area} · 등록일 :
            {' '}
            {project.postedAt.slice(0, 10)}
          </p>
        </div>

        <div className="border-t border-line pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ebf6fb] text-sm font-semibold text-[#58aed4]">
              {project.title.charAt(0)}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-ink">등록 계정</p>
              <p className="text-[13px] text-pale">{project.area}</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-[#ff8a35]">연락처 인증</p>
        </div>
      </div>
    </a>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="sm:px-4 sm:first:pl-0 sm:last:pr-0">
      <p className="text-[13px] text-pale">{label}</p>
      <p className="mt-2 font-semibold text-ink">{value}</p>
    </div>
  )
}
