import { ChevronRight } from 'lucide-react'

type SectionHeadProps = {
  title: string
  moreHref?: string
  moreLabel?: string
}

export function SectionHead({ title, moreHref, moreLabel = '더보기' }: SectionHeadProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h2 className="text-[30px] font-bold text-ink leading-[44px] m-0">{title}</h2>
      {moreHref && (
        <a
          href={moreHref}
          className="inline-flex items-center gap-0.5 text-lg text-ink hover:text-brand transition-colors"
        >
          {moreLabel}
          <ChevronRight size={19} />
        </a>
      )}
    </div>
  )
}
