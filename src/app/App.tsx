import { ClientProjectCreatePage } from '@/pages/client-project-create'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { MyPagePage } from '@/pages/my-page'
import { NotFoundPage } from '@/pages/not-found'
import { ProjectDetailPage } from '@/pages/project-detail'
import { ProjectListPage } from '@/pages/project-list'
import { SignupPage } from '@/pages/signup'

function normalizePath(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/'
  }

  return pathname.replace(/\/+$/, '')
}

export function App() {
  const pathname = normalizePath(window.location.pathname)
  const searchParams = new URLSearchParams(window.location.search)

  if (pathname === '/' || pathname === '/m4/s41' || pathname === '/search') {
    return <ProjectListPage />
  }

  if (pathname === '/home') {
    return <HomePage />
  }

  if (pathname === '/m0/s02' || pathname === '/login') {
    return <LoginPage />
  }

  if (pathname === '/m0/jointype' || pathname === '/signup') {
    return <SignupPage />
  }

  if (pathname === '/mypage') {
    return <MyPagePage />
  }

  if (pathname === '/m4/regProject' || pathname === '/client/projects/new') {
    return <ClientProjectCreatePage />
  }

  if (pathname === '/m4/s41v') {
    const projectId = Number(searchParams.get('projectId') ?? searchParams.get('id') ?? '0')
    return <ProjectDetailPage projectId={projectId} />
  }

  const legacyProjectMatch = pathname.match(/^\/projects\/(\d+)$/)
  if (legacyProjectMatch) {
    return <ProjectDetailPage projectId={Number(legacyProjectMatch[1])} />
  }

  return <NotFoundPage />
}
