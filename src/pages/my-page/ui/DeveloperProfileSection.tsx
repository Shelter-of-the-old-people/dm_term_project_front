import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'

import {
  getDeveloperProfile,
  resolveDeveloperProfileImageUrl,
  updateDeveloperProfile,
  uploadDeveloperProfileImage,
} from '@/entities/profile'
import type { DeveloperProfile, ProfileSupportField } from '@/entities/profile'

const SUPPORT_FIELD_OPTIONS: ProfileSupportField[] = ['개발', '디자인', '기획']

type ProfileLoadState = {
  isLoading: boolean
  errorMessage: string | null
  item: DeveloperProfile | null
}

type SaveState = {
  isSaving: boolean
  isUploadingImage: boolean
  errorMessage: string | null
  successMessage: string | null
}

type ProfileFormState = {
  supportFields: ProfileSupportField[]
  activeAvailable: boolean
  onsiteAvailable: boolean
  regionSido: string
  regionSigungu: string
  businessType: string
  careerYears: string
  searchTags: string
  introduction: string
}

const EMPTY_FORM: ProfileFormState = {
  supportFields: [],
  activeAvailable: false,
  onsiteAvailable: false,
  regionSido: '',
  regionSigungu: '',
  businessType: '',
  careerYears: '0',
  searchTags: '',
  introduction: '',
}

function createFormState(profile: DeveloperProfile): ProfileFormState {
  return {
    supportFields: profile.supportFields,
    activeAvailable: profile.activeAvailable,
    onsiteAvailable: profile.onsiteAvailable,
    regionSido: profile.regionSido,
    regionSigungu: profile.regionSigungu,
    businessType: profile.businessType,
    careerYears: String(profile.careerYears),
    searchTags: profile.searchTags.join(', '),
    introduction: profile.introduction,
  }
}

function parseSearchTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  )
}

export function DeveloperProfileSection() {
  const [profileState, setProfileState] = useState<ProfileLoadState>({
    isLoading: true,
    errorMessage: null,
    item: null,
  })
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM)
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    isUploadingImage: false,
    errorMessage: null,
    successMessage: null,
  })

  useEffect(() => {
    let cancelled = false

    setProfileState({
      isLoading: true,
      errorMessage: null,
      item: null,
    })

    void getDeveloperProfile()
      .then((profile) => {
        if (cancelled) {
          return
        }

        setProfileState({
          isLoading: false,
          errorMessage: null,
          item: profile,
        })
        setForm(createFormState(profile))
      })
      .catch((error) => {
        if (cancelled) {
          return
        }

        setProfileState({
          isLoading: false,
          errorMessage:
            error instanceof Error
              ? error.message
              : '프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          item: null,
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  function updateField<Key extends keyof ProfileFormState>(key: Key, value: ProfileFormState[Key]) {
    setSaveState((current) => ({
      ...current,
      errorMessage: null,
      successMessage: null,
    }))
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleSupportFieldToggle(field: ProfileSupportField, checked: boolean) {
    if (checked) {
      updateField('supportFields', [...form.supportFields, field])
      return
    }

    updateField(
      'supportFields',
      form.supportFields.filter((item) => item !== field),
    )
  }

  function handleImageFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setPendingImageFile(file)
    setSaveState((current) => ({
      ...current,
      errorMessage: null,
      successMessage: null,
    }))
  }

  async function handleImageUpload() {
    if (!pendingImageFile) {
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage: '먼저 업로드할 이미지를 선택해주세요.',
        successMessage: null,
      })
      return
    }

    setSaveState({
      isSaving: false,
      isUploadingImage: true,
      errorMessage: null,
      successMessage: null,
    })

    try {
      const result = await uploadDeveloperProfileImage(pendingImageFile)

      setProfileState((current) => ({
        ...current,
        item: current.item
          ? {
              ...current.item,
              profileImageUrl: result.imageUrl,
            }
          : current.item,
      }))
      setPendingImageFile(null)
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage: null,
        successMessage: '프로필 이미지가 업로드되었습니다.',
      })
    } catch (error) {
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage:
          error instanceof Error ? error.message : '이미지 업로드 중 문제가 발생했습니다.',
        successMessage: null,
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const careerYears = Number(form.careerYears)
    const searchTags = parseSearchTags(form.searchTags)

    if (
      form.supportFields.length === 0 ||
      !form.regionSido.trim() ||
      !form.regionSigungu.trim() ||
      !form.businessType.trim() ||
      !Number.isInteger(careerYears) ||
      careerYears < 0 ||
      !form.introduction.trim()
    ) {
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage: '필수 항목을 모두 올바르게 입력해주세요.',
        successMessage: null,
      })
      return
    }

    if (searchTags.length > 5) {
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage: '검색 태그는 최대 5개까지 입력할 수 있습니다.',
        successMessage: null,
      })
      return
    }

    setSaveState({
      isSaving: true,
      isUploadingImage: false,
      errorMessage: null,
      successMessage: null,
    })

    try {
      const profile = await updateDeveloperProfile({
        supportFields: form.supportFields,
        activeAvailable: form.activeAvailable,
        onsiteAvailable: form.onsiteAvailable,
        regionSido: form.regionSido.trim(),
        regionSigungu: form.regionSigungu.trim(),
        businessType: form.businessType.trim(),
        careerYears,
        searchTags,
        introduction: form.introduction.trim(),
      })

      setProfileState({
        isLoading: false,
        errorMessage: null,
        item: profile,
      })
      setForm(createFormState(profile))
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage: null,
        successMessage: '개발자 프로필이 저장되었습니다.',
      })
    } catch (error) {
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage:
          error instanceof Error ? error.message : '프로필 저장 중 문제가 발생했습니다.',
        successMessage: null,
      })
    }
  }

  if (profileState.isLoading) {
    return <CenteredState>개발자 프로필을 불러오는 중입니다.</CenteredState>
  }

  if (profileState.errorMessage) {
    return <CenteredState tone="error">{profileState.errorMessage}</CenteredState>
  }

  if (!profileState.item) {
    return <CenteredState>프로필 정보를 찾을 수 없습니다.</CenteredState>
  }

  const profileImageUrl = resolveDeveloperProfileImageUrl(profileState.item.profileImageUrl)

  return (
    <section className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="border-b border-line px-6 py-5">
          <p className="text-[13px] font-medium text-[#39b9ea]">Developer Profile</p>
          <h2 className="mt-2 text-[22px] font-bold text-ink">{profileState.item.nickname}</h2>
          <p className="mt-2 text-[13px] text-pale">{profileState.item.loginId}</p>
        </div>

        <div className="px-6 py-6">
          <div className="flex justify-center">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={`${profileState.item.nickname} 프로필 이미지`}
                className="h-36 w-36 rounded-full border border-line object-cover shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
              />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-full border border-dashed border-line bg-[#fafafa] text-[32px] font-bold text-[#39b9ea]">
                {profileState.item.nickname.slice(0, 1)}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold text-ink">프로필 이미지</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="block w-full text-[13px] text-dim file:mr-3 file:rounded-md file:border-0 file:bg-[#eef8fd] file:px-3 file:py-2 file:text-[13px] file:font-semibold file:text-[#2f86b4]"
              />
            </label>

            {pendingImageFile ? (
              <p className="text-[12px] leading-5 text-pale">선택한 파일: {pendingImageFile.name}</p>
            ) : null}

            <button
              type="button"
              onClick={() => void handleImageUpload()}
              disabled={saveState.isUploadingImage}
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-line bg-page px-4 text-sm font-semibold text-dim disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState.isUploadingImage ? '업로드 중...' : '이미지 업로드'}
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            <AvailabilityBadge
              label="즉시 투입 가능"
              active={profileState.item.activeAvailable}
            />
            <AvailabilityBadge
              label="상주 가능"
              active={profileState.item.onsiteAvailable}
            />
          </div>

          <div className="mt-6 space-y-3 rounded-sm border border-line bg-[#fafafa] px-4 py-4">
            <InfoRow label="희망 지역" value={`${profileState.item.regionSido} ${profileState.item.regionSigungu}`} />
            <InfoRow label="사업자 형태" value={profileState.item.businessType} />
            <InfoRow label="경력" value={`${profileState.item.careerYears}년`} />
          </div>
        </div>
      </aside>

      <section className="rounded-md border border-line bg-page shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="border-b border-line px-6 py-5">
          <p className="text-[13px] font-medium text-[#39b9ea]">Profile Management</p>
          <h2 className="mt-2 text-[24px] font-bold text-ink">개발자 프로필 관리</h2>
          <p className="mt-3 text-[14px] leading-7 text-dim">
            지원 가능 분야, 활동 가능 여부, 희망 지역, 검색 태그와 소개글을 수정할 수 있습니다.
          </p>
        </div>

        <form className="px-6 py-6" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="지원 분야">
              <div className="flex flex-wrap gap-3">
                {SUPPORT_FIELD_OPTIONS.map((field) => {
                  const checked = form.supportFields.includes(field)

                  return (
                    <label
                      key={field}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-sm border px-4 py-2 text-[14px] ${
                        checked
                          ? 'border-[#39b9ea] bg-[#f3fbff] text-[#2d85b3]'
                          : 'border-line bg-page text-dim'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => handleSupportFieldToggle(field, event.target.checked)}
                      />
                      {field}
                    </label>
                  )
                })}
              </div>
            </FormField>

            <FormField label="활동 상태">
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  label="즉시 투입 가능"
                  checked={form.activeAvailable}
                  onChange={(checked) => updateField('activeAvailable', checked)}
                />
                <ToggleCard
                  label="상주 가능"
                  checked={form.onsiteAvailable}
                  onChange={(checked) => updateField('onsiteAvailable', checked)}
                />
              </div>
            </FormField>

            <FormField label="지역 1단계">
              <TextInput
                value={form.regionSido}
                placeholder="예: 서울"
                onChange={(value) => updateField('regionSido', value)}
              />
            </FormField>

            <FormField label="지역 2단계">
              <TextInput
                value={form.regionSigungu}
                placeholder="예: 강남구"
                onChange={(value) => updateField('regionSigungu', value)}
              />
            </FormField>

            <FormField label="사업자 형태">
              <TextInput
                value={form.businessType}
                placeholder="예: 개인사업자"
                onChange={(value) => updateField('businessType', value)}
              />
            </FormField>

            <FormField label="경력 연차">
              <UnitInput
                value={form.careerYears}
                unit="년"
                placeholder="예: 7"
                onChange={(value) => updateField('careerYears', value)}
              />
            </FormField>
          </div>

          <div className="mt-6">
            <FormField label="검색 태그">
              <TextInput
                value={form.searchTags}
                placeholder="예: Spring Boot, React, Java"
                onChange={(value) => updateField('searchTags', value)}
              />
              <HelperText>쉼표로 구분해서 최대 5개까지 입력할 수 있습니다.</HelperText>
            </FormField>
          </div>

          <div className="mt-6">
            <FormField label="소개글">
              <TextArea
                value={form.introduction}
                placeholder="본인의 경험과 강점을 간단히 소개해주세요."
                onChange={(value) => updateField('introduction', value)}
              />
            </FormField>
          </div>

          {saveState.errorMessage ? (
            <p className="mt-6 rounded-sm border border-[#ffd4d4] bg-[#fff5f5] px-4 py-3 text-[13px] leading-6 text-[#ba4545]">
              {saveState.errorMessage}
            </p>
          ) : null}

          {saveState.successMessage ? (
            <p className="mt-6 rounded-sm border border-[#caefdb] bg-[#f3fff7] px-4 py-3 text-[13px] leading-6 text-[#247a4d]">
              {saveState.successMessage}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saveState.isSaving}
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#39b9ea] px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState.isSaving ? '저장 중...' : '프로필 저장하기'}
            </button>
          </div>
        </form>
      </section>
    </section>
  )
}

function CenteredState({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'error'
}) {
  return (
    <div
      className={`mt-6 rounded-md border border-line bg-page px-6 py-12 text-center text-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${
        tone === 'error' ? 'text-[#ba4545]' : 'text-dim'
      }`}
    >
      {children}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[14px] font-semibold text-ink">{label}</label>
      {children}
    </div>
  )
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[12px] leading-5 text-pale">{children}</p>
}

function TextInput({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-sm border border-line bg-page px-4 text-[14px] text-ink outline-none placeholder:text-pale"
    />
  )
}

function UnitInput({
  value,
  unit,
  placeholder,
  onChange,
}: {
  value: string
  unit: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex h-11 overflow-hidden rounded-sm border border-line bg-page">
      <input
        value={value}
        inputMode="numeric"
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-4 text-[14px] text-ink outline-none placeholder:text-pale"
      />
      <span className="inline-flex min-w-[56px] items-center justify-center border-l border-line bg-[#fafafa] px-3 text-[13px] text-dim">
        {unit}
      </span>
    </div>
  )
}

function TextArea({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-[180px] w-full rounded-sm border border-line bg-page px-4 py-3 text-[14px] leading-7 text-ink outline-none placeholder:text-pale"
    />
  )
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-sm border px-4 py-3 text-[14px] ${
        checked ? 'border-[#39b9ea] bg-[#f3fbff] text-[#2d85b3]' : 'border-line bg-page text-dim'
      }`}
    >
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

function AvailabilityBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`rounded-sm border px-4 py-3 text-center text-[13px] font-semibold ${
        active ? 'border-[#39b9ea] bg-[#f3fbff] text-[#2d85b3]' : 'border-line bg-[#fafafa] text-pale'
      }`}
    >
      {label}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] text-pale">{label}</span>
      <span className="text-[13px] font-medium text-ink">{value}</span>
    </div>
  )
}
