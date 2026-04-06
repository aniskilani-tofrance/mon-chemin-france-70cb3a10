

# Plan : 5 améliorations stratégiques de l'onboarding

## Résumé

Intégrer 5 correctifs majeurs identifiés par ChatGPT : micro-évaluation de compréhension, expérience en France, statut administratif détaillé, score distance-à-l'emploi, téléphone + écran plan personnalisé.

---

## 1. Micro-évaluation réelle (après `french_level_cecrl`)

**Fichier** : `src/lib/decisionTree.ts`

- Ajouter une question `real_comprehension_test` de type `choice` juste après `french_level_cecrl`
- Phrase test : "Prenez un balai et nettoyez la table" — Comprenez-vous ?
- Choix : Oui / Un peu / Non
- Tags : `comprehension_high`, `comprehension_partial`, `comprehension_low`
- Modifier `french_level_cecrl.nextQuestion` → `real_comprehension_test`
- `real_comprehension_test.nextQuestion` → `admin_status` (nouvelle question, voir point 3)
- Ajouter `real_comprehension_score` dans `OnboardingAnswers`
- Traductions complètes (fr, en, ar, es, pt, ru)

## 2. Expérience en France (après `previous_job`)

**Fichier** : `src/lib/decisionTree.ts`

- Ajouter une question `worked_in_france` de type `choice` après `previous_job`
- "Avez-vous déjà travaillé en France ?"
- Choix : Oui / Non / Un peu (stage, bénévolat)
- Tags : `exp_france`, `no_exp_france`, `partial_exp_france`
- Modifier `previous_job.nextQuestion` → `worked_in_france`
- `worked_in_france.nextQuestion` → `main_goal`
- Ajouter `worked_in_france` dans `OnboardingAnswers`

## 3. Statut administratif détaillé (avant `work_right`)

**Fichier** : `src/lib/decisionTree.ts`

- Ajouter `admin_status` de type `choice` après `real_comprehension_test`
- "Quelle est votre situation administrative aujourd'hui ?"
- Choix : Titre de séjour / Réfugié / Demandeur d'asile / Sans papiers / Je ne sais pas
- Tags : `status_titre_sejour`, `status_refugie`, `status_demandeur_asile`, `status_sans_papiers`, `status_inconnu`
- `admin_status.nextQuestion` → `work_right`
- Ajouter `admin_status` dans `OnboardingAnswers`

## 4. Score distance-à-l'emploi + routage intelligent

**Fichier** : `src/lib/decisionTree.ts`

- Ajouter une fonction `calculateDistanceToJob(answers)` :
  - alpha → 4, a1 → 3, a2 + no exp france → 2, a2 + exp france → 1, b1 → 0
- Stocker dans `OnboardingAnswers.distance_to_job`
- Modifier `determineRoute()` :
  ```
  IF level <= A1 → FLE
  ELSE IF distance_to_job >= 2 → FORMATION
  ELSE IF work_right = yes AND distance_to_job <= 1 → EMPLOI
  ELSE → SAS
  ```
- Intégrer `distance_to_job` dans `calculateLeadScore()` comme bonus/malus sur le score fit

## 5. Téléphone + écran plan personnalisé

### 5a. Question téléphone

**Fichier** : `src/lib/decisionTree.ts`

- Ajouter `contact_phone` de type `text` après `contact_email`
- "Votre numéro de téléphone ? (WhatsApp si possible)"
- Subtitle : "On vous contactera pour vous aider, pas pour vendre"
- `contact_email.nextQuestion` → `contact_phone`
- `contact_phone.nextQuestion` → `null` (fin du flow)

**Fichier** : `src/components/VocalOnboarding/ChatOnboarding.tsx`
- Ajouter `contact_phone` dans `WIDGET_QUESTIONS` et `DIRECT_TEXT_QUESTIONS`
- Ajouter validation basique de numéro de téléphone

**Fichier** : `src/lib/decisionTree.ts` — `OnboardingAnswers`
- Ajouter `contact_phone`

### 5b. Écran plan personnalisé (CompletionStep)

**Fichier** : `src/components/VocalOnboarding/CompletionStep.tsx`

- Ajouter un bloc "Ton plan personnalisé" en haut, style Marianne conversationnel :
  - Message personnalisé basé sur la route (ex: "1. Améliorer ton français → 2. Formation logistique → 3. Trouver un emploi")
  - Icône motivante + "Tu es sur le bon chemin 💪"
- Afficher le `distance_to_job` score visuellement

### 5c. Mise à jour du profil côté DB

**Fichiers** : `src/pages/Onboarding.tsx`, `src/components/VocalOnboarding/ChatOnboarding.tsx`
- Passer les nouvelles variables (`worked_in_france`, `admin_status`, `real_comprehension_score`, `contact_phone`, `distance_to_job`) dans les answers transmises au match-leads

**Fichier** : `supabase/functions/match-leads/index.ts`
- Mapper les nouveaux champs vers la table `profiles` (ajout colonnes si nécessaire)

### 5d. Migration DB

- Ajouter colonnes à `profiles` : `worked_in_france`, `admin_status`, `real_comprehension_score`, `contact_phone`, `distance_to_job`

---

## Ordre du flow mis à jour

```text
location → origin_country → previous_job → worked_in_france → main_goal
→ contact_48h → literacy → french_level_cecrl → real_comprehension_test
→ admin_status → work_right → barriers → [route-specific questions]
→ contact_firstname → contact_lastname → contact_email → contact_phone
→ CompletionStep (avec plan personnalisé)
```

## Impact sur le scoring

- `distance_to_job` intégré dans le fit score (jusqu'à +15 pts pour distance 0, -10 pour distance 4)
- `worked_in_france = yes` → +10 pts fit
- `real_comprehension_score = high` → +5 pts fit
- `admin_status = sans_papiers` → alerte dans CompletionStep + tag orientation juridique

