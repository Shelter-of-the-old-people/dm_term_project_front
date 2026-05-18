import { Star } from 'lucide-react'

type StarRatingProps = {
  rating: number
  size?: number
}

export function StarRating({ rating, size = 14 }: StarRatingProps) {
  return (
    <span className="inline-flex items-center gap-1 text-base font-semibold text-[#c77700]">
      <Star size={size} fill="currentColor" color="currentColor" />
      {rating.toFixed(1)}
    </span>
  )
}
