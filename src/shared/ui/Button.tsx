import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  href?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'sm'
  className?: string
  disabled?: boolean
  onClick?: () => void
}

export function Button({ children, href, variant = 'primary', size = 'md', className = '', disabled, onClick }: ButtonProps) {
  const classes = ['button', `button-${variant}`, `button-${size}`, className].filter(Boolean).join(' ')

  if (href) {
    return (
      <a className={classes} href={href}>
        {children}
      </a>
    )
  }

  return (
    <button className={classes} disabled={disabled} type="button" onClick={onClick}>
      {children}
    </button>
  )
}
