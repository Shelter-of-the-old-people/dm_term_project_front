import { clearSessionUser, useSessionUser } from '@/shared/lib'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

export function MyPagePage() {
  const sessionUser = useSessionUser()

  if (sessionUser === undefined) {
    return (
      <div className="min-h-screen bg-soft">
        <SiteHeader />
        <main className="mx-auto max-w-[720px] px-5 py-16">
          <section className="rounded-3xl border border-line bg-page p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-ink">세션을 확인하는 중입니다.</h1>
            <p className="mt-3 text-base leading-7 text-dim">
              로그인 정보를 불러온 뒤 마이페이지를 표시합니다.
            </p>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-soft">
        <SiteHeader />
        <main className="mx-auto max-w-[720px] px-5 py-16">
          <section className="rounded-3xl border border-line bg-page p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-ink">로그인이 필요합니다.</h1>
            <p className="mt-3 text-base leading-7 text-dim">
              마이페이지는 로그인 후에만 확인할 수 있습니다.
            </p>
            <a
              href="/m0/s02"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white"
            >
              로그인 페이지로 이동
            </a>
          </section>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const roleLabel = sessionUser.role === 'developer' ? '개발자' : '클라이언트'

  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-[1080px] px-5 py-16">
        <section className="rounded-3xl border border-line bg-page p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">My Page</p>
          <h1 className="mt-4 text-3xl font-bold text-ink">{sessionUser.name}님, 반갑습니다.</h1>
          <p className="mt-3 text-base leading-7 text-dim">
            현재 백엔드 세션 기준으로 로그인된 상태입니다. 역할은 {roleLabel}이며, 이후 마이페이지 기능이 추가되면 이 정보를
            기준으로 화면이 확장됩니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard label="이름" value={sessionUser.name} />
            <InfoCard label="아이디" value={sessionUser.loginId} />
            <InfoCard label="역할" value={roleLabel} />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="/m4/s41?page=1"
              className="inline-flex h-12 items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white"
            >
              프로젝트 보러가기
            </a>
            {sessionUser.role === 'client' ? (
              <a
                href="/m4/regProject"
                className="inline-flex h-12 items-center justify-center rounded-pill border border-line bg-page px-6 text-sm font-semibold text-dim"
              >
                프로젝트 등록하기
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => {
                void clearSessionUser().finally(() => {
                  window.location.assign('/')
                })
              }}
              className="inline-flex h-12 items-center justify-center rounded-pill border border-line bg-page px-6 text-sm font-semibold text-dim"
            >
              로그아웃
            </button>
          </div>
        </section>
      </main>
      <SiteFooter />
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
