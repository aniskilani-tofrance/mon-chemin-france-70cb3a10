export const MARIANNE_CODE_MIN_LENGTH = 4;
export const MARIANNE_CODE_MAX_LENGTH = 12;

export function normalizeMarianneAccessCode(value: string) {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

export function isValidMarianneAccessCodeFormat(value: string) {
  const normalized = normalizeMarianneAccessCode(value);
  return normalized.length >= MARIANNE_CODE_MIN_LENGTH && normalized.length <= MARIANNE_CODE_MAX_LENGTH;
}