import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { getProjectById } from '@/entities/project'
import type { ProjectDetail } from '@/entities/project'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

import './project-detail-page.css'

type ProjectLoadState = {
  isLoading: boolean
  errorMessage: string | null
  project: ProjectDetail | null
}

const SUMMARY_TAB_ATTRS = { 'target-div': 'projectViewConMidArticle' } as Record<string, string>
const WORK_TAB_ATTRS = { 'target-div': 'projectInfoDataDiv' } as Record<string, string>
const RECRUIT_TAB_ATTRS = { 'target-div': 'recruitMemoDiv' } as Record<string, string>

const PROFILE_ACTIONS = ['가입정보 등록', '기술정보 등록', '경력정보 등록', '포트폴리오 등록하기']

function formatProjectType(type: ProjectDetail['type']) {
  return type === 'budget' ? '도급' : '상주'
}

function formatTypeClass(type: ProjectDetail['type']) {
  return type === 'budget' ? 'b' : 'r'
}

function formatStatusLabel(status: ProjectDetail['status']) {
  return status === '마감' ? '마감' : '모집중'
}

function formatStatusClass(status: ProjectDetail['status']) {
  return status === '마감' ? 'c' : 'e'
}

function formatEmploymentLabel(type: ProjectDetail['type']) {
  return type === 'budget' ? '도급외주' : '상주(기간제)'
}

function formatWorkTypeValue(type: ProjectDetail['type']) {
  return type === 'budget' ? '1' : '3'
}

function formatBudgetLabel(project: ProjectDetail) {
  return project.type === 'budget' ? '예상비용' : '월임금'
}

function formatProjectBudget(project: ProjectDetail) {
  if (project.type === 'budget') {
    if (project.quoteLow === project.quoteHigh) {
      return `${project.quoteHigh.toLocaleString()} 만원`
    }

    return `${project.quoteLow.toLocaleString()} ~ ${project.quoteHigh.toLocaleString()} 만원`
  }

  return `${project.averageEstimate.toLocaleString()} 만원`
}

function formatTopDeadlineLabel(label: string) {
  if (!label) {
    return ''
  }

  return label.endsWith('일') ? label : `${label}일`
}

function formatDeadlineValue(project: ProjectDetail) {
  return [project.deadline, formatTopDeadlineLabel(project.deadlineLabel)].filter(Boolean).join(' ')
}

function formatPostedAtDisplay(date: string) {
  return date.replace(/-/g, '.')
}

function normalizeText(value: string) {
  return value.replace(/\r\n/g, '\n').trim()
}

function hasVisibleSkills(project: ProjectDetail) {
  return project.skills.some((skill) => skill.trim().length > 0)
}

function buildWorkContent(project: ProjectDetail) {
  const workMethod = normalizeText(project.workMethod)
  const description = normalizeText(project.workDescription)
  const summary = normalizeText(project.summary)

  if (description.includes('※ 프로젝트 진행 방식') || description.includes('────────────────────────')) {
    return description
  }

  const sections: string[] = []

  if (description) {
    sections.push(description)
  }

  if (workMethod) {
    sections.push(`※ 프로젝트 진행 방식\n\n${workMethod}`)
  }

  if (summary && !description.includes(summary)) {
    sections.push(`※ 프로젝트 개요\n\n${summary}`)
  }

  return sections.join('\n\n────────────────────────\n\n') || '상세 업무 내용이 아직 등록되지 않았습니다.'
}

function formatContractAmount(amount: number) {
  return `${amount.toLocaleString()}원`
}

function buildApplyHref(projectId: number) {
  return `/m4/s41v/apply?projectId=${projectId}`
}

export function ProjectDetailPage({ projectId }: { projectId: number }) {
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

        if (!project) {
          setState({
            isLoading: false,
            errorMessage: null,
            project: null,
          })
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
          title="프로젝트 정보를 불러오는 중입니다."
          description="상세 화면과 우측 패널 구성을 준비하고 있습니다."
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
  const projectFieldValue = project.categories.join(',')
  const visibleSkills = project.skills.filter((skill) => skill.trim().length > 0)
  void formatEmploymentLabel(project.type)

  return (
    <div className="project-detail-page">
      <SiteHeader />
      <main className="project-detail-page__main">
        <div className="project-detail-page__layout">
          <div className="projectViewCon">
            <div className="projectViewConTop">
              <div>
                <div className="projectAttr">
                  <p className={formatTypeClass(project.type)}>{formatProjectType(project.type)}</p>
                  <p className={formatStatusClass(project.status)}>{formatStatusLabel(project.status)}</p>
                </div>
                <div>
                  <b>
                    등록일 : <span className="projectInfoDate">{formatPostedAtDisplay(project.postedAt)}</span>
                  </b>
                </div>
              </div>

              <p className="projectInfoData" data-name="title">
                {project.title}
              </p>

              <ul>
                <li>
                  <span className="projectCostDataKey">{formatBudgetLabel(project)}</span>
                  <b className="projectCostData" data-name="costView">
                    {formatProjectBudget(project)}
                  </b>
                </li>
                <li>
                  <span>예상기간</span>
                  <b className="projectInfoData" data-name="during">
                    {project.averagePeriodDays}
                  </b>
                  <b>일</b>
                </li>
                <li>
                  <span>지원자수</span>
                  <b className="bg projectInfoData" data-name="ALL_APPLY_COUNT">
                    {project.applicants}
                  </b>
                </li>
                <li>
                  <span>마감일정</span>
                  <b className="dday_view">{formatTopDeadlineLabel(project.deadlineLabel)}</b>
                </li>
              </ul>

              {hasVisibleSkills(project) ? (
                <article className="prj-need-tech-new">
                  <span>관련기술</span>
                  {visibleSkills.map((skill) => (
                    <p key={skill}>{skill}</p>
                  ))}
                </article>
              ) : null}

              <section className="projectViewMidMenu">
                <p className="projectViewMidMenuItem selected" {...SUMMARY_TAB_ATTRS}>
                  요약
                </p>
                <p className="projectViewMidMenuItem" {...WORK_TAB_ATTRS}>
                  업무내용
                </p>
                <p
                  className="projectViewMidMenuItem"
                  id="projectViewMidMenuRecruitMemo"
                  style={{ display: 'none' }}
                  {...RECRUIT_TAB_ATTRS}
                >
                  모집요건
                </p>
              </section>
            </div>

            <div className="projectViewConMid">
              <article id="projectViewConMidArticle">
                <div>
                  <h3>요약</h3>
                  <article>
                    <ProjectSummaryRow label="모집 마감일">
                      <b className="enddate_custom">{formatDeadlineValue(project)}</b>
                    </ProjectSummaryRow>
                    <ProjectSummaryRow label="예상 킥오프 일정">
                      <b className="projectInfoData" data-name="BEGIN_EXPECT">
                        {project.kickoffSchedule}
                      </b>
                    </ProjectSummaryRow>
                    <p>
                      <input type="hidden" id="projectWorkType" value={formatWorkTypeValue(project.type)} readOnly />
                      <span>고용형태</span>
                      <b className="item02 workType01" style={{ display: project.type === 'budget' ? undefined : 'none' }}>
                        도급외주
                      </b>
                      <b className="item02 workType02" style={{ display: 'none' }}>
                        상주(시간제)
                      </b>
                      <b className="item02 workType03" style={{ display: project.type === 'resident' ? undefined : 'none' }}>
                        상주(기간제)
                      </b>
                      <b className="item02 workType04" style={{ display: 'none' }}>
                        상주
                      </b>
                    </p>
                    <ProjectSummaryRow label="프로젝트 분야">
                      <b className="projectInfoData" data-name="proj_filed_new">
                        {projectFieldValue}
                      </b>
                    </ProjectSummaryRow>
                    <ProjectSummaryRow label="진행 분류">
                      <b className="projectType">{project.progressType}</b>
                    </ProjectSummaryRow>
                    <ProjectSummaryRow label="기획 상태">
                      <b className="projectInfoData" data-name="plan_nm">
                        {project.planningStatus}
                      </b>
                    </ProjectSummaryRow>
                    <ProjectSummaryRow label="미팅 희망 지역">
                      <b className="projectInfoData" data-name="pvNmu">
                        {project.meetingLocation}
                      </b>
                    </ProjectSummaryRow>
                  </article>
                </div>

                <section className="projectViewApplyHidenContens">
                  <div id="projectInfoDataDiv">
                    <h3>업무내용</h3>
                    <pre className="projectInfoData" data-name="txt" id="projectInfoDataDetail">
                      {buildWorkContent(project)}
                    </pre>
                  </div>

                  <div className="stayProjectDiv" style={{ display: 'none' }}>
                    <div>
                      <p className="tit">상주 프로젝트 추천을 받아보시겠어요?</p>
                      <p className="sub">조건에 맞는 다음 프로젝트를 추천받을 수 있도록 준비된 영역입니다.</p>
                    </div>
                    <div className="stayProjectPlaceholder" aria-hidden="true" />
                    <div>
                      <button type="button" className="stayCheckClass modalBtn_new">
                        추천받기
                      </button>
                    </div>
                  </div>

                  <div id="recruitMemoDiv" style={{ display: 'none' }}>
                    <h3>모집요건</h3>
                    <pre className="recruitMemo"></pre>
                  </div>

                  <div id="projectAddFilesDiv" style={{ display: 'none' }}>
                    <h3>참고자료</h3>
                    <div className="projectAddFilesNone">
                      <div>첨부된 참고자료가 없습니다.</div>
                    </div>
                    <div className="projectAddFilesShow"></div>
                  </div>

                </section>
              </article>
            </div>
          </div>

          <aside className="project-detail-aside">
            <div className="project-detail-aside__panel">
              <ProfileSetupCard />
              <a href={buildApplyHref(project.id)} className="project-detail-apply-link">
                지원하기
              </a>
              <button type="button" className="project-detail-interest-link">
                <HeartOutlineIcon />
                관심 프로젝트 지정
              </button>
              <ClientInfoCard project={project} />
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
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

function ProjectSummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p>
      <span>{label}</span>
      {children}
    </p>
  )
}

function ProfileSetupCard() {
  return (
    <section className="project-detail-setup-card">
      <p className="project-detail-setup-card__title">프로필 정보 등록하기</p>
      <p className="project-detail-setup-card__description">
        프로젝트 지원을 위하여 아래 항목들을 입력해주세요.
      </p>

      <div className="project-detail-setup-card__actions">
        {PROFILE_ACTIONS.map((label) => (
          <button key={label} type="button" className="project-detail-setup-action">
            <span className="project-detail-setup-action__icon">+</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <button type="button" className="project-detail-setup-submit" disabled>
        정보 등록 후 지원 가능
      </button>
    </section>
  )
}

function ClientInfoCard({ project }: { project: ProjectDetail }) {
  const displayId =
    typeof project.clientDisplayId === 'string' && project.clientDisplayId.trim().length > 0
      ? project.clientDisplayId.trim()
      : 'cli***'
  const region =
    typeof project.clientRegion === 'string' && project.clientRegion.trim().length > 0
      ? project.clientRegion.trim()
      : project.meetingLocation

  return (
    <section className="project-detail-client-card">
      <p className="project-detail-client-card__title">클라이언트 정보</p>

      <div className="project-detail-client-card__profile">
        <div className="project-detail-client-card__avatar">{displayId.charAt(0).toUpperCase()}</div>
        <div className="project-detail-client-card__meta">
          <p className="project-detail-client-card__name">{displayId}</p>
          <p className="project-detail-client-card__region">{region}</p>
          <p className="project-detail-client-card__verified">연락처 인증</p>
        </div>
      </div>

      <ul className="project-detail-client-card__stats">
        <ClientInfoItem label="등록 프로젝트" value={`${project.clientProjectCount}건`} />
        <ClientInfoItem label="계약" value={`${project.clientContractCount}건`} />
        <ClientInfoItem label="누적 계약 금액" value={formatContractAmount(project.clientTotalContractAmount)} />
      </ul>
    </section>
  )
}

function ClientInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <li>
      <span>{label}</span>
      <b>{value}</b>
    </li>
  )
}

function HeartOutlineIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 16.5C9.75 16.5 9.51 16.41 9.32 16.24C8.49 15.5 7.71 14.83 7.04 14.25C5.05 12.53 3.86 11.5 3.02 10.52C2.07 9.43 1.5 8.37 1.5 7C1.5 4.51 3.42 2.5 5.85 2.5C7.23 2.5 8.54 3.16 9.38 4.19L10 4.95L10.62 4.19C11.46 3.16 12.77 2.5 14.15 2.5C16.58 2.5 18.5 4.51 18.5 7C18.5 8.37 17.93 9.43 16.98 10.52C16.14 11.5 14.95 12.53 12.96 14.25C12.29 14.83 11.51 15.5 10.68 16.24C10.49 16.41 10.25 16.5 10 16.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  )
}
