

# Plan — Refonte du module FLE intégré à ToFrance

Ce plan est découpé en **5 phases** pour rester gérable. Chaque phase est autonome et livrable. Le scope total est important — on commence par les fondations et l'UX critique.

---

## Phase 1 : Fondations — Gamification, structure enrichie, dashboard refondu

### 1.1 Migration base de données

Ajout de colonnes et tables manquantes :

- **`fle_user_progress`** : ajouter `daily_goal_minutes` (int, default 5), `weekly_xp_target` (int, default 100), `badges_earned` (jsonb, default '[]'), `daily_mission_completed_at` (timestamptz), `last_streak_date` (date)
- Nouvelle table **`fle_badges`** : `id`, `key` (text unique), `title`, `description`, `icon` (text emoji), `category` (text), `condition_type` (text), `condition_value` (int)
- Nouvelle table **`fle_user_badges`** : `id`, `user_id`, `badge_key` (text), `earned_at` (timestamptz) — RLS : user can read/insert own
- Nouvelle table **`fle_review_items`** : `id`, `user_id`, `exercise_id`, `module_id`, `next_review_at` (timestamptz), `interval_days` (int default 1), `ease_factor` (numeric default 2.5), `repetitions` (int default 0) — RLS : user CRUD own
- Seed **`fle_badges`** avec ~15 badges initiaux (premier exercice, premier module, streak 3j, streak 7j, 100 XP, oral score 80+, etc.)

### 1.2 Dashboard FLE refondu (`FLEDashboard.tsx`)

Restructuration complète de la page `/fle` :

- **En-tête** : "Mon français 🇫🇷" + niveau + streak flame animée
- **Mission du jour** : carte proéminente avec exercice recommandé, temps estimé, bouton "Commencer" — basée sur le module en cours ou la révision
- **Barre de progression hebdomadaire** : XP de la semaine vs objectif
- **4 boutons d'accès rapide** en grille 2x2 :
  - "📖 Leçon du jour" → prochain exercice non fait
  - "🔄 Réviser" → `/fle/review` (nouveau)
  - "🗣️ Pratiquer l'oral" → `/fle/dialogue`
  - "💼 Français emploi" → filtre professionnel
- **Parcours** : vue en chemin vertical (pas une simple liste) avec nœuds connectés, icônes, état (verrouillé/en cours/terminé)
- **Badges récents** : rangée horizontale scrollable

### 1.3 Nouveaux composants FLE

- `FLEDailyMission.tsx` — carte mission quotidienne
- `FLEPathwayMap.tsx` — vue parcours en chemin vertical avec connecteurs
- `FLEBadgeCard.tsx` — carte badge avec état earned/locked
- `FLEBadgeRow.tsx` — rangée horizontale de badges
- `FLEWeeklyProgress.tsx` — barre XP hebdomadaire

### 1.4 Carte enrichie sur Dashboard principal (`Dashboard.tsx`)

Remplacer le CTA actuel par une carte plus riche :
- Niveau estimé, progression %, streak, prochaine mission, temps estimé
- Message motivationnel dynamique
- Bouton "Continuer"

---

## Phase 2 : Module de révision + écran de fin de module

### 2.1 Page `/fle/review` — Révision espacée

- Nouvelle page `FLEReview.tsx`
- Récupère les items de `fle_review_items` dont `next_review_at <= now()`
- Affiche les exercices un par un (même composant que FLEExercise)
- Après chaque réponse : met à jour `interval_days`, `ease_factor`, `next_review_at` selon algorithme SM-2 simplifié
- Si aucun item à réviser : message "Tout est à jour ! Revenez demain 🎉"

### 2.2 Alimentation automatique des items de révision

- Dans `FLEExercise.tsx`, après chaque exercice terminé : insérer/mettre à jour un `fle_review_item` pour cet exercice
- Les exercices ratés (score < 60) ont un intervalle plus court

### 2.3 Écran de fin de module

- Remplacer le simple `toast` par un écran dédié avec :
  - Animation de félicitations (confetti ou sparkles)
  - Score final avec étoiles (1-3)
  - XP gagnés (animé)
  - Badge débloqué si applicable
  - Boutons : "Module suivant" / "Réviser" / "Retour"
- Mise à jour `fle_user_progress` : incrémenter `total_xp`, `words_learned`

---

## Phase 3 : Parcours thématiques + personnalisation profil

### 3.1 Filtres par parcours thématique

- Sur le dashboard FLE, ajouter des onglets/filtres par parcours :
  - "🏠 Vie quotidienne" (tous les modules quotidien)
  - "💼 Emploi" (tous les modules professionnel)
  - "🏥 Santé" / "🚌 Transport" / etc. (filtres par `theme`)
- Parcours recommandé mis en avant selon `preferred_category` et `target_sector` du profil

### 3.2 Personnalisation selon le profil ToFrance

- Lire le profil utilisateur (`profiles` table) au chargement du dashboard FLE
- Adapter l'ordre des modules recommandés :
  - Si `main_goal` = travail → prioriser modules professionnel
  - Si `target_sector` renseigné → mettre en avant le module métier correspondant
  - Si `french_level_cecrl` très bas → mode ultra-guidé (plus d'audio, moins d'écrit)
- Afficher un message personnalisé : "Vous cherchez du travail en restauration ? Commencez par le module Hôtellerie-restauration"

### 3.3 Signaux d'orientation remontés à ToFrance

- Après chaque session FLE, mettre à jour des champs dans `fle_user_progress` :
  - `oral_score`, `comprehension_score` (moyennes glissantes)
  - `total_time_minutes`, `streak_days`
- Créer une vue calculée (ou champs dérivés) pour le routage :
  - Autonomie linguistique : faible/moyenne/bonne (basé sur score + modules complétés)
  - Capacité à suivre une consigne
  - Potentiel d'entrée en formation

---

## Phase 4 : Coach quotidien + contenu enrichi

### 4.1 Coach quotidien IA

- Nouveau composant `FLECoach.tsx` intégré en haut du dashboard FLE
- Appel à l'edge function `fle-voice-ai` avec action `"coach"` :
  - Salutation personnalisée
  - Proposition de mini-mission de 5 min
  - Rappel d'objectif
  - Encouragement basé sur les dernières performances
- Affichage sous forme de bulle de dialogue avec avatar Marianne
- Audio TTS du message

### 4.2 Exercices supplémentaires

- Ajouter 2-3 exercices par module existant (passer de 3-4 à 5-6)
- Nouveaux types d'exercices :
  - `situation_image` : comprendre une situation à partir d'une image/emoji
  - `order_sentence` : remettre les mots dans l'ordre
  - `fill_blank` : compléter un texte à trous

### 4.3 Sous-parcours métiers

- Ajouter des exercices spécifiques par secteur dans les modules professionnels existants
- Contenus ciblés : vocabulaire restauration, propreté, logistique, etc.

---

## Phase 5 : Vue accompagnant/admin + analytics

### 5.1 Vue accompagnant dans l'admin

- Nouvelle page `/admin/fle-progress` :
  - Liste des utilisateurs avec leur progression FLE
  - Pour chaque utilisateur : niveau, progression, régularité, temps passé, scores
  - Indicateurs de décrochage (pas de session depuis X jours)
  - Recommandations d'orientation automatiques
- Accessible aux admins via `AdminRoute`

### 5.2 Dashboard admin FLE analytics

- Statistiques globales : nombre d'apprenants actifs, niveau moyen, modules les plus/moins complétés
- Taux de complétion par module
- Répartition par niveau CECRL

---

## Fichiers impactés (Phase 1 — première implémentation)

| Fichier | Action |
|---------|--------|
| `supabase/migrations/` | 1 migration : tables badges, review_items, colonnes user_progress |
| `src/pages/FLEDashboard.tsx` | Refonte complète |
| `src/pages/Dashboard.tsx` | Carte FLE enrichie |
| `src/components/FLE/FLEDailyMission.tsx` | Nouveau |
| `src/components/FLE/FLEPathwayMap.tsx` | Nouveau |
| `src/components/FLE/FLEBadgeCard.tsx` | Nouveau |
| `src/components/FLE/FLEWeeklyProgress.tsx` | Nouveau |
| `src/hooks/useFLEProgress.ts` | Ajouter hooks badges + review |
| `src/App.tsx` | Ajouter route `/fle/review` |

## Approche d'implémentation

Vu l'ampleur, je propose de livrer **Phase 1** d'abord (dashboard refondu + gamification + carte enrichie), puis avancer phase par phase selon vos retours. Chaque phase est indépendante et testable.

