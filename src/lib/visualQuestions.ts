/**
 * Configuration du questionnaire visuel pas-à-pas (PhotoLanguageChoice).
 * Chaque question : un écran avec titre + grille de cartes images.
 * Audio TTS lu automatiquement à l'affichage.
 */

// Illustrations IA importées (questions principales)
import gaWomanU25 from "@/assets/onboarding/gender_age_woman_under25.jpg";
import gaWoman25 from "@/assets/onboarding/gender_age_woman_25_45.jpg";
import gaWomanO45 from "@/assets/onboarding/gender_age_woman_over45.jpg";
import gaManU25 from "@/assets/onboarding/gender_age_man_under25.jpg";
import gaMan25 from "@/assets/onboarding/gender_age_man_25_45.jpg";
import gaManO45 from "@/assets/onboarding/gender_age_man_over45.jpg";

import sitJobseeker from "@/assets/onboarding/situation_jobseeker.jpg";
import sitEmployee from "@/assets/onboarding/situation_employee.jpg";
import sitStudent from "@/assets/onboarding/situation_student.jpg";
import sitInactive from "@/assets/onboarding/situation_inactive.jpg";

import goalLearn from "@/assets/onboarding/goal_learn_french.jpg";
import goalJob from "@/assets/onboarding/goal_find_job.jpg";
import goalTraining from "@/assets/onboarding/goal_job_training.jpg";
import goalHelp from "@/assets/onboarding/goal_need_help.jpg";

import lvlAlpha from "@/assets/onboarding/level_alpha.jpg";
import lvlA1 from "@/assets/onboarding/level_a1.jpg";
import lvlA2 from "@/assets/onboarding/level_a2.jpg";
import lvlB1 from "@/assets/onboarding/level_b1.jpg";

import litYes from "@/assets/onboarding/literacy_yes.jpg";
import litPartial from "@/assets/onboarding/literacy_partial.jpg";
import litNo from "@/assets/onboarding/literacy_no.jpg";

import wrYes from "@/assets/onboarding/work_right_yes.jpg";
import wrNo from "@/assets/onboarding/work_right_no.jpg";
import wrUnknown from "@/assets/onboarding/work_right_unknown.jpg";

import secBtp from "@/assets/onboarding/sector_btp.jpg";
import secLog from "@/assets/onboarding/sector_logistique.jpg";
import secProp from "@/assets/onboarding/sector_proprete.jpg";
import secAide from "@/assets/onboarding/sector_aide_personne.jpg";
import secHotel from "@/assets/onboarding/sector_hotellerie.jpg";
import secCom from "@/assets/onboarding/sector_commerce.jpg";

import tensionBtp from "@/assets/onboarding/tension_btp.jpg";
import tensionAidePersonne from "@/assets/onboarding/tension_aide_personne.jpg";
import tensionHotellerie from "@/assets/onboarding/tension_hotellerie.jpg";
import tensionLogistique from "@/assets/onboarding/tension_logistique.jpg";
import tensionProprete from "@/assets/onboarding/tension_proprete.jpg";
import tensionSante from "@/assets/onboarding/tension_sante.jpg";
import tensionSecurite from "@/assets/onboarding/tension_securite.jpg";
import tensionTransport from "@/assets/onboarding/tension_transport.jpg";

// Reconnaissance de diplôme
import goalRecognize from "@/assets/onboarding/goal_recognize_diploma.jpg";

// Niveau de diplôme
import dipSecondary from "@/assets/onboarding/diploma_secondary.jpg";
import dipBac from "@/assets/onboarding/diploma_bac.jpg";
import dipBachelor from "@/assets/onboarding/diploma_bachelor.jpg";
import dipMaster from "@/assets/onboarding/diploma_master.jpg";
import dipDoctorate from "@/assets/onboarding/diploma_doctorate.jpg";
import dipNone from "@/assets/onboarding/diploma_no_diploma.jpg";

// Continuer dans le domaine
import contYes from "@/assets/onboarding/continue_yes.jpg";
import contNo from "@/assets/onboarding/continue_no.jpg";
import contUnsure from "@/assets/onboarding/continue_unsure.jpg";

// Mobilité
import mobWalk from "@/assets/onboarding/mobility_walk.jpg";
import mobBike from "@/assets/onboarding/mobility_bike.jpg";
import mobCar from "@/assets/onboarding/mobility_car.jpg";
import mobTransit from "@/assets/onboarding/mobility_transit.jpg";

// Contraintes
import barTransport from "@/assets/onboarding/barrier_transport.jpg";
import barChildcare from "@/assets/onboarding/barrier_childcare.jpg";
import barSchedule from "@/assets/onboarding/barrier_schedule.jpg";
import barHousing from "@/assets/onboarding/barrier_housing.jpg";
import barHealth from "@/assets/onboarding/barrier_health.jpg";
import barNone from "@/assets/onboarding/barrier_none.jpg";

// Disponibilité contact
import contactYes from "@/assets/onboarding/contact_yes.jpg";
import contactNo from "@/assets/onboarding/contact_no.jpg";

// Statut administratif
import adminTitre from "@/assets/onboarding/admin_titre_sejour.jpg";
import adminBpiRefugie from "@/assets/onboarding/admin_bpi_refugie.jpg";
import adminBpiSubs from "@/assets/onboarding/admin_bpi_subsidiaire.jpg";
import adminDemandeur from "@/assets/onboarding/admin_demandeur_asile.jpg";
import adminSansPapiers from "@/assets/onboarding/admin_sans_papiers.jpg";
import adminDontKnow from "@/assets/onboarding/admin_dont_know.jpg";

// CIR / OFII
import cirSignedLeft from "@/assets/onboarding/cir_signed_hours_left.jpg";
import cirSignedUsed from "@/assets/onboarding/cir_signed_used.jpg";
import cirInProgress from "@/assets/onboarding/cir_in_progress.jpg";
import cirNotSigned from "@/assets/onboarding/cir_not_signed.jpg";
import cirNotConcerned from "@/assets/onboarding/cir_not_concerned.jpg";
import cirDontKnow from "@/assets/onboarding/cir_dont_know.jpg";

export type VisualQuestionType = "single" | "multi" | "info";

export interface VisualOption {
  id: string;
  /** Clé i18n du libellé */
  labelKey: string;
  /** Émoji affiché si pas d'illustration */
  icon: string;
  /** Illustration importée (optionnelle) */
  illustration?: string;
}

/** Réponses déjà collectées (utilisé par showIf) */
export type AnswersMap = Record<string, string | string[] | undefined>;

export interface VisualQuestion {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  type: VisualQuestionType;
  columns: 2 | 3;
  options: VisualOption[];
  /** Si true, optionnel — bouton « Passer » disponible */
  optional?: boolean;
  /** Affichage conditionnel basé sur les réponses précédentes */
  showIf?: (answers: AnswersMap) => boolean;
  /** Pour les écrans purement informatifs : texte du bouton de validation */
  infoCtaKey?: string;
}

/** Helper : main_goal peut être string ou string[] (multi-choice) */
const goalIncludes = (answers: AnswersMap, goal: string): boolean => {
  const v = answers.main_goal;
  if (Array.isArray(v)) return v.includes(goal);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).includes(goal);
  return false;
};

export const VISUAL_QUESTIONS: VisualQuestion[] = [
  // 1 — Genre + âge (NOUVEAU)
  {
    id: "gender_age",
    titleKey: "questionnaire.gender_age.question",
    subtitleKey: "questionnaire.gender_age.subtitle",
    type: "single",
    columns: 3,
    options: [
      { id: "woman_under25", labelKey: "questionnaire.gender_age.choices.woman_under25", icon: "👩", illustration: gaWomanU25 },
      { id: "woman_25_45", labelKey: "questionnaire.gender_age.choices.woman_25_45", icon: "👩‍💼", illustration: gaWoman25 },
      { id: "woman_over45", labelKey: "questionnaire.gender_age.choices.woman_over45", icon: "👵", illustration: gaWomanO45 },
      { id: "man_under25", labelKey: "questionnaire.gender_age.choices.man_under25", icon: "👨", illustration: gaManU25 },
      { id: "man_25_45", labelKey: "questionnaire.gender_age.choices.man_25_45", icon: "👨‍💼", illustration: gaMan25 },
      { id: "man_over45", labelKey: "questionnaire.gender_age.choices.man_over45", icon: "👴", illustration: gaManO45 },
    ],
  },

  // 2 — Situation actuelle (NOUVEAU)
  {
    id: "current_situation",
    titleKey: "questionnaire.current_situation.question",
    type: "single",
    columns: 2,
    options: [
      { id: "jobseeker", labelKey: "questionnaire.current_situation.choices.jobseeker", icon: "🔍", illustration: sitJobseeker },
      { id: "employee", labelKey: "questionnaire.current_situation.choices.employee", icon: "👷", illustration: sitEmployee },
      { id: "student", labelKey: "questionnaire.current_situation.choices.student", icon: "🎒", illustration: sitStudent },
      { id: "inactive", labelKey: "questionnaire.current_situation.choices.inactive", icon: "🏠", illustration: sitInactive },
    ],
  },

  // 3 — Objectif principal (multi : on peut combiner ex. apprendre français + trouver emploi)
  {
    id: "main_goal",
    titleKey: "questionnaire.main_goal.question",
    subtitleKey: "questionnaire.main_goal.subtitle",
    type: "multi",
    columns: 2,
    options: [
      { id: "learn_french", labelKey: "questionnaire.main_goal.choices.learn_french", icon: "📚", illustration: goalLearn },
      { id: "find_job", labelKey: "questionnaire.main_goal.choices.find_job", icon: "💼", illustration: goalJob },
      { id: "job_training", labelKey: "questionnaire.main_goal.choices.job_training", icon: "🎓", illustration: goalTraining },
      { id: "recognize_diploma", labelKey: "questionnaire.main_goal.choices.recognize_diploma", icon: "🎖️", illustration: goalRecognize },
      { id: "need_help", labelKey: "questionnaire.main_goal.choices.need_help", icon: "🤝", illustration: goalHelp },
    ],
  },

  // 3.a — Niveau du diplôme d'origine (conditionnel : si recognize_diploma)
  {
    id: "diploma_level",
    titleKey: "questionnaire.diploma_level.question",
    subtitleKey: "questionnaire.diploma_level.subtitle",
    type: "single",
    columns: 2,
    options: [
      { id: "secondary", labelKey: "questionnaire.diploma_level.choices.secondary", icon: "🏫", illustration: dipSecondary },
      { id: "bac", labelKey: "questionnaire.diploma_level.choices.bac", icon: "📜", illustration: dipBac },
      { id: "bachelor", labelKey: "questionnaire.diploma_level.choices.bachelor", icon: "🎓", illustration: dipBachelor },
      { id: "master", labelKey: "questionnaire.diploma_level.choices.master", icon: "📚", illustration: dipMaster },
      { id: "doctorate", labelKey: "questionnaire.diploma_level.choices.doctorate", icon: "🧑‍🔬", illustration: dipDoctorate },
      { id: "no_diploma", labelKey: "questionnaire.diploma_level.choices.no_diploma", icon: "❓", illustration: dipNone },
    ],
    showIf: (a) => goalIncludes(a, "recognize_diploma"),
  },

  // 3.b — Continuer dans son domaine de compétence ?
  {
    id: "continue_field",
    titleKey: "questionnaire.continue_field.question",
    subtitleKey: "questionnaire.continue_field.subtitle",
    type: "single",
    columns: 3,
    options: [
      { id: "yes", labelKey: "questionnaire.continue_field.choices.yes", icon: "✅", illustration: contYes },
      { id: "no", labelKey: "questionnaire.continue_field.choices.no", icon: "🔄", illustration: contNo },
      { id: "unsure", labelKey: "questionnaire.continue_field.choices.unsure", icon: "🤔", illustration: contUnsure },
    ],
    showIf: (a) => goalIncludes(a, "recognize_diploma"),
  },

  // 3.c — Écran info : ENIC-NARIC + métiers en tension
  {
    id: "tension_jobs_info",
    titleKey: "questionnaire.tension_jobs_info.question",
    subtitleKey: "questionnaire.tension_jobs_info.subtitle",
    type: "info",
    columns: 3,
    options: [
      { id: "btp", labelKey: "questionnaire.tension_jobs_info.sectors.btp", icon: "🏗️", illustration: tensionBtp },
      { id: "aide_personne", labelKey: "questionnaire.tension_jobs_info.sectors.aide_personne", icon: "❤️", illustration: tensionAidePersonne },
      { id: "hotellerie", labelKey: "questionnaire.tension_jobs_info.sectors.hotellerie", icon: "🍽️", illustration: tensionHotellerie },
      { id: "logistique", labelKey: "questionnaire.tension_jobs_info.sectors.logistique", icon: "📦", illustration: tensionLogistique },
      { id: "proprete", labelKey: "questionnaire.tension_jobs_info.sectors.proprete", icon: "🧹", illustration: tensionProprete },
      { id: "sante", labelKey: "questionnaire.tension_jobs_info.sectors.sante", icon: "🩺", illustration: tensionSante },
      { id: "securite", labelKey: "questionnaire.tension_jobs_info.sectors.securite", icon: "🛡️", illustration: tensionSecurite },
      { id: "transport", labelKey: "questionnaire.tension_jobs_info.sectors.transport", icon: "🚚", illustration: tensionTransport },
    ],
    infoCtaKey: "questionnaire.tension_jobs_info.cta",
    showIf: (a) => goalIncludes(a, "recognize_diploma"),
  },

  // 4 — Niveau de français parlé (CECRL)
  {
    id: "french_level_cecrl",
    titleKey: "questionnaire.french_level_cecrl.question",
    subtitleKey: "questionnaire.french_level_cecrl.subtitle",
    type: "single",
    columns: 2,
    options: [
      { id: "alpha", labelKey: "questionnaire.french_level_cecrl.choices.alpha", icon: "🌱", illustration: lvlAlpha },
      { id: "a1", labelKey: "questionnaire.french_level_cecrl.choices.a1", icon: "🌿", illustration: lvlA1 },
      { id: "a2", labelKey: "questionnaire.french_level_cecrl.choices.a2", icon: "🌳", illustration: lvlA2 },
      { id: "b1", labelKey: "questionnaire.french_level_cecrl.choices.b1", icon: "🌲", illustration: lvlB1 },
    ],
  },

  // 5 — Lettrisme
  {
    id: "literacy",
    titleKey: "questionnaire.literacy.question",
    type: "single",
    columns: 3,
    options: [
      { id: "yes", labelKey: "questionnaire.literacy.choices.yes", icon: "✅", illustration: litYes },
      { id: "partial", labelKey: "questionnaire.literacy.choices.partial", icon: "✍️", illustration: litPartial },
      { id: "no", labelKey: "questionnaire.literacy.choices.no", icon: "❌", illustration: litNo },
    ],
  },

  // 6 — Droit de travailler
  {
    id: "work_right",
    titleKey: "questionnaire.work_right.question",
    subtitleKey: "questionnaire.work_right.subtitle",
    type: "single",
    columns: 3,
    options: [
      { id: "yes", labelKey: "questionnaire.work_right.choices.yes", icon: "✅", illustration: wrYes },
      { id: "no", labelKey: "questionnaire.work_right.choices.no", icon: "❌", illustration: wrNo },
      { id: "unknown", labelKey: "questionnaire.work_right.choices.unknown", icon: "🤔", illustration: wrUnknown },
    ],
  },

  // 7 — Secteur visé
  {
    id: "target_sector",
    titleKey: "onboardingVisual.target_sector.question",
    subtitleKey: "onboardingVisual.target_sector.subtitle",
    type: "single",
    columns: 3,
    options: [
      { id: "btp", labelKey: "onboardingVisual.target_sector.choices.btp", icon: "🏗️", illustration: secBtp },
      { id: "logistique", labelKey: "onboardingVisual.target_sector.choices.logistique", icon: "📦", illustration: secLog },
      { id: "proprete", labelKey: "onboardingVisual.target_sector.choices.proprete", icon: "🧹", illustration: secProp },
      { id: "aide_personne", labelKey: "onboardingVisual.target_sector.choices.aide_personne", icon: "❤️", illustration: secAide },
      { id: "hotellerie", labelKey: "onboardingVisual.target_sector.choices.hotellerie", icon: "🍽️", illustration: secHotel },
      { id: "commerce", labelKey: "onboardingVisual.target_sector.choices.commerce", icon: "🛍️", illustration: secCom },
    ],
    optional: true,
  },

  // 8 — Mobilité (NOUVEAU, multi, émojis)
  {
    id: "mobility",
    titleKey: "questionnaire.mobility.question",
    subtitleKey: "questionnaire.mobility.subtitle",
    type: "multi",
    columns: 2,
    options: [
      { id: "walk", labelKey: "questionnaire.mobility.choices.walk", icon: "🚶", illustration: mobWalk },
      { id: "bike", labelKey: "questionnaire.mobility.choices.bike", icon: "🚲", illustration: mobBike },
      { id: "car", labelKey: "questionnaire.mobility.choices.car", icon: "🚗", illustration: mobCar },
      { id: "transit", labelKey: "questionnaire.mobility.choices.transit", icon: "🚌", illustration: mobTransit },
    ],
  },

  // 9 — Contraintes (multi, émojis)
  {
    id: "barriers",
    titleKey: "onboardingVisual.barriers.question",
    subtitleKey: "onboardingVisual.barriers.subtitle",
    type: "multi",
    columns: 3,
    options: [
      { id: "transport", labelKey: "onboardingVisual.barriers.choices.transport", icon: "🚌", illustration: barTransport },
      { id: "childcare", labelKey: "onboardingVisual.barriers.choices.childcare", icon: "👶", illustration: barChildcare },
      { id: "schedule", labelKey: "onboardingVisual.barriers.choices.schedule", icon: "⏰", illustration: barSchedule },
      { id: "housing", labelKey: "onboardingVisual.barriers.choices.housing", icon: "🏠", illustration: barHousing },
      { id: "health", labelKey: "onboardingVisual.barriers.choices.health", icon: "💊", illustration: barHealth },
      { id: "none", labelKey: "onboardingVisual.barriers.choices.none", icon: "✨", illustration: barNone },
    ],
  },

  // 10 — Disponibilité de contact (émojis)
  {
    id: "contact_48h",
    titleKey: "questionnaire.contact_48h.question",
    subtitleKey: "questionnaire.contact_48h.subtitle",
    type: "single",
    columns: 2,
    options: [
      { id: "yes", labelKey: "questionnaire.contact_48h.choices.yes", icon: "✅", illustration: contactYes },
      { id: "no", labelKey: "questionnaire.contact_48h.choices.no", icon: "⏰", illustration: contactNo },
    ],
  },
];

/**
 * Calcule le pourcentage de progression (questions + code postal + email).
 */
export function getProgressPercent(currentIndex: number, totalQuestions: number): number {
  // +2 pour code postal et email
  const total = totalQuestions + 2;
  return Math.round(((currentIndex + 1) / total) * 100);
}
