

# Plan : Atteindre et dépasser Frello

## Analyse comparative

| Fonctionnalité Frello | ToFrance actuel | Écart |
|---|---|---|
| App mobile native | Web mobile-first | Ajouter PWA installable |
| 12 langues d'interface | 6 langues (fr/en/ar/es/pt/ru) | Ajouter 6 langues |
| 1500h de contenu, accès 12 mois | ~200 exercices, 18 modules | Générer du contenu IA à la volée |
| Publics grands débutants (infra A2) | Alpha → B1 supporté | Renforcer UX Alpha |
| Préparation DELF/TCF + examen civique | Absent | Ajouter parcours certif + civique |
| Parcours 100% individualisé | Personnalisation basique (secteur/objectif) | Adaptive learning avancé |
| Suivi temps réel des progrès | XP, streak, badges existants | Enrichir analytics apprenant |
| Heures illimitées | Limité aux exercices en base | Exercices IA génératifs illimités |

## Plan d'implémentation (10 étapes)

### 1. PWA — App installable sur téléphone
- Ajouter `manifest.json` (nom, icônes, couleurs ToFrance, `display: standalone`)
- Ajouter Service Worker pour cache offline des pages FLE
- Bouton "Installer l'app" sur le dashboard FLE pour mobile

### 2. Exercices génératifs illimités par IA
- Étendre l'edge function `fle-voice-ai` avec l'action `generate_exercise` (déjà prévue dans l'interface)
- Sur le dashboard, ajouter un bouton "Encore plus d'exercices" qui génère dynamiquement des exercices adaptés au niveau et thème de l'utilisateur
- Stocker les exercices générés en base pour ne pas les régénérer

### 3. Parcours adaptatif avancé (Adaptive Learning)
- Après chaque exercice, ajuster le niveau estimé en fonction du taux de réussite glissant (derniers 10 exercices)
- Proposer automatiquement des exercices de révision si le score oral ou compréhension baisse
- Algorithme SM-2 déjà implémenté → l'exposer plus visiblement avec des rappels push/notification

### 4. Parcours préparation DELF/TCF
- Créer une catégorie "certification" dans `fle_modules`
- Migration DB : ajouter des modules DELF A1, A2, B1 avec exercices types (compréhension orale, production orale, compréhension écrite)
- Ajouter un examen blanc chronométré simulant les conditions réelles

### 5. Parcours Culture & Civique
- Créer des modules "culture" couvrant les valeurs de la République, histoire, institutions
- Préparer aux questions de l'examen civique du CIR
- Exercices QCM + audio explicatifs

### 6. UX renforcée pour grands débutants (Alpha)
- Mode "ultra-simple" pour niveau Alpha : gros boutons, audio omniprésent, zéro texte inutile
- Pictogrammes pour chaque action (écouter = oreille, parler = bouche, etc.)
- Auto-play audio systématique pour toutes les consignes
- Traduction automatique de la consigne dans la langue maternelle

### 7. Suivi du temps d'apprentissage
- Tracker le temps passé par session (start/end timestamps)
- Migration DB : ajouter `session_start_at`, `session_duration_seconds` dans une table `fle_sessions`
- Afficher sur le dashboard : "Temps total cette semaine", "Temps aujourd'hui"
- Graphique hebdomadaire du temps d'apprentissage

### 8. 6 langues supplémentaires
- Ajouter : turc (tr), dari/farsi (fa), pashto (ps), tigrinya (ti), mandarin (zh), bengali (bn)
- Traduire l'interface FLE et les consignes dans ces langues
- Adapter le TTS et STT pour ces langues

### 9. Mode hors-ligne (Offline)
- Pré-charger les exercices du module en cours + le suivant
- Stocker les réponses localement et synchroniser à la reconnexion
- IndexedDB pour le cache des données d'exercices

### 10. Tableau de bord apprenant enrichi
- Ajouter graphique de progression CECRL dans le temps
- Statistiques détaillées : points forts/faibles par compétence (oral, écoute, lecture)
- Objectifs hebdomadaires personnalisables
- Export PDF du bilan de progression

## Ordre de priorité recommandé

**Phase 1 (impact immédiat)** : PWA (1) + Exercices IA illimités (2) + Temps d'apprentissage (7)

**Phase 2 (différenciation)** : Parcours DELF/TCF (4) + Civique (5) + UX Alpha (6)

**Phase 3 (scaling)** : Adaptive learning (3) + Langues (8) + Offline (9) + Dashboard enrichi (10)

## Détails techniques

- **PWA** : `vite-plugin-pwa` avec Workbox pour le caching
- **Exercices génératifs** : Edge function existante `fle-voice-ai`, action `generate_exercise` → GPT-5-mini via Lovable AI Gateway
- **Temps tracking** : Nouvelle table `fle_sessions` avec RLS, hook `useFLESession` qui enregistre start/end
- **DELF/TCF** : Nouvelles lignes dans `fle_modules` + `fle_exercises` via migration
- **Offline** : Service Worker + IndexedDB via `idb` library

