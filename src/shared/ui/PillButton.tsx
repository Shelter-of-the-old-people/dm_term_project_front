type PillButtonVariant = 'primary' | 'secondary'

type PillButtonProps = {
  href?: string
  variant?: PillButtonVariant
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

const VARIANTS: Record<PillButtonVariant, string> = {
  primary:   'bg-brand-solid text-white hover:shadow-cta',
  secondary: 'border border-[#cccccc] bg-white text-dim hover:border-brand hover:text-brand',
}

export function PillButton({
  href,
  variant = 'primary',
  children,
  className = '',
  onClick,
  disabled,
  type = 'button',
}: PillButtonProps) {
  const base = `inline-flex items-center justify-center rounded-pill font-normal transition-all duration-500 ${VARIANTS[variant]} ${className}`

  if (href) {
    return <a href={href} className={base}>{children}</a>
  }
  return (
    <button type={type} className={base} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
