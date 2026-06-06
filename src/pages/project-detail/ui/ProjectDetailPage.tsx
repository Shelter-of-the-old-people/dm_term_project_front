import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { getProjectById } from '@/entities/project'
import type { Project } from '@/entities/project'
import { useSessionUser } from '@/shared/lib'
import { Badge } from '@/shared/ui'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

function formatProjectType(type: Project['type']) {
  return type === 'budget' ? '도급(외주)' : '상주'
}

function formatProjectBudget(project: Project) {
  if (project.type === 'budget') {
    return `${project.quoteLow.toLocaleString()} ~ ${project.quoteHigh.toLocaleString()}만원`
  }

  return `${project.averageEstimate.toLocaleString()}만원 / 월`
}

type ProjectLoadState = {
  isLoading: boolean
  errorMessage: string | null
  project: Project | null
}

export function ProjectDetailPage({ projectId }: { projectId: number }) {
  const sessionUser = useSessionUser()
  const [state, setState] = useState<ProjectLoadState>({
    isLoading: true,
    errorMessage: null,
    project: null,
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

  if (state.isLoading) {
    return (
      <PageShell>
        <StatusCard
          eyebrow="Loading"
          title="프로젝트 정보를 불러오는 중입니다."
          description="백엔드 API 응답을 확인하고 있습니다."
        />
      </PageShell>
    )
  }

  if (state.errorMessage) {
    return (
      <PageShell>
        <StatusCard
          eyebrow="Project Error"
          title="프로젝트 정보를 불러오지 못했습니다."
          description={state.errorMessage}
        />
      </PageShell>
    )
  }

  if (!state.project) {
    return (
      <PageShell>
        <StatusCard
          eyebrow="Project Not Found"
          title="프로젝트를 찾을 수 없습니다."
          description="선택한 공고가 삭제되었거나 아직 준비되지 않았습니다."
        />
      </PageShell>
    )
  }

  const project = state.project
  const statusTone =
    project.status === '마감임박' ? 'orange' : project.status === '검수중' ? 'gray' : 'blue'

  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-12">
        <a href="/m4/s41?page=1" className="text-sm font-medium text-brand hover:underline">
          프로젝트 목록으로
        </a>

        <section className="mt-4 rounded-3xl border border-line bg-page p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="blue">{formatProjectType(project.type)}</Badge>
            <Badge tone={statusTone}>{project.status}</Badge>
            <span className="text-sm text-pale">{project.postedAt}</span>
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-tight text-ink">{project.title}</h1>
          <p className="mt-4 text-base leading-8 text-dim">{project.summary}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="프로젝트 형태" value={formatProjectType(project.type)} />
            <InfoCard label="예상 금액" value={formatProjectBudget(project)} />
            <InfoCard label="예상 기간" value={`${project.averagePeriodDays}일`} />
            <InfoCard label="지원자 수" value={`${project.applicants}명`} />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-ink">기술 스택</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-[#ffd9bb] bg-[#fff4ea] px-3 py-1 text-sm text-[#b85f17]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={sessionUser ? '/mypage' : '/m0/s02'}
              className="inline-flex h-12 items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white"
            >
              {sessionUser ? '지원 준비하기' : '로그인 후 지원하기'}
            </a>
            <a
              href="/m4/regProject"
              className="inline-flex h-12 items-center justify-center rounded-pill border border-line bg-page px-6 text-sm font-semibold text-dim"
            >
              무료 견적 문의
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-[960px] px-5 py-16">{children}</main>
      <SiteFooter />
    </div>
  )
}

function StatusCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-line bg-page p-10 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-3 text-base leading-7 text-dim">{description}</p>
      <a
        href="/m4/s41?page=1"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white"
      >
        프로젝트 목록으로 돌아가기
      </a>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-soft px-5 py-4">
      <p className="text-sm text-pale">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  )
}
