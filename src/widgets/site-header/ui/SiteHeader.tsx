import { useState } from 'react'
import { PillButton } from '@/shared/ui'

const NAV_ITEMS = [
  { label: '프로젝트',      href: '/m4/s41' },
  { label: '파트너스',      href: '/m7/s71' },
  { label: '포트폴리오 검색', href: '/m7/s712' },
  { label: '이용후기',      href: '/review/reviewList' },
]

const MORE_ITEMS = [
  { label: '이용방법',    href: '/m1/guide?tab=guide_client' },
  { label: '블로그',      href: 'https://blog.naver.com/freemoa1' },
  { label: '예상견적 조회', href: '/search' },
  { label: '프리미엄 PRO', href: 'https://pro.freemoa.net' },
  { label: '개발자 채용',  href: '/teamdev' },
  { label: '유지보수',    href: '/management' },
]

export function SiteHeader() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-[2000] border-b border-line bg-page">
      <div className="mx-auto flex h-[68px] max-w-[1080px] items-center justify-between px-5">
        {/* 로고 */}
        <a href="/" className="mr-9 flex-shrink-0" aria-label="FREEMOA 홈">
          <img src="/freemoa-logo.svg" alt="FREEMOA" width="90" height="17" />
        </a>

        {/* 메인 네비게이션 */}
        <nav className="flex flex-1 items-center" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}

          {/* 더보기 드롭다운 */}
          <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button type="button" className="nav-link">
              {moreOpen ? '접기' : '더보기'}
            </button>
            {moreOpen && (
              <ul
                className="more-dropdown absolute top-[calc(100%+1px)] left-0 z-50 min-w-[148px] py-1 m-0 list-none border border-[#e0e0e0] border-t-2 border-t-brand bg-page shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
                role="menu"
              >
                {MORE_ITEMS.map((item) => (
                  <li key={item.href} role="menuitem">
                    <a
                      href={item.href}
                      className="block px-[18px] py-[9px] text-[#444] text-[13px] hover:bg-[#fff5ef] hover:text-brand transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        {/* 우측: 로그인 | 회원가입 | CTA */}
        <div className="ml-5 flex flex-shrink-0 items-center gap-2">
          <a href="/m0/s02"    className="text-[#555] text-[13px] hover:text-ink transition-colors">로그인</a>
          <span className="text-[#d0d0d0] text-xs select-none">|</span>
          <a href="/m0/jointype" className="text-[#555] text-[13px] hover:text-ink transition-colors">회원가입</a>
          <PillButton
            href="/m4/regProject"
            variant="primary"
            className="ml-1.5 h-9 min-w-[110px] px-4 text-base"
          >
            무료 견적 의뢰
          </PillButton>
        </div>
      </div>
    </header>
  )
}
