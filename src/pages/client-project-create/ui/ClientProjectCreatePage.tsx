import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

const REQUIRED_FIELDS = [
  '프로젝트명',
  '모집마감일',
  '고용형태',
  '예산',
  '프로젝트 분야',
  '기획상태',
  '미팅 희망 지역',
  '업무내용',
  '프로젝트 진행 방식',
  '필요 기술 스택',
]

export function ClientProjectCreatePage() {
  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-16">
        <section className="rounded-3xl border border-line bg-page p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Client Project</p>
          <h1 className="mt-4 text-3xl font-bold text-ink">무료 견적 의뢰</h1>
          <p className="mt-3 max-w-[760px] text-base leading-7 text-dim">
            지금은 페이지 이동과 화면 구조를 확인할 수 있도록 필수 입력 항목 중심의 폼만
            먼저 열어둔 상태입니다. 실제 저장은 백엔드 API가 연결되면 이어집니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {REQUIRED_FIELDS.map((field) => (
              <label key={field} className="block">
                <span className="mb-2 block text-sm font-semibold text-ink">{field}</span>
                <input
                  type="text"
                  placeholder={`${field} 입력`}
                  className="h-12 w-full rounded-2xl border border-line px-4 text-sm text-ink outline-none transition-colors focus:border-brand"
                />
              </label>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white"
            >
              저장 준비중
            </button>
            <a
              href="/m4/s41?page=1"
              className="inline-flex h-12 items-center justify-center rounded-pill border border-line bg-page px-6 text-sm font-semibold text-dim"
            >
              프로젝트 목록으로
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
