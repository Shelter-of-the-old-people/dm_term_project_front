const FOOTER_LINKS = [
  { label: '프리모아 스토리', href: '/m1/introduce1' },
  { label: '이용약관', href: '#' },
  { label: '개인정보취급방침', href: '#', emphasized: true },
  { label: '자주 찾는 질문', href: '/m2/customer_main' },
  { label: '페이스북', href: 'https://www.facebook.com/freemoa.net', external: true },
  { label: '네이버 포스트', href: 'http://post.naver.com/freemoa1', external: true },
  { label: '네이버 블로그', href: 'http://blog.naver.com/freemoa1', external: true },
  { label: '카카오톡 채널', href: 'https://pf.kakao.com/_rUrxdxd', external: true },
  { label: '유튜브', href: 'https://youtu.be/Dpv9wCWg5-Q', external: true },
]

const META_LINES = [
  '히어로하우스 주식회사 / 대표 : 조재인',
  '사업자등록번호 : 585-86-03332',
  '서울특별시 강남구 선릉로100길 30, 유니콘빌딩 B1층',
  '고객센터 : 02-6497-3300  |  월-금 10:00 - 17:00 * 공휴일 휴무',
  '프리모아 협업 제안 : contact@freemoa.net',
  'Copyright 2024 Herohouse',
]

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-page">
      <div className="mx-auto max-w-330 px-5 py-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-5">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-[13px] hover:underline ${link.emphasized ? 'text-ink font-semibold' : 'text-quiet'}`}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {META_LINES.map((line) => (
            <span key={line} className="text-[13px] text-quiet leading-relaxed">{line}</span>
          ))}
        </div>
      </div>
    </footer>
  )
}
