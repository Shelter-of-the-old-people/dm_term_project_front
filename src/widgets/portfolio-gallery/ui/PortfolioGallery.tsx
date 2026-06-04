import { portfolios } from '@/entities/portfolio'
import { SectionHead } from '@/shared/ui'

export function PortfolioGallery() {
  return (
    <section id="portfolio" className="bg-page py-22.5">
      <div className="mx-auto max-w-330 px-5">
        <SectionHead title="등록된 포트폴리오로 파트너 찾기" moreHref="/#portfolio" moreLabel="전체보기" />
        <div className="scroll-row gap-0">
          {portfolios.map((portfolio) => (
            <a key={portfolio.id} href="/#portfolio" className="group mr-4 w-76.25 shrink-0 no-underline">
              <div className="mb-3 h-51 w-76.25 overflow-hidden rounded-md">
                <img
                  src={portfolio.image}
                  alt={portfolio.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h2 className="m-0 overflow-hidden px-1.25 text-[18px] font-normal text-ink text-ellipsis whitespace-nowrap">
                {portfolio.title}
              </h2>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
