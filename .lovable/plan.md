
# Rendre Marianne accessible à un public non-numérique

Objectif : un primo-arrivant qui ne sait quasiment pas utiliser un téléphone doit pouvoir lancer Marianne en **un seul tap visible**, comprendre où il en est, et avancer sans lire de petits textes.

Le travail reste **purement frontend / présentation** (pas de changement de logique métier ni de questions).

---

## 1. Entrée vers Marianne (page d'accueil)

Aujourd'hui : `AccessCodeSection` met un champ "code" en avant — bloquant et anxiogène pour un débutant numérique.

Changements :
- **Gros bouton unique "Commencer avec Marianne"** (pleine largeur, hauteur ~64px, icône micro + flèche) tout en haut de la section, qui mène directement à `/onboarding`.
- Le champ code est replié dans un lien discret sous le bouton : *"J'ai un code d'accès"* → ouvre le champ uniquement au clic.
- Texte simplifié : phrases courtes (max 8 mots), lecture niveau A1, suppression du jargon "version pilote".
- Bouton de **lecture audio** (icône haut-parleur) à côté du titre principal pour faire lire le texte d'intro par TTS.

## 2. Choix de la langue (`LanguageStep`)

- Garder le visuel actuel mais : **drapeau plus grand** (text-6xl), **nom de la langue dans la langue elle-même** déjà fait, plus titre court "Votre langue ?" / "اختر لغتك" / etc.
- **Auto-lecture** du titre dans chaque langue au survol/focus (déjà partiellement OK), et lecture du nom de langue au tap avant de continuer.
- Supprimer le helper "🌍 6 langues disponibles" (bruit visuel inutile).

## 3. Écran intermédiaire `OnboardingPathChoice`

Aujourd'hui : 2 cartes (visuel / vocal verrouillé). Inutile et déroutant puisqu'une seule option est active.

Changement : **supprimer cet écran** et passer directement de la langue à la 1ʳᵉ question. Une seule décision en moins.

## 4. Écran de question (`VisualQuestionStep` + `PhotoLanguageChoice`)

- **Bouton "Réécouter"** : passer d'une icône 36×36 à un bouton large avec libellé texte ("Réécouter la question" / icône + mot), placé sous le titre, bien visible.
- **Numéros d'option** (1, 2, 3…) : agrandir (h-9 w-9), placer en haut-centre de la carte au lieu d'un petit badge en coin — ces numéros sont la clé pour les non-lecteurs ("appuie sur le 2").
- **Cartes plus grandes** : min-h passe à ~220px mobile, image qui prend toute la largeur, label en gros (text-base font-semibold).
- **Indicateur de sélection** : remplacer le petit `Check` discret par une **bordure pleine épaisse + halo coloré** sur toute la carte sélectionnée.
- **Progression** : remplacer "3/12 — 25 %" par une barre simple **avec petits ronds** (un par étape, rempli si fait), sans pourcentage écrit.
- **Boutons navigation** : "Précédent" devient une flèche ronde discrète en haut à gauche ; "Suivant" devient un **gros bouton vert pleine largeur** en bas, sticky sur mobile, libellé "Continuer" + flèche.
- Pour les questions `multi`, ajouter une mini-instruction visuelle au-dessus de la grille : icône doigt + "Vous pouvez choisir plusieurs réponses".

## 5. Étapes de saisie texte (postal, contact, email)

Ces étapes cassent le rythme visuel. Changements :
- **Une seule donnée par écran** (déjà le cas).
- Champ input **hauteur 56px, text-lg**, label au-dessus en gros, exemple gris en dessous ("Exemple : 75011").
- Clavier mobile adapté : `inputMode="numeric"` pour code postal/téléphone, `inputMode="email"` pour l'email (vérifier que c'est bien posé).
- Bouton TTS visible pour faire lire la question.

## 6. Récap & complétion

- `VisualRecapStep` : grosse vignette image + valeur en clair par item, bouton "Modifier" gros et clair (pas un petit lien).
- `CompletionStep` : un seul bouton géant "Voir mes résultats", animation rassurante (déjà OK).

## 7. Accessibilité transverse

- Taille de base passe à `text-base` partout dans le flux Marianne (suppression des `text-xs`, `text-sm` sur le contenu utile, on les garde uniquement pour les mentions légales).
- Contrastes vérifiés WCAG AA.
- Tous les boutons cliquables ≥ 48×48 px (cible tactile WCAG).
- Ajout d'un bouton **"🔊 Tout réécouter"** flottant en bas à droite, persistant pendant tout le parcours Marianne.

---

## Détails techniques (fichiers touchés)

- `src/components/AccessCodeSection.tsx` — refonte hiérarchie + repli du champ code.
- `src/components/VocalOnboarding/LanguageStep.tsx` — simplification typo + audio.
- `src/pages/Onboarding.tsx` — supprimer le step `path-choice` (passer direct de `language` → `visual-quiz`), supprimer l'import `OnboardingPathChoice`.
- `src/components/VocalOnboarding/OnboardingPathChoice.tsx` — supprimer le fichier.
- `src/components/VisualOnboarding/VisualQuestionStep.tsx` — barre de progression à ronds, bouton Réécouter en gros, sticky CTA mobile, instruction multi.
- `src/components/VocalOnboarding/PhotoLanguageChoice.tsx` — numéros d'option agrandis et centrés, état sélection plus marqué, min-h augmenté.
- `src/components/VisualOnboarding/PostalCodeStep.tsx`, `ContactStep.tsx`, `EmailStep.tsx` — gros inputs, `inputMode` adaptés, bouton TTS.
- `src/components/VisualOnboarding/VisualRecapStep.tsx` — boutons Modifier visibles.
- Nouveau composant `src/components/VocalOnboarding/FloatingReplayButton.tsx` — bouton flottant TTS persistant.

Aucune modification du décisionnel, de la base, des fonctions edge ou du contenu des questions.
