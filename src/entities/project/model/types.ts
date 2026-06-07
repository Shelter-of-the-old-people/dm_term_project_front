export type ProjectType = 'budget' | 'resident'

export type ProjectStatus = '모집중' | '마감'

export type ProjectCategory = '개발' | '디자인' | '기획'

export type Project = {
  id: number
  title: string
  area: string
  type: ProjectType
  status: ProjectStatus
  categories: ProjectCategory[]
  skills: string[]
  quoteHigh: number
  quoteLow: number
  averageEstimate: number
  averagePeriodDays: number
  applicants: number
  deadlineDays: number
  postedAt: string
  summary: string
}

export type ProjectDetail = Project & {
  deadline: string
  deadlineLabel: string
  kickoffSchedule: string
  progressType: string
  planningStatus: string
  meetingLocation: string
  workDescription: string
  workMethod: string
}

export type ProjectSort = 'freemoa' | 'latest' | 'highBudget' | 'lowBudget' | 'deadline'

export type ProjectQuery = {
  type: 'all' | ProjectType
  sort: ProjectSort
  page: number
  pageSize: number
}

export type ProjectPage = {
  items: Project[]
  total: number
  page: number
  totalPages: number
}

export type ProjectApplicationInput =
  | {
      employmentType: 'outsourcing'
      workDays: number
      bidAmount: number
      content: string
    }
  | {
      employmentType: 'resident'
      position: string
      careerLevel: string
      headcount: number
      monthlyWage: number
      content: string
    }

export type ProjectApplicationResult = {
  applicationId: number
  projectId: number
  applicationCount: number
}

export type ClientProjectCreateInput = {
  title: string
  recruitmentDeadline: string
  projectType: 'outsourcing' | 'resident'
  budgetAmount: number
  expectedDurationDays: number
  projectFields: ProjectCategory[]
  planningStatus: string
  meetingRegion: string
  workDescription: string
  progressMethod: string
  techStacks: string[]
  kickoffSchedule?: string
}

export type ClientProjectCreateResult = {
  projectId: number
}

export type ClientProjectSummary = {
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

export type ClientProjectDetail = {
  id: number
  title: string
  deadline: string
  deadlineLabel: string
  kickoffSchedule: string
  employmentType: 'outsourcing' | 'resident'
  categories: ProjectCategory[]
  progressType: string
  planningStatus: string
  meetingLocation: string
  workDescription: string
  workMethod: string
  applicationCount: number
}

export type ClientApplicantSummary = {
  applicationId: number
  developerId: number
  developerName: string
  employmentType: 'outsourcing' | 'resident'
  expectedAmount: number | null
  createdAt: string
}

export type ClientApplicantPage = {
  items: ClientApplicantSummary[]
  page: number
  size: number
  totalItems: number
  totalPages: number
  hasNext: boolean
}

export type ClientApplicationOnsiteLine = {
  position: string
  careerLevel: string
  headcount: number
  monthlyWage: number
  sortOrder: number
}

export type ClientApplicationDetail = {
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
  onsiteLines: ClientApplicationOnsiteLine[]
}

export type DeveloperApplicationSummary = {
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

export type DeveloperApplicationOnsiteLine = {
  position: string
  careerLevel: string
  headcount: number
  monthlyWage: number
  sortOrder: number
}

export type DeveloperApplicationDetail = {
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
  onsiteLines: DeveloperApplicationOnsiteLine[]
}
