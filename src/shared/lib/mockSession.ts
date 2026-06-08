export type SessionRole = 'developer' | 'client'

export type SessionUser = {
  id: number
  loginId: string
  name: string
  role: SessionRole
}

type BackendSessionUser = {
  id: number
  loginId: string
  nickname: string
  role: SessionRole
}

type ApiResponse<T> = {
  success: boolean
  data: T | null
  message: string | null
}

type LoginInput = {
  loginId: string
  password: string
}

type SignupInput = {
  loginId: string
  name: string
  password: string
  role: SessionRole
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const SESSION_EVENT = 'freemoa-session-change'

let sessionCache: SessionUser | null = null
let sessionLoaded = false

class SessionApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'SessionApiError'
    this.status = status
  }
}

function canUseWindow() {
  return typeof window !== 'undefined'
}

function dispatchSessionEvent() {
  if (!canUseWindow()) {
    return
  }

  window.dispatchEvent(new Event(SESSION_EVENT))
}

function mapSessionUser(user: BackendSessionUser): SessionUser {
  return {
    id: user.id,
    loginId: user.loginId,
    name: user.nickname,
    role: user.role,
  }
}

function setSessionCache(user: SessionUser | null) {
  sessionCache = user
  sessionLoaded = true
  dispatchSessionEvent()
  return user
}

function buildApiUrl(path: string) {
  return new URL(path, API_BASE_URL).toString()
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    if (!response.ok) {
      throw new SessionApiError(response.status, `Request failed with status ${response.status}.`)
    }
    throw new SessionApiError(response.status, 'Invalid API response.')
  }

  if (!response.ok || !payload.success || payload.data == null) {
    throw new SessionApiError(response.status, payload.message ?? `Request failed with status ${response.status}.`)
  }

  return payload.data
}

async function requestApiWithoutData(path: string, init?: RequestInit) {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    throw new SessionApiError(response.status, `Request failed with status ${response.status}.`)
  }
}

export function readSessionUser() {
  return sessionCache
}

export function hasLoadedSessionUser() {
  return sessionLoaded
}

export async function refreshSessionUser() {
  try {
    const sessionUser = await requestApi<BackendSessionUser>('/api/session')
    return setSessionCache(mapSessionUser(sessionUser))
  } catch (error) {
    if (error instanceof SessionApiError && error.status === 401) {
      return setSessionCache(null)
    }

    throw error
  }
}

export async function writeSessionUser(input: LoginInput) {
  const sessionUser = await requestApi<BackendSessionUser>('/api/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return setSessionCache(mapSessionUser(sessionUser))
}

export async function createSessionUser(input: SignupInput) {
  const sessionUser = await requestApi<BackendSessionUser>('/api/signup', {
    method: 'POST',
    body: JSON.stringify({
      loginId: input.loginId,
      nickname: input.name,
      password: input.password,
      role: input.role,
    }),
  })

  return setSessionCache(mapSessionUser(sessionUser))
}

export async function clearSessionUser() {
  try {
    await requestApiWithoutData('/api/logout', {
      method: 'POST',
    })
  } finally {
    setSessionCache(null)
  }
}

export function getSessionEventName() {
  return SESSION_EVENT
}
