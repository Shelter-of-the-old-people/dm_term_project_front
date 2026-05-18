import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionHead } from '@/shared/ui'

const STEPS = [
  { num: '01', label: '프로젝트 등록 & 상담',  title: '마음에 드는 IT파트너를 찾고 계신가요?',           desc: '요청 내용을 작성하면 IT전문 상담매니저가 프로젝트 진단과 예산 범위를 안내합니다.' },
  { num: '02', label: 'IT 전문가 모집',         title: '24시간 이내 평균 5.6팀의 지원서를 받아보세요.',   desc: '유사 경험이 있는 파트너의 지원서를 빠르게 받아보고 조건을 비교합니다.' },
  { num: '03', label: '3자미팅 & 선정',         title: '마음에 드는 지원자에게 "미팅 요청"을 해보세요.', desc: '매니저가 미팅에 동행해 파트너 검증과 조율을 돕습니다.' },
  { num: '04', label: '계약',                   title: '복잡한 계약과정 이젠 걱정하지 마세요.',          desc: '표준계약서와 에스크로 흐름으로 복잡한 계약 과정을 정리합니다.' },
  { num: '05', label: '프로젝트 진행(PMS)',      title: '프로젝트가 "잘 진행이 되고 있는지" 궁금하셨죠?', desc: '협업툴을 통해 일정과 산출물 진행 상황을 확인합니다.' },
  { num: '06', label: '프로젝트 완료',          title: '프로젝트 완료',                                desc: '완료 선언 후 서로 평가를 남기고 다음 협업으로 연결합니다.' },
]

export function ProcessTimeline() {
  const [active, setActive] = useState(0)
  const step = STEPS[active]

  return (
    <section className="bg-page py-22.5">
      <div className="mx-auto max-w-330 px-5">
        <SectionHead title="프리모아 진행프로세스" />

        {/* 스텝 바 */}
        <div className="mt-12.5">
          <div className="h-px bg-line" />
          <ul className="flex list-none m-0 p-0">
            {STEPS.map((s, i) => (
              <li
                key={s.num}
                onClick={() => setActive(i)}
                className={`flex-1 min-w-0 pt-5 pr-2.5 cursor-pointer border-t-2 transition-colors duration-200 ${
                  i === active ? 'border-ink' : 'border-transparent'
                }`}
              >
                <b className={`block text-[13px] mb-1 font-normal ${i === active ? 'text-ink font-bold' : 'text-pale'}`}>
                  STEP {s.num}
                </b>
                <span className={`text-[14px] leading-snug word-break-keep ${i === active ? 'text-ink font-semibold' : 'text-quiet font-normal'}`}>
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 상세 카드 */}
        <div className="relative mt-5 min-h-65.5 px-15 py-10 rounded-md border border-line">
          <p className="text-[14px] text-pale tracking-wide m-0">STEP {step.num}</p>
          <h2 className="text-2xl font-bold text-ink mt-3 m-0">{step.title}</h2>
          <p className="text-base text-dim mt-3 leading-relaxed">{step.desc}</p>

          {/* 이전 버튼 */}
          <button
            type="button"
            onClick={() => setActive((i) => Math.max(0, i - 1))}
            disabled={active === 0}
            aria-label="이전 단계"
            className="absolute right-17 top-1/2 -translate-y-1/2 w-12 h-12 rounded-pill bg-page border border-line flex items-center justify-center text-dim cursor-pointer hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft size={20} />
          </button>

          {/* 다음 버튼 */}
          <button
            type="button"
            onClick={() => setActive((i) => Math.min(STEPS.length - 1, i + 1))}
            disabled={active === STEPS.length - 1}
            aria-label="다음 단계"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-pill bg-page border border-line flex items-center justify-center text-dim cursor-pointer hover:border-ink hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
