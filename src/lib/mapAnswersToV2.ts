/**
 * Maps current onboarding answers (from ONBOARDING_TREE) to v2 UserResponses
 * for use with computeOrientation().
 */
import type {
  UserResponses,
  Secteur,
  NiveauFrancais,
  StatutAdministratif,
} from "./orientationEngine";

interface LegacyAnswers {
  main_goal?: string | string[];
  work_right?: string;
  french_level_cecrl?: string;
  target_sector?: string;
  barriers?: string | string[];
  contact_48h?: string;
  fle_type?: string;
  training_duration?: string;
  tags?: string[];
  diploma_level?: string;
  continue_field?: string;
  admin_status?: string;
  cir_status?: string;
  ofii_hours_remaining?: number;
  housing_blocking?: boolean;
  prefers_female_trainer?: boolean;
  childcare_status?: string;
  [key: string]: unknown;
}

const GOAL_MAP: Record<string, UserResponses["q1_interet"]> = {
  learn_french: "francais",
  find_job: "travail",
  job_training: "formation",
  need_help: "nsp",
};

const LEVEL_MAP: Record<string, NiveauFrancais> = {
  alpha: "Alpha",
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

const BESOIN_MAP: Record<string, "logement" | "admin" | "sante" | "sante_mentale" | "autre"> = {
  housing: "logement",
  admin: "admin",
  health: "sante",
  mental_health: "sante_mentale",
};

const ADMIN_STATUS_MAP: Record<string, StatutAdministratif> = {
  titre_sejour: "titre_sejour",
  refugie: "bpi_refugie",
  bpi_refugie: "bpi_refugie",
  bpi_subsidiaire: "bpi_subsidiaire",
  demandeur_asile: "demandeur_asile",
  sans_papiers: "sans_papiers",
  ue: "ue",
  cir_signed: "cir_signed",
  cir_in_progress: "cir_in_progress",
  ne_sait_pas: "nsp",
};

export function mapAnswersToV2(answers: LegacyAnswers): UserResponses {
  const tags = answers.tags ?? [];

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

  // q4_niveau_francais — Alpha distingué de A0/A1
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

  // Reconnaissance de diplôme : déclenché si "recognize_diploma" est dans main_goal
  const recognizeDiploma = goals.includes("recognize_diploma");
  const diplomaLevel = answers.diploma_level as UserResponses["q_diploma_level"] | undefined;
  const continueField = answers.continue_field as UserResponses["q_continue_field"] | undefined;

  // ── Statut administratif détaillé ──
  let q_statut_admin: StatutAdministratif | undefined =
    answers.admin_status ? ADMIN_STATUS_MAP[answers.admin_status] : undefined;
  // Override depuis CIR
  if (answers.cir_status === "signed_hours_left" || answers.cir_status === "signed_used") {
    q_statut_admin = "cir_signed";
  } else if (answers.cir_status === "in_progress") {
    q_statut_admin = "cir_in_progress";
  } else if (answers.cir_status === "not_concerned" && !q_statut_admin) {
    q_statut_admin = "ue";
  }
  // Tags fallback (compat ancienne donnée)
  if (!q_statut_admin) {
    if (tags.includes("status_refugie")) q_statut_admin = "bpi_refugie";
    else if (tags.includes("status_demandeur_asile")) q_statut_admin = "demandeur_asile";
    else if (tags.includes("status_sans_papiers")) q_statut_admin = "sans_papiers";
    else if (tags.includes("status_titre_sejour")) q_statut_admin = "titre_sejour";
  }

  // ── OFII heures restantes ──
  const q_ofii_hours_remaining =
    typeof answers.ofii_hours_remaining === "number"
      ? answers.ofii_hours_remaining
      : answers.cir_status === "signed_hours_left"
        ? 200 // estimation par défaut quand pas chiffré
        : answers.cir_status === "signed_used"
          ? 0
          : undefined;

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
    q_recognize_diploma: recognizeDiploma || undefined,
    q_diploma_level: diplomaLevel,
    q_continue_field: continueField,
    q_statut_admin,
    q_ofii_hours_remaining,
    q_housing_blocking: answers.housing_blocking || undefined,
    q_prefers_female_trainer: answers.prefers_female_trainer || undefined,
    q_childcare: answers.childcare_status as UserResponses["q_childcare"] | undefined,
  };
}
