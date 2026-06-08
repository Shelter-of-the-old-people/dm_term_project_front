import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode } from 'react'

import {
  getDeveloperProfile,
  resolveDeveloperProfileImageUrl,
  updateDeveloperProfile,
  uploadDeveloperProfileImage,
} from '@/entities/profile'
import type { DeveloperProfile, ProfileSupportField } from '@/entities/profile'

const SUPPORT_FIELD_OPTIONS: ProfileSupportField[] = ['개발', '디자인', '기획']
const BUSINESS_TYPE_OPTIONS = ['개인프리랜서', '팀프리랜서', '개인사업자', '법인사업자']
const CAREER_YEAR_OPTIONS = Array.from({ length: 21 }, (_, index) => `${index}년`)
const REGION_OPTIONS: Record<string, string[]> = {
  서울특별시: ['강남구', '서초구', '송파구', '마포구', '구로구', '영등포구'],
  부산광역시: ['해운대구', '수영구', '부산진구', '남구', '동래구'],
  대구광역시: ['수성구', '달서구', '중구', '북구'],
  인천광역시: ['연수구', '남동구', '부평구', '서구'],
  광주광역시: ['서구', '북구', '광산구', '동구'],
  대전광역시: ['유성구', '서구', '중구', '동구'],
  울산광역시: ['남구', '중구', '북구', '동구'],
  세종특별자치시: ['세종시'],
  경기도: ['성남시', '수원시', '용인시', '고양시', '화성시', '부천시'],
  강원특별자치도: ['춘천시', '원주시', '강릉시'],
  충청북도: ['청주시', '충주시', '제천시'],
  충청남도: ['천안시', '아산시', '공주시'],
  전라북도: ['전주시', '군산시', '익산시'],
  전라남도: ['목포시', '순천시', '여수시'],
  경상북도: ['구미시', '포항시', '경산시', '안동시'],
  경상남도: ['창원시', '김해시', '진주시', '양산시'],
  제주특별자치도: ['제주시', '서귀포시'],
}
const REGION_ALIASES: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원특별자치도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전라북도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
}

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
  searchTags: string[]
  tagInput: string
  introduction: string
}

const EMPTY_FORM: ProfileFormState = {
  supportFields: [],
  activeAvailable: false,
  onsiteAvailable: false,
  regionSido: '',
  regionSigungu: '',
  businessType: BUSINESS_TYPE_OPTIONS[0],
  careerYears: '0',
  searchTags: [],
  tagInput: '',
  introduction: '',
}

function normalizeBusinessType(value: string) {
  const normalized = value.replaceAll(' ', '').trim()

  if (normalized === '개인프리랜서' || normalized === '팀프리랜서') {
    return normalized
  }

  return value.trim()
}

function normalizeRegionSido(value: string) {
  const trimmed = value.trim()
  return REGION_ALIASES[trimmed] ?? trimmed
}

function buildBusinessOptions(currentValue: string) {
  const normalized = normalizeBusinessType(currentValue)
  return BUSINESS_TYPE_OPTIONS.includes(normalized)
    ? BUSINESS_TYPE_OPTIONS
    : normalized
      ? [...BUSINESS_TYPE_OPTIONS, normalized]
      : BUSINESS_TYPE_OPTIONS
}

function buildRegionSidoOptions(currentValue: string) {
  const normalized = normalizeRegionSido(currentValue)
  const options = Object.keys(REGION_OPTIONS)

  return options.includes(normalized) || !normalized ? options : [...options, normalized]
}

function buildRegionSigunguOptions(regionSido: string, currentValue: string) {
  const options = REGION_OPTIONS[normalizeRegionSido(regionSido)] ?? []
  const trimmed = currentValue.trim()

  return options.includes(trimmed) || !trimmed ? options : [...options, trimmed]
}

function createFormState(profile: DeveloperProfile): ProfileFormState {
  return {
    supportFields: profile.supportFields,
    activeAvailable: profile.activeAvailable,
    onsiteAvailable: profile.onsiteAvailable,
    regionSido: normalizeRegionSido(profile.regionSido),
    regionSigungu: profile.regionSigungu,
    businessType: normalizeBusinessType(profile.businessType || BUSINESS_TYPE_OPTIONS[0]),
    careerYears: String(profile.careerYears),
    searchTags: profile.searchTags,
    tagInput: '',
    introduction: profile.introduction,
  }
}

function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  )
}

export function DeveloperProfileSection() {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [profileState, setProfileState] = useState<ProfileLoadState>({
    isLoading: true,
    errorMessage: null,
    item: null,
  })
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM)
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    isUploadingImage: false,
    errorMessage: null,
    successMessage: null,
  })

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setProfileState({
        isLoading: true,
        errorMessage: null,
        item: null,
      })

      try {
        const profile = await getDeveloperProfile()
        if (cancelled) {
          return
        }

        setProfileState({
          isLoading: false,
          errorMessage: null,
          item: profile,
        })
        setForm(createFormState(profile))
      } catch (error) {
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
      }
    }

    void loadProfile()

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
    setSaveState((current) => ({
      ...current,
      errorMessage: null,
      successMessage: null,
    }))

    if (!file) {
      return
    }

    void handleImageUpload(file)
    event.target.value = ''
  }

  function addTagsFromInput() {
    const nextTags = parseTags(form.tagInput)
    if (nextTags.length === 0) {
      return
    }

    const mergedTags = Array.from(new Set([...form.searchTags, ...nextTags]))

    if (mergedTags.length > 5) {
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage: '검색 태그는 최대 5개까지 등록할 수 있습니다.',
        successMessage: null,
      })
      return
    }

    setForm((current) => ({
      ...current,
      searchTags: mergedTags,
      tagInput: '',
    }))
  }

  function removeTag(tagToRemove: string) {
    setForm((current) => ({
      ...current,
      searchTags: current.searchTags.filter((tag) => tag !== tagToRemove),
    }))
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTagsFromInput()
    }
  }

  async function handleImageUpload(file: File) {
    setSaveState({
      isSaving: false,
      isUploadingImage: true,
      errorMessage: null,
      successMessage: null,
    })

    try {
      const result = await uploadDeveloperProfileImage(file)

      setProfileState((current) => ({
        ...current,
        item: current.item
          ? {
              ...current.item,
              profileImageUrl: result.imageUrl,
            }
          : current.item,
      }))
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

    if (form.searchTags.length > 5) {
      setSaveState({
        isSaving: false,
        isUploadingImage: false,
        errorMessage: '검색 태그는 최대 5개까지만 등록할 수 있습니다.',
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
        regionSido: normalizeRegionSido(form.regionSido.trim()),
        regionSigungu: form.regionSigungu.trim(),
        businessType: normalizeBusinessType(form.businessType.trim()),
        careerYears,
        searchTags: form.searchTags,
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
        successMessage: '프로필 정보가 저장되었습니다.',
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
    return <InlineState>프로필 정보를 불러오는 중입니다.</InlineState>
  }

  if (profileState.errorMessage) {
    return <InlineState tone="error">{profileState.errorMessage}</InlineState>
  }

  if (!profileState.item) {
    return <InlineState>프로필 정보를 찾을 수 없습니다.</InlineState>
  }

  const profileImageUrl = resolveDeveloperProfileImageUrl(profileState.item.profileImageUrl)
  const businessOptions = buildBusinessOptions(form.businessType)
  const regionSidoOptions = buildRegionSidoOptions(form.regionSido)
  const regionSigunguOptions = buildRegionSigunguOptions(form.regionSido, form.regionSigungu)

  function handleRegionSidoChange(value: string) {
    const normalizedRegionSido = normalizeRegionSido(value)
    const nextSigunguOptions = REGION_OPTIONS[normalizedRegionSido] ?? []

    setSaveState((current) => ({
      ...current,
      errorMessage: null,
      successMessage: null,
    }))

    setForm((current) => ({
      ...current,
      regionSido: normalizedRegionSido,
      regionSigungu: nextSigunguOptions.includes(current.regionSigungu) ? current.regionSigungu : '',
    }))
  }

  return (
    <div>
      <form className="px-6 py-8" onSubmit={(event) => void handleSubmit(event)}>
        <div className="space-y-8">
          <ProfileRow label="프로필 이미지">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-6">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${profileState.item.nickname} 프로필 이미지`}
                    className="h-28 w-28 rounded-full border border-line object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-line bg-[#fafafa] text-[30px] font-bold text-[#39b9ea]">
                    {profileState.item.nickname.slice(0, 1)}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={saveState.isUploadingImage}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-[#ff8b2b] px-5 text-[13px] font-semibold text-[#ff8b2b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saveState.isUploadingImage ? '업로드 중...' : '업데이트'}
                    </button>
                  </div>

                  <HelperText>
                    개인/팀 프로필 등의 이미지를 등록해주세요.
                    <br />
                    미팅 선정률이 높아질 수 있습니다.
                  </HelperText>
                </div>
              </div>
            </div>
          </ProfileRow>

          <ProfileRow label="지원분야 *">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {SUPPORT_FIELD_OPTIONS.map((field) => (
                <label key={field} className="inline-flex items-center gap-2 text-[15px] text-[#333]">
                  <input
                    type="checkbox"
                    checked={form.supportFields.includes(field)}
                    onChange={(event) => handleSupportFieldToggle(field, event.target.checked)}
                    className="h-4 w-4"
                  />
                  {field}
                </label>
              ))}
            </div>
          </ProfileRow>

          <ProfileRow label="활동가능여부">
            <div>
              <InlineCheckbox
                label="가능시 체크"
                checked={form.activeAvailable}
                onChange={(checked) => updateField('activeAvailable', checked)}
              />
              <HelperText>클라이언트에게 지원요청을 받으려면 활동중으로 체크해주세요.</HelperText>
            </div>
          </ProfileRow>

          <ProfileRow label="상주가능여부">
            <div>
              <InlineCheckbox
                label="가능시 체크"
                checked={form.onsiteAvailable}
                onChange={(checked) => updateField('onsiteAvailable', checked)}
              />
              <HelperText>이력서 첨부 시 상주 프로젝트 추천에 활용됩니다.</HelperText>
            </div>
          </ProfileRow>

          <ProfileRow label="지역 *">
            <div className="grid gap-3 md:max-w-[520px] md:grid-cols-2">
              <SelectInput
                value={form.regionSido}
                options={regionSidoOptions}
                placeholder="도/시 선택"
                onChange={handleRegionSidoChange}
              />
              <SelectInput
                value={form.regionSigungu}
                options={regionSigunguOptions}
                placeholder="시/군/구 선택"
                onChange={(value) => updateField('regionSigungu', value)}
              />
            </div>
          </ProfileRow>

          <ProfileRow label="형태 *">
            <div className="grid gap-3 md:max-w-[520px] md:grid-cols-[1fr_140px]">
              <SelectInput
                value={form.businessType}
                options={businessOptions}
                onChange={(value) => updateField('businessType', value)}
              />
              <SelectInput
                value={`${form.careerYears}년`}
                options={CAREER_YEAR_OPTIONS}
                onChange={(value) => updateField('careerYears', value.replace('년', ''))}
              />
            </div>
          </ProfileRow>

          <ProfileRow label="검색태그">
            <div className="max-w-[720px]">
              <div className="rounded-[4px] border border-line bg-page px-3 py-3">
                <div className="flex flex-wrap gap-2">
                  {form.searchTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-[4px] border border-[#d8dce2] bg-[#fafafa] px-2.5 py-1.5 text-[13px] text-[#555]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-[12px] font-semibold text-[#999]"
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-col gap-3 md:flex-row">
                  <input
                    value={form.tagInput}
                    placeholder="예: LLM, 웹앱, AI"
                    onChange={(event) => updateField('tagInput', event.target.value)}
                    onKeyDown={handleTagKeyDown}
                    className="h-11 w-full rounded-[4px] border border-line px-4 text-[14px] text-ink outline-none placeholder:text-pale"
                  />
                  <button
                    type="button"
                    onClick={addTagsFromInput}
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-[4px] border border-line px-5 text-sm font-semibold text-dim"
                  >
                    추가
                  </button>
                </div>

                <p className="mt-3 text-[12px] text-pale">
                  태그는 쉼표로 구분하며, 최대 5개까지 입력하실 수 있습니다.
                </p>
              </div>
              <HelperText>대표하는 기술 및 검색 태그를 반드시 입력해주세요. (검색 노출 유리)</HelperText>
            </div>
          </ProfileRow>

          <ProfileRow label="소개글 *">
            <div className="max-w-[720px]">
              <TextArea
                value={form.introduction}
                placeholder="보유 기술, 주요 경력, 협업 방식 등을 자유롭게 소개해주세요."
                onChange={(value) => updateField('introduction', value)}
              />
              <HelperText>고객이 키워드 검색을 통해 개발 견적 요청을 보낼 수 있습니다.</HelperText>
            </div>
          </ProfileRow>
        </div>

        {saveState.errorMessage ? <MessageBox tone="error">{saveState.errorMessage}</MessageBox> : null}
        {saveState.successMessage ? (
          <MessageBox tone="success">{saveState.successMessage}</MessageBox>
        ) : null}

        <div className="mt-10 md:pl-[170px]">
          <button
            type="submit"
            disabled={saveState.isSaving}
            className="inline-flex h-12 min-w-[140px] items-center justify-center rounded-[4px] bg-[#ff8b2b] px-8 text-[15px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveState.isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  )
}

function InlineState({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'error'
}) {
  return (
    <div
      className={`px-6 py-12 text-center text-[14px] ${
        tone === 'error' ? 'text-[#ba4545]' : 'text-dim'
      }`}
    >
      {children}
    </div>
  )
}

function ProfileRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="md:flex md:items-start md:gap-8">
      <div className="mb-3 w-[140px] shrink-0 text-[15px] font-semibold text-[#333] md:mb-0">
        {label}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function InlineCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[15px] text-[#333]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  )
}

function HelperText({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-[12px] leading-5 text-[#5d83d7]">{children}</p>
}

function MessageBox({
  children,
  tone,
}: {
  children: ReactNode
  tone: 'error' | 'success'
}) {
  return (
    <p
      className={`mt-6 rounded-[4px] border px-4 py-3 text-[13px] leading-6 ${
        tone === 'error'
          ? 'border-[#ffd4d4] bg-[#fff5f5] text-[#ba4545]'
          : 'border-[#caefdb] bg-[#f3fff7] text-[#247a4d]'
      }`}
    >
      {children}
    </p>
  )
}

function SelectInput({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string
  options: string[]
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-[4px] border border-line bg-page px-4 text-[14px] text-ink outline-none"
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
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
      className="min-h-[160px] w-full rounded-[4px] border border-line bg-page px-4 py-3 text-[14px] leading-7 text-ink outline-none placeholder:text-pale"
    />
  )
}
