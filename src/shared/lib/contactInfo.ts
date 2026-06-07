const EMAIL = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/
const PHONE = /\d{2,3}[-\s.]?\d{3,4}[-\s.]?\d{4}/

export function containsContactInfo(text: string) {
  if (!text.trim()) {
    return false
  }

  return EMAIL.test(text) || PHONE.test(text)
}
