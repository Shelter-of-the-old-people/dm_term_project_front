import type { ProjectCategory, ProjectSort } from '@/entities/project'
import type { ProjectFilters, ProjectTypeFilter } from '../model/types'

type ProjectFilterPanelProps = {
  filters: ProjectFilters
  categories: ProjectCategory[]
  onTypeChange: (type: ProjectTypeFilter) => void
  onSortChange: (sort: ProjectSort) => void
  onToggleCategory: (category: ProjectCategory) => void
}

const typeOptions: Array<{ value: ProjectTypeFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'budget', label: '기간제 외주' },
  { value: 'resident', label: '상주' },
]

const sortOptions: Array<{ value: ProjectSort; label: string }> = [
  { value: 'freemoa', label: '프리모아 기본정렬' },
  { value: 'latest', label: '최신 등록 순' },
  { value: 'highBudget', label: '금액 높은 순' },
  { value: 'lowBudget', label: '금액 낮은 순' },
  { value: 'deadline', label: '마감 임박 순' },
]

export function ProjectFilterPanel({
  filters,
  categories,
  onTypeChange,
  onSortChange,
  onToggleCategory,
}: ProjectFilterPanelProps) {
  return (
    <div className="project-filter" aria-label="프로젝트 필터">
      <div className="segmented-control">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            className={filters.type === option.value ? 'is-active' : ''}
            type="button"
            onClick={() => onTypeChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="category-filter" aria-label="참여 파트 분류">
        {categories.map((category) => (
          <label key={category}>
            <input
              checked={filters.categories.includes(category)}
              type="checkbox"
              onChange={() => onToggleCategory(category)}
            />
            <span>{category}</span>
          </label>
        ))}
      </div>

      <label className="sort-select">
        <span>정렬</span>
        <select value={filters.sort} onChange={(event) => onSortChange(event.target.value as ProjectSort)}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
