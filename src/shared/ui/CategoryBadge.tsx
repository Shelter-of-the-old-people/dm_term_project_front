export type BadgeVariant = 'dev' | 'design' | 'plan' | 'etc'

const BADGE_MAP: Record<BadgeVariant, { label: string; className: string }> = {
  dev:    { label: '개발',   className: 'bg-dev-bg text-dev' },
  design: { label: '디자인', className: 'bg-design-bg text-design' },
  plan:   { label: '기획',   className: 'bg-plan-bg text-brand' },
  etc:    { label: '기타',   className: 'bg-[#ffc53a] text-ink' },
}

type CategoryBadgeProps = {
  variant: BadgeVariant
}

export function CategoryBadge({ variant }: CategoryBadgeProps) {
  const { label, className } = BADGE_MAP[variant]
  return (
    <span className={`inline-block px-2.5 rounded-pill text-[17px] leading-7 ${className}`}>
      {label}
    </span>
  )
}
