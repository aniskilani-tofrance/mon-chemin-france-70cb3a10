## Phase 1 — implémentation sans bloquer sur l'email

Je pars sur les 4 chantiers qui ne dépendent pas de la config domaine email. L'email résultats sera branché dès que le domaine est validé (template + trigger déjà prévus, c'est juste l'envoi qui attend).

### 1. PDF résultats sobre (`PlacementTestResults.tsx`)
- Lib : `jspdf` + `jspdf-autotable` (ajout dépendance)
- Contenu : logo PEF, nom candidat, date, niveau CECRL + libellé, score global, analyse par compétence (barres simples), 3 recommandations
- Footer : "Document généré par PEF — ToFrance" (pas de SIRET, pas de watermark "officiel", pas de tableau question-par-question)
- Bouton "Télécharger le PDF" à côté du bouton existant

### 2. Dashboard admin analytics test de positionnement
- Nouveau composant `AdminPlacementTestAnalytics.tsx` monté dans la page admin existante
- Données : `test_results` + `placement_test_sessions` via `useQuery`
- KPIs : nb tests 30j, score moyen, taux de complétion, durée moyenne
- Charts (`recharts` déjà présent) : pie par niveau CECRL, line 30j volume, bar par catégorie d'erreurs
- Export CSV uniquement (pas de Google Sheets)

### 3. Responsive mobile sur le parcours test
Fichiers : `PlacementTestHome.tsx`, `PlacementTestLegal.tsx`, `PlacementTest.tsx`, `QuestionCard.tsx`, `PlacementTestResults.tsx`
- Conteneurs : `px-3 sm:px-4`, `max-w-2xl`
- Boutons nav : `flex-col sm:flex-row`, `w-full sm:w-auto`, `min-h-11` (tap target ≥44px)
- Inputs : `text-base` (évite le zoom iOS)
- Timer/progress : tailles fluides `text-sm sm:text-base`
- Tokens sémantiques : ajout `--placement-primary`, `--placement-accent` dans `index.css` (HSL) pour remplacer les couleurs en dur éventuelles

### 4. Accessibilité WCAG 2.1 AA
Mêmes fichiers + `Header.tsx` du parcours test
- `<main>` + hiérarchie H1/H2 correcte
- `aria-label` sur tous les boutons icônes
- Timer : `role="timer"` + `aria-live="polite"` + `aria-atomic="true"`
- Progress : `role="progressbar"` + `aria-valuenow/min/max`
- Questions : annonce changement via `aria-live="polite"` sur le conteneur de question
- Champs : `aria-describedby` reliant erreurs et hints
- Navigation clavier : focus visible (`focus-visible:ring-2`), Escape pour fermer modales, Enter pour valider
- Contraste : vérifier `--placement-primary` (#00504e) vs blanc → ratio AA ok

### 5. Email résultats (différé jusqu'à validation domaine)
- Une fois le domaine ajouté : scaffold infra emails + template `placement-test-results` + trigger dans `handleSubmit` (idempotent via clé `test-result-${id}`) + bouton "Renvoyer par email" sur la page résultats

### Hors scope Phase 1 (confirmé)
Anti-fraude, lien session unique complet, notif formateur, CMS questions, emails marketing, refonte auth, watermark "officiel", tableau question-par-question dans le PDF.

### Détails techniques
- Pas de migration DB (toutes les données existent déjà)
- Dépendances à ajouter : `jspdf`, `jspdf-autotable`
- `recharts` déjà installé
- Aucun changement de logique métier (`test_results`, `placement_test_sessions`, scoring intacts)
