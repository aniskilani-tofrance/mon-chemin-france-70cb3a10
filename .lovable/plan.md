

# Intégrer les meilleures idées de ParlerEmploi dans ToFrance

## Idées retenues (valeur ajoutée réelle)

### 1. Rôle Formateur + Dashboard dédié
**Pourquoi** : Permet à un organisme de formation d'assigner des modules, suivre ses apprenants et valider les productions orales. C'est le chaînon manquant entre l'apprenant autonome et l'accompagnement professionnel.

- Ajouter `formateur` à l'enum `app_role` (existe déjà `admin`, `provider`, `user`)
- Créer la table `formateur_learners` (relation N-N formateur ↔ apprenant)
- Créer la page `/formateur` avec sidebar : Apprenants | Contenus | Assignations | Évaluations audio | AFEST
- Redirection automatique au login selon le rôle

### 2. Système d'assignation de modules
**Pourquoi** : Un formateur peut prescrire un parcours personnalisé avec date limite, au lieu que l'apprenant navigue seul.

- Table `assignments` : module_id, learner_id, assigned_by, due_date, status (à_faire/en_cours/terminé/en_retard)
- Vue apprenant : badge "Assigné par votre formateur" sur les modules prescrits
- Vue formateur : tableau de suivi des assignations

### 3. Soumissions audio pour évaluation manuelle
**Pourquoi** : L'IA corrige bien les QCM mais l'évaluation de la production orale nécessite un regard humain pour les niveaux DELF.

- Table `audio_submissions` : learner_id, module_id, audio_url, status (pending/validated/rework), formateur_comment
- Bucket storage `audio-submissions`
- Dans l'exercice `oral_answer` : option "Soumettre au formateur" (enregistre le blob audio)
- Onglet Évaluations du formateur : lecteur audio + boutons valider/à retravailler + commentaire

### 4. Suivi AFEST (Action de Formation En Situation de Travail)
**Pourquoi** : Fonctionnalité différenciante forte pour les organismes de formation. Aucun concurrent ne l'intègre dans une app FLE.

- Table `afest_observations` : learner_id, formateur_id, date, situation, competences (jsonb), appreciation (1-4), commentaire
- Formulaire d'observation pré-rempli (date du jour)
- Grille de suivi par apprenant avec historique
- Export PDF via CSS print

### 5. Deux nouveaux types d'exercices
**Pourquoi** : Enrichit la variété pédagogique sans complexité excessive.

- **Scénario simulation** : arbre de dialogue en JSON (3 choix par nœud, chaque branche mène à un résultat différent). Réutilise le moteur de dialogue existant.
- **Drag & drop** : association terme ↔ définition. Utilise `@dnd-kit/core` pour le tactile mobile.
- Ajouter `scenario_tree` et `drag_match` à l'enum `fle_exercise_type`

### 6. Dashboard Directeur (lecture seule)
**Pourquoi** : Les décideurs veulent des KPIs sans accéder aux détails. Simple à implémenter car les données existent déjà.

- Ajouter `directeur` à `app_role`
- Page `/directeur` : 4 cartes métriques + graphique barres completions par secteur + tableau par formateur
- Requêtes agrégées sur les tables existantes
- Bouton export CSV

## Idées NON retenues
- Nouvelle palette de couleurs → la charte ToFrance est cohérente, pas de raison de changer
- Schema DB différent → on étend le modèle existant plutôt que de dupliquer
- Seed data démo → pas nécessaire à ce stade

## Plan d'implémentation (4 étapes)

**Étape 1 — Migration DB + Rôles**
- Ajouter `formateur`, `directeur` à l'enum `app_role`
- Créer tables : `assignments`, `audio_submissions`, `afest_observations`, `formateur_learners`
- Créer bucket storage `audio-submissions`
- RLS : formateur voit ses apprenants, directeur voit les agrégats, apprenant voit ses assignations

**Étape 2 — Dashboard Formateur**
- Page `/formateur` avec layout sidebar/bottom-tab
- Onglets : liste apprenants, fiche détail, assignation de modules, évaluations audio, grille AFEST
- Détection du rôle au login → redirection

**Étape 3 — Nouveaux exercices + soumission audio**
- Ajouter types `scenario_tree` et `drag_match` à l'enum
- Composant ScenarioExercise (JSON tree navigation)
- Composant DragMatchExercise (@dnd-kit)
- Bouton "Soumettre au formateur" dans oral_answer avec upload audio

**Étape 4 — Dashboard Directeur**
- Page `/directeur` lecture seule
- 4 KPI cards + bar chart Recharts + table formateurs
- Export CSV

