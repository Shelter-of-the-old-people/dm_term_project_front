export type PartnerKind = 'company' | 'freelancer'
export type PartnerCategory = 'dev' | 'design' | 'plan' | 'etc'

export type Partner = {
  id: number
  kind: PartnerKind
  category: PartnerCategory
  name: string
  type: string
  headline: string
  skills: string[]
  rating: number
  contracts: number
}
