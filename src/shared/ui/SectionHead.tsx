import { ChevronRight } from 'lucide-react'

type SectionHeadProps = {
  title: string
  moreHref?: string
  moreLabel?: string
}

export function SectionHead({ title, moreHref, moreLabel = '더보기' }: SectionHeadProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <h2 className="m-0 text-[30px] leading-[44px] font-bold text-ink">{title}</h2>
      {moreHref ? (
        <a
          href={moreHref}
          className="inline-flex items-center gap-0.5 text-lg text-ink transition-colors hover:text-brand"
        >
          {moreLabel}
          <ChevronRight size={19} />
        </a>
      ) : null}
    </div>
  )
}
