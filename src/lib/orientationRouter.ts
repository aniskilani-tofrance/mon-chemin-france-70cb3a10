// Maps existing internal route ids (route_a/b/c/sas + extended ids from the
// decision tree) to the simplified 6-path "recommended_path" enum used by the
// callback workflow.
import type { Database } from "@/integrations/supabase/types";

export type RecommendedPath = Database["public"]["Enums"]["recommended_path"];

const ROUTE_TO_PATH: Record<string, RecommendedPath> = {
  // Legacy onboarding routes
  route_a: "francais",
  route_b: "formation",
  route_c: "emploi",
  sas: "social",
  // Extended decision-tree parcours ids
  FRANCAIS: "francais",
  OFII: "francais",
  INSERTION: "emploi",
  FORMATION: "formation",
  MIXTE: "formation",
  RECONNAISSANCE: "diplome",
  BPI: "social",
  ADMIN: "social",
  LOGEMENT: "social",
  ECOUTE: "social",
  ORIENTATION: "social",
};

const GOAL_TO_PATH: Record<string, RecommendedPath> = {
  learn_french: "francais",
  find_job: "emploi",
  get_training: "formation",
  recognize_diploma: "diplome",
  admin_help: "social",
  digital_help: "numerique",
  need_help: "social",
};

export interface OrientationInputs {
  leadRoute?: string | null;
  main_goal?: string | null;
  french_level_cecrl?: string | null;
  barriers?: string[] | null;
}

/**
 * Compute the user-facing recommended_path + an optional secondary_path.
 *
 * Rules (kept simple — see plan):
 * - Blocking barriers (housing/papers/health) → social as primary
 * - Non/very low French + employment/formation goal → français primary, original as secondary
 * - Otherwise map from existing leadRoute, falling back to main_goal
 */
export function computeRecommendedPath(
  inputs: OrientationInputs
): { primary: RecommendedPath; secondary: RecommendedPath | null } {
  const barriers = inputs.barriers ?? [];
  const blockingBarrier = barriers.some((b) =>
    ["housing", "logement", "papers", "papiers", "sante", "health"].includes(b)
  );

  const fromGoal = inputs.main_goal ? GOAL_TO_PATH[inputs.main_goal] : undefined;
  const fromRoute = inputs.leadRoute ? ROUTE_TO_PATH[inputs.leadRoute] : undefined;
  const base: RecommendedPath = fromRoute ?? fromGoal ?? "social";

  const lowFrench =
    inputs.french_level_cecrl === "alpha" || inputs.french_level_cecrl === "post_alpha";

  if (blockingBarrier && base !== "social") {
    return { primary: "social", secondary: base };
  }
  if (lowFrench && (base === "emploi" || base === "formation")) {
    return { primary: "francais", secondary: base };
  }
  return { primary: base, secondary: null };
}

export const RECOMMENDED_PATH_LABEL: Record<RecommendedPath, string> = {
  francais: "Apprendre le français",
  emploi: "Accès à l'emploi",
  formation: "Formation métier",
  diplome: "Reconnaissance de diplôme",
  social: "Accompagnement social et administratif",
  numerique: "Aide numérique",
};
