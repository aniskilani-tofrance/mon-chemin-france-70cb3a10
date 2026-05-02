import { calculateUnifiedLeadScore } from "./leadScoring";
// ============================================================
// ToFrance — Arbre de décision v2 (TypeScript)
// Fichier : src/lib/decisionTree.ts
// ============================================================

// ─── Types ───────────────────────────────────────────────────

export type NiveauFrancais = "Alpha" | "A0A1" | "A2" | "B1plus";

export type Secteur =
  | "logistique"
  | "proprete"
  | "aide_personne"
  | "restauration"
  | "commerce"
  | "btp"
  | "nsp";

export type StatutAdministratif =
  | "ue"                    // Citoyen UE / EEE / Suisse
  | "cir_signed"            // CIR signé
  | "cir_in_progress"       // CIR en cours
  | "titre_sejour"          // Titre de séjour avec autorisation de travail
  | "bpi_refugie"           // Statut de réfugié OFPRA
  | "bpi_subsidiaire"       // Protection subsidiaire
  | "demandeur_asile"       // En attente OFPRA / CNDA
  | "sans_papiers"          // Sans titre
  | "autre"
  | "nsp";

export type ParcoursId =
  | "ADMIN"          // Blocage — droit de travail non établi
  | "LOGEMENT"       // Blocage — pas de domiciliation administrative
  | "BPI"            // Réfugié / protection subsidiaire — AGIR/HOPE/Accelair
  | "OFII"           // CIR signé avec heures restantes — FLE OFII gratuit prioritaire
  | "INSERTION"      // Travail rapide
  | "FORMATION"      // TP/CQP
  | "FRANCAIS"       // FLE/FOS pur
  | "MIXTE"          // Français + métier combinés
  | "ORIENTATION"    // Indécis — besoin d'un conseiller
  | "ECOUTE"         // Besoins spécifiques (hors emploi/formation) + santé mentale
  | "RECONNAISSANCE"; // Reconnaissance de diplôme étranger (ENIC-NARIC)

export type ActionId =
  | "AIDE_FRANCE_TRAVAIL"
  | "TEST_FRANCAIS"
  | "RDV_CONSEILLER"
  | "DOSSIER_FORMATION"
  | "MISE_EN_RELATION_OF"
  | "CONTACT_SOCIAL"
  | "CONTACT_OFII"          // Aller à l'OFII / activer heures gratuites
  | "CONTACT_DOMICILIATION" // CCAS, asso agréée
  | "CONTACT_AGIR"          // Programme AGIR pour BPI
  | "CONTACT_SANTE_MENTALE" // COMEDE, Primo Levi, PASS
  | "CONTACT_ENIC_NARIC";   // Reconnaissance diplôme

export interface UserResponses {
  q1_interet: "travail" | "formation" | "francais" | "mixte" | "nsp" | "autre";
  q2_droit_travailler: "oui" | "non" | "nsp";
  q3_france_travail: "oui" | "non" | "nsp";
  q4_niveau_francais: NiveauFrancais;
  q5_objectif: "rapide" | "formation" | "alternance" | "francais";
  q6_secteur: Secteur;
  q7_contraintes: Array<"mobilite" | "garde_enfants" | "horaires" | "aucune">;
  q8_competences: Array<
    | "manutention" | "nettoyage" | "cuisine" | "aide_personnes"
    | "entrepot" | "btp" | "accueil" | "engins" | "informatique"
    | "aucune" | "autre"
  >;
  q9_besoins?: Array<"logement" | "admin" | "sante" | "sante_mentale" | "autre">;
  /** L'utilisateur souhaite faire reconnaître un diplôme étranger */
  q_recognize_diploma?: boolean;
  /** Niveau du diplôme d'origine (si q_recognize_diploma) */
  q_diploma_level?: "secondary" | "bac" | "bachelor" | "master" | "doctorate" | "no_diploma";
  /** Souhaite continuer dans son domaine de compétence ? */
  q_continue_field?: "yes" | "no" | "unsure";
  /** Statut administratif détaillé (CIR, BPI, etc.) */
  q_statut_admin?: StatutAdministratif;
  /** Heures OFII de français gratuites restantes */
  q_ofii_hours_remaining?: number;
  /** Pas de domiciliation administrative — bloquant */
  q_housing_blocking?: boolean;
  /** Préfère une formatrice femme */
  q_prefers_female_trainer?: boolean;
  /** Mode de garde d'enfants */
  q_childcare?: "none" | "informal" | "creche" | "school" | "not_needed";
}

export interface MetierMatch {
  label: string;
  certification: "TP" | "CQP" | "TP/CQP";
  duree: string;
  financements: string[];
}

export interface OrientationResult {
  parcours: ParcoursId;
  parcoursLabel: string;
  parcoursDescription: string;
  metier: MetierMatch | null;
  actions: ActionId[];
  actionsLabels: string[];
  /** Score de qualification du lead : 0–100 */
  score: number;
  scoreLabel: "Froid" | "Tiède" | "Chaud" | "Très chaud";
  messageWhatsapp: string;
  /** Alertes bloquantes ou prioritaires à afficher dans l'UI */
  alertes: string[];
}

// ─── Référentiel métiers ──────────────────────────────────────

const METIERS: Record<Secteur, MetierMatch> = {
  logistique: {
    label: "Préparateur(trice) de commandes",
    certification: "TP",
    duree: "3–4 mois",
    financements: ["CPF", "OPCO", "France Travail"],
  },
  proprete: {
    label: "Agent(e) de propreté et d'hygiène",
    certification: "CQP",
    duree: "2–3 mois",
    financements: ["CPF", "OPCO Propreté", "France Travail"],
  },
  aide_personne: {
    label: "Assistant(e) de vie aux familles (ADVF)",
    certification: "TP",
    duree: "6 mois",
    financements: ["CPF", "OPCO Santé", "AIF France Travail"],
  },
  restauration: {
    label: "Employé(e) polyvalent(e) de restauration (EPR)",
    certification: "TP",
    duree: "3 mois",
    financements: ["CPF", "OPCO AKTO", "France Travail"],
  },
  commerce: {
    label: "Employé(e) de commerce multi-spécialités",
    certification: "CQP",
    duree: "3–4 mois",
    financements: ["CPF", "OPCO Commerce"],
  },
  btp: {
    label: "Ouvrier(ère) polyvalent(e) du bâtiment",
    certification: "TP/CQP",
    duree: "4–6 mois",
    financements: ["CPF", "OPCO Constructys", "Pro-BTP"],
  },
  nsp: {
    label: "À définir avec un conseiller",
    certification: "TP",
    duree: "Variable",
    financements: ["CPF", "France Travail"],
  },
};

// ─── Labels & descriptions des parcours ──────────────────────

export const PARCOURS_META: Record<
  ParcoursId,
  { label: string; description: string; emoji: string }
> = {
  ADMIN: {
    emoji: "📋",
    label: "Accompagnement administratif",
    description:
      "Avant toute formation ou emploi, il faut d'abord régulariser ta situation administrative. Un conseiller va t'aider.",
  },
  LOGEMENT: {
    emoji: "🏠",
    label: "Domiciliation & logement prioritaire",
    description:
      "Sans domiciliation administrative, tu ne peux pas t'inscrire à France Travail ni ouvrir tes droits. On t'oriente vers un CCAS ou une association agréée.",
  },
  BPI: {
    emoji: "🛡️",
    label: "Parcours réfugié·e (AGIR / HOPE)",
    description:
      "En tant que bénéficiaire de la protection internationale, tu as accès à des dispositifs renforcés : AGIR (24 mois), HOPE (AFPA + OFII), Accelair. Reconnaissance facilitée des qualifications.",
  },
  OFII: {
    emoji: "🇫🇷",
    label: "Heures OFII gratuites en priorité",
    description:
      "Tu as encore des heures de français OFII non utilisées : c'est gratuit, déjà financé, et conditionne ta carte de séjour pluriannuelle. À utiliser avant tout autre dispositif payant.",
  },
  INSERTION: {
    emoji: "💼",
    label: "Insertion rapide en emploi",
    description:
      "Tu es prêt(e) à travailler rapidement. On t'oriente vers les métiers en tension de ton secteur avec un accompagnement ciblé.",
  },
  FORMATION: {
    emoji: "🎓",
    label: "Formation qualifiante (TP/CQP)",
    description:
      "Tu veux apprendre un métier certifié. On identifie la formation la plus adaptée et les financements disponibles.",
  },
  FRANCAIS: {
    emoji: "🇫🇷",
    label: "Apprentissage du français professionnel",
    description:
      "Le français est ta priorité. On te propose un parcours FLE/FOS adapté à ton niveau et à ton projet professionnel.",
  },
  MIXTE: {
    emoji: "🔄",
    label: "Parcours mixte Français + Métier",
    description:
      "Tu veux progresser en français ET te former à un métier. Ce parcours combine les deux pour une intégration complète.",
  },
  ORIENTATION: {
    emoji: "🧭",
    label: "Orientation personnalisée",
    description:
      "Tu n'es pas encore sûr(e) de ta direction. Un conseiller dédié va t'accompagner pour clarifier ton projet.",
  },
  ECOUTE: {
    emoji: "👂",
    label: "Accompagnement global & besoins spécifiques",
    description:
      "Tu as des besoins prioritaires au-delà de l'emploi ou la formation (santé, social, santé mentale). On te met en relation avec les bons interlocuteurs (COMEDE, Primo Levi, PASS, CCAS).",
  },
  RECONNAISSANCE: {
    emoji: "🎖️",
    label: "Reconnaissance de diplôme étranger",
    description:
      "Tu as un diplôme obtenu à l'étranger. On t'oriente vers ENIC-NARIC pour le faire reconnaître, et vers les métiers en tension de ton domaine accessibles avec des formations courtes.",
  },
};

export const ACTIONS_LABELS: Record<ActionId, string> = {
  AIDE_FRANCE_TRAVAIL: "S'inscrire à France Travail (aide disponible)",
  TEST_FRANCAIS: "Passer un test de niveau de français",
  RDV_CONSEILLER: "Prendre rendez-vous avec un conseiller d'orientation",
  DOSSIER_FORMATION: "Préparer le dossier de financement formation",
  MISE_EN_RELATION_OF: "Mise en relation avec un organisme de formation partenaire",
  CONTACT_SOCIAL: "Orientation vers un accompagnement social",
  CONTACT_OFII: "Activer tes heures de français OFII (gratuit)",
  CONTACT_DOMICILIATION: "Obtenir une domiciliation (CCAS ou association agréée)",
  CONTACT_AGIR: "Intégrer le programme AGIR (accompagnement BPI 24 mois)",
  CONTACT_SANTE_MENTALE: "Orientation vers un soutien psychologique (COMEDE, Primo Levi, PASS)",
  CONTACT_ENIC_NARIC: "Démarche ENIC-NARIC pour reconnaissance de diplôme",
};

// ─── Scoring du lead (0–100) ──────────────────────────────────
//
//  Critère                     | Points max
//  ----------------------------|------------
//  Droit de travailler         | 25
//  Inscription France Travail  | 20
//  Clarté du projet (Q1)       | 20
//  Niveau de français          | 15
//  Secteur identifié           | 10
//  Absence de contraintes      | 10
//  ----------------------------|------------
//  Total                       | 100

function computeScore(r: UserResponses): number {
  return calculateUnifiedLeadScore({
    main_goal: r.q1_interet,
    work_right: r.q2_droit_travailler === "oui" ? "yes" : r.q2_droit_travailler === "non" ? "no" : "unknown",
    french_level_cecrl: r.q4_niveau_francais === "B1plus" ? "b1" : r.q4_niveau_francais === "A2" ? "a2" : "a1",
    target_sector: r.q6_secteur !== "nsp" ? r.q6_secteur : undefined,
  }).total;
}

function getScoreLabel(score: number): OrientationResult["scoreLabel"] {
  if (score >= 80) return "Très chaud";
  if (score >= 55) return "Chaud";
  if (score >= 30) return "Tiède";
  return "Froid";
}

// ─── Moteur de décision ───────────────────────────────────────

export function computeOrientation(r: UserResponses): OrientationResult {
  let parcoursId: ParcoursId;
  const actions: ActionId[] = [];
  const alertes: string[] = [];

  // ── PRIORITÉ 0 : Logement / domiciliation absente — bloquant absolu ──
  if (r.q_housing_blocking === true) {
    parcoursId = "LOGEMENT";
    actions.push("CONTACT_DOMICILIATION", "CONTACT_SOCIAL", "RDV_CONSEILLER");
    alertes.push(
      "🏠 Sans domiciliation administrative, l'inscription France Travail / CAF / banque est impossible. Orientation prioritaire vers un CCAS ou une association agréée."
    );
  }
  // ── PRIORITÉ 1 : Blocage administratif (droit au travail) ──
  else if (r.q2_droit_travailler !== "oui" && r.q_statut_admin !== "demandeur_asile") {
    parcoursId = "ADMIN";
    actions.push("RDV_CONSEILLER", "CONTACT_SOCIAL");
    alertes.push(
      r.q2_droit_travailler === "non"
        ? "⚠️ Droit de travail non établi — orientation administrative obligatoire avant toute démarche."
        : "⚠️ Droit de travail incertain — une vérification est nécessaire avant toute orientation."
    );
  }
  // ── PRIORITÉ 1bis : BPI (réfugié / protection subsidiaire) → AGIR / HOPE / Accelair ──
  else if (r.q_statut_admin === "bpi_refugie" || r.q_statut_admin === "bpi_subsidiaire") {
    parcoursId = "BPI";
    actions.push("CONTACT_AGIR", "RDV_CONSEILLER", "MISE_EN_RELATION_OF");
    alertes.push(
      "🛡️ Statut BPI détecté : tu es éligible aux dispositifs renforcés AGIR (24 mois), HOPE (AFPA + OFII) et Accelair. Reconnaissance facilitée des qualifications via France Compétences."
    );
    if (r.q_recognize_diploma) {
      actions.push("CONTACT_ENIC_NARIC");
    }
  }
  // ── PRIORITÉ 1ter : Reconnaissance de diplôme étranger ──
  else if (r.q_recognize_diploma) {
    parcoursId = "RECONNAISSANCE";
    actions.push("CONTACT_ENIC_NARIC", "RDV_CONSEILLER", "MISE_EN_RELATION_OF");
    alertes.push(
      "🎖️ Reconnaissance de diplôme : démarche ENIC-NARIC à engager. En parallèle, des métiers en tension peuvent être accessibles via une formation courte."
    );
    if (r.q_continue_field === "no") {
      alertes.push("🔄 Reconversion souhaitée — accompagnement orientation prioritaire.");
    }
  } else {
    // ── PRIORITÉ 2 : Orientation par intention (Q1) ──
    switch (r.q1_interet) {
      case "travail":
        parcoursId = "INSERTION";
        actions.push("MISE_EN_RELATION_OF");
        break;
      case "formation":
        parcoursId = "FORMATION";
        actions.push("DOSSIER_FORMATION", "MISE_EN_RELATION_OF");
        break;
      case "francais":
        parcoursId = "FRANCAIS";
        actions.push("TEST_FRANCAIS", "MISE_EN_RELATION_OF");
        break;
      case "mixte":
        parcoursId = "MIXTE";
        actions.push("TEST_FRANCAIS", "DOSSIER_FORMATION");
        break;
      case "nsp":
        parcoursId = "ORIENTATION";
        actions.push("RDV_CONSEILLER");
        break;
      case "autre":
        parcoursId = "ECOUTE";
        actions.push("RDV_CONSEILLER", "CONTACT_SOCIAL");
        break;
    }

    // ── PRIORITÉ 3 : Actions opérationnelles ──

    // France Travail non inscrit
    if (r.q3_france_travail !== "oui") {
      actions.unshift("AIDE_FRANCE_TRAVAIL");
      alertes.push(
        "📌 Inscription à France Travail requise pour débloquer les financements formation."
      );
    }

    // Niveau A0/A1 : le français passe en priorité
    if (r.q4_niveau_francais === "A0A1") {
      if (!actions.includes("TEST_FRANCAIS")) actions.unshift("TEST_FRANCAIS");
      alertes.push(
        "📌 Niveau A0/A1 détecté : un parcours FLE/FOS est indispensable avant toute formation métier."
      );
      // Insertion directe → basculer vers mixte
      if (parcoursId === "INSERTION") {
        parcoursId = "MIXTE";
      }
    }

    // Contraintes multiples
    if (r.q7_contraintes.length >= 2 && !r.q7_contraintes.includes("aucune")) {
      alertes.push(
        "ℹ️ Contraintes multiples identifiées (mobilité, garde d'enfants…) — à prendre en compte lors de la mise en relation."
      );
    }
  }

  // Dédoublonnage des actions
  const actionsUniques = [...new Set(actions)] as ActionId[];

  // Sélection du métier selon le parcours
  const parcoursAvecMetier: ParcoursId[] = ["INSERTION", "FORMATION", "MIXTE"];
  const metier = parcoursAvecMetier.includes(parcoursId)
    ? METIERS[r.q6_secteur]
    : null;

  // Score
  const score = computeScore(r);
  const scoreLabel = getScoreLabel(score);

  // Message WhatsApp
  const meta = PARCOURS_META[parcoursId];
  const messageWhatsapp = [
    "👋 Bonjour ! Voici ton orientation ToFrance :",
    "",
    `🧭 Parcours : ${meta.label}`,
    metier ? `🎯 Métier conseillé : ${metier.label} (${metier.certification})` : null,
    actionsUniques[0]
      ? `✅ Prochaine étape : ${ACTIONS_LABELS[actionsUniques[0]]}`
      : null,
    "",
    "Un conseiller va te contacter très prochainement. 🤝",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    parcours: parcoursId,
    parcoursLabel: `${meta.emoji} ${meta.label}`,
    parcoursDescription: meta.description,
    metier,
    actions: actionsUniques,
    actionsLabels: actionsUniques.map((a) => ACTIONS_LABELS[a]),
    score,
    scoreLabel,
    messageWhatsapp,
    alertes,
  };
}

// ─── Couleurs de score (pour l'UI badge / dashboard) ─────────

export const SCORE_COLORS: Record<OrientationResult["scoreLabel"], string> = {
  Froid: "#64748b",
  Tiède: "#f59e0b",
  Chaud: "#f97316",
  "Très chaud": "#16a34a",
};

// ─── Utilitaires export (admin / dashboard) ──────────────────

export const getAllMetiers = () => METIERS;
export const getAllParcours = () => PARCOURS_META;
