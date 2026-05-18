import { filterProjects } from '../lib/filterProjects'
import { projects } from '../model/projects'

import type { ProjectPage, ProjectQuery } from '../model/types'

export const PROJECT_PAGE_SIZE = 4

export async function getProjects(query: ProjectQuery): Promise<ProjectPage> {
  const filtered = filterProjects(projects, query)
  const start = (query.page - 1) * query.pageSize
  const items = filtered.slice(start, start + query.pageSize)

  return {
    items,
    total: filtered.length,
    page: query.page,
    totalPages: Math.max(1, Math.ceil(filtered.length / query.pageSize)),
  }
}
