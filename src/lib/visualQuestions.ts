/**
 * Configuration du questionnaire visuel pas-à-pas (PhotoLanguageChoice).
 * Chaque question : un écran avec titre + grille de cartes images.
 * Audio TTS lu automatiquement à l'affichage.
 */

export type VisualQuestionType = "single" | "multi";

export interface VisualOption {
  id: string;
  /** Clé i18n du libellé (ex: "questionnaire.main_goal.choices.learn_french") */
  labelKey: string;
  /** Émoji affiché (utilisé par PhotoLanguageChoice) */
  icon: string;
}

export interface VisualQuestion {
  /** Identifiant interne — sert aussi de clé pour stocker la réponse */
  id: string;
  /** Clé i18n du titre */
  titleKey: string;
  /** Clé i18n du sous-titre (optionnel) */
  subtitleKey?: string;
  type: VisualQuestionType;
  /** Nombre de colonnes dans la grille */
  columns: 2 | 3;
  options: VisualOption[];
  /** Si true, optionnel — bouton « Passer » disponible */
  optional?: boolean;
}

export const VISUAL_QUESTIONS: VisualQuestion[] = [
  // 1 — Objectif principal
  {
    id: "main_goal",
    titleKey: "questionnaire.main_goal.question",
    type: "single",
    columns: 2,
    options: [
      { id: "learn_french", labelKey: "questionnaire.main_goal.choices.learn_french", icon: "📚" },
      { id: "find_job", labelKey: "questionnaire.main_goal.choices.find_job", icon: "💼" },
      { id: "job_training", labelKey: "questionnaire.main_goal.choices.job_training", icon: "🎓" },
      { id: "need_help", labelKey: "questionnaire.main_goal.choices.need_help", icon: "🤝" },
    ],
  },

  // 2 — Niveau de français parlé (CECRL)
  {
    id: "french_level_cecrl",
    titleKey: "questionnaire.french_level_cecrl.question",
    subtitleKey: "questionnaire.french_level_cecrl.subtitle",
    type: "single",
    columns: 2,
    options: [
      { id: "alpha", labelKey: "questionnaire.french_level_cecrl.choices.alpha", icon: "🌱" },
      { id: "a1", labelKey: "questionnaire.french_level_cecrl.choices.a1", icon: "🌿" },
      { id: "a2", labelKey: "questionnaire.french_level_cecrl.choices.a2", icon: "🌳" },
      { id: "b1", labelKey: "questionnaire.french_level_cecrl.choices.b1", icon: "🌲" },
    ],
  },

  // 3 — Lettrisme
  {
    id: "literacy",
    titleKey: "questionnaire.literacy.question",
    type: "single",
    columns: 3,
    options: [
      { id: "yes", labelKey: "questionnaire.literacy.choices.yes", icon: "✅" },
      { id: "partial", labelKey: "questionnaire.literacy.choices.partial", icon: "✍️" },
      { id: "no", labelKey: "questionnaire.literacy.choices.no", icon: "❌" },
    ],
  },

  // 4 — Droit de travailler
  {
    id: "work_right",
    titleKey: "questionnaire.work_right.question",
    subtitleKey: "questionnaire.work_right.subtitle",
    type: "single",
    columns: 3,
    options: [
      { id: "yes", labelKey: "questionnaire.work_right.choices.yes", icon: "✅" },
      { id: "no", labelKey: "questionnaire.work_right.choices.no", icon: "❌" },
      { id: "unknown", labelKey: "questionnaire.work_right.choices.unknown", icon: "🤔" },
    ],
  },

  // 5 — Secteur visé
  {
    id: "target_sector",
    titleKey: "onboardingVisual.target_sector.question",
    subtitleKey: "onboardingVisual.target_sector.subtitle",
    type: "single",
    columns: 3,
    options: [
      { id: "btp", labelKey: "onboardingVisual.target_sector.choices.btp", icon: "🏗️" },
      { id: "logistique", labelKey: "onboardingVisual.target_sector.choices.logistique", icon: "📦" },
      { id: "proprete", labelKey: "onboardingVisual.target_sector.choices.proprete", icon: "🧹" },
      { id: "aide_personne", labelKey: "onboardingVisual.target_sector.choices.aide_personne", icon: "❤️" },
      { id: "hotellerie", labelKey: "onboardingVisual.target_sector.choices.hotellerie", icon: "🍽️" },
      { id: "commerce", labelKey: "onboardingVisual.target_sector.choices.commerce", icon: "🛍️" },
    ],
    optional: true,
  },

  // 6 — Contraintes (multi)
  {
    id: "barriers",
    titleKey: "onboardingVisual.barriers.question",
    subtitleKey: "onboardingVisual.barriers.subtitle",
    type: "multi",
    columns: 3,
    options: [
      { id: "transport", labelKey: "onboardingVisual.barriers.choices.transport", icon: "🚌" },
      { id: "childcare", labelKey: "onboardingVisual.barriers.choices.childcare", icon: "👶" },
      { id: "schedule", labelKey: "onboardingVisual.barriers.choices.schedule", icon: "⏰" },
      { id: "housing", labelKey: "onboardingVisual.barriers.choices.housing", icon: "🏠" },
      { id: "health", labelKey: "onboardingVisual.barriers.choices.health", icon: "💊" },
      { id: "none", labelKey: "onboardingVisual.barriers.choices.none", icon: "✨" },
    ],
  },

  // 7 — Disponibilité de contact
  {
    id: "contact_48h",
    titleKey: "questionnaire.contact_48h.question",
    subtitleKey: "questionnaire.contact_48h.subtitle",
    type: "single",
    columns: 2,
    options: [
      { id: "yes", labelKey: "questionnaire.contact_48h.choices.yes", icon: "✅" },
      { id: "no", labelKey: "questionnaire.contact_48h.choices.no", icon: "⏰" },
    ],
  },
];

/**
 * Calcule le pourcentage de progression (sur les questions + l'étape email).
 */
export function getProgressPercent(currentIndex: number, totalQuestions: number): number {
  // +1 pour l'étape email finale
  const total = totalQuestions + 1;
  return Math.round(((currentIndex + 1) / total) * 100);
}
