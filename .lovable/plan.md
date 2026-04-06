## Module FLE intégré à ToFrance — Plan en 5 phases

### Phase 1 : Fondations — ✅ EN COURS

#### 1.1 Migration BDD ✅
- Tables `fle_badges`, `fle_user_badges`, `fle_review_items` créées
- Colonnes ajoutées à `fle_user_progress` : `daily_goal_minutes`, `weekly_xp_target`, `badges_earned`, `daily_mission_completed_at`, `last_streak_date`
- 15 badges seedés

#### 1.2 Dashboard FLE refondu ✅
- Mission du jour, barre XP hebdomadaire, grille d'accès rapide 2x2
- Vue parcours en chemin vertical (FLEPathwayMap)
- Rangée de badges horizontale scrollable
- Streak animé dans le header

#### 1.3 Nouveaux composants ✅
- `FLEDailyMission.tsx`, `FLEPathwayMap.tsx`, `FLEBadgeCard.tsx`, `FLEWeeklyProgress.tsx`
- `FLEDashboardCard.tsx` (carte enrichie pour Dashboard principal)

#### 1.4 Carte enrichie Dashboard ✅
- Niveau, XP, streak, progression, prochaine mission, message motivationnel

### Phase 2 : Module de révision + écran de fin de module
- Page `/fle/review` avec révision espacée (SM-2)
- Alimentation automatique des items de révision
- Écran de fin de module avec animation, score, badges

### Phase 3 : Parcours thématiques + personnalisation profil
- Filtres par thème (santé, transport, etc.)
- Personnalisation selon profil ToFrance
- Signaux d'orientation remontés

### Phase 4 : Coach quotidien + contenu enrichi
- Coach IA Marianne quotidien
- Exercices supplémentaires par module
- Sous-parcours métiers

### Phase 5 : Vue accompagnant/admin + analytics
- Page admin progression FLE
- Dashboard analytics FLE
