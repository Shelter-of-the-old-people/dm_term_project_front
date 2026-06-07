import type {
  DeveloperProfile,
  DeveloperProfileImageUploadResult,
  DeveloperProfileUpdateInput,
  ProfileSupportField,
} from '../model/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

type ApiResponse<T> = {
  success: boolean
  data: T | null
  message: string | null
}

type BackendDeveloperProfile = {
  userId: number
  loginId: string
  nickname: string
  profileImageUrl: string | null
  supportFields: string[]
  activeAvailable: boolean
  onsiteAvailable: boolean
  regionSido: string
  regionSigungu: string
  businessType: string
  careerYears: number
  searchTags: string[]
  introduction: string
}

type BackendDeveloperProfileImageUploadResult = {
  imageUrl: string
}

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function isProfileSupportField(value: string): value is ProfileSupportField {
  return value === '개발' || value === '디자인' || value === '기획'
}

function mapDeveloperProfile(profile: BackendDeveloperProfile): DeveloperProfile {
  return {
    userId: profile.userId,
    loginId: profile.loginId,
    nickname: profile.nickname,
    profileImageUrl: profile.profileImageUrl,
    supportFields: profile.supportFields.filter(isProfileSupportField),
    activeAvailable: profile.activeAvailable,
    onsiteAvailable: profile.onsiteAvailable,
    regionSido: profile.regionSido,
    regionSigungu: profile.regionSigungu,
    businessType: profile.businessType,
    careerYears: profile.careerYears,
    searchTags: profile.searchTags,
    introduction: profile.introduction,
  }
}

function buildApiUrl(path: string) {
  return new URL(path, API_BASE_URL).toString()
}

async function readApiResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | null = null

  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    if (!response.ok) {
      throw new ApiError(response.status, `Request failed with status ${response.status}.`)
    }
    throw new ApiError(response.status, 'Invalid API response.')
  }

  if (!response.ok || !payload.success || payload.data == null) {
    throw new ApiError(response.status, payload.message ?? `Request failed with status ${response.status}.`)
  }

  return payload.data
}

async function requestApi<T>(path: string): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    credentials: 'include',
  })

  return readApiResponse<T>(response)
}

async function requestApiWithBody<T>(path: string, body: unknown, method = 'PUT'): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return readApiResponse<T>(response)
}

async function requestMultipartApi<T>(path: string, file: File): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  return readApiResponse<T>(response)
}

export function resolveDeveloperProfileImageUrl(imageUrl: string | null) {
  if (!imageUrl) {
    return null
  }

  if (/^https?:\/\//.test(imageUrl)) {
    return imageUrl
  }

  return buildApiUrl(imageUrl)
}

export async function getDeveloperProfile(): Promise<DeveloperProfile> {
  const profile = await requestApi<BackendDeveloperProfile>('/api/developer/profile')
  return mapDeveloperProfile(profile)
}

export async function updateDeveloperProfile(
  input: DeveloperProfileUpdateInput,
): Promise<DeveloperProfile> {
  const profile = await requestApiWithBody<BackendDeveloperProfile>('/api/developer/profile', input)
  return mapDeveloperProfile(profile)
}

export async function uploadDeveloperProfileImage(
  file: File,
): Promise<DeveloperProfileImageUploadResult> {
  const result = await requestMultipartApi<BackendDeveloperProfileImageUploadResult>(
    '/api/developer/profile/image',
    file,
  )

  return {
    imageUrl: result.imageUrl,
  }
}
