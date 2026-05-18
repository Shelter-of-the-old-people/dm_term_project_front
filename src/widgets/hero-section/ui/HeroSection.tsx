import { useEffect, useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { PillButton } from '@/shared/ui'

const KEYWORDS = [
  '프리랜서 개발자', '프리랜서 디자이너', '프리랜서 기획자',
  '업무시스템 개발업체', '웹서비스 개발업체', '모바일앱 개발업체',
  'AI 개발업체', '플랫폼 개발업체', '해외 개발업체',
]

const PARTNERS_ROW1 = [
  { name: '허남표', field: 'Android 앱', color: '#5b6fc8' },
  { name: '홍종근', field: '애플리케이션', color: '#e07b39' },
  { name: '오희준', field: '웹', color: '#3aaa5c' },
  { name: '이지훈', field: '웹', color: '#2196f3' },
  { name: '이유진', field: '웹', color: '#7c5cbb' },
  { name: '정경민', field: '프로그램', color: '#e84393' },
  { name: '송상욱', field: '웹', color: '#1cbfad' },
  { name: '최정회', field: '웹', color: '#f07c3a' },
  { name: '이안나', field: '그래픽', color: '#608a9c' },
  { name: '문태욱', field: '3D', color: '#6366f1' },
]

const PARTNERS_ROW2 = [
  { name: '김한종', field: 'Android 앱', color: '#65a748' },
  { name: '박진호', field: '웹', color: '#d4a017' },
  { name: '사공협', field: '웹', color: '#15998a' },
  { name: '김명준', field: '웹', color: '#d64545' },
  { name: '박재관', field: '기타 앱', color: '#7b44b5' },
  { name: '박송제', field: '웹', color: '#2196f3' },
  { name: '최홍선', field: '기타 앱', color: '#7a6255' },
  { name: '김재익', field: '프로그램', color: '#546e7a' },
  { name: '이한울', field: 'Android 앱', color: '#e07b39' },
  { name: '김우수', field: '프로그램', color: '#5b6fc8' },
]

const ROW1 = [...PARTNERS_ROW1, ...PARTNERS_ROW1, ...PARTNERS_ROW1]
const ROW2 = [...PARTNERS_ROW2, ...PARTNERS_ROW2, ...PARTNERS_ROW2]

const QUICK_TAGS = ['오픈마켓', '반려동물', '병원예약', 'O2O/중개', '배달', '교육', '헬스케어']

/* ── StatPanel data ── */
const STATS_LEFT = [
  { label: '누적 프로젝트 금액', value: '424,363,430,000', unit: '원' },
  { label: '포트폴리오 수',      value: '92,489',          unit: '건' },
]

/* ── PartnerCard (marquee용 pill 카드) ── */
function MarqueeCard({ name, field, color }: { name: string; field: string; color: string }) {
  return (
    <a
      href="/m7/s71"
      className="inline-flex shrink-0 items-center gap-2.5 px-4.5 pl-2 py-2 rounded-pill bg-white/80 backdrop-blur-sm shadow-card whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_4px_18px_rgba(0,0,0,0.14)] transition-all duration-200"
    >
      <span
        className="flex items-center justify-center w-11 h-11 rounded-full text-white text-base font-bold shrink-0"
        style={{ background: color }}
      >
        {name.charAt(0)}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-ink text-[13px] font-semibold">{name} 파트너</span>
        <span className="text-pale text-[11px]">{field}</span>
      </span>
    </a>
  )
}

export function HeroSection() {
  const [kwIdx, setKwIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setKwIdx((prev) => (prev + 1) % KEYWORDS.length)
        setVisible(true)
      }, 350)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {/* ══ HERO ══ */}
      <section className="fmh-hero">
        {/* 헤드라인 */}
        <div className="text-center px-5 pt-11 pb-12.5">
          <h3 className="m-0 text-ink leading-[1.3] word-break-keep">
            <span className="inline text-[59px] leading-15 font-light text-ink">당신이 찾는 </span>
            <span
              className={`inline text-[58px] leading-14.25 font-normal text-ink transition-[opacity,transform] duration-300 ease-in-out ${visible ? 'kw-in' : 'kw-out'}`}
              aria-live="polite"
            >
              {KEYWORDS[kwIdx]}
            </span>
            <span className="block text-[59px] leading-15 font-light text-ink mt-1.5">
              지금 <span className="text-brand">프리모아</span>에서{' '}
              <span className="text-brand">3일</span>만에
            </span>
          </h3>
        </div>

        {/* 파트너 마퀴 2행 */}
        <div className="fmh-marquee-area flex flex-col gap-2.5 mb-11">
          <div className="overflow-hidden">
            <div className="fmh-marquee-inner fmh-slide-left flex gap-2.5 w-max">
              {ROW1.map((p, i) => <MarqueeCard key={`r1-${i}`} {...p} />)}
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="fmh-marquee-inner fmh-slide-right flex gap-2.5 w-max">
              {ROW2.map((p, i) => <MarqueeCard key={`r2-${i}`} {...p} />)}
            </div>
          </div>
        </div>

        {/* 검색 패널 카드 */}
        <div className="mx-auto px-5 flex justify-center">
          <div className="flex items-center gap-5 w-full max-w-280 min-h-53 px-10 py-8.75 pb-7.5 rounded-lg bg-white/85 backdrop-blur-lg shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
            {/* 검색 입력 + 퀵태그 */}
            <div className="flex flex-col gap-3 flex-1">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="어떤 유형의 IT포트폴리오를 찾으시나요?"
                  className="w-full h-[82px] pl-6 pr-16 border border-line rounded-md text-[27px] text-ink outline-none placeholder:text-pale placeholder:text-xl focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,125,18,0.12)] transition-[border-color,box-shadow] duration-200"
                />
                <button
                  type="button"
                  aria-label="검색"
                  className="absolute right-5 flex items-center justify-center border-none bg-transparent text-brand cursor-pointer p-0"
                >
                  <Search size={28} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS.map((tag) => (
                  <a
                    key={tag}
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center h-8 px-3.5 rounded-pill border border-black/18 bg-white/70 text-dim text-[14px] whitespace-nowrap hover:border-brand hover:text-brand transition-colors"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            </div>

            {/* 또는 */}
            <span className="text-pale text-[15px] whitespace-nowrap shrink-0">또는</span>

            {/* CTA 버튼 */}
            <div className="flex flex-col gap-2.5 shrink-0 min-w-40">
              <PillButton href="/m4/regProject" variant="primary"   className="h-13 px-6 text-base font-semibold">무료 견적 의뢰</PillButton>
              <PillButton href="/search"        variant="secondary" className="h-13 px-6 text-base">간편 견적 조회</PillButton>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STAT PANEL ══ */}
      <div className="bg-page pt-22.5">
        <div className="mx-auto max-w-330 px-5 flex gap-5">
          {/* 왼쪽: 누적금액 + 포트폴리오 */}
          <div className="flex-1 flex flex-col">
            {STATS_LEFT.map((s) => (
              <div key={s.label} className="flex flex-col px-5 py-8 border-t border-b border-line first:border-b-0 last:border-t-0 [&+&]:border-t">
                <span className="text-dim text-[21px] font-semibold leading-normal">{s.label}</span>
                <strong className="mt-2 text-ink text-[46px] font-bold leading-none tracking-tight">
                  {s.value}
                  <span className="text-[17px] font-medium ml-1 text-dim">{s.unit}</span>
                </strong>
              </div>
            ))}
          </div>

          {/* 오른쪽: 진행중 프로젝트 카드 */}
          <div className="flex-1 flex flex-col justify-center px-10 py-7.5 rounded-md border border-line">
            <span className="text-dim text-[21px] font-semibold leading-normal">진행중 프로젝트 수</span>
            <strong className="mt-2 text-ink text-[46px] font-bold leading-none tracking-tight">
              101<span className="text-[17px] font-medium ml-1 text-dim">건</span>
            </strong>
            <p className="mt-3 text-quiet text-base leading-[1.6]">
              현재 프리모아를 통해 진행중인 기획, 디자인, 개발을 포함한 IT 프로젝트입니다.
            </p>
            <a href="/m4/s41" className="inline-flex items-center gap-1.5 mt-5 text-ink text-base font-semibold hover:text-brand transition-colors">
              프로젝트 보러가기
              <ChevronRight size={19} />
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
