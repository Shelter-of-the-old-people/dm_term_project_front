import { Star } from 'lucide-react'
import { reviews } from '@/entities/review'
import { SectionHead } from '@/shared/ui'

export function ReviewList() {
  return (
    <section
      className="py-22.5"
      style={{
        background: 'linear-gradient(91deg, rgba(255,125,18,0.05) 0%, rgba(255,197,58,0.05) 29%, rgba(65,216,158,0.05) 64%, rgba(49,208,244,0.05) 100%)',
      }}
    >
      <div className="mx-auto max-w-330 px-5">
        <SectionHead title="고객 이용후기" moreHref="/review/reviewList" moreLabel="전체보기" />
        <div className="scroll-row gap-0">
          {reviews.map((r) => (
            <a
              key={r.id}
              href="/review/reviewList"
              className="shrink-0 w-99.5 h-83.75 bg-neutral rounded-md border border-page mr-4.5 px-6.25 py-6.25 pb-5 flex flex-col no-underline"
            >
              <p className="text-xl font-medium text-ink mb-3 hover:underline">{r.title}</p>
              <p className="text-base text-dim leading-relaxed mb-5.5 line-clamp-3">{r.content}</p>
              <div className="mt-auto flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1 text-base font-semibold text-[#c77700]">
                  <Star size={14} fill="currentColor" color="currentColor" />
                  {r.rating.toFixed(1)}
                </span>
                <span className="text-[14px] text-quiet">{r.author}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
