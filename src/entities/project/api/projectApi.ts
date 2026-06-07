import type {
  ClientApplicantPage,
  ClientApplicationDetail,
  ClientProjectCreateInput,
  ClientProjectCreateResult,
  ClientProjectDetail,
  ClientProjectSummary,
  DeveloperApplicationDetail,
  DeveloperApplicationSummary,
  Project,
  ProjectApplicationInput,
  ProjectApplicationResult,
  ProjectCategory,
  ProjectDetail,
  ProjectPage,
  ProjectQuery,
  ProjectStatus,
  ProjectType,
} from '../model/types'

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

type BackendProjectDetail = BackendProject & {
  kickoffSchedule: string
  progressType: string
  planningStatus: string
  meetingLocation: string
  workDescription: string
  workMethod: string
}

type BackendProjectPage = {
  items: BackendProject[]
  page: number
  size: number
  totalItems: number
  totalPages: number
  hasNext: boolean
}

type BackendProjectApplicationResult = {
  applicationId: number
  projectId: number
  applicationCount: number
}

type BackendDeveloperApplicationSummary = {
  applicationId: number
  projectId: number
  projectTitle: string
  employmentType: 'outsourcing' | 'resident'
  estimateAmount: number | null
  applicationCount: number
  workDays: number | null
  expectedDurationDays: number
  createdAt: string
}

type BackendDeveloperApplicationOnsiteLine = {
  position: string
  careerLevel: string
  headcount: number
  monthlyWage: number
  sortOrder: number
}

type BackendDeveloperApplicationDetail = {
  applicationId: number
  projectId: number
  projectTitle: string
  employmentType: 'outsourcing' | 'resident'
  estimateAmount: number | null
  applicationCount: number
  expectedDurationDays: number
  deadline: string
  deadlineLabel: string
  workDays: number | null
  bidAmount: number | null
  headcount: number | null
  content: string
  createdAt: string
  onsiteLines: BackendDeveloperApplicationOnsiteLine[]
}

type BackendClientProjectCreateResult = {
  projectId: number
}

type BackendClientProjectSummary = {
  id: number
  title: string
  employmentType: 'outsourcing' | 'resident'
  budgetMin: number | null
  budgetMax: number | null
  monthlyWage: number | null
  applicationCount: number
  deadline: string
  deadlineLabel: string
}

type BackendClientProjectDetail = {
  id: number
  title: string
  deadline: string
  deadlineLabel: string
  kickoffSchedule: string
  employmentType: 'outsourcing' | 'resident'
  categories: string[]
  progressType: string
  planningStatus: string
  meetingLocation: string
  workDescription: string
  workMethod: string
  applicationCount: number
}

type BackendClientApplicantSummary = {
  applicationId: number
  developerId: number
  developerName: string
  employmentType: 'outsourcing' | 'resident'
  expectedAmount: number | null
  createdAt: string
}

type BackendClientApplicantPage = {
  items: BackendClientApplicantSummary[]
  page: number
  size: number
  totalItems: number
  totalPages: number
  hasNext: boolean
}

type BackendClientApplicationOnsiteLine = {
  position: string
  careerLevel: string
  headcount: number
  monthlyWage: number
  sortOrder: number
}

type BackendClientApplicationDetail = {
  applicationId: number
  projectId: number
  developerId: number
  developerName: string
  employmentType: 'outsourcing' | 'resident'
  workDays: number | null
  bidAmount: number | null
  headcount: number
  content: string
  createdAt: string
  onsiteLines: BackendClientApplicationOnsiteLine[]
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

function mapProjectDetail(project: BackendProjectDetail): ProjectDetail {
  return {
    ...mapProject(project),
    deadline: project.deadline,
    deadlineLabel: project.deadlineLabel,
    kickoffSchedule: project.kickoffSchedule,
    progressType: project.progressType,
    planningStatus: project.planningStatus,
    meetingLocation: project.meetingLocation,
    workDescription: project.workDescription,
    workMethod: project.workMethod,
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

async function requestApiWithBody<T>(path: string, body: unknown, method = 'POST'): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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

export async function getProjectById(projectId: number): Promise<ProjectDetail | null> {
  try {
    const project = await requestApi<BackendProjectDetail>(`/api/projects/${projectId}`)
    return mapProjectDetail(project)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }

    throw error
  }
}

export async function createProjectApplication(
  projectId: number,
  input: ProjectApplicationInput,
): Promise<ProjectApplicationResult> {
  const body =
    input.employmentType === 'outsourcing'
      ? input
      : {
          employmentType: input.employmentType,
          position: input.position,
          careerLevel: input.careerLevel,
          headcount: input.headcount,
          monthlyWage: input.monthlyWage,
          content: input.content,
        }

  const result = await requestApiWithBody<BackendProjectApplicationResult>(
    `/api/projects/${projectId}/applications`,
    body,
  )

  return {
    applicationId: result.applicationId,
    projectId: result.projectId,
    applicationCount: result.applicationCount,
  }
}

export async function createClientProject(
  input: ClientProjectCreateInput,
): Promise<ClientProjectCreateResult> {
  const result = await requestApiWithBody<BackendClientProjectCreateResult>('/api/client/projects', input)

  return {
    projectId: result.projectId,
  }
}

export async function getClientProjects(): Promise<ClientProjectSummary[]> {
  const items = await requestApi<BackendClientProjectSummary[]>('/api/client/projects')

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    employmentType: item.employmentType,
    budgetMin: item.budgetMin,
    budgetMax: item.budgetMax,
    monthlyWage: item.monthlyWage,
    applicationCount: item.applicationCount,
    deadline: item.deadline,
    deadlineLabel: item.deadlineLabel,
  }))
}

export async function getClientProjectById(projectId: number): Promise<ClientProjectDetail> {
  const item = await requestApi<BackendClientProjectDetail>(`/api/client/projects/${projectId}`)

  return {
    id: item.id,
    title: item.title,
    deadline: item.deadline,
    deadlineLabel: item.deadlineLabel,
    kickoffSchedule: item.kickoffSchedule,
    employmentType: item.employmentType,
    categories: mapProjectCategories(item.categories),
    progressType: item.progressType,
    planningStatus: item.planningStatus,
    meetingLocation: item.meetingLocation,
    workDescription: item.workDescription,
    workMethod: item.workMethod,
    applicationCount: item.applicationCount,
  }
}

export async function getClientProjectApplicants(
  projectId: number,
  page: number,
  size = 2,
): Promise<ClientApplicantPage> {
  const applicantPage = await requestApi<BackendClientApplicantPage>(
    `/api/client/projects/${projectId}/applicants`,
    {
      page: String(page),
      size: String(size),
    },
  )

  return {
    items: applicantPage.items.map((item) => ({
      applicationId: item.applicationId,
      developerId: item.developerId,
      developerName: item.developerName,
      employmentType: item.employmentType,
      expectedAmount: item.expectedAmount,
      createdAt: item.createdAt,
    })),
    page: applicantPage.page,
    size: applicantPage.size,
    totalItems: applicantPage.totalItems,
    totalPages: applicantPage.totalPages,
    hasNext: applicantPage.hasNext,
  }
}

export async function getClientApplicationById(
  applicationId: number,
): Promise<ClientApplicationDetail> {
  const item = await requestApi<BackendClientApplicationDetail>(
    `/api/client/applications/${applicationId}`,
  )

  return {
    applicationId: item.applicationId,
    projectId: item.projectId,
    developerId: item.developerId,
    developerName: item.developerName,
    employmentType: item.employmentType,
    workDays: item.workDays,
    bidAmount: item.bidAmount,
    headcount: item.headcount,
    content: item.content,
    createdAt: item.createdAt,
    onsiteLines: item.onsiteLines.map((line) => ({
      position: line.position,
      careerLevel: line.careerLevel,
      headcount: line.headcount,
      monthlyWage: line.monthlyWage,
      sortOrder: line.sortOrder,
    })),
  }
}

export async function getDeveloperApplications(): Promise<DeveloperApplicationSummary[]> {
  const items = await requestApi<BackendDeveloperApplicationSummary[]>('/api/developer/applications')

  return items.map((item) => ({
    applicationId: item.applicationId,
    projectId: item.projectId,
    projectTitle: item.projectTitle,
    employmentType: item.employmentType,
    estimateAmount: item.estimateAmount,
    applicationCount: item.applicationCount,
    workDays: item.workDays,
    expectedDurationDays: item.expectedDurationDays,
    createdAt: item.createdAt,
  }))
}

export async function getDeveloperApplicationById(
  applicationId: number,
): Promise<DeveloperApplicationDetail> {
  const item = await requestApi<BackendDeveloperApplicationDetail>(
    `/api/developer/applications/${applicationId}`,
  )

  return {
    applicationId: item.applicationId,
    projectId: item.projectId,
    projectTitle: item.projectTitle,
    employmentType: item.employmentType,
    estimateAmount: item.estimateAmount,
    applicationCount: item.applicationCount,
    expectedDurationDays: item.expectedDurationDays,
    deadline: item.deadline,
    deadlineLabel: item.deadlineLabel,
    workDays: item.workDays,
    bidAmount: item.bidAmount,
    headcount: item.headcount,
    content: item.content,
    createdAt: item.createdAt,
    onsiteLines: item.onsiteLines.map((line) => ({
      position: line.position,
      careerLevel: line.careerLevel,
      headcount: line.headcount,
      monthlyWage: line.monthlyWage,
      sortOrder: line.sortOrder,
    })),
  }
}
