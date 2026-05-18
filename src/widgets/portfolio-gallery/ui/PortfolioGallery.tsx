import { portfolios } from '@/entities/portfolio'
import { SectionHead } from '@/shared/ui'

export function PortfolioGallery() {
  return (
    <section className="bg-page py-22.5">
      <div className="mx-auto max-w-330 px-5">
        <SectionHead title="등록된 포트폴리오로 파트너 찾기" moreHref="/m7/s712" moreLabel="전체보기" />
        <div className="scroll-row gap-0">
          {portfolios.map((p) => (
            <a key={p.id} href="/m7/s712" className="shrink-0 w-76.25 mr-4 no-underline group">
              <div className="w-76.25 h-51 rounded-md overflow-hidden mb-3">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h2 className="text-[18px] font-normal text-ink px-1.25 overflow-hidden text-ellipsis whitespace-nowrap m-0">
                {p.title}
              </h2>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
