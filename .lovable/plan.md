# Phase 1 — Test de positionnement : mobile, a11y, email, dashboard, PDF

5 chantiers indépendants livrables incrémentalement. Périmètre strict : parcours du test de positionnement uniquement.

---

## 1. Responsive mobile (parcours candidat)

**Pages**: `PlacementTestHome.tsx`, `PlacementTestLegal.tsx`, `PlacementTest.tsx`, `PlacementTestResults.tsx`, `components/PlacementTest/QuestionCard.tsx`.

- Layout : `max-w-2xl` → conserver, mais padding `px-3 sm:px-4`, header `h-14` ok.
- Boutons navigation (Précédent / Passer / Suivant) : passer en `flex-col sm:flex-row` sur très petits écrans, tap-targets `min-h-11`.
- `QuestionCard` : audit des sous-types interactifs (drag, match_pairs, order_sentences, sentence_builder, complete_form) — vérifier qu'ils sont utilisables au doigt (espacement vertical, pas de hover-only).
- Inputs texte : `text-base` (évite zoom iOS), `inputMode` adapté.
- Timer : taille lisible, position non-recouvrante en mobile.

## 2. Accessibilité WCAG 2.1 AA

Sur les 4 pages + `QuestionCard` :
- `aria-label` sur tous les boutons icône (`ChevronLeft`, `ChevronRight`, `SkipForward`, X de fermeture).
- `<main>` unique par page, hiérarchie `h1` → `h2`.
- Timer : `role="timer" aria-live="polite" aria-atomic="true"`.
- Changement de question : `aria-live="polite"` annonçant "Question N sur total".
- Progress : `role="progressbar" aria-valuenow/min/max`.
- Couleurs : remplacer les valeurs hardcodées (`#00504e`, `#17c3b2`, `text-gray-400`) par des tokens sémantiques dans `index.css` + `tailwind.config.ts` (ajout `--placement-primary`, `--placement-accent`).
- Navigation clavier : Tab + Enter + Escape, focus visible, pas de focus-trap involontaire.
- Champs : `aria-describedby` pour les messages d'aide/erreur.

## 3. Email de résultats au candidat

**Infra** : Lovable Emails (à provisionner — aucune fonction transactional en place actuellement).

Étapes :
1. Vérifier le domaine email via `email_domain--check_email_domain_status`. Si absent, déclencher le dialog setup.
2. `email_domain--setup_email_infra` puis `email_domain--scaffold_transactional_email`.
3. Créer template `placement-test-results.tsx` dans `_shared/transactional-email-templates/` :
   - Props : `candidateName`, `level` (A1..B2), `score`, `levelLabel`, `resultsUrl` (lien vers `/placement-test/results?id=...`).
   - Style sobre, brand PEF (vert `#00504e`).
4. Trigger : dans `PlacementTest.tsx` `handleSubmit`, après insert `test_results`, appel `supabase.functions.invoke('send-transactional-email', { body: { templateName: 'placement-test-results', recipientEmail: candidate.email, idempotencyKey: \`test-result-${data.id}\`, templateData: {...} } })`. Best-effort (ne bloque pas la navigation si échec).
5. Bouton "Renvoyer par email" sur `PlacementTestResults.tsx`.

## 4. Dashboard admin enrichi

Nouveau composant `AdminPlacementTestAnalytics.tsx` (sur le modèle de `AdminAnalytics.tsx`), monté dans `AdminDashboard.tsx` (nouvel onglet "Tests de positionnement").

KPIs (lecture `test_results`) :
- Total tests passés (30 derniers jours + total).
- Taux de complétion (sessions créées vs résultats finaux — joindre `placement_test_sessions`).
- Niveau CECRL moyen / médian.
- Durée moyenne.

Visualisations (recharts) :
- Pie chart : répartition par niveau A1/A2/B1/B2.
- Line chart : tests passés par jour sur 30j.
- Bar chart : top catégories d'erreurs.

Actions :
- Export CSV (toutes colonnes pertinentes, RGPD-aware : email anonymisable selon flag).
- Pas d'export Google Sheets.

## 5. PDF résultats sobre

Bouton "Télécharger le PDF" sur `PlacementTestResults.tsx`.

Génération côté client (`jspdf` + `jspdf-autotable` déjà utilisés dans le projet — à vérifier, sinon `pdf-lib`).

Contenu :
- Logo PEF, date.
- Nom + email candidat.
- **Niveau CECRL** + libellé (ex : "B1 — Utilisateur indépendant, niveau seuil").
- Score global.
- Analyse par compétence (compréhension écrite/orale/expression — agrégation via `level` et `category` des records).
- Recommandations qualitatives (3-4 lignes selon niveau).
- Pied de page : "Document généré par PEF — ToFrance" (PAS de mention "officiel", PAS de SIRET, PAS de filigrane).

**Exclu** : tableau question-par-question (protection de la grille).

QA : ouvrir le PDF généré, inspection visuelle obligatoire sur chaque page.

---

## Détails techniques

```text
Ordre d'implémentation suggéré (indépendants) :
  1) Mobile + a11y (même PR — touche les mêmes fichiers)
  2) Dashboard admin (isolé)
  3) PDF sobre (isolé)
  4) Email résultats (dépend du setup domaine)
```

**Tokens CSS à ajouter** (`index.css`) :
```
--placement-primary: 178 100% 16%;   /* #00504e */
--placement-accent:  171 70% 43%;    /* #17c3b2 */
```

**Données utilisées** : `test_results` (existant), `placement_test_sessions` (existant). Aucune migration nécessaire pour la Phase 1.

**Dépendances à confirmer présentes** : `recharts` (oui), lib PDF (à vérifier).

**Hors scope explicite** : anti-fraude, refonte auth formateur, CMS questions, lien session complet, notif formateur, emails marketing.
