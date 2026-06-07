import type { ReactNode } from 'react'
import { Play } from 'lucide-react'

const FOOTER_LINKS = [
  { label: '프리모아 스토리', href: '/m1/introduce1' },
  { label: '이용약관', href: '#' },
  { label: '개인정보취급방침', href: '#', emphasized: true },
  { label: '자주 찾는 질문', href: '/m2/customer_main' },
]

const SOCIAL_LINKS = [
  {
    label: '페이스북',
    href: 'https://www.facebook.com/freemoa.net',
    badgeClassName: 'bg-[#2352a5] text-white',
    content: <span className="text-[20px] font-semibold lowercase leading-none">f</span>,
  },
  {
    label: '네이버 포스트',
    href: 'http://post.naver.com/freemoa1',
    badgeClassName: 'bg-[#1ec800] text-white',
    content: <span className="text-[13px] font-semibold uppercase leading-none">N</span>,
  },
  {
    label: '네이버 블로그',
    href: 'http://blog.naver.com/freemoa1',
    badgeClassName: 'bg-[#22c55e] text-white',
    content: <span className="text-[13px] font-semibold lowercase leading-none">b</span>,
  },
  {
    label: '카카오톡 채널',
    href: 'https://pf.kakao.com/_rUrxdxd',
    badgeClassName: 'bg-[#ffd400] text-[#3b2b16]',
    content: <span className="text-[13px] font-bold uppercase leading-none">k</span>,
  },
  {
    label: '유튜브',
    href: 'https://youtu.be/Dpv9wCWg5-Q',
    badgeClassName: 'bg-[#f3342b] text-white',
    content: <Play size={14} className="translate-x-[1px] fill-white text-white" />,
  },
]

export function SiteFooter() {
  return (
    <footer className="relative z-[2] flex w-full flex-wrap justify-center border-t border-[#e8e8e8] bg-white">
      <div className="w-full max-w-[1080px] shrink-0">
        <div className="flex h-[74px] items-center justify-between bg-white">
          <div className="flex shrink-0 items-center">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`mr-[54px] text-center text-[17px] leading-none text-[#262626] transition-colors duration-200 hover:text-[#31d0f4] ${
                  link.emphasized ? 'pt-[1px] font-semibold' : ''
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex shrink-0 items-center">
            {SOCIAL_LINKS.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className={`${index === 0 ? '' : 'ml-[20px]'} block h-[37px] w-[37px]`}
              >
                <span
                  className={`flex h-full w-full items-center justify-center rounded-full ${link.badgeClassName}`}
                >
                  {link.content}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-center bg-[#555555] py-[40px]">
        <div className="w-full max-w-[1080px] text-white">
          <div className="flex flex-wrap items-end">
            <h1 className="mr-[8px] text-[25px] leading-[27px] font-semibold">
              고객센터 : 02-6497-3300
            </h1>
            <FooterMetaText>
              월-금 10:00 - 17:00 <span className="text-[14px]">* 공휴일 휴무</span>
            </FooterMetaText>
            <FooterMetaText>프리모아 협업 제안 : contact@freemoa.net</FooterMetaText>
          </div>

          <div className="mt-[20px] mb-[30px] flex flex-wrap items-center">
            <FooterMetaText>히어로하우스 주식회사</FooterMetaText>
            <FooterMetaText noBorder>대표 : 조재인</FooterMetaText>
            <FooterMetaText>사업자등록번호 : 585-86-03332</FooterMetaText>
            <FooterMetaText>서울특별시 강남구 선릉로100길 30, 유니콘빌딩 B1층</FooterMetaText>
          </div>

          <div className="flex">
            <p className="text-[15px] leading-none text-[#aaaaaa]">
              Copyright 2024 Herohouse Inc., All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterMetaText({
  children,
  noBorder = false,
}: {
  children: ReactNode
  noBorder?: boolean
}) {
  return (
    <div className="mr-[10px] flex h-[18px] items-center text-[18px] leading-[16px]">
      {noBorder ? null : (
        <span className="ml-[10px] mr-[10px] h-[18px] w-px bg-[#aaaaaa]" aria-hidden="true" />
      )}
      <p>{children}</p>
    </div>
  )
}
