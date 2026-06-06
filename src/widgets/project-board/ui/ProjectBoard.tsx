import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useProjectFilter } from '@/features/project-filter'
import { getProjects, PROJECT_PAGE_SIZE, ProjectCard } from '@/entities/project'
import { SectionHead } from '@/shared/ui'

import type { ProjectPage, ProjectSort } from '@/entities/project'
import type { ProjectTypeFilter } from '@/features/project-filter'

const TYPE_TABS: { label: string; value: ProjectTypeFilter }[] = [
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

export function ProjectBoard() {
  const { filters, setType, setSort } = useProjectFilter()
  const [page, setPage] = useState(1)
  const [projectPage, setProjectPage] = useState<ProjectPage>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
  })

  useEffect(() => {
    void getProjects({
      type: filters.type,
      sort: filters.sort,
      page,
      pageSize: PROJECT_PAGE_SIZE,
    }).then(setProjectPage)
  }, [filters.type, filters.sort, page])

  const handleTypeChange = (value: ProjectTypeFilter) => {
    setPage(1)
    setType(value)
  }

  const handleSortChange = (sort: ProjectSort) => {
    setPage(1)
    setSort(sort)
  }

  return (
    <section className="bg-soft py-22.5" id="projects">
      <div className="mx-auto max-w-330 px-5">
        <SectionHead title="진행중인 비교견적" moreHref="/m4/s41?page=1" moreLabel="더보기" />

        <div className="mb-6 flex items-center justify-between gap-4">
          <ul className="m-0 flex list-none gap-0 p-0">
            {TYPE_TABS.map((tab) => (
              <li
                key={tab.value}
                onClick={() => handleTypeChange(tab.value)}
                className={`cursor-pointer whitespace-nowrap border-b-2 px-4 py-2 text-[14px] transition-colors duration-150 ${
                  filters.type === tab.value
                    ? 'border-ink font-semibold text-ink'
                    : 'border-transparent text-quiet hover:text-ink'
                }`}
              >
                {tab.label}
              </li>
            ))}
          </ul>

          <select
            className="h-9 cursor-pointer rounded-sm border border-line bg-page px-3 text-[13px] text-dim outline-none transition-colors duration-150 hover:border-ink"
            value={filters.sort}
            onChange={(event) => handleSortChange(event.target.value as ProjectSort)}
            aria-label="정렬 기준"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {projectPage.items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label="이전 페이지"
            className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-page text-dim transition-colors duration-150 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="min-w-16 text-center text-[14px] text-dim">
            {projectPage.page} / {projectPage.totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= projectPage.totalPages}
            aria-label="다음 페이지"
            className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-page text-dim transition-colors duration-150 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
