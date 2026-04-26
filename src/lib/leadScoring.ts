export interface LeadScoringInput {
  contact_email?: unknown;
  contact_firstname?: unknown;
  contact_phone?: unknown;
  location?: unknown;
  postal_code?: unknown;
  main_goal?: unknown;
  french_level_cecrl?: unknown;
  target_sector?: unknown;
  fle_type?: unknown;
  work_right?: unknown;
  worked_in_france?: unknown;
  real_comprehension_score?: unknown;
  contact_48h?: unknown;
  consent_lead_sharing?: unknown;
  consentement_rappel?: unknown;
  consentement_transmission?: unknown;
}

export interface LeadScoreBreakdown {
  completude: number;
  fit: number;
  reactivite: number;
  total: number;
}

const hasText = (value: unknown) => Array.isArray(value) ? value.length > 0 : String(value ?? "").trim().length > 0;
const isYes = (value: unknown) => ["true", "yes", "oui", "1"].includes(String(value ?? "").trim().toLowerCase()) || value === true;
const goalHasIntent = (value: unknown) => {
  const goals = Array.isArray(value) ? value : String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return goals.some((goal) => goal && goal !== "need_help" && goal !== "nsp");
};

export function calculateUnifiedLeadScore(input: LeadScoringInput): LeadScoreBreakdown {
  let completude = 0;
  let fit = 0;
  let reactivite = 0;

  if (hasText(input.contact_email)) completude += 8;
  if (hasText(input.contact_firstname)) completude += 6;
  if (hasText(input.contact_phone)) completude += 10;
  if (hasText(input.location) || hasText(input.postal_code)) completude += 4;
  if (goalHasIntent(input.main_goal)) completude += 6;
  if (hasText(input.french_level_cecrl)) completude += 6;
  completude = Math.min(completude, 40);

  const level = String(input.french_level_cecrl ?? "").toLowerCase();
  if (["b1", "b2", "c1", "c2", "b1plus"].includes(level)) fit += 18;
  else if (level === "a2") fit += 14;
  else if (level === "a1") fit += 8;
  else if (level === "alpha" || level === "a0a1") fit += 4;

  if (String(input.work_right ?? "").toLowerCase() === "yes" || String(input.work_right ?? "").toLowerCase() === "oui") fit += 12;
  if (String(input.worked_in_france ?? "").toLowerCase() === "yes") fit += 8;
  else if (String(input.worked_in_france ?? "").toLowerCase() === "partial") fit += 4;
  if (isYes(input.real_comprehension_score)) fit += 4;
  if (hasText(input.target_sector) || hasText(input.fle_type)) fit += 8;
  fit = Math.min(fit, 50);

  if (isYes(input.contact_48h) || isYes(input.consentement_rappel)) reactivite += 5;
  if (isYes(input.consent_lead_sharing) || isYes(input.consentement_transmission)) reactivite += 5;
  reactivite = Math.min(reactivite, 10);

  return { completude, fit, reactivite, total: Math.min(100, completude + fit + reactivite) };
}
