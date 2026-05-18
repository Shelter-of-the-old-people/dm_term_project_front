import type { ProjectCategory, ProjectSort, ProjectType } from '@/entities/project'

export type ProjectTypeFilter = 'all' | ProjectType

export type ProjectFilters = {
  type: ProjectTypeFilter
  categories: ProjectCategory[]
  sort: ProjectSort
}
