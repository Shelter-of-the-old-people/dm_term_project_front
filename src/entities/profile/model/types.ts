export type ProfileSupportField = '개발' | '디자인' | '기획'

export type DeveloperProfile = {
  userId: number
  loginId: string
  nickname: string
  profileImageUrl: string | null
  supportFields: ProfileSupportField[]
  activeAvailable: boolean
  onsiteAvailable: boolean
  regionSido: string
  regionSigungu: string
  businessType: string
  careerYears: number
  searchTags: string[]
  introduction: string
}

export type DeveloperProfileUpdateInput = {
  supportFields: ProfileSupportField[]
  activeAvailable: boolean
  onsiteAvailable: boolean
  regionSido: string
  regionSigungu: string
  businessType: string
  careerYears: number
  searchTags: string[]
  introduction: string
}

export type DeveloperProfileImageUploadResult = {
  imageUrl: string
}
