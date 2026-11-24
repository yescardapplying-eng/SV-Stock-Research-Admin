export function normalizeIndianPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  // Strip non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  // Strip leading 0 or 91 country code for standard 10-digit format
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

export function sanitizeSearchString(term: string | null | undefined): string {
  if (!term) return '';
  return term.trim().replace(/[<>]/g, '');
}

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}
