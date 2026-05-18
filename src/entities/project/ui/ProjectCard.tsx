import { CalendarClock, Clock3, UsersRound, WalletCards } from 'lucide-react'

import { Badge } from '@/shared/ui'

import type { Project } from '../model/types'

export function ProjectCard({ project }: { project: Project }) {
  const tone = project.status === '마감임박' ? 'orange' : project.status === '검수중' ? 'gray' : 'blue'

  return (
    <article className="flex flex-col gap-2.5 bg-page border border-line rounded-md px-6 py-5 hover:shadow-card transition-shadow duration-200 cursor-pointer">
      <div className="flex items-center justify-between">
        <Badge tone={tone}>{project.status}</Badge>
        <span className="text-[13px] text-pale">{project.area}</span>
      </div>

      <h3 className="text-[16px] font-semibold text-ink leading-snug m-0">{project.title}</h3>

      <p className="text-[13px] text-dim m-0">
        최고 / 최저 견적 {project.quoteHigh.toLocaleString()} ~ {project.quoteLow.toLocaleString()} 만원
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-dim">
          <WalletCards size={15} className="shrink-0 text-pale" />
          평균견적 {project.averageEstimate.toLocaleString()} 만원
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-dim">
          <Clock3 size={15} className="shrink-0 text-pale" />
          평균기간 {project.averagePeriodDays}일
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-dim">
          <UsersRound size={15} className="shrink-0 text-pale" />
          지원 {project.applicants}명
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-dim">
          <CalendarClock size={15} className="shrink-0 text-pale" />
          D-{project.deadlineDays}
        </span>
      </div>

      <p className="text-[14px] text-dim leading-relaxed line-clamp-3 m-0">{project.summary}</p>

      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {project.skills.map((skill) => (
          <span key={skill} className="text-[12px] text-quiet bg-neutral px-2 py-0.5 rounded-sm">
            {skill}
          </span>
        ))}
      </div>
    </article>
  )
}
