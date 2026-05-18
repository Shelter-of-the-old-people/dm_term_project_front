import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  tone?: 'blue' | 'green' | 'orange' | 'gray'
}

const TONE_CLASS: Record<NonNullable<BadgeProps['tone']>, string> = {
  blue:   'bg-[#e8f4ff] text-[#1a6fd9]',
  green:  'bg-design-bg text-design',
  orange: 'bg-[#fff3e6] text-brand',
  gray:   'bg-neutral text-quiet',
}

export function Badge({ children, tone = 'blue' }: BadgeProps) {
  return (
    <span className={`inline-block text-[12px] font-medium px-2 py-0.5 rounded-sm ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  )
}
