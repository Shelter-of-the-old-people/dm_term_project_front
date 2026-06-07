import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { createClientProject } from '@/entities/project'
import type { ClientProjectCreateInput, ProjectCategory } from '@/entities/project'
import { useSessionUser } from '@/shared/lib'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

const CATEGORY_OPTIONS: ProjectCategory[] = ['개발', '디자인', '기획']

type SubmitState = {
  isSubmitting: boolean
  errorMessage: string | null
  successMessage: string | null
}

type FormState = {
  title: string
  recruitmentDeadline: string
  projectType: 'outsourcing' | 'resident'
  budgetAmount: string
  expectedDurationDays: string
  projectFields: ProjectCategory[]
  planningStatus: string
  meetingRegion: string
  workDescription: string
  progressMethod: string
  techStacks: string
  kickoffSchedule: string
}

const INITIAL_FORM: FormState = {
  title: '',
  recruitmentDeadline: '',
  projectType: 'outsourcing',
  budgetAmount: '',
  expectedDurationDays: '',
  projectFields: [],
  planningStatus: '',
  meetingRegion: '',
  workDescription: '',
  progressMethod: '',
  techStacks: '',
  kickoffSchedule: '',
}

export function ClientProjectCreatePage() {
  const sessionUser = useSessionUser()
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitState, setSubmitState] = useState<SubmitState>({
    isSubmitting: false,
    errorMessage: null,
    successMessage: null,
  })

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setSubmitState((current) => ({
      ...current,
      errorMessage: null,
      successMessage: null,
    }))
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!sessionUser) {
      setSubmitState({
        isSubmitting: false,
        errorMessage: '로그인 후에만 프로젝트를 등록할 수 있습니다.',
        successMessage: null,
      })
      return
    }

    if (sessionUser.role !== 'client') {
      setSubmitState({
        isSubmitting: false,
        errorMessage: '의뢰인 계정만 프로젝트를 등록할 수 있습니다.',
        successMessage: null,
      })
      return
    }

    const budgetAmount = Number(form.budgetAmount)
    const expectedDurationDays = Number(form.expectedDurationDays)
    const techStacks = form.techStacks
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    if (
      !form.title.trim() ||
      !form.recruitmentDeadline ||
      !Number.isFinite(budgetAmount) ||
      budgetAmount <= 0 ||
      !Number.isFinite(expectedDurationDays) ||
      expectedDurationDays <= 0 ||
      form.projectFields.length === 0 ||
      !form.planningStatus.trim() ||
      !form.meetingRegion.trim() ||
      !form.workDescription.trim() ||
      !form.progressMethod.trim() ||
      techStacks.length === 0
    ) {
      setSubmitState({
        isSubmitting: false,
        errorMessage: '필수 항목을 모두 올바르게 입력해주세요.',
        successMessage: null,
      })
      return
    }

    const payload: ClientProjectCreateInput = {
      title: form.title.trim(),
      recruitmentDeadline: form.recruitmentDeadline,
      projectType: form.projectType,
      budgetAmount,
      expectedDurationDays,
      projectFields: form.projectFields,
      planningStatus: form.planningStatus.trim(),
      meetingRegion: form.meetingRegion.trim(),
      workDescription: form.workDescription.trim(),
      progressMethod: form.progressMethod.trim(),
      techStacks,
      kickoffSchedule: form.kickoffSchedule.trim() || undefined,
    }

    setSubmitState({
      isSubmitting: true,
      errorMessage: null,
      successMessage: null,
    })

    try {
      const result = await createClientProject(payload)
      setForm(INITIAL_FORM)
      setSubmitState({
        isSubmitting: false,
        errorMessage: null,
        successMessage: `프로젝트가 등록되었습니다. 프로젝트 번호는 ${result.projectId}입니다.`,
      })
    } catch (error) {
      setSubmitState({
        isSubmitting: false,
        errorMessage:
          error instanceof Error ? error.message : '프로젝트 등록 중 문제가 발생했습니다. 다시 시도해주세요.',
        successMessage: null,
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-5 py-16">
        <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="border-b border-line px-8 py-6">
            <p className="text-[14px] font-medium text-[#39b9ea]">Client Project</p>
            <h1 className="mt-3 text-[30px] font-bold text-ink">프로젝트 의뢰하기</h1>
            <p className="mt-3 max-w-[760px] text-[14px] leading-7 text-dim">
              PPT 요구사항 기준 필수 항목만 구성했습니다. 등록 후에는 의뢰인 마이페이지에서 프로젝트
              목록과 지원자 현황을 확인할 수 있습니다.
            </p>
          </div>

          {sessionUser === undefined ? (
            <NoticeBox
              title="세션을 확인하는 중입니다."
              description="로그인 정보를 확인한 뒤 프로젝트 등록 폼을 표시합니다."
            />
          ) : !sessionUser ? (
            <NoticeBox
              title="로그인이 필요합니다."
              description="의뢰인 계정으로 로그인한 뒤 프로젝트를 등록할 수 있습니다."
              actionHref="/m0/s02"
              actionLabel="로그인 페이지로 이동"
            />
          ) : sessionUser.role !== 'client' ? (
            <NoticeBox
              title="의뢰인 계정 전용 기능입니다."
              description="개발자 계정에서는 프로젝트 등록 기능을 사용할 수 없습니다."
            />
          ) : (
            <form className="px-8 py-8" onSubmit={(event) => void handleSubmit(event)}>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField label="프로젝트명">
                  <TextInput
                    value={form.title}
                    placeholder="예: 신규 예약 서비스 관리자 페이지 구축"
                    onChange={(value) => updateField('title', value)}
                  />
                </FormField>

                <FormField label="모집마감일">
                  <input
                    type="date"
                    value={form.recruitmentDeadline}
                    onChange={(event) => updateField('recruitmentDeadline', event.target.value)}
                    className="h-11 w-full rounded-sm border border-line bg-page px-4 text-[14px] text-ink outline-none"
                  />
                </FormField>

                <FormField label="고용형태">
                  <select
                    value={form.projectType}
                    onChange={(event) =>
                      updateField('projectType', event.target.value as 'outsourcing' | 'resident')
                    }
                    className="h-11 w-full rounded-sm border border-line bg-page px-4 text-[14px] text-ink outline-none"
                  >
                    <option value="outsourcing">도급외주</option>
                    <option value="resident">상주</option>
                  </select>
                </FormField>

                <FormField label={form.projectType === 'outsourcing' ? '제작예산' : '월급여'}>
                  <UnitInput
                    value={form.budgetAmount}
                    unit="만원"
                    placeholder="예산 입력"
                    onChange={(value) => updateField('budgetAmount', value)}
                  />
                </FormField>

                <FormField label="예상기간">
                  <UnitInput
                    value={form.expectedDurationDays}
                    unit="일"
                    placeholder="예상 기간 입력"
                    onChange={(value) => updateField('expectedDurationDays', value)}
                  />
                </FormField>

                <FormField label="예상 킥오프 일정">
                  <TextInput
                    value={form.kickoffSchedule}
                    placeholder="비워두면 '미팅 후'로 저장됩니다."
                    onChange={(value) => updateField('kickoffSchedule', value)}
                  />
                </FormField>
              </div>

              <div className="mt-6">
                <FormField label="프로젝트 분야">
                  <div className="flex flex-wrap gap-3">
                    {CATEGORY_OPTIONS.map((category) => {
                      const checked = form.projectFields.includes(category)

                      return (
                        <label
                          key={category}
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2 text-[14px] ${
                            checked
                              ? 'border-[#39b9ea] bg-[#f3fbff] text-[#2d85b3]'
                              : 'border-line bg-page text-dim'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              if (event.target.checked) {
                                updateField('projectFields', [...form.projectFields, category])
                                return
                              }

                              updateField(
                                'projectFields',
                                form.projectFields.filter((item) => item !== category),
                              )
                            }}
                          />
                          {category}
                        </label>
                      )
                    })}
                  </div>
                </FormField>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <FormField label="기획상태">
                  <TextInput
                    value={form.planningStatus}
                    placeholder="예: 상세기획 보유"
                    onChange={(value) => updateField('planningStatus', value)}
                  />
                </FormField>

                <FormField label="미팅 희망 지역">
                  <TextInput
                    value={form.meetingRegion}
                    placeholder="예: 서울 강남구"
                    onChange={(value) => updateField('meetingRegion', value)}
                  />
                </FormField>
              </div>

              <div className="mt-6">
                <FormField label="프로젝트 진행 방식">
                  <TextArea
                    value={form.progressMethod}
                    placeholder="예: 주 1회 오프라인 미팅, 나머지는 온라인 협업"
                    onChange={(value) => updateField('progressMethod', value)}
                  />
                </FormField>
              </div>

              <div className="mt-6">
                <FormField label="업무내용">
                  <TextArea
                    value={form.workDescription}
                    placeholder="실제 의뢰하고 싶은 업무 내용을 입력해주세요."
                    onChange={(value) => updateField('workDescription', value)}
                  />
                </FormField>
              </div>

              <div className="mt-6">
                <FormField label="필요 기술 스택">
                  <TextInput
                    value={form.techStacks}
                    placeholder="예: React, Spring Boot, MySQL"
                    onChange={(value) => updateField('techStacks', value)}
                  />
                  <HelperText>쉼표로 구분해서 여러 기술을 입력할 수 있습니다.</HelperText>
                </FormField>
              </div>

              {submitState.errorMessage ? (
                <p className="mt-6 rounded-sm border border-[#ffd4d4] bg-[#fff5f5] px-4 py-3 text-[13px] leading-6 text-[#ba4545]">
                  {submitState.errorMessage}
                </p>
              ) : null}

              {submitState.successMessage ? (
                <p className="mt-6 rounded-sm border border-[#caefdb] bg-[#f3fff7] px-4 py-3 text-[13px] leading-6 text-[#247a4d]">
                  {submitState.successMessage}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitState.isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[#39b9ea] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitState.isSubmitting ? '등록 중...' : '프로젝트 등록하기'}
                </button>
                <a
                  href="/mypage"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-line bg-page px-6 text-sm font-semibold text-dim"
                >
                  마이페이지로 이동
                </a>
              </div>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
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
    <div className="px-8 py-8">
      <div className="rounded-sm border border-line bg-[#fafafa] px-5 py-5">
        <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-[14px] leading-7 text-dim">{description}</p>
        {actionHref && actionLabel ? (
          <a
            href={actionHref}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-md bg-[#39b9ea] px-5 text-sm font-semibold text-white"
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

function TextInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-sm border border-line bg-page px-4 text-[14px] text-ink outline-none placeholder:text-pale"
    />
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
      className="min-h-[140px] w-full rounded-sm border border-line bg-page px-4 py-3 text-[14px] leading-7 text-ink outline-none placeholder:text-pale"
    />
  )
}
