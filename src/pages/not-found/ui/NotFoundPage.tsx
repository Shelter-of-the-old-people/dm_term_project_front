import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-[720px] px-5 py-16">
        <section className="rounded-3xl border border-line bg-page p-8 text-center shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">404</p>
          <h1 className="mt-4 text-3xl font-bold text-ink">페이지를 찾을 수 없습니다.</h1>
          <p className="mt-3 text-base leading-7 text-dim">
            요청한 주소가 없거나 아직 연결되지 않은 화면입니다.
          </p>
          <a
            href="/m4/s41?page=1"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white"
          >
            프로젝트 페이지로 이동
          </a>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
