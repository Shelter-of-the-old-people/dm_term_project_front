import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, Search } from 'lucide-react'

import { getProjects, PROJECT_PAGE_SIZE } from '@/entities/project'
import { Badge } from '@/shared/ui'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import type { Project, ProjectPage, ProjectSort } from '@/entities/project'
import type { ProjectTypeFilter } from '@/features/project-filter'

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

export function ProjectListPage() {
  const [type, setType] = useState<ProjectTypeFilter>('all')
  const [sort, setSort] = useState<ProjectSort>('freemoa')
  const [page, setPage] = useState(readInitialPage)
  const [projectPage, setProjectPage] = useState<ProjectPage>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })

  useEffect(() => {
    void getProjects({
      type,
      sort,
      page,
      pageSize: PROJECT_PAGE_SIZE,
    }).then((nextPage) => {
      setProjectPage(nextPage)
      if (page > nextPage.totalPages) {
        setPage(nextPage.totalPages)
      }
    })
  }, [page, sort, type])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(page))
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
  }, [page])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <SiteHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-7">
        <section className="rounded-md border border-line bg-page px-10 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#39b9ea]">
                프로젝트를 찾아보세요.
              </h1>
            </div>

            <div className="relative">
              <label className="block border-b-2 border-[#4fc4ee] pb-3">
                <span className="mb-3 block text-[15px] font-medium text-ink">
                  프로젝트 검색어를 입력해주세요.
                </span>
                <input
                  type="text"
                  placeholder="프로젝트 검색어를 입력해주세요."
                  className="w-full border-none bg-transparent px-0 text-base text-ink outline-none placeholder:text-pale"
                />
              </label>

              <button
                type="button"
                aria-label="검색"
                className="absolute right-0 top-[30px] text-[#39b9ea]"
              >
                <Search size={22} />
              </button>
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

            <div className="border-b border-line px-5 py-5">
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

            <div className="px-5 py-4 text-[14px] font-medium text-dim">지역검색</div>
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

            <div className="space-y-4">
              {projectPage.items.map((project) => (
                <ProjectListCard key={project.id} project={project} />
              ))}
            </div>

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
  const categoryText = project.categories.join(', ')
  const statusTone = project.status === '마감임박' ? 'orange' : project.status === '검수중' ? 'gray' : 'blue'

  return (
    <a
      href={`/m4/s41v?projectId=${project.id}`}
      className="block rounded-md border border-line bg-page p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold leading-8 text-ink">{project.title}</h2>
          <p className="mt-2 text-[14px] text-[#ff8a35]">{categoryText}</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="orange">{project.type === 'budget' ? '도급' : '상주'}</Badge>
          <Badge tone={statusTone}>{project.status}</Badge>
          <span className="text-[#c4c7ce]">
            <Heart size={18} />
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-sm bg-[#fafafa] px-4 py-4 text-[14px] text-dim sm:grid-cols-4">
        <StatCell label="예상비용" value={`${project.quoteLow.toLocaleString()} ~ ${project.quoteHigh.toLocaleString()}만원`} />
        <StatCell label="예상기간" value={`${project.averagePeriodDays}일`} />
        <StatCell label="지원자수" value={`${project.applicants}명`} />
        <StatCell label="마감일정" value={`D-${project.deadlineDays}`} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div>
          <p className="text-[14px] leading-7 text-dim">
            프로젝트 요약과 진행 방식, 계약 방식, 회사 위치 등은 실제 API가 연결되면 더 구체적으로
            보여줄 예정입니다.
          </p>
          <p className="mt-3 text-[14px] leading-7 text-dim">{project.summary}</p>

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
        </div>

        <div className="border-t border-line pt-4 lg:border-t-0 lg:border-l lg:pl-5 lg:pt-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ebf6fb] text-sm font-semibold text-[#58aed4]">
              {project.title.charAt(0)}
            </div>
            <div>
              <p className="text-[15px] font-semibold text-ink">파트너 계정</p>
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
    <div>
      <p className="text-[13px] text-pale">{label}</p>
      <p className="mt-2 font-semibold text-ink">{value}</p>
    </div>
  )
}
