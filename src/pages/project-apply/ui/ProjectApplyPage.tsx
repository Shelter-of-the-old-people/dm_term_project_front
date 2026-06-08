import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { createProjectApplication, getProjectById } from '@/entities/project'
import type { ProjectApplicationInput, ProjectDetail } from '@/entities/project'
import { containsContactInfo, isProjectClosed, useSessionUser } from '@/shared/lib'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import './project-apply-page.css'

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

const APPLY_REDIRECT_DELAY_MS = 1000

const RESIDENT_POSITION_OPTIONS = ['개발', '디자인', '기획', '기타']
const RESIDENT_CAREER_OPTIONS = ['초급(1년 이상 ~ 5년 미만)', '중급(5년 이상 ~ 10년 미만)', '고급(10년 이상)']

const OUTSOURCING_CONTENT_TEMPLATE = `<프로젝트 진행 제안>
프로젝트 이해도, 작업 범위, 일정 계획을 중심으로 작성해주세요.

<관련 경험 및 강점>
유사한 프로젝트 경험과 본 프로젝트에 적합한 강점을 작성해주세요.`

const RESIDENT_CONTENT_TEMPLATE = `<투입 가능 시점>
프로젝트에 참여 가능한 시점과 근무 형태를 구체적으로 작성해주세요.

<관련 경험 및 작업 방식>
해당 역할, 작업 경험, 프로젝트 기여 방안을 작성해주세요.`

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

function formatEmploymentLabel(type: ProjectDetail['type']) {
  return type === 'budget' ? '도급외주' : '상주(기간제)'
}

function formatBudgetLabel(project: ProjectDetail) {
  return project.type === 'budget' ? '예상비용' : '월임금'
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

function formatDeadlineMetric(label: string) {
  if (!label) {
    return ''
  }

  return label.endsWith('일') ? label : `${label}일`
}

function formatDeadlineValue(project: ProjectDetail) {
  return `${project.deadline} ${formatDeadlineMetric(project.deadlineLabel)}`.trim()
}

function formatPostedAtDisplay(date: string) {
  return date.replaceAll('-', '.')
}

function parsePositiveInteger(value: string) {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}

export function ProjectApplyPage({ projectId }: { projectId: number }) {
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

  useEffect(() => {
    if (!submitState.successMessage) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      window.location.assign('/mypage')
    }, APPLY_REDIRECT_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [submitState.successMessage])

  useEffect(() => {
    if (sessionUser === null) {
      window.location.replace('/m0/s02')
    }
  }, [sessionUser])

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

    if (isProjectClosed(project.status, project.deadline)) {
      setSubmitState({
        isSubmitting: false,
        errorMessage: '마감된 프로젝트는 지원할 수 없습니다.',
        successMessage: null,
      })
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
        successMessage: `지원이 접수되었습니다. 현재 지원자 수는 ${result.applicationCount}명이며 곧 마이페이지로 이동합니다.`,
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
  const projectClosed = isProjectClosed(project.status, project.deadline)
  const currentContent = project.type === 'budget' ? outsourcingForm.content : residentForm.content
  const hasContactInfoWarning = containsContactInfo(currentContent)
  const submitDisabled = submitState.isSubmitting || projectClosed || hasContactInfoWarning
  const submitButtonLabel = submitState.isSubmitting
    ? '제출 중...'
    : projectClosed
      ? '마감된 프로젝트입니다'
      : hasContactInfoWarning
        ? '연락처 제거 후 지원 가능'
        : '프로젝트 지원 완료하기'

  return (
    <div className="project-apply-page">
      <SiteHeader />
      <main className="project-apply-page__main">
        <div className="project-apply-page__container">
          <section className="project-apply-card">
            <header className="project-apply-card__header">
              <h1 className="project-apply-card__title">{project.title}</h1>
              <p className="project-apply-card__description">
                등록일 {formatPostedAtDisplay(project.postedAt)} · {formatBudgetLabel(project)} {formatProjectBudget(project)}
              </p>
            </header>

            <section className="project-apply-summary">
              <SectionTitle>요약</SectionTitle>
              <SummaryRows
                rows={[
                  ['모집 마감일', formatDeadlineValue(project)],
                  ['예상 킥오프 일정', project.kickoffSchedule],
                  ['고용형태', formatEmploymentLabel(project.type)],
                  ['프로젝트 분야', project.categories.join(',')],
                  ['진행 분류', project.progressType],
                  ['기획 상태', project.planningStatus],
                  ['미팅 희망 지역', project.meetingLocation],
                ]}
              />
            </section>

            <section className="project-apply-form-section">
              {projectClosed ? (
                <NoticeBox
                  title="마감된 프로젝트입니다."
                  description="마감된 프로젝트는 더 이상 지원할 수 없습니다. 다른 프로젝트를 확인해주세요."
                  actionHref={`/m4/s41v?projectId=${project.id}`}
                  actionLabel="상세 페이지로 돌아가기"
                />
              ) : sessionUser === undefined ? (
                <NoticeBox
                  title="세션을 확인하는 중입니다."
                  description="로그인 정보를 확인한 뒤 지원 폼을 표시합니다."
                />
              ) : !sessionUser ? null : sessionUser.role !== 'developer' ? (
                <NoticeBox
                  title="개발자 계정 전용 기능입니다."
                  description="의뢰인 계정에서는 프로젝트 지원이 불가능합니다."
                />
              ) : (
                <form className="project-apply-form" onSubmit={(event) => void handleSubmit(event)}>
                  {project.type === 'budget' ? (
                    <>
                      <ApplyField label="작업기간" hint="실제 진행 가능한 합리적인 기간을 제안해주세요.">
                        <UnitInput
                          value={outsourcingForm.workDays}
                          unit="일"
                          placeholder="숫자만 입력"
                          onChange={(value) => {
                            resetSubmitMessage()
                            setOutsourcingForm((current) => ({ ...current, workDays: value }))
                          }}
                        />
                      </ApplyField>

                      <ApplyField
                        label="지원 금액"
                        hint="작업 기간과 투입 범위를 고려해 진행 가능한 금액을 제안해주세요."
                      >
                        <UnitInput
                          value={outsourcingForm.bidAmount}
                          unit="만원"
                          placeholder="만원 단위로 입력"
                          onChange={(value) => {
                            resetSubmitMessage()
                            setOutsourcingForm((current) => ({ ...current, bidAmount: value }))
                          }}
                        />
                        <HelperText tone="alert">
                          * 만원 단위로 작성하고, 프리모아 이용료 10%를 포함하여 입력합니다.
                        </HelperText>
                      </ApplyField>
                    </>
                  ) : (
                    <ApplyField
                      label="지원 금액"
                      hint="기술구분, 연차구분, 인원수, 임금을 순서대로 입력해주세요."
                    >
                      <div className="project-apply-grid project-apply-grid--resident">
                        <SelectInput
                          value={residentForm.position}
                          placeholder="기술구분"
                          options={RESIDENT_POSITION_OPTIONS}
                          onChange={(value) => {
                            resetSubmitMessage()
                            setResidentForm((current) => ({ ...current, position: value }))
                          }}
                        />
                        <SelectInput
                          value={residentForm.careerLevel}
                          placeholder="연차구분"
                          options={RESIDENT_CAREER_OPTIONS}
                          onChange={(value) => {
                            resetSubmitMessage()
                            setResidentForm((current) => ({ ...current, careerLevel: value }))
                          }}
                        />
                        <UnitInput
                          value={residentForm.headcount}
                          unit="명"
                          placeholder="인원수"
                          onChange={(value) => {
                            resetSubmitMessage()
                            setResidentForm((current) => ({ ...current, headcount: value }))
                          }}
                        />
                        <UnitInput
                          value={residentForm.monthlyWage}
                          unit="만원"
                          placeholder="임금"
                          onChange={(value) => {
                            resetSubmitMessage()
                            setResidentForm((current) => ({ ...current, monthlyWage: value }))
                          }}
                        />
                      </div>
                      <HelperText tone="alert">
                        * 인원 및 임금은 만원 단위로 기입하고, 상주 프로젝트는 월임금 기준으로 입력합니다.
                      </HelperText>
                    </ApplyField>
                  )}

                  <ApplyField
                    label="지원 내용"
                    hint={
                      project.type === 'budget'
                        ? '프로젝트 이해도, 작업 범위, 일정, 구현 방식을 중심으로 작성해주세요.'
                        : '실제 투입 가능 시점, 관련 경험, 작업 방식을 중심으로 작성해주세요.'
                    }
                  >
                    <TextArea
                      value={currentContent}
                      placeholder={project.type === 'budget' ? OUTSOURCING_CONTENT_TEMPLATE : RESIDENT_CONTENT_TEMPLATE}
                      invalid={hasContactInfoWarning}
                      onChange={(value) => {
                        resetSubmitMessage()

                        if (project.type === 'budget') {
                          setOutsourcingForm((current) => ({ ...current, content: value }))
                          return
                        }

                        setResidentForm((current) => ({ ...current, content: value }))
                      }}
                    />
                    <HelperText tone="alert">
                      * 이메일, 전화번호 등 직접 연락처를 공유하여 거래를 유도할 경우 서비스 이용에 제재를 받을 수 있습니다.
                    </HelperText>
                  </ApplyField>

                  {hasContactInfoWarning ? (
                    <p className="project-apply-message project-apply-message--error">
                      이메일 또는 전화번호가 포함되어 있어 지원하기 버튼이 비활성화되었습니다. 연락처를 제거한 뒤 다시 제출해주세요.
                    </p>
                  ) : null}

                  {submitState.errorMessage ? (
                    <p className="project-apply-message project-apply-message--error">{submitState.errorMessage}</p>
                  ) : null}

                  {submitState.successMessage ? (
                    <p className="project-apply-message project-apply-message--success">{submitState.successMessage}</p>
                  ) : null}

                  <div className="project-apply-actions">
                    <a href={`/m4/s41v?projectId=${project.id}`} className="project-apply-actions__ghost">
                      돌아가기
                    </a>
                    <button type="submit" disabled={submitDisabled} className="project-apply-actions__submit">
                      {submitButtonLabel}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="project-apply-page">
      <SiteHeader />
      <main className="project-apply-page__main">
        <div className="project-apply-page__container">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}

function StatusCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="project-apply-card project-apply-card--status">
      <h1 className="project-apply-status__title">{title}</h1>
      <p className="project-apply-status__description">{description}</p>
      <a href="/m4/s41?page=1" className="project-apply-status__action">
        프로젝트 목록으로 이동
      </a>
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="project-apply-section-title">{children}</h2>
}

function SummaryRows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="project-apply-summary-list">
      {rows.map(([label, value]) => (
        <div key={`${label}-${value}`} className="project-apply-summary-list__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function NoticeBox({
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
    <div className="project-apply-notice">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionHref && actionLabel ? (
        <a href={actionHref} className="project-apply-notice__action">
          {actionLabel}
        </a>
      ) : null}
    </div>
  )
}

function ApplyField({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="project-apply-field">
      <div className="project-apply-field__header">
        <label className="project-apply-field__label">{label}</label>
      </div>
      {hint ? <p className="project-apply-field__hint">{hint}</p> : null}
      {children}
    </section>
  )
}

function HelperText({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'alert'
}) {
  return (
    <p className={`project-apply-helper-text${tone === 'alert' ? ' project-apply-helper-text--alert' : ''}`}>
      {children}
    </p>
  )
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
    <div className="project-apply-unit-input">
      <input
        value={value}
        inputMode="numeric"
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="project-apply-unit-input__input"
      />
      <span className="project-apply-unit-input__unit">{unit}</span>
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
    <select value={value} onChange={(event) => onChange(event.target.value)} className="project-apply-select">
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
  invalid = false,
  onChange,
}: {
  value: string
  placeholder: string
  invalid?: boolean
  onChange: (value: string) => void
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`project-apply-textarea${invalid ? ' project-apply-textarea--invalid' : ''}`}
    />
  )
}
