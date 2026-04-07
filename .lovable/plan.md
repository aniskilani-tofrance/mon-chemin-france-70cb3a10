
# Phase 3 : Adaptive Learning + Offline + Dashboard enrichi

## 1. Adaptive Learning avancé
- Après chaque exercice, calculer le taux de réussite glissant (derniers 10 exercices)
- Si taux < 60% → baisser le niveau estimé, si > 85% → monter
- Proposer automatiquement des exercices de révision quand oral_score ou comprehension_score baisse
- Hook `useAdaptiveLearning` qui encapsule cette logique
- Afficher une notification quand le niveau change

## 2. Mode hors-ligne (Offline)
- Manifest PWA déjà en place → ajouter cache des exercices du module en cours via IndexedDB
- Hook `useOfflineExercises` pour pré-charger et stocker les exercices
- Synchronisation des réponses à la reconnexion
- Indicateur "hors-ligne" dans le dashboard
- Note : pas de Service Worker complet (risque preview), juste IndexedDB pour les données

## 3. Dashboard apprenant enrichi
- Graphique de progression CECRL dans le temps (recharts)
- Radar chart des compétences (oral, écoute, lecture, vocabulaire)
- Objectifs hebdomadaires personnalisables (slider)
- Export PDF du bilan de progression
- Migration DB : ajouter table `fle_level_history` pour tracer l'évolution du niveau

## Migration DB nécessaire
- Table `fle_level_history` : user_id, level, changed_at, reason
- RLS : utilisateurs voient leur propre historique
