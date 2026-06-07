import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Heart, Search } from 'lucide-react'

import { getProjects, PROJECT_PAGE_SIZE } from '@/entities/project'
import type { Project, ProjectPage, ProjectSort } from '@/entities/project'
import type { ProjectTypeFilter } from '@/features/project-filter'
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

function readInitialPage() {
  const page = Number(new URLSearchParams(window.location.search).get('page') ?? '1')
  return Number.isFinite(page) && page > 0 ? page : 1
}

function formatProjectType(type: Project['type']) {
  return type === 'budget' ? '도급' : '기간제 상주'
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
  return project.type === 'budget' ? '예상비용' : '월 임금'
}

function formatDeadlineLabel(project: Project) {
  if (project.deadlineDays <= 0) {
    return 'D-day'
  }

  return `D-${project.deadlineDays}`
}

function formatStatusTone(status: Project['status']) {
  if (status === '마감') {
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

function formatCategoryLine(project: Project) {
  return project.categories.join(',')
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
  const pageNumbers = useMemo(
    () => Array.from({ length: projectPage.totalPages }, (_, index) => index + 1),
    [projectPage.totalPages],
  )

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-5 py-7">
        <section className="rounded-[6px] border border-[#e9e9e9] bg-page px-[44px] py-[31px] shadow-[0_1px_6px_rgba(0,0,0,0.07)]">
          <div className="grid gap-8 lg:grid-cols-[1fr_460px] lg:items-center">
            <div>
              <h1 className="text-[26px] font-semibold tracking-[-0.03em] text-ink">
                <span className="text-[#39b9ea]">프로젝트</span>를 찾아보세요.
              </h1>
            </div>

            <label className="block w-full justify-self-end border-b-[3px] border-[#39c4f5] pb-[10px] pt-[10px]">
              <div className="flex items-center gap-[13px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="프로젝트 검색어를 입력해주세요."
                  className="w-full border-none bg-transparent px-0 text-[14px] text-ink outline-none placeholder:text-[#c2c2c2]"
                />
                <Search size={24} strokeWidth={2.1} className="mt-[1px] shrink-0 text-[#39b9ea]" />
                <span className="mt-[1px] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#cfcfcf] text-white">
                  <ChevronDown size={15} strokeWidth={2.6} />
                </span>
              </div>
            </label>
          </div>
        </section>

        <section className="mt-[18px] grid gap-[20px] lg:grid-cols-[182px_minmax(0,1fr)]">
          <aside className="self-start overflow-hidden rounded-[8px] border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:mt-[46px]">
            <div className="bg-brand-solid px-5 py-4 text-sm font-semibold text-white">
              프로젝트 필터
            </div>
            <div className="flex items-center gap-1.5 border-b border-line px-5 py-3 text-[13px] text-dim">
              <span className="text-[#9a9a9a]">✓</span>
              <span>체크된 필터 항상 적용</span>
            </div>

            <div className="px-5 pb-6 pt-5">
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
            <div className="mb-[10px] flex justify-end">
              <div className="relative w-[182px]">
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as ProjectSort)
                    setPage(1)
                  }}
                  className="h-[42px] w-full appearance-none rounded-[4px] border border-[#e6e6e6] bg-page pl-[14px] pr-[39px] text-[13px] font-medium text-dim outline-none"
                  aria-label="정렬"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[#7f7f7f]">
                  <ChevronDown size={16} strokeWidth={2.1} />
                </span>
              </div>
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

            {projectPage.totalPages > 1 ? (
              <div className="mt-[30px] flex items-center justify-center gap-[8px] pb-[2px] text-[12px] text-[#9a9a9a]">
                {pageNumbers.map((pageNumber) => {
                  const isActive = pageNumber === page

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      aria-current={isActive ? 'page' : undefined}
                      className={
                        isActive
                          ? 'flex h-[22px] min-w-[22px] items-center justify-center rounded-[2px] border border-[#dddddd] bg-page px-[6px] text-[12px] font-medium text-[#777777]'
                          : 'flex h-[22px] min-w-[14px] items-center justify-center px-[2px] text-[12px] text-[#9a9a9a]'
                      }
                    >
                      {pageNumber}
                    </button>
                  )
                })}

                {page < projectPage.totalPages ? (
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(projectPage.totalPages, current + 1))}
                    aria-label="다음 페이지"
                    className="ml-[2px] flex h-[22px] min-w-[14px] items-center justify-center px-[1px] text-[#9a9a9a]"
                  >
                    <ChevronRight size={12} strokeWidth={2.2} />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function ProjectListCard({ project }: { project: Project }) {
  return (
    <a
      href={`/m4/s41v?projectId=${project.id}`}
      className="block rounded-[6px] border border-[#e9e9e9] bg-page px-[24px] py-[24px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_5px_16px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[23px] font-semibold leading-[1.35] tracking-[-0.025em] text-ink">
            {project.title}
          </h2>

          <div className="mt-[10px] flex flex-wrap items-center gap-[6px]">
            <span className="mr-[2px] text-[14px] font-medium text-[#ff7f2a]">
              {formatCategoryLine(project)}
            </span>
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-[3px] border border-[#d7d7d7] bg-page px-[9px] py-[4px] text-[12px] font-medium leading-none text-[#555f69]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[8px] pt-[4px]">
          <ProjectBadge tone={project.type === 'budget' ? 'orange' : 'blue'}>
            {formatProjectType(project.type)}
          </ProjectBadge>
          <ProjectBadge tone={formatStatusTone(project.status)}>{project.status}</ProjectBadge>
          <span className="text-[#d1d1d1]">
            <Heart size={22} strokeWidth={1.9} />
          </span>
        </div>
      </div>

      <div className="mt-[18px] rounded-[2px] bg-[#f7f7f7] px-[8px] py-[13px]">
        <div className="grid gap-2 sm:grid-cols-4 sm:divide-x sm:divide-[#d9d9d9]">
          <StatCell label={formatBudgetLabel(project)} value={formatBudget(project)} />
          <StatCell label="예상기간" value={`${project.averagePeriodDays}일`} />
          <StatCell label="지원자수" value={`${project.applicants}명`} />
          <StatCell label="마감일정" value={formatDeadlineLabel(project)} />
        </div>
      </div>
    </a>
  )
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-center px-2 text-center sm:px-3 sm:first:pl-2 sm:last:pr-2">
      <p className="whitespace-nowrap text-[13px] leading-none">
        <span className="text-[#7a838d]">{label}</span>
        <span className="ml-1.5 font-semibold text-ink">{value}</span>
      </p>
    </div>
  )
}

function ProjectBadge({
  children,
  tone,
}: {
  children: string
  tone: 'orange' | 'blue' | 'gray'
}) {
  const className =
    tone === 'orange'
      ? 'bg-[#fff4e7] text-[#d8891c]'
      : tone === 'gray'
        ? 'bg-[#f2f2f2] text-[#8c8c8c]'
        : 'bg-[#e4f6ff] text-[#3c8ec6]'

  return (
    <span
      className={`inline-flex h-[32px] items-center rounded-full px-[15px] text-[12px] font-semibold ${className}`}
    >
      {children}
    </span>
  )
}
