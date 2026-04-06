

## Analyse de l'existant

La page d'accueil actuelle est générique et ne reflète pas les 3 piliers concrets de ToFrance :
1. **Onboarding vocal avec Marianne** (conseillère IA multilingue)
2. **Module FLE** (apprentissage du français oral-first)
3. **Mise en relation** avec des organismes de formation locaux

Les problèmes :
- Le hero est correct mais le badge "Votre guide pour réussir en France" est vague
- EmployersSection affiche des stats (50+ organismes, 200+ formations) mais sans contexte narratif
- FeaturesSection montre 4 cartes génériques (Cours, Orientation, Formations, Accompagnement) sans lien avec les vrais produits
- CTASection répète les stats avec des chiffres gonflés (50K+, 500+) qui ne correspondent pas à la réalité
- Il manque une section "Comment ça marche" (parcours en 3 étapes)
- Il manque une section qui présente le module FLE comme produit phare

## Plan d'amélioration

### 1. Refonte du HeroSection
- Garder l'image de fond et la structure existante
- Rendre le badge plus spécifique : "IA multilingue -- 6 langues"
- Ajouter un second CTA "Apprendre le français" qui pointe vers `/fle`
- Garder les cartes Marianne et Parcours personnalisé

### 2. Nouvelle section "Comment ça marche" (HowItWorksSection)
Créer un nouveau composant avec 3 étapes visuelles :
- **Etape 1** : "Parlez avec Marianne" -- onboarding vocal en 5 minutes
- **Etape 2** : "Recevez votre orientation" -- parcours personnalisé (FLE, Formation, Emploi)
- **Etape 3** : "Commencez votre parcours" -- cours de français ou mise en relation

Design : timeline horizontale sur desktop, verticale sur mobile, avec icones et numéros

### 3. Refonte de FeaturesSection
Remplacer les 4 cartes génériques par 3 cartes produit plus impactantes :
- **Marianne, votre conseillère IA** : onboarding vocal, 6 langues, orientation instantanée
- **Apprenez le français (FLE)** : modules interactifs, du niveau Alpha à B1, oral-first
- **Formations près de chez vous** : réseau de partenaires, mise en relation directe

Chaque carte aura un CTA propre (lien vers /onboarding, /fle, /partenaires)

### 4. Nettoyage de EmployersSection
- Garder les stats dynamiques (providers, trainings, sectors)
- Retirer "10 000+ personnes accompagnées" (chiffre non vérifié)
- Ajouter "6 langues" comme stat

### 5. Refonte de CTASection
- Retirer les stats gonflées (50K+, 500+, 13 régions)
- Simplifier : un CTA principal + mention "Gratuit, sans inscription, 5 minutes"
- Ajouter les langues supportées sous forme de drapeaux ou badges

### 6. Mise à jour Index.tsx
Nouvel ordre des sections :
1. Hero
2. EmployersSection (stats rapides)
3. HowItWorksSection (nouveau)
4. FeaturesSection (refonte produit)
5. CTA
6. Footer

## Fichiers modifiés
- `src/components/HeroSection.tsx` -- second CTA + badge mis à jour
- `src/components/HowItWorksSection.tsx` -- nouveau composant
- `src/components/FeaturesSection.tsx` -- refonte 3 cartes produit avec CTA
- `src/components/EmployersSection.tsx` -- stats réalistes
- `src/components/CTASection.tsx` -- simplification
- `src/pages/Index.tsx` -- ajout HowItWorksSection
- `src/lib/translations.ts` -- mise à jour des textes features (toutes langues)

