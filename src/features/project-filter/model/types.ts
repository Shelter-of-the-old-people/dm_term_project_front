import type { ProjectSort, ProjectType } from '@/entities/project'

export type ProjectTypeFilter = 'all' | ProjectType

export type ProjectFilters = {
  type: ProjectTypeFilter
  sort: ProjectSort
}
