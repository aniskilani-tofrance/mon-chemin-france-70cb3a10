

# Plan: Générer un PDF structuré des questions du parcours d'onboarding ToFrance

## Objectif
Créer un document PDF professionnel listant toutes les questions du parcours d'onboarding, organisé par étapes et routes, avec les choix, tags et branchements.

## Structure du document

1. **Page de couverture** — ToFrance, Parcours d'onboarding, date
2. **Schéma du flux** — Diagramme ASCII montrant les 3 routes (A: FLE, B: Formation, C: Emploi)
3. **Étape 1 : Triage rapide** — Questions 1-3 (location, pays d'origine, métier, objectifs, contact 48h)
4. **Étape 2 : Diagnostic linguistique** — Questions 4-5 (littératie, niveau CECRL)
5. **Étape 3 : Droits & contraintes** — Questions 6-7 (droit au travail, freins)
6. **Route A : FLE** — Questions type FLE, format FLE
7. **Route B : Formation** — Secteur cible, durée, mobilité, financement
8. **Route C : Emploi** — Satisfaction secteur, horaires, mobilité km, disponibilité
9. **Contact** — Prénom, nom, email
10. **Logique de scoring** — Barème de score lead (complétude, fit, réactivité)
11. **Logique de routage** — Règles de détermination des routes

## Détails techniques
- Utiliser **ReportLab** (Python) pour générer le PDF
- Chaque question affichée avec : ID, type, texte FR, choix avec tags, question suivante
- Tables pour les choix avec colonnes : ID | Label FR | Icône | Tags
- Couleurs par route : bleu (FLE), vert (Formation), orange (Emploi), gris (SAS)
- Export vers `/mnt/documents/tofrance-parcours-onboarding.pdf`

