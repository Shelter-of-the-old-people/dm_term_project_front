import { useState } from 'react'

import type { ProjectCategory, ProjectSort } from '@/entities/project'
import type { ProjectFilters, ProjectTypeFilter } from './types'

const initialFilters: ProjectFilters = {
  type: 'all',
  categories: [],
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

  const toggleCategory = (category: ProjectCategory) => {
    setFilters((current) => {
      const exists = current.categories.includes(category)
      const categories = exists
        ? current.categories.filter((currentCategory) => currentCategory !== category)
        : [...current.categories, category]

      return { ...current, categories }
    })
  }

  return {
    filters,
    setType,
    setSort,
    toggleCategory,
  }
}
