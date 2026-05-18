import { CategoryBadge, StarRating } from '@/shared/ui'
import type { Partner } from '../model/types'

export function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <a
      href="/m7/s71"
      className="shrink-0 flex flex-col w-64.5 h-75.25 bg-page rounded-md p-6.25 mr-4 no-underline hover:shadow-card transition-shadow duration-200"
    >
      {/* 아바타 */}
      <div className="w-20 h-20 rounded-pill bg-neutral flex items-center justify-center text-[26px] font-bold text-quiet shrink-0 mb-3.5">
        {partner.name.charAt(0).toUpperCase()}
      </div>

      <div className="text-base font-semibold text-ink">{partner.name}</div>
      <div className="text-[14px] text-pale mt-0.5">{partner.type}</div>

      <CategoryBadge variant={partner.category} />

      <div className="text-[15px] text-pale mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
        {partner.skills.join(', ')}
      </div>

      <div className="mt-auto pt-2.5 flex items-center justify-between">
        <StarRating rating={partner.rating} />
        <span className="text-[15px] text-dim">계약 : {partner.contracts}건</span>
      </div>
    </a>
  )
}
