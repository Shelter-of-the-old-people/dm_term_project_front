import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useProjectFilter } from '@/features/project-filter'
import { getProjects, PROJECT_PAGE_SIZE, ProjectCard } from '@/entities/project'
import { SectionHead } from '@/shared/ui'

import type { ProjectPage, ProjectSort } from '@/entities/project'
import type { ProjectTypeFilter } from '@/features/project-filter'

const TYPE_TABS: { label: string; value: ProjectTypeFilter }[] = [
  { label: '전체',           value: 'all' },
  { label: '어플리케이션 개발', value: 'all' },
  { label: '웹 개발',         value: 'all' },
  { label: '소프트웨어 개발',  value: 'all' },
  { label: '게임 개발',       value: 'all' },
  { label: '기획&디자인',     value: 'all' },
  { label: '기타',           value: 'all' },
]

const SORT_OPTIONS: { label: string; value: ProjectSort }[] = [
  { label: '프리모아 기본정렬', value: 'freemoa' },
  { label: '최신 등록 순',    value: 'latest' },
  { label: '금액 높은 순',    value: 'highBudget' },
  { label: '금액 낮은 순',    value: 'lowBudget' },
  { label: '마감 임박 순',    value: 'deadline' },
]

export function ProjectBoard() {
  const { filters, setType, setSort } = useProjectFilter()
  const [page, setPage]           = useState(1)
  const [activeTab, setActiveTab] = useState(0)
  const [projectPage, setProjectPage] = useState<ProjectPage>({
    items: [], total: 0, page: 1, totalPages: 1,
  })

  useEffect(() => {
    void getProjects({
      type:       filters.type,
      categories: filters.categories,
      sort:       filters.sort,
      page,
      pageSize:   PROJECT_PAGE_SIZE,
    }).then(setProjectPage)
  }, [filters, page])

  const handleTypeChange = (value: ProjectTypeFilter, idx: number) => {
    setPage(1)
    setActiveTab(idx)
    setType(value)
  }

  const handleSortChange = (sort: ProjectSort) => {
    setPage(1)
    setSort(sort)
  }

  return (
    <section className="bg-soft py-22.5" id="projects">
      <div className="mx-auto max-w-330 px-5">
        <SectionHead title="진행중인 비교견적" moreHref="/m4/s41" moreLabel="더보기" />

        {/* 카테고리 탭 + 정렬 */}
        <div className="flex items-center justify-between mb-6">
          <ul className="flex list-none m-0 p-0 gap-0">
            {TYPE_TABS.map((tab, i) => (
              <li
                key={tab.label}
                onClick={() => handleTypeChange(tab.value, i)}
                className={`px-4 py-2 text-[14px] cursor-pointer border-b-2 transition-colors duration-150 whitespace-nowrap ${
                  activeTab === i
                    ? 'border-ink text-ink font-semibold'
                    : 'border-transparent text-quiet hover:text-ink'
                }`}
              >
                {tab.label}
              </li>
            ))}
          </ul>

          <select
            className="h-9 px-3 text-[13px] text-dim border border-line rounded-sm bg-page cursor-pointer outline-none hover:border-ink transition-colors duration-150"
            value={filters.sort}
            onChange={(e) => handleSortChange(e.target.value as ProjectSort)}
            aria-label="정렬 기준"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 2열 그리드 */}
        <div className="grid grid-cols-2 gap-4">
          {projectPage.items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label="이전 페이지"
            className="w-9 h-9 rounded-pill border border-line bg-page flex items-center justify-center text-dim hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-[14px] text-dim min-w-16 text-center">
            {projectPage.page} / {projectPage.totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= projectPage.totalPages}
            aria-label="다음 페이지"
            className="w-9 h-9 rounded-pill border border-line bg-page flex items-center justify-center text-dim hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
