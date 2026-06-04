import type { Project, ProjectQuery } from '../model/types'

export function filterProjects(source: Project[], query: ProjectQuery) {
  const filtered = source.filter((project) => query.type === 'all' || project.type === query.type)

  return sortProjects(filtered, query.sort)
}

function sortProjects(source: Project[], sort: ProjectQuery['sort']) {
  return [...source].sort((current, next) => {
    if (sort === 'latest') {
      return next.postedAt.localeCompare(current.postedAt)
    }

    if (sort === 'highBudget') {
      return next.averageEstimate - current.averageEstimate
    }

    if (sort === 'lowBudget') {
      return current.averageEstimate - next.averageEstimate
    }

    if (sort === 'deadline') {
      return current.deadlineDays - next.deadlineDays
    }

    return next.applicants - current.applicants
  })
}
