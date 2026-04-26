Objectif : rendre les diagnostics pilotables par lieu source, mieux capter prénom/téléphone, unifier le scoring, et créer une vue admin pilote.

Plan d’implémentation

1. Source du lead dans la base
- Ajouter les colonnes suivantes à `onboarding_results`, `profiles` et `leads` :
  - `source_location_id`
  - `source_name`
  - `source_type`
  - `source_campaign`
- Conserver la compatibilité avec les champs déjà envoyés vers HubSpot (`source_location`, `source_slug`) en mappant :
  - `source_name` -> `source_location`
  - slug URL -> `source_slug`
- Indexer les champs source utiles pour les vues admin et exports.

2. URLs QR code par lieu
- Ajouter la route `/to/:sourceSlug`.
- Cette route redirigera vers `/onboarding?source=<sourceSlug>` en conservant une URL courte imprimable sur QR code.
- Gérer aussi directement `/onboarding?source=aurore`.
- Préconfigurer les sources pilotes :
  - `aurore`
  - `emmaus-victoire`
  - `mdq-landy`
- Chaque source aura un nom lisible, un type et éventuellement une campagne par défaut.

3. Prénom + téléphone dans le parcours
- Ajouter une étape contact dédiée dans l’onboarding visuel avant l’email, avec :
  - prénom obligatoire
  - téléphone obligatoire
  - email conservé séparément
- Sauvegarder ces données dans `answers`, `onboarding_results`, `profiles`, l’appel `match-leads`, puis HubSpot.
- Adapter la reprise de parcours pour ne pas perdre prénom/téléphone si l’utilisateur revient plus tard.

4. Un seul moteur de scoring
- Créer une fonction commune de scoring utilisable côté frontend et côté backend, avec une version partagée pour les Edge Functions.
- Remplacer les calculs dispersés :
  - score `orientationEngine`
  - score `match-leads`
  - ancien `calculateLeadScore` dans `decisionTree`
  - score qualification HubSpot si nécessaire
- Garder une séparation claire :
  - `route_orientation` décide du parcours recommandé
  - `score_qualification` mesure la qualité du lead
- Harmoniser le score enregistré dans :
  - `onboarding_results.lead_score`
  - `profiles.lead_score`
  - `leads.match_score`
  - HubSpot `score_qualification`

5. Vue pilote admin `/admin/pilotes`
- Créer une page protégée admin `/admin/pilotes`.
- Afficher des indicateurs filtrables par lieu/source :
  - nombre de diagnostics par lieu
  - profils qualifiés
  - orientations / routes
  - statuts
  - taux de contactabilité téléphone
  - score moyen
- Ajouter un tableau détaillé des diagnostics/leads avec filtres par source, campagne, statut et date.
- Ajouter export CSV des données filtrées.
- Ajouter un mode “bilan imprimable” avec une mise en page propre pour impression/PDF navigateur.
- Ajouter un lien vers cette vue depuis le dashboard admin.

6. Intégration HubSpot et Slack déjà prévue à sécuriser
- Propager les nouveaux champs source vers HubSpot lors de `sync-hubspot-diagnostic`.
- Ajouter la notification Slack automatique après création d’un nouveau contact HubSpot avec `diagnostic_id`, en Block Kit, vers `SLACK_WEBHOOK_URL`.
- Si `score_qualification >= 70` et `consentement_rappel = true`, ajouter le bloc d’action “À rappeler dans les 24h”.
- Ajouter une journalisation non bloquante : si Slack échoue, le diagnostic et HubSpot restent valides, mais l’échec est visible dans les logs.

Détails techniques

- Base de données : migration uniquement pour les nouvelles colonnes et index.
- Backend : mise à jour de `match-leads` et `sync-hubspot-diagnostic` pour transporter les champs source et utiliser le scoring unifié.
- Frontend : mise à jour de `Onboarding.tsx`, ajout de la route courte `/to/:sourceSlug`, ajout de `/admin/pilotes`.
- Sécurité : la page pilote reste derrière `AdminRoute`; les exports sont générés côté navigateur à partir des données admin autorisées.
- Secrets : `SLACK_WEBHOOK_URL` devra être ajouté comme secret runtime avant déploiement de la notification Slack.

Résultat attendu

```text
QR code lieu
  -> /to/aurore
  -> /onboarding?source=aurore
  -> diagnostic complété avec prénom + téléphone
  -> source enregistrée localement
  -> score unique calculé
  -> HubSpot contact/deal
  -> notification Slack
  -> pilotage admin /admin/pilotes
```