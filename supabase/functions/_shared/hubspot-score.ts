const text = (value: unknown): string | null => {
  if (value == null) return null;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ").slice(0, 500) || null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed.slice(0, 500) : null;
};

const boolish = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "yes", "oui", "1", "whatsapp"].includes(normalized);
};

export function calculateQualificationScore(input: {
  phone?: unknown;
  consentement_rappel?: unknown;
  consentement_transmission?: unknown;
  besoin_principal?: unknown;
  niveau_francais?: unknown;
}) {
  let score = 0;
  if (text(input.phone)) score += 30;
  if (boolish(input.consentement_rappel)) score += 20;
  if (boolish(input.consentement_transmission)) score += 20;
  if (text(input.besoin_principal)) score += 20;
  if (text(input.niveau_francais)) score += 10;
  return Math.min(score, 100);
}
