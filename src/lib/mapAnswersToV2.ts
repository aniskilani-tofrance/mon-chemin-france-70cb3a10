/**
 * Maps current onboarding answers (from ONBOARDING_TREE) to v2 UserResponses
 * for use with computeOrientation().
 */
import type { UserResponses, Secteur, NiveauFrancais } from "./orientationEngine";

interface LegacyAnswers {
  main_goal?: string;
  work_right?: string;
  french_level_cecrl?: string;
  target_sector?: string;
  barriers?: string | string[];
  contact_48h?: string;
  fle_type?: string;
  training_duration?: string;
  tags?: string[];
  [key: string]: unknown;
}

const GOAL_MAP: Record<string, UserResponses["q1_interet"]> = {
  learn_french: "francais",
  find_job: "travail",
  job_training: "formation",
  need_help: "nsp",
};

const LEVEL_MAP: Record<string, NiveauFrancais> = {
  alpha: "A0A1",
  a1: "A0A1",
  a2: "A2",
  b1: "B1plus",
};

const SECTOR_MAP: Record<string, Secteur> = {
  logistique: "logistique",
  proprete: "proprete",
  sante: "aide_personne",
  aide_personne: "aide_personne",
  hotellerie: "restauration",
  restauration: "restauration",
  commerce: "commerce",
  btp: "btp",
};

const BARRIER_MAP: Record<string, "mobilite" | "garde_enfants" | "horaires" | "aucune"> = {
  transport: "mobilite",
  childcare: "garde_enfants",
  schedule: "horaires",
  none: "aucune",
};

const BESOIN_MAP: Record<string, "logement" | "admin" | "sante" | "autre"> = {
  housing: "logement",
  admin: "admin",
  health: "sante",
};

export function mapAnswersToV2(answers: LegacyAnswers): UserResponses {
  // q1_interet — main_goal peut être multi (string CSV ou array). Priorité: travail+francais=mixte, sinon travail > formation > francais.
  const rawGoal = answers.main_goal;
  const goals = Array.isArray(rawGoal)
    ? rawGoal
    : typeof rawGoal === "string"
      ? rawGoal.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const mappedGoals = goals.map((g) => GOAL_MAP[g]).filter(Boolean) as Array<UserResponses["q1_interet"]>;
  const hasFrench = mappedGoals.includes("francais");
  const hasJob = mappedGoals.includes("travail");
  const hasTraining = mappedGoals.includes("formation");
  let q1: UserResponses["q1_interet"];
  if (hasJob && hasFrench) q1 = "mixte";
  else if (hasJob) q1 = "travail";
  else if (hasTraining) q1 = "formation";
  else if (hasFrench) q1 = "francais";
  else q1 = mappedGoals[0] ?? "nsp";

  // q2_droit_travailler
  const workRight = answers.work_right;
  const q2: UserResponses["q2_droit_travailler"] =
    workRight === "yes" ? "oui" : workRight === "no" ? "non" : "nsp";

  // q3_france_travail — not asked in current flow
  const q3: UserResponses["q3_france_travail"] = "nsp";

  // q4_niveau_francais
  const q4: NiveauFrancais = LEVEL_MAP[answers.french_level_cecrl || ""] ?? "A0A1";

  // q5_objectif — derive from goal + context
  let q5: UserResponses["q5_objectif"] = "francais";
  if (q1 === "travail") q5 = "rapide";
  else if (q1 === "formation") q5 = "formation";
  else if (q1 === "mixte") q5 = "alternance";

  // q6_secteur
  const q6: Secteur = SECTOR_MAP[answers.target_sector || ""] ?? "nsp";

  // q7_contraintes
  const rawBarriers = Array.isArray(answers.barriers)
    ? answers.barriers
    : answers.barriers
      ? answers.barriers.split(",")
      : [];
  const q7 = rawBarriers
    .map((b) => BARRIER_MAP[b])
    .filter(Boolean) as UserResponses["q7_contraintes"];
  if (q7.length === 0) q7.push("aucune");

  // q8_competences — not directly asked
  const q8: UserResponses["q8_competences"] = ["aucune"];

  // q9_besoins — extract from barriers
  const q9 = rawBarriers
    .map((b) => BESOIN_MAP[b])
    .filter(Boolean) as NonNullable<UserResponses["q9_besoins"]>;

  return {
    q1_interet: q1,
    q2_droit_travailler: q2,
    q3_france_travail: q3,
    q4_niveau_francais: q4,
    q5_objectif: q5,
    q6_secteur: q6,
    q7_contraintes: q7,
    q8_competences: q8,
    q9_besoins: q9.length > 0 ? q9 : undefined,
  };
}
