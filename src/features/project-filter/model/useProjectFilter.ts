import { useState } from 'react'

import type { ProjectSort } from '@/entities/project'
import type { ProjectFilters, ProjectTypeFilter } from './types'

const initialFilters: ProjectFilters = {
  type: 'all',
  sort: 'freemoa',
}

export function useProjectFilter() {
  const [filters, setFilters] = useState<ProjectFilters>(initialFilters)

  const setType = (type: ProjectTypeFilter) => {
    setFilters((current) => ({ ...current, type }))
  }

  const setSort = (sort: ProjectSort) => {
    setFilters((current) => ({ ...current, sort }))
  }

  return {
    filters,
    setType,
    setSort,
  }
}
