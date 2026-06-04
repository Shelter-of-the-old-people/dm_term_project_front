export type ProjectType = 'budget' | 'resident'

export type ProjectStatus = '모집중' | '마감임박' | '검수중'

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
