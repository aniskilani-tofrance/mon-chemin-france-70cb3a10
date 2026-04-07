

# Audit & Optimisation de l'architecture ToFrance

---

## Partie 1 — Diagnostic de l'existant

### Ce qui va
- **Modèle FLE solide** : tables bien structurées (`fle_modules`, `fle_exercises`, `fle_module_progress`, `fle_user_progress`, `fle_review_items`, `fle_badges`, `fle_user_badges`) avec RLS correcte
- **Onboarding conversationnel** : arbre de décision complet avec routing intelligent (route_a/b/c/sas)
- **RLS bien appliquée** partout, rôles via `user_roles` table séparée + `has_role()` SECURITY DEFINER
- **Séparation admin/user** propre via `AdminRoute` et `ProtectedRoute`
- **Consents RGPD** correctement gérés dans une table dédiée
- **Leads marketplace** fonctionnelle (providers, trainings, sessions, pricing)

### Ce qui ne va pas

1. **Table `profiles` fourre-tout** (35 colonnes) — mélange données identité, diagnostic onboarding, signaux d'orientation, résultats de scoring, et préférences FLE. C'est le plus gros problème.

2. **Duplication `target_sector`** — présent dans `profiles` ET `fle_user_progress`. Lequel fait foi ?

3. **Duplication des systèmes de scoring** — `orientationEngine.ts` a un moteur complet (`computeOrientation`, `UserResponses`, `computeScore`) qui n'est utilisé nulle part dans le front. Le front utilise `decisionTree.ts` (`calculateLeadScore`, `determineRoute`). Deux logiques parallèles, jamais connectées.

4. **`profiles.lead_score` et `profiles.lead_route`** sont calculés par le front puis stockés, mais le recalcul n'est jamais déclenché si le profil change. Données potentiellement périmées.

5. **`fle_user_progress.badges_earned` (JSONB)** doublon de la table `fle_user_badges`. Deux sources de vérité pour la même donnée.

6. **Pas de foreign keys sur `profiles.user_id`** vers `auth.users` (normal pour Supabase), mais aussi aucune FK entre `leads.profile_id` → `profiles.id`, `leads.training_id` → `trainings.id`, etc. — les FK existent dans les types TS mais pas dans le schéma affiché. A vérifier.

7. **`test_results`** (placement test) n'est pas connecté au profil utilisateur. Résultats orphelins.

8. **Pas de table `onboarding_sessions`** — les données d'onboarding transitent par localStorage puis sont envoyées à `match-leads` en un seul appel. Si l'appel échoue, tout est perdu.

9. **Flux trop dispersé** : la logique de routage est dans 3 fichiers (`decisionTree.ts`, `orientationEngine.ts`, `mapAnswersToV2.ts`) avec des types incompatibles entre eux.

### Ce qui est redondant
- `orientationEngine.ts` entier (non utilisé)
- `profiles.distance_to_job` (calculable à la volée)
- `profiles.lead_score` (calculable à la volée)
- `fle_user_progress.badges_earned` (table `fle_user_badges` existe)

### Ce qui manque
- Table pour stocker les réponses brutes d'onboarding (audit trail)
- Lien entre `test_results` et `profiles`
- Statut de parcours global de l'utilisateur (au-delà du FLE)
- Historique des changements de niveau

---

## Partie 2 — Architecture cible simplifiée

```text
┌─────────────────────────────────────────────────────────┐
│                    auth.users (Supabase)                 │
└──────────────┬──────────────────────────────────────────┘
               │ user_id
    ┌──────────┼──────────────────────┐
    ▼          ▼                      ▼
┌────────┐ ┌──────────────┐   ┌─────────────┐
│profiles│ │user_roles    │   │consents     │
│(identi-│ │              │   │             │
│ té)    │ └──────────────┘   └─────────────┘
└───┬────┘
    │ profile.id / user_id
    ├──────────────────────────────────────────┐
    ▼                                          ▼
┌──────────────────┐                ┌──────────────────┐
│onboarding_results│                │fle_user_progress │
│(diagnostic brut) │                │(progression FLE) │
└────────┬─────────┘                └──────────────────┘
         │                                     │
         ▼                                     ▼
┌──────────────────┐                ┌──────────────────┐
│leads             │                │fle_module_progress│
│(marketplace)     │                │fle_exercise_results│
└──────────────────┘                │fle_review_items  │
                                    │fle_user_badges   │
                                    └──────────────────┘
```

**5 blocs fonctionnels :**
1. **Identité** : `profiles` (allégée), `user_roles`, `consents`
2. **Diagnostic** : `onboarding_results` (nouveau — stocke les réponses brutes + route + score)
3. **FLE** : tables existantes (inchangées, sauf suppression `badges_earned` de `fle_user_progress`)
4. **Marketplace** : `leads`, `training_providers`, `trainings`, `training_sessions`
5. **Analytics** : `analytics_events`, `test_results`

---

## Partie 3 — Tables optimisées

### 3.1 `profiles` — ALLÉGER

**Rôle :** identité de l'utilisateur, données stables.

**Colonnes à garder :** `id`, `user_id`, `first_name`, `last_name`, `full_name`, `email`, `phone`, `city`, `postal_code`, `origin_country`, `previous_job`, `created_at`, `updated_at`

**Colonnes à déplacer vers `onboarding_results` :** `literacy`, `french_level_cecrl`, `french_level`, `work_right`, `barriers`, `main_goal`, `target_sector`, `fle_type`, `fle_format`, `training_duration`, `mobility`, `funding_status`, `work_schedule`, `mobility_km`, `immediate_availability`, `worked_in_france`, `admin_status`, `real_comprehension_score`, `contact_48h`, `lead_route`, `lead_score`, `distance_to_job`, `skills`

**Justification :** ces 23 colonnes sont des résultats d'onboarding, pas des données d'identité. Elles polluent le profil et créent de la confusion sur la source de vérité.

### 3.2 `onboarding_results` — CRÉER

**Rôle :** snapshot complet du diagnostic d'onboarding.

| Colonne | Type | Notes |
|---------|------|-------|
| id | uuid PK | |
| user_id | uuid | nullable (onboarding possible sans compte) |
| email | text | identifiant de fallback |
| language | text | langue de l'onboarding |
| answers | jsonb | réponses brutes complètes |
| french_level_cecrl | varchar | extrait pour requêtes rapides |
| main_goal | varchar | extrait |
| target_sector | varchar | extrait |
| lead_route | varchar | route_a/b/c/sas calculée |
| lead_score | integer | score 0-100 calculé |
| distance_to_job | integer | 0-4 calculé |
| work_right | varchar | extrait |
| literacy | varchar | extrait |
| barriers | text[] | extrait |
| completed_at | timestamptz | |
| created_at | timestamptz | |

**Relation :** `user_id` → lié quand l'utilisateur crée un compte après onboarding.

**Justification :** audit trail complet, on peut recalculer les scores, on ne pollue plus `profiles`.

### 3.3 `fle_user_progress` — NETTOYER

**Supprimer :** `badges_earned` (JSONB) — doublon de `fle_user_badges`.
**Supprimer :** `target_sector` — déjà dans `onboarding_results` et/ou `profiles`.

### 3.4 Tables inchangées (correctes)

- `fle_modules`, `fle_exercises`, `fle_module_progress`, `fle_exercise_results`, `fle_review_items`, `fle_badges`, `fle_user_badges`
- `leads`, `training_providers`, `trainings`, `training_sessions`
- `user_roles`, `consents`, `analytics_events`, `contact_requests`
- `test_results`

### 3.5 Fichier à supprimer

- `src/lib/orientationEngine.ts` — moteur v2 jamais utilisé, crée de la confusion avec `decisionTree.ts`.

---

## Partie 4 — Flux utilisateurs optimisés

### Flux 1 : Nouvel utilisateur

1. **Landing** (`/`) → CTA "Commencer"
2. **Onboarding** (`/onboarding`) → choix langue → chat conversationnel Marianne
3. **Diagnostic** : réponses collectées progressivement, route calculée en temps réel
4. **Sauvegarde** : `INSERT INTO onboarding_results` (réponses brutes + route + score)
5. **Confirmation** (`/confirmation`) → parcours recommandé affiché
6. **Création de compte** (optionnel) → `profiles` créé avec données identité uniquement
7. **Dashboard** (`/dashboard`) → vue personnalisée selon la route

**Simplification proposée :** aujourd'hui, les données passent par localStorage puis une edge function `match-leads`. Ajouter un `INSERT` direct dans `onboarding_results` AVANT l'appel à `match-leads` pour sécuriser les données.

### Flux 2 : Apprentissage FLE

1. **Dashboard FLE** (`/fle`) → mission du jour, progression, parcours
2. **Exercice** (`/fle/exercise/:id`) → exercices du module
3. **Feedback** → son + score + XP mis à jour dans `fle_user_progress`
4. **Fin de module** → écran de complétion, badges vérifiés
5. **Révision** (`/fle/review`) → révision espacée SM-2
6. **Dialogue** (`/fle/dialogue`) → pratique orale avec Marianne

**Flux correct, pas de changement structurel nécessaire.**

### Flux 3 : Orientation emploi/formation

**Actuellement fonctionnel via :** onboarding → route → leads → providers.
**Point de friction :** pas de suivi post-orientation côté utilisateur. Le dashboard affiche le profil mais pas l'avancement du parcours emploi/formation.

**Proposition V2 (pas MVP) :** ajouter une table `user_journey_steps` pour tracker les étapes post-orientation (inscrit France Travail, RDV pris, formation démarrée, etc.).

### Flux 4 : Admin/Accompagnant

**Actuellement :** `/admin/fle` pour suivi FLE, `/admin` pour dashboard global, `/admin/users` pour gestion utilisateurs.
**Fonctionnel.** La vue `AdminFLEProgress` joint correctement `fle_user_progress` + `profiles`.

---

## Partie 5 — Logique métier cible

### Sources de vérité

| Donnée | Source de vérité | Dérivée de |
|--------|-----------------|------------|
| Identité utilisateur | `profiles` | — |
| Diagnostic onboarding | `onboarding_results` | — |
| Route d'orientation | `onboarding_results.lead_route` | Calculée par `determineRoute()` |
| Score lead | `onboarding_results.lead_score` | Calculé par `calculateLeadScore()` |
| Niveau FLE estimé | `fle_user_progress.estimated_level` | Mis à jour par exercices |
| Progression FLE | `fle_module_progress` | — |
| Badges | `fle_user_badges` | — |
| XP, streak, scores | `fle_user_progress` | Agrégés depuis exercices |

### Calculs

- **Côté base (triggers/fonctions) :** `set_lead_price`, `protect_purchased_at` — existants et corrects
- **Côté front :** scoring lead, routing, personnalisation modules, risque décrochage — corrects et appropriés pour le MVP
- **A migrer en base (V2) :** `updated_at` trigger (existe mais pas attaché)

### Statuts standards

**Lead :** `pending` → `a_qualifier` → `qualifie_fle|qualifie_of|qualifie_employeur` → `transmis_partenaire` → `rdv_fixe` → `entre_formation|recrute` → `converted` | `rejected` | `perdu_injoignable`

**Onboarding :** `started` → `completed` → `matched` (lead créé)

**Module FLE :** `locked` → `unlocked` → `in_progress` → `completed`

---

## Partie 6 — Plan de refactor concret

### Phase 1 — Quick wins (sans casser le MVP)

1. **Supprimer `src/lib/orientationEngine.ts`** — code mort, 0 import
2. **Supprimer `fle_user_progress.badges_earned`** (migration) — doublon de `fle_user_badges`
3. **Supprimer `fle_user_progress.target_sector`** — doublon de `profiles.target_sector`
4. **Nettoyer les imports** de `orientationEngine` s'il y en a

### Phase 2 — Créer `onboarding_results` (sécurisation des données)

1. Migration : créer table `onboarding_results` avec RLS
2. Modifier `Onboarding.tsx` → `handleComplete` : insérer dans `onboarding_results` avant `match-leads`
3. Conserver le flux actuel avec `profiles` en parallèle (pas de breaking change)

### Phase 3 — Alléger `profiles` (refactor progressif)

1. Les nouvelles lectures de données onboarding pointent vers `onboarding_results`
2. `Dashboard.tsx` lit depuis `onboarding_results` au lieu des colonnes onboarding de `profiles`
3. Les colonnes onboarding de `profiles` deviennent optionnelles/dépréciées
4. Suppression des colonnes onboarding de `profiles` quand plus aucun code n'y accède

### Ordre de priorité

1. Quick wins (Phase 1) — immédiat, 0 risque
2. `onboarding_results` (Phase 2) — 1 migration + 1 fichier modifié
3. Allègement `profiles` (Phase 3) — progressif, plusieurs itérations

---

## Bonus

### Naming

| Actuel | Proposé | Raison |
|--------|---------|--------|
| `fle_user_progress` | ✅ garder | clair |
| `profiles.distance_to_job` | supprimer | calculable |
| `profiles.lead_score` | déplacer vers `onboarding_results` | pas une donnée d'identité |

### 3 plus gros risques actuels

1. **Perte de données onboarding** — si `match-leads` échoue, les réponses sont perdues (seulement dans localStorage)
2. **Données périmées dans `profiles`** — `lead_score`, `lead_route` ne sont jamais recalculés
3. **Double source de vérité badges** — `badges_earned` JSONB vs `fle_user_badges` table

### 5 quick wins prioritaires

1. Supprimer `orientationEngine.ts` (code mort)
2. Supprimer `fle_user_progress.badges_earned` (doublon)
3. Créer `onboarding_results` (sécurisation)
4. Ajouter `user_id` nullable à `test_results` (lier placement au profil)
5. Ajouter un `INSERT onboarding_results` dans le flux onboarding avant `match-leads`

