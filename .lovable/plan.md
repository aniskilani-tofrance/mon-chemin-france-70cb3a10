

# Plan : Deux parcours d'onboarding (Q&R visuel + Vocal verrouillé)

## Objectif
À l'arrivée sur l'onboarding (après le choix de langue et l'intro Marianne), proposer à l'utilisateur **deux parcours distincts** :

1. **Parcours visuel (actif)** — Questions/réponses avec PhotoLanguageChoice (le système actuel basé sur le decision tree avec widgets visuels).
2. **Parcours vocal (verrouillé)** — Conversation libre avec Marianne via voix, marqué **"Bientôt disponible"** et non cliquable.

## Changements à apporter

### 1. Nouveau composant `OnboardingPathChoice.tsx`
Écran de sélection avec deux grandes cartes côte à côte (mobile : empilées) :
- **Carte 1 — Parcours guidé** : icône (ex: `Images` ou `MousePointerClick`), titre "Questions & images", sous-titre "Réponds à des questions simples avec des images", badge "Recommandé", cliquable.
- **Carte 2 — Parcours vocal** : icône (`Mic`), titre "Conversation vocale", sous-titre "Discute avec Marianne à l'oral", badge **"Bientôt disponible"**, état désactivé (opacité réduite, cadenas, `cursor-not-allowed`, pas d'action au clic).

Animations Framer Motion cohérentes avec le reste de l'onboarding, support i18n (6 langues + RTL arabe).

### 2. Modification de `src/pages/Onboarding.tsx`
Ajouter une nouvelle étape `"path-choice"` dans le type `OnboardingStep` :

```text
language → intro Marianne → path-choice → chat (parcours visuel actuel)
```

- Le bouton "Continuer" de `MarianneIntroStep` mène désormais à `path-choice` au lieu de `chat`.
- Sur `path-choice`, seul le parcours visuel est actif → mène à `chat` (flow existant inchangé).
- Le parcours vocal est verrouillé → aucun clic possible.

### 3. Traductions i18n
Ajouter dans les 6 fichiers locales (`fr.json`, `en.json`, `ar.json`, `es.json`, `pt.json`, `ru.json`) :
- `onboarding.pathChoice.title` — "Comment souhaites-tu répondre ?"
- `onboarding.pathChoice.subtitle` — "Choisis le parcours qui te convient"
- `onboarding.pathChoice.visual.title` / `.subtitle` / `.badge` ("Recommandé")
- `onboarding.pathChoice.vocal.title` / `.subtitle` / `.badge` ("Bientôt disponible")

### 4. Analytics
Tracker `onboarding_path_selected` avec `{ path: "visual" | "vocal" }` pour mesurer l'intérêt pour le parcours vocal (utile pour prioriser son développement).

## Fichiers touchés
- **Créé** : `src/components/VocalOnboarding/OnboardingPathChoice.tsx`
- **Modifié** : `src/pages/Onboarding.tsx` (ajout étape, routing)
- **Modifié** : `src/components/VocalOnboarding/MarianneIntroStep.tsx` (renommage callback si besoin, ou inchangé)
- **Modifié** : `src/i18n/locales/{fr,en,ar,es,pt,ru}.json` (nouvelles clés)

## Hors scope
- Pas de suppression du code lié au vocal (préservé pour activation future).
- Pas de modification du parcours visuel/chat lui-même.
- Pas de changement du système de checkpoints/reprise.

