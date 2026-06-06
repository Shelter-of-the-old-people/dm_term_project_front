import { useState } from 'react'

import { clearSessionUser, useSessionUser } from '@/shared/lib'
import { PillButton } from '@/shared/ui'

const NAV_ITEMS = [
  { label: '프로젝트', href: '/m4/s41?page=1' },
  { label: '파트너스', href: '/home#partners' },
  { label: '포트폴리오 검색', href: '/home#portfolio' },
  { label: '이용후기', href: '/home#reviews' },
]

const MORE_ITEMS = [
  { label: '이용방법', href: 'https://www.freemoa.net/m1/guide?tab=guide_client' },
  { label: '블로그', href: 'https://blog.naver.com/freemoa1' },
  { label: '예상견적 조회', href: '/m4/s41?page=1' },
  { label: '프리미엄 PRO', href: 'https://pro.freemoa.net' },
  { label: '개발자 채용', href: 'https://www.freemoa.net/teamdev' },
  { label: '유지보수', href: 'https://www.freemoa.net/management' },
]

export function SiteHeader() {
  const [moreOpen, setMoreOpen] = useState(false)
  const sessionUser = useSessionUser()

  return (
    <header className="fixed left-0 right-0 top-0 z-[2000] border-b border-line bg-page">
      <div className="mx-auto flex h-[68px] max-w-[1080px] items-center justify-between px-5">
        <a href="/" className="mr-9 flex-shrink-0" aria-label="FREEMOA 홈">
          <img src="/freemoa-logo.svg" alt="FREEMOA" width="90" height="17" />
        </a>

        <nav className="flex flex-1 items-center" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}

          <div
            className="relative inline-flex items-center"
            onMouseEnter={() => setMoreOpen(true)}
            onMouseLeave={() => setMoreOpen(false)}
          >
            <button type="button" className="nav-link">
              {moreOpen ? '닫기' : '더보기'}
            </button>

            {moreOpen ? (
              <ul
                className="more-dropdown absolute left-0 top-[calc(100%+1px)] z-50 m-0 min-w-[148px] list-none border border-[#e0e0e0] border-t-2 border-t-brand bg-page py-1 shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
                role="menu"
              >
                {MORE_ITEMS.map((item) => (
                  <li key={item.href} role="menuitem">
                    <a
                      href={item.href}
                      className="block px-[18px] py-[9px] text-[13px] text-[#444] transition-colors hover:bg-[#fff5ef] hover:text-brand"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </nav>

        <div className="ml-5 flex flex-shrink-0 items-center gap-2">
          {sessionUser === undefined ? (
            <span className="text-[13px] text-[#888]">세션 확인 중</span>
          ) : sessionUser ? (
            <>
              <a href="/mypage" className="text-[13px] text-[#555] transition-colors hover:text-ink">
                마이페이지
              </a>
              <span className="select-none text-xs text-[#d0d0d0]">|</span>
              <button
                type="button"
                onClick={() => {
                  void clearSessionUser().finally(() => {
                    window.location.assign('/')
                  })
                }}
                className="text-[13px] text-[#555] transition-colors hover:text-ink"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <a href="/m0/s02" className="text-[13px] text-[#555] transition-colors hover:text-ink">
                로그인
              </a>
              <span className="select-none text-xs text-[#d0d0d0]">|</span>
              <a href="/m0/jointype" className="text-[13px] text-[#555] transition-colors hover:text-ink">
                회원가입
              </a>
            </>
          )}

          <PillButton
            href="/m4/regProject"
            variant="primary"
            className="ml-1.5 h-9 min-w-[110px] px-4 text-base"
          >
            무료 견적 문의
          </PillButton>
        </div>
      </div>
    </header>
  )
}
