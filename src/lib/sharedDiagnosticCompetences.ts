import { supabase } from "@/integrations/supabase/client";
import competenceReference from "@/data/detection_competences_simple.json";

export type ExperienceCategory = "travail" | "famille" | "benevolat" | "pays_origine";

export interface CompetenceRule {
  key: string;
  label: string;
  domain: string;
  keywords: string[];
  examples: string[];
}

export interface ExperienceInput {
  diagnostic_id: string;
  category: ExperienceCategory;
  description: string;
  activities?: string[];
}

export interface CompetenceScore {
  competence_key: string;
  competence_label: string;
  domain: string;
  score: number;
  level: "repéré" | "émergent" | "opérationnel" | "maîtrise";
  detected_from: string[];
  evidence: unknown;
}

export const COMPETENCE_REFERENCE = competenceReference as CompetenceRule[];

export const EXPERIENCE_CATEGORY_LABELS: Record<ExperienceCategory, string> = {
  travail: "Travail",
  famille: "Famille",
  benevolat: "Bénévolat",
  pays_origine: "Pays d’origine",
};

export function normalizeActivities(activities: string[] = []) {
  return activities.map((item) => item.trim()).filter(Boolean).slice(0, 30);
}

export async function saveSharedDiagnosticExperiences(experiences: ExperienceInput[]) {
  const cleanExperiences = experiences.map((experience) => ({
    diagnostic_id: experience.diagnostic_id,
    category: experience.category,
    description: experience.description.trim().slice(0, 5000),
    activities: normalizeActivities(experience.activities),
  }));

  const { data, error } = await supabase
    .from("shared_diagnostic_experiences")
    .upsert(cleanExperiences, { onConflict: "diagnostic_id,category" })
    .select();

  if (error) throw error;
  return data;
}

export async function scoreSharedDiagnosticCompetences(diagnosticId: string): Promise<CompetenceScore[]> {
  const { data, error } = await supabase.rpc("score_shared_diagnostic_competences", {
    _diagnostic_id: diagnosticId,
  });

  if (error) throw error;
  return Array.isArray(data) ? (data as unknown as CompetenceScore[]) : [];
}

export async function saveExperiencesAndScore(experiences: ExperienceInput[]) {
  if (!experiences.length) return [];
  await saveSharedDiagnosticExperiences(experiences);
  return scoreSharedDiagnosticCompetences(experiences[0].diagnostic_id);
}

export function getScoreExplanation(score: number) {
  if (score >= 75) return "Maîtrise : compétence observée dans plusieurs situations avec plusieurs indices.";
  if (score >= 45) return "Opérationnel : compétence solide, confirmée par plusieurs mots-clés ou contextes.";
  if (score >= 20) return "Émergent : compétence repérée, à confirmer avec le formateur.";
  return "Repéré : premier signal détecté dans l’expérience.";
}
