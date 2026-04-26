import { calculateUnifiedLeadScore } from "./lead-scoring.ts";

export function calculateQualificationScore(input: {
  phone?: unknown;
  consentement_rappel?: unknown;
  consentement_transmission?: unknown;
  besoin_principal?: unknown;
  niveau_francais?: unknown;
}) {
  return calculateUnifiedLeadScore({
    contact_phone: input.phone,
    consentement_rappel: input.consentement_rappel,
    consentement_transmission: input.consentement_transmission,
    main_goal: input.besoin_principal,
    french_level_cecrl: input.niveau_francais,
  }).total;
}
