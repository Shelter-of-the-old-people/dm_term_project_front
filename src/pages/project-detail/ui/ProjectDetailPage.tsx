import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { createProjectApplication, getProjectById } from '@/entities/project'
import type { ProjectApplicationInput, ProjectDetail } from '@/entities/project'
import { containsContactInfo, useSessionUser } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

type ProjectLoadState = {
  isLoading: boolean
  errorMessage: string | null
  project: ProjectDetail | null
}

type SubmitState = {
  isSubmitting: boolean
  errorMessage: string | null
  successMessage: string | null
}

const RESIDENT_POSITION_OPTIONS = ['개발자', '디자이너', '기획자', '기타']
const RESIDENT_CAREER_OPTIONS = ['초급 1~5년 미만', '중급 5~10년 미만', '고급 10년 이상']

const INITIAL_OUTSOURCING_FORM = {
  workDays: '',
  bidAmount: '',
  content: '',
}

const INITIAL_RESIDENT_FORM = {
  position: '',
  careerLevel: '',
  headcount: '',
  monthlyWage: '',
  content: '',
}

function formatProjectType(type: ProjectDetail['type']) {
  return type === 'budget' ? '도급' : '기간제 상주'
}

function formatBudgetLabel(project: ProjectDetail) {
  if (project.type === 'budget') {
    return '예상 비용'
  }

  return '월 임금'
}

function formatProjectBudget(project: ProjectDetail) {
  if (project.type === 'budget') {
    if (project.quoteLow === project.quoteHigh) {
      return `${project.quoteHigh.toLocaleString()}만원`
    }

    return `${project.quoteLow.toLocaleString()} ~ ${project.quoteHigh.toLocaleString()}만원`
  }

  return `${project.averageEstimate.toLocaleString()}만원`
}

function parsePositiveInteger(value: string) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export function ProjectDetailPage({ projectId }: { projectId: number }) {
  const sessionUser = useSessionUser()
  const [state, setState] = useState<ProjectLoadState>({
    isLoading: true,
    errorMessage: null,
    project: null,
  })
  const [outsourcingForm, setOutsourcingForm] = useState(INITIAL_OUTSOURCING_FORM)
  const [residentForm, setResidentForm] = useState(INITIAL_RESIDENT_FORM)
  const [submitState, setSubmitState] = useState<SubmitState>({
    isSubmitting: false,
    errorMessage: null,
    successMessage: null,
  })

  useEffect(() => {
    let cancelled = false

    setState({
      isLoading: true,
      errorMessage: null,
      project: null,
    })

    void getProjectById(projectId)
      .then((project) => {
        if (cancelled) {
          return
        }

        setState({
          isLoading: false,
          errorMessage: null,
          project,
        })
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setState({
          isLoading: false,
          errorMessage: '프로젝트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          project: null,
        })
      })

    return () => {
      cancelled = true
    }
  }, [projectId])

  function resetSubmitMessage() {
    setSubmitState((current) => ({
      ...current,
      errorMessage: null,
      successMessage: null,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const project = state.project
    if (!project) {
      return
    }

    if (!sessionUser) {
      setSubmitState({
        isSubmitting: false,
        errorMessage: '로그인 후에만 지원할 수 있습니다.',
        successMessage: null,
      })
      return
    }

    if (sessionUser.role !== 'developer') {
      setSubmitState({
        isSubmitting: false,
        errorMessage: '개발자 계정만 프로젝트 지원이 가능합니다.',
        successMessage: null,
      })
      return
    }

    let payload: ProjectApplicationInput | null = null

    if (project.type === 'budget') {
      const workDays = parsePositiveInteger(outsourcingForm.workDays)
      const bidAmount = parsePositiveInteger(outsourcingForm.bidAmount)
      const content = outsourcingForm.content.trim()

      if (!workDays || !bidAmount || !content) {
        setSubmitState({
          isSubmitting: false,
          errorMessage: '작업기간, 지원 금액, 지원 내용을 모두 입력해주세요.',
          successMessage: null,
        })
        return
      }

      if (containsContactInfo(content)) {
        setSubmitState({
          isSubmitting: false,
          errorMessage: '지원 내용에는 이메일 또는 전화번호를 입력할 수 없습니다.',
          successMessage: null,
        })
        return
      }

      payload = {
        employmentType: 'outsourcing',
        workDays,
        bidAmount,
        content,
      }
    } else {
      const position = residentForm.position.trim()
      const careerLevel = residentForm.careerLevel.trim()
      const headcount = parsePositiveInteger(residentForm.headcount)
      const monthlyWage = parsePositiveInteger(residentForm.monthlyWage)
      const content = residentForm.content.trim()

      if (!position || !careerLevel || !headcount || !monthlyWage || !content) {
        setSubmitState({
          isSubmitting: false,
          errorMessage: '기술구분, 연차구분, 인원수, 임금, 지원 내용을 모두 입력해주세요.',
          successMessage: null,
        })
        return
      }

      if (containsContactInfo(content)) {
        setSubmitState({
          isSubmitting: false,
          errorMessage: '지원 내용에는 이메일 또는 전화번호를 입력할 수 없습니다.',
          successMessage: null,
        })
        return
      }

      payload = {
        employmentType: 'resident',
        position,
        careerLevel,
        headcount,
        monthlyWage,
        content,
      }
    }

    setSubmitState({
      isSubmitting: true,
      errorMessage: null,
      successMessage: null,
    })

    try {
      const result = await createProjectApplication(project.id, payload)

      setState((current) => ({
        ...current,
        project: current.project
          ? {
              ...current.project,
              applicants: result.applicationCount,
            }
          : current.project,
      }))
      setOutsourcingForm(INITIAL_OUTSOURCING_FORM)
      setResidentForm(INITIAL_RESIDENT_FORM)
      setSubmitState({
        isSubmitting: false,
        errorMessage: null,
        successMessage: `지원이 접수되었습니다. 현재 지원자 수는 ${result.applicationCount}명입니다.`,
      })
    } catch (error) {
      setSubmitState({
        isSubmitting: false,
        errorMessage:
          error instanceof Error ? error.message : '지원 접수 중 문제가 발생했습니다. 다시 시도해주세요.',
        successMessage: null,
      })
    }
  }

  if (state.isLoading) {
    return (
      <PageShell>
        <StatusCard
          title="프로젝트 정보를 불러오는 중입니다."
          description="요약 화면과 지원 폼을 준비하고 있습니다."
        />
      </PageShell>
    )
  }

  if (state.errorMessage) {
    return (
      <PageShell>
        <StatusCard title="프로젝트 정보를 불러오지 못했습니다." description={state.errorMessage} />
      </PageShell>
    )
  }

  if (!state.project) {
    return (
      <PageShell>
        <StatusCard
          title="프로젝트를 찾을 수 없습니다."
          description="선택한 공고가 삭제되었거나 아직 준비되지 않았습니다."
        />
      </PageShell>
    )
  }

  const project = state.project
  const statusTone = project.status === '마감' ? 'gray' : 'blue'

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-5 py-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <a href="/m4/s41?page=1" className="text-[14px] font-medium text-[#3d92d1] hover:underline">
            프로젝트 목록으로 돌아가기
          </a>
          <a
            href={sessionUser ? '#application-panel' : '/m0/s02'}
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#39b9ea] px-4 text-sm font-semibold text-white"
          >
            {sessionUser ? '지원하기' : '로그인 후 지원하기'}
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="border-b border-line px-6 py-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge tone="orange">{formatProjectType(project.type)}</Badge>
                  <Badge tone={statusTone}>{project.status}</Badge>
                  <span className="text-[13px] text-pale">등록일 {project.postedAt}</span>
                </div>
                <h1 className="mt-4 text-[28px] font-bold leading-[1.35] text-ink">{project.title}</h1>
                <p className="mt-3 text-[15px] leading-7 text-dim">{project.summary}</p>
              </div>

              <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryMetric label={formatBudgetLabel(project)} value={formatProjectBudget(project)} />
                <SummaryMetric label="예상 기간" value={`${project.averagePeriodDays}일`} />
                <SummaryMetric label="지원자 수" value={`${project.applicants}명`} />
                <SummaryMetric label="마감 일정" value={project.deadlineLabel} />
              </div>
            </section>

            <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
              <div className="border-b border-line px-6 py-4">
                <div className="flex items-center gap-5 text-sm font-semibold text-ink">
                  <span className="border-b-2 border-[#39b9ea] pb-3 text-[#39b9ea]">요약</span>
                </div>
              </div>

              <div className="px-6 py-6">
                <SectionTitle>프로젝트 요약</SectionTitle>
                <InfoTable
                  rows={[
                    ['모집 마감일', project.deadline],
                    ['예상 킥오프 일정', project.kickoffSchedule],
                    ['고용형태', formatProjectType(project.type)],
                    ['프로젝트 분야', project.categories.join(', ')],
                    ['진행 분류', project.progressType],
                    ['기획 상태', project.planningStatus],
                    ['미팅 희망 지역', project.meetingLocation],
                  ]}
                />

                <SectionTitle className="mt-8">관련 기술</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-sm border border-[#d8dde4] bg-[#fafbfd] px-3 py-1 text-[13px] text-dim"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <SectionTitle className="mt-8">업무 내용</SectionTitle>
                <div className="rounded-sm border border-line bg-[#fafafa] px-5 py-4 text-[14px] leading-7 text-dim">
                  {project.workDescription}
                </div>

                <SectionTitle className="mt-8">프로젝트 진행 방식</SectionTitle>
                <div className="rounded-sm border border-line bg-[#fafafa] px-5 py-4 text-[14px] leading-7 text-dim">
                  {project.workMethod}
                </div>
              </div>
            </section>
          </div>

          <aside id="application-panel" className="space-y-5">
            <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)] lg:sticky lg:top-6">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-[18px] font-bold text-ink">프로젝트 지원하기</h2>
                <p className="mt-2 text-[13px] leading-6 text-dim">
                  요약 내용을 확인한 뒤 도급 또는 상주 형태에 맞게 지원서를 작성해주세요.
                </p>
              </div>

              <div className="border-b border-line bg-[#fafafa] px-5 py-4">
                <p className="text-[13px] leading-6 text-dim">
                  지원 내용에는 이메일, 전화번호 등 직접 연락 가능한 정보를 입력할 수 없습니다.
                </p>
              </div>

              {sessionUser === undefined ? (
                <SideNotice
                  title="세션을 확인하는 중입니다."
                  description="로그인 정보를 불러온 뒤 지원 폼을 표시합니다."
                />
              ) : !sessionUser ? (
                <SideNotice
                  title="로그인이 필요합니다."
                  description="개발자 계정으로 로그인한 뒤 프로젝트를 지원할 수 있습니다."
                  actionHref="/m0/s02"
                  actionLabel="로그인 페이지로 이동"
                />
              ) : sessionUser.role !== 'developer' ? (
                <SideNotice
                  title="개발자 계정 전용 기능입니다."
                  description="의뢰인 계정에서는 프로젝트 지원이 불가능합니다."
                />
              ) : (
                <form className="px-5 py-5" onSubmit={(event) => void handleSubmit(event)}>
                  <SummaryMiniCard project={project} />

                  {project.type === 'budget' ? (
                    <div className="mt-5 space-y-5">
                      <FormField label="작업기간">
                        <UnitInput
                          value={outsourcingForm.workDays}
                          unit="일"
                          placeholder="실제 진행 가능한 기간"
                          onChange={(value) => {
                            resetSubmitMessage()
                            setOutsourcingForm((current) => ({ ...current, workDays: value }))
                          }}
                        />
                      </FormField>

                      <FormField label="지원 금액">
                        <UnitInput
                          value={outsourcingForm.bidAmount}
                          unit="만원"
                          placeholder="프리모아 이용료 포함 금액"
                          onChange={(value) => {
                            resetSubmitMessage()
                            setOutsourcingForm((current) => ({ ...current, bidAmount: value }))
                          }}
                        />
                        <HelperText>만원 단위로 입력하며, 이용료 10%를 포함한 금액입니다.</HelperText>
                      </FormField>

                      <FormField label="지원 내용">
                        <TextArea
                          value={outsourcingForm.content}
                          placeholder="프로젝트 이해도, 진행 계획, 강점을 작성해주세요."
                          onChange={(value) => {
                            resetSubmitMessage()
                            setOutsourcingForm((current) => ({ ...current, content: value }))
                          }}
                        />
                      </FormField>
                    </div>
                  ) : (
                    <div className="mt-5 space-y-5">
                      <FormField label="기술구분">
                        <SelectInput
                          value={residentForm.position}
                          placeholder="기술구분을 선택해주세요."
                          options={RESIDENT_POSITION_OPTIONS}
                          onChange={(value) => {
                            resetSubmitMessage()
                            setResidentForm((current) => ({ ...current, position: value }))
                          }}
                        />
                      </FormField>

                      <FormField label="연차구분">
                        <SelectInput
                          value={residentForm.careerLevel}
                          placeholder="연차구분을 선택해주세요."
                          options={RESIDENT_CAREER_OPTIONS}
                          onChange={(value) => {
                            resetSubmitMessage()
                            setResidentForm((current) => ({ ...current, careerLevel: value }))
                          }}
                        />
                      </FormField>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="인원수">
                          <UnitInput
                            value={residentForm.headcount}
                            unit="명"
                            placeholder="인원수"
                            onChange={(value) => {
                              resetSubmitMessage()
                              setResidentForm((current) => ({ ...current, headcount: value }))
                            }}
                          />
                        </FormField>

                        <FormField label="임금">
                          <UnitInput
                            value={residentForm.monthlyWage}
                            unit="만원"
                            placeholder="월 임금"
                            onChange={(value) => {
                              resetSubmitMessage()
                              setResidentForm((current) => ({ ...current, monthlyWage: value }))
                            }}
                          />
                        </FormField>
                      </div>

                      <FormField label="지원 내용">
                        <TextArea
                          value={residentForm.content}
                          placeholder="투입 가능 시점, 수행 경험, 강점을 작성해주세요."
                          onChange={(value) => {
                            resetSubmitMessage()
                            setResidentForm((current) => ({ ...current, content: value }))
                          }}
                        />
                      </FormField>
                    </div>
                  )}

                  {submitState.errorMessage ? (
                    <p className="mt-5 rounded-sm border border-[#ffd4d4] bg-[#fff5f5] px-4 py-3 text-[13px] leading-6 text-[#ba4545]">
                      {submitState.errorMessage}
                    </p>
                  ) : null}

                  {submitState.successMessage ? (
                    <p className="mt-5 rounded-sm border border-[#caefdb] bg-[#f3fff7] px-4 py-3 text-[13px] leading-6 text-[#247a4d]">
                      {submitState.successMessage}
                    </p>
                  ) : null}

                  <div className="mt-6 flex gap-3">
                    <a
                      href="/m4/s41?page=1"
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-line bg-page text-sm font-semibold text-dim"
                    >
                      돌아가기
                    </a>
                    <button
                      type="submit"
                      disabled={submitState.isSubmitting}
                      className="inline-flex h-11 flex-1 items-center justify-center rounded-md bg-[#39b9ea] text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitState.isSubmitting ? '제출 중...' : '지원 완료하기'}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-5 py-16">{children}</main>
      <SiteFooter />
    </div>
  )
}

function StatusCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-md border border-line bg-page p-10 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-3 text-base leading-7 text-dim">{description}</p>
      <a
        href="/m4/s41?page=1"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-[#39b9ea] px-6 text-sm font-semibold text-white"
      >
        프로젝트 목록으로 이동
      </a>
    </div>
  )
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line px-6 py-5 sm:border-r sm:last:border-r-0 lg:border-t-0">
      <p className="text-[13px] text-pale">{label}</p>
      <p className="mt-2 text-[18px] font-semibold text-ink">{value}</p>
    </div>
  )
}

function SectionTitle({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <h2 className={`mb-4 text-[18px] font-semibold text-ink ${className}`}>{children}</h2>
}

function InfoTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="overflow-hidden rounded-sm border border-line">
      {rows.map(([label, value], index) => (
        <div
          key={`${label}-${value}`}
          className={`grid gap-2 px-4 py-4 text-[14px] sm:grid-cols-[160px_minmax(0,1fr)] ${
            index > 0 ? 'border-t border-line' : ''
          }`}
        >
          <p className="font-medium text-pale">{label}</p>
          <p className="leading-7 text-dim">{value}</p>
        </div>
      ))}
    </div>
  )
}

function SummaryMiniCard({ project }: { project: ProjectDetail }) {
  return (
    <div className="rounded-sm border border-line bg-[#fafafa] px-4 py-4">
      <p className="text-[13px] text-pale">요약</p>
      <div className="mt-3 space-y-2 text-[13px] leading-6 text-dim">
        <p>
          <span className="font-medium text-ink">모집 마감일</span> {project.deadline}
        </p>
        <p>
          <span className="font-medium text-ink">예상 킥오프</span> {project.kickoffSchedule}
        </p>
        <p>
          <span className="font-medium text-ink">고용형태</span> {formatProjectType(project.type)}
        </p>
        <p>
          <span className="font-medium text-ink">프로젝트 분야</span> {project.categories.join(', ')}
        </p>
        <p>
          <span className="font-medium text-ink">진행 분류</span> {project.progressType}
        </p>
        <p>
          <span className="font-medium text-ink">기획 상태</span> {project.planningStatus}
        </p>
        <p>
          <span className="font-medium text-ink">미팅 희망 지역</span> {project.meetingLocation}
        </p>
      </div>
    </div>
  )
}

function SideNotice({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="px-5 py-5">
      <div className="rounded-sm border border-line bg-[#fafafa] px-4 py-4">
        <h3 className="text-[16px] font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-[13px] leading-6 text-dim">{description}</p>
        {actionHref && actionLabel ? (
          <a
            href={actionHref}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#39b9ea] px-4 text-sm font-semibold text-white"
          >
            {actionLabel}
          </a>
        ) : null}
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-semibold text-ink">{label}</label>
      {children}
    </div>
  )
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[12px] leading-5 text-pale">{children}</p>
}

function UnitInput({
  value,
  unit,
  placeholder,
  onChange,
}: {
  value: string
  unit: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex h-11 overflow-hidden rounded-sm border border-line bg-page">
      <input
        value={value}
        inputMode="numeric"
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 text-[14px] text-ink outline-none placeholder:text-pale"
      />
      <span className="inline-flex min-w-[56px] items-center justify-center border-l border-line bg-[#fafafa] px-3 text-[13px] text-dim">
        {unit}
      </span>
    </div>
  )
}

function SelectInput({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-sm border border-line bg-page px-4 text-[14px] text-ink outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function TextArea({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-[180px] w-full rounded-sm border border-line bg-page px-4 py-3 text-[14px] leading-7 text-ink outline-none placeholder:text-pale"
    />
  )
}
