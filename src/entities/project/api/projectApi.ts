import type { Project, ProjectCategory, ProjectPage, ProjectQuery, ProjectStatus, ProjectType } from '../model/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export const PROJECT_PAGE_SIZE = 4

type ApiResponse<T> = {
  success: boolean
  data: T | null
  message: string | null
}

type BackendProject = {
  id: number
  title: string
  area: string
  employmentType: 'outsourcing' | 'resident'
  recruitStatus: 'open' | 'urgent' | 'reviewing'
  budgetMin: number | null
  budgetMax: number | null
  monthlyWage: number | null
  expectedDurationDays: number
  applicationCount: number
  deadline: string
  deadlineLabel: string
  categories: string[]
  skills: string[]
  createdAt: string
  summary: string
}

type BackendProjectPage = {
  items: BackendProject[]
  page: number
  size: number
  totalItems: number
  totalPages: number
  hasNext: boolean
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function mapProjectType(employmentType: BackendProject['employmentType']): ProjectType {
  return employmentType === 'outsourcing' ? 'budget' : 'resident'
}

function mapProjectStatus(recruitStatus: BackendProject['recruitStatus']): ProjectStatus {
  switch (recruitStatus) {
    case 'urgent':
      return '마감임박'
    case 'reviewing':
      return '검수중'
    default:
      return '모집중'
  }
}

function mapProjectCategories(categories: string[]): ProjectCategory[] {
  return categories.filter(isProjectCategory)
}

function isProjectCategory(category: string): category is ProjectCategory {
  return category === '개발' || category === '디자인' || category === '기획'
}

function buildProjectAmount(project: BackendProject) {
  const high = project.budgetMax ?? project.monthlyWage ?? 0
  const low = project.budgetMin ?? project.monthlyWage ?? high
  const average = project.monthlyWage ?? Math.round((high + low) / 2)

  return {
    high,
    low,
    average,
  }
}

function calculateDeadlineDays(deadline: string) {
  const [year, month, day] = deadline.split('-').map(Number)
  const today = new Date()
  const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const deadlineDate = new Date(year, month - 1, day)
  const diffMs = deadlineDate.getTime() - todayAtMidnight.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

function mapProject(project: BackendProject): Project {
  const amount = buildProjectAmount(project)

  return {
    id: project.id,
    title: project.title,
    area: project.area,
    type: mapProjectType(project.employmentType),
    status: mapProjectStatus(project.recruitStatus),
    categories: mapProjectCategories(project.categories),
    skills: project.skills,
    quoteHigh: amount.high,
    quoteLow: amount.low,
    averageEstimate: amount.average,
    averagePeriodDays: project.expectedDurationDays,
    applicants: project.applicationCount,
    deadlineDays: calculateDeadlineDays(project.deadline),
    postedAt: project.createdAt,
    summary: project.summary,
  }
}

function buildApiUrl(path: string, query?: Record<string, string>) {
  const url = new URL(path, API_BASE_URL)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  return url.toString()
}

async function requestApi<T>(path: string, query?: Record<string, string>): Promise<T> {
  const response = await fetch(buildApiUrl(path, query), {
    credentials: 'include',
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    if (!response.ok) {
      throw new ApiError(response.status, `Request failed with status ${response.status}.`)
    }
    throw new ApiError(response.status, 'Invalid API response.')
  }

  if (!response.ok || !payload.success || payload.data == null) {
    throw new ApiError(response.status, payload.message ?? `Request failed with status ${response.status}.`)
  }

  return payload.data
}

function toBackendType(type: ProjectQuery['type']) {
  if (type === 'budget') {
    return 'outsourcing'
  }

  return type
}

export async function getProjects(query: ProjectQuery): Promise<ProjectPage> {
  const page = await requestApi<BackendProjectPage>('/api/projects', {
    type: toBackendType(query.type),
    sort: query.sort,
    page: String(query.page),
    size: String(query.pageSize),
  })

  return {
    items: page.items.map(mapProject),
    total: page.totalItems,
    page: page.page,
    totalPages: Math.max(1, page.totalPages),
  }
}

export async function getProjectById(projectId: number): Promise<Project | null> {
  try {
    const project = await requestApi<BackendProject>(`/api/projects/${projectId}`)
    return mapProject(project)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}
