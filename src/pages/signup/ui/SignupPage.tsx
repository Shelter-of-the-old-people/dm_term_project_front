import { useState, type FormEvent } from 'react'

import { createSessionUser } from '@/shared/lib'
import type { SessionRole } from '@/shared/lib'
import { SiteFooter } from '@/widgets/site-footer'
import { SiteHeader } from '@/widgets/site-header'

export function SignupPage() {
  const [role, setRole] = useState<SessionRole>('developer')
  const [name, setName] = useState('')
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!name.trim() || !loginId.trim() || !password.trim()) {
      setMessage('이름, 아이디, 비밀번호를 모두 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      await createSessionUser({
        loginId: loginId.trim(),
        name: name.trim(),
        password: password.trim(),
        role,
      })

      window.location.assign('/mypage')
    } catch (submitError) {
      if (submitError instanceof Error) {
        setMessage(submitError.message)
      } else {
        setMessage('회원가입에 실패했습니다.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-soft">
      <SiteHeader />
      <main className="mx-auto max-w-[560px] px-5 py-16">
        <section className="rounded-3xl border border-line bg-page p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">Join</p>
          <h1 className="mt-4 text-3xl font-bold text-ink">회원가입</h1>
          <p className="mt-3 text-base leading-7 text-dim">
            간단한 테스트용 회원가입입니다. 가입이 완료되면 바로 로그인된 상태로 마이페이지로 이동합니다.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">가입 역할</p>
              <div className="grid grid-cols-2 gap-3">
                <RoleOption active={role === 'developer'} label="개발자" onClick={() => setRole('developer')} />
                <RoleOption active={role === 'client'} label="클라이언트" onClick={() => setRole('client')} />
              </div>
            </div>

            <TextField label="이름" value={name} onChange={setName} placeholder="홍길동" />
            <TextField
              label="아이디"
              value={loginId}
              onChange={setLoginId}
              placeholder="example@test.com 또는 testuser"
            />
            <TextField
              label="비밀번호"
              value={password}
              onChange={setPassword}
              placeholder="비밀번호를 입력해주세요."
              type="password"
            />

            {message ? <p className="text-sm text-[#d64d1f]">{message}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-pill bg-brand-solid px-6 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dim">
            이미 계정이 있다면 <a href="/m0/s02" className="font-semibold text-brand">로그인</a> 페이지로 이동하세요.
          </p>
        </section>
      </main>
      <SiteFooter />
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
