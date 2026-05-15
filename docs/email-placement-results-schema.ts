/**
 * Schéma de données du payload de l'email de résultats du test de positionnement.
 *
 * Template Lovable Emails : `placement-test-results`
 * Destinataire : `test_results.candidate_email`
 * Idempotence  : `placement-results-${test_results.id}`
 *
 * Triggers :
 *  - Auto, dans PlacementTest.tsx → handleSubmit() après insertion test_results
 *  - Manuel, bouton "Recevoir par email" sur PlacementTestResults.tsx (même clé)
 */

export type PlacementCECRLLevel = "A1" | "A2" | "B1" | "B2";

export interface PlacementResultsEmailData {
  // ── Identité candidat ───────────────────────────────────────────
  /** Prénom + nom — affiché dans la salutation. */
  candidateName: string;
  /** Reprise pour la lecture, déjà fourni via `recipientEmail`. */
  candidateEmail: string;

  // ── Résultat principal ──────────────────────────────────────────
  /** Niveau CECRL atteint (max cumulatif ≥ 60 % de bonnes réponses). */
  level: PlacementCECRLLevel;
  /** Libellé pédagogique, ex. "Élémentaire", "Intermédiaire". */
  levelLabel: string;
  /** Phrase descriptive courte (1 à 2 lignes) du niveau. */
  levelDescription: string;
  /** Score global sur 100. */
  score: number;
  /** Durée du test, arrondie à la minute. */
  durationMinutes: number;
  /** Date passation formatée (ex. "12 mai 2026 à 14h32") OU ISO. */
  completedAt: string;

  // ── Détail par compétence ───────────────────────────────────────
  /** 4 à 5 catégories agrégées depuis `test_results.answers`. */
  competences: Array<{
    label: string;   // ex. "Compréhension orale"
    score: number;   // 0-100
  }>;

  // ── Recommandations pédagogiques ────────────────────────────────
  /** 3 items max, mappés au niveau atteint. */
  recommendations: string[];

  // ── Liens utiles ────────────────────────────────────────────────
  /** Page de relecture en ligne, ex. /placement-test/results?id=<uuid>. */
  resultsUrl: string;
  /** Optionnel — sinon CTA "télécharger" affiché côté app uniquement. */
  pdfUrl?: string;
  /** Présent si la session a été lancée par un formateur. */
  trainerName?: string;

  // ── Footer ──────────────────────────────────────────────────────
  /** Baked-in côté template, ex. "PEF — ToFrance". */
  siteName: string;
}

/** Construction du payload depuis test_results + agrégation des réponses. */
export interface PlacementResultsEmailSource {
  testResultId: string;        // → idempotencyKey
  recipientEmail: string;      // → send-transactional-email body
  templateData: PlacementResultsEmailData;
}

/** Sujet dynamique calculé côté template. */
export const placementResultsSubject = (d: PlacementResultsEmailData) =>
  `Votre niveau de français : ${d.level} (${d.levelLabel})`;

/** Preview text (affiché en aperçu inbox). */
export const placementResultsPreview = (d: PlacementResultsEmailData) =>
  `Niveau ${d.level} — score ${d.score}/100. Voici vos recommandations.`;
