import { Star } from 'lucide-react'
import { reviews } from '@/entities/review'
import { SectionHead } from '@/shared/ui'

export function ReviewList() {
  return (
    <section
      id="reviews"
      className="py-22.5"
      style={{
        background:
          'linear-gradient(91deg, rgba(255,125,18,0.05) 0%, rgba(255,197,58,0.05) 29%, rgba(65,216,158,0.05) 64%, rgba(49,208,244,0.05) 100%)',
      }}
    >
      <div className="mx-auto max-w-330 px-5">
        <SectionHead title="고객 이용후기" moreHref="/#reviews" moreLabel="전체보기" />
        <div className="scroll-row gap-0">
          {reviews.map((review) => (
            <a
              key={review.id}
              href="/#reviews"
              className="mr-4.5 flex h-83.75 w-99.5 shrink-0 flex-col rounded-md border border-page bg-neutral px-6.25 py-6.25 pb-5 no-underline"
            >
              <p className="mb-3 text-xl font-medium text-ink hover:underline">{review.title}</p>
              <p className="mb-5.5 line-clamp-3 text-base leading-relaxed text-dim">{review.content}</p>
              <div className="mt-auto flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1 text-base font-semibold text-[#c77700]">
                  <Star size={14} fill="currentColor" color="currentColor" />
                  {review.rating.toFixed(1)}
                </span>
                <span className="text-[14px] text-quiet">{review.author}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
