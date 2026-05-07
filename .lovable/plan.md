## Problème

Le PDF "Votre profil" affiche des valeurs brutes en anglais (`bike`, `childcare`, `partial`, `hotellerie`) parce que `src/lib/generateOnboardingPDF.ts` ne traduit que quelques champs (objectif, niveau CECRL, droit travail, dispo). Pour les autres (`target_sector`, `mobility`, `literacy`, `barriers`, `fle_type`, `training_duration`, `work_schedule`, `funding_status`), `formatValue` se contente d'un `replace(/_/g, " ")`.

## Correctif

Dans `src/lib/generateOnboardingPDF.ts` :

1. Ajouter des dictionnaires FR :
   - `SECTOR_LABELS` : hotellerie → "Hôtellerie-restauration", logistique, proprete, sante, aide_personne, commerce, btp, restauration, autre…
   - `MOBILITY_LABELS` : walk → "À pied", bike → "Vélo", public_transport → "Transports en commun", car → "Voiture", none → "Aucune"
   - `LITERACY_LABELS` : none → "Non alphabétisé", partial → "Partiellement alphabétisé", yes → "Alphabétisé"
   - `BARRIER_LABELS` : transport → "Transport", childcare → "Garde d'enfants", schedule → "Horaires", health → "Santé", admin → "Démarches administratives", housing → "Logement", language → "Langue", none → "Aucun"
   - `FLE_TYPE_LABELS`, `TRAINING_DURATION_LABELS`, `WORK_SCHEDULE_LABELS`, `FUNDING_LABELS` : couverture des id utilisés dans `visualQuestions.ts`.

2. Étendre `formatValue(key, value)` pour utiliser ces dictionnaires (avec support multi-valeurs CSV/array pour `barriers`, et fallback humanisé propre — capitaliser, sans underscores).

3. Ajouter une fonction `humanizeFallback(v)` qui remplace `_` par espace **et** capitalise, utilisée comme dernier recours pour ne plus jamais laisser un mot anglais brut.

4. Étendre le test `src/lib/__tests__/generateOnboardingPDF.test.ts` avec un scénario contenant `target_sector: "hotellerie"`, `mobility: "bike"`, `literacy: "partial"`, `barriers: ["childcare"]` et vérifier que le HTML contient les libellés FR et **ne contient pas** les chaînes brutes `>bike<`, `>childcare<`, `>partial<`, `>hotellerie<`.

## Hors scope

- Pas de refonte i18n du PDF (reste FR-only — c'est le besoin actuel).
- Pas de changement de design / mise en page.