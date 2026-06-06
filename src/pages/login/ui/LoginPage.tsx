import { useState, type FormEvent, type ReactNode } from 'react'

import { writeSessionUser } from '@/shared/lib'
import type { SessionRole } from '@/shared/lib'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

export function LoginPage() {
  const [role, setRole] = useState<SessionRole>('developer')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!loginId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await writeSessionUser({
        loginId: loginId.trim(),
        password: password.trim(),
        role,
      })

      window.location.assign('/mypage')
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message)
      } else {
        setError('로그인에 실패했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-[560px] px-5 py-16">
        <AuthCard
          title="로그인"
          description="백엔드 세션 로그인으로 연결되어 있습니다. 테스트 계정은 developer1 / 1234, client1 / 1234 입니다."
        >
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <RoleField role={role} onChange={setRole} />
            <TextField
              label="아이디"
              value={loginId}
              onChange={setLoginId}
              placeholder="developer1 또는 client1"
            />
            <TextField
              label="비밀번호"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호를 입력해주세요."
              type="password"
            />

            {error ? <p className="text-sm text-[#d64d1f]">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dim">
            계정이 없다면 <a href="/m0/jointype" className="font-semibold text-brand">회원가입</a> 페이지로 이동하세요.
          </p>
        </AuthCard>
      </main>
      <SiteFooter />
    </div>
  )
}

function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl border border-line bg-page p-8 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Account</p>
      <h1 className="mt-4 text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-3 text-base leading-7 text-dim">{description}</p>
      {children}
    </section>
  )
}

function RoleField({
  role,
  onChange,
}: {
  role: SessionRole
  onChange: (role: SessionRole) => void
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">역할</p>
      <div className="grid grid-cols-2 gap-3">
        <RoleOption active={role === 'developer'} label="개발자" onClick={() => onChange('developer')} />
        <RoleOption active={role === 'client'} label="클라이언트" onClick={() => onChange('client')} />
      </div>
    </div>
  )
}

function RoleOption({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center rounded-2xl border text-sm font-semibold transition-colors ${
        active
          ? 'border-brand bg-[#fff4ea] text-brand'
          : 'border-line bg-page text-dim hover:border-brand hover:text-brand'
      }`}
    >
      {label}
    </button>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-line px-4 text-sm text-ink outline-none transition-colors focus:border-brand"
      />
    </label>
  )
}
