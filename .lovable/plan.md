Objectif : envoyer automatiquement vers HubSpot les diagnostics terminés, pour Marianne onboarding et le diagnostic partagé formateur/apprenant.

Plan d’implémentation

1. Connecter HubSpot au projet
- Utiliser le connecteur HubSpot natif, comme choisi.
- Aucune connexion HubSpot n’est actuellement liée au projet : au moment de l’implémentation, je lancerai la connexion HubSpot et tu pourras sélectionner ou créer la connexion.
- Les appels HubSpot seront faits côté backend uniquement, via Lovable Cloud, jamais depuis le navigateur.

2. Ajouter une table de journalisation locale
Créer un journal technique d’intégration, par exemple `hubspot_diagnostic_sync_logs`, avec :
- `diagnostic_type` : `marianne` ou `shared_diagnostic`
- `diagnostic_id`
- `hubspot_contact_id`
- `hubspot_company_id`
- `hubspot_deal_id`
- `score_qualification`
- `status` : succès / échec / warning
- `error_message`
- `payload_summary`
- `created_at`

Accès : lecture admin uniquement. Cela permettra de suivre tous les envois réussis et les échecs.

3. Créer une fonction backend `sync-hubspot-diagnostic`
Cette fonction recevra un diagnostic terminé et :
- validera les données reçues côté backend
- calculera `score_qualification` sur 100 :
  - téléphone présent : +30
  - consentement rappel : +20
  - consentement transmission : +20
  - besoin clair : +20
  - niveau français déclaré : +10
- recherchera le contact HubSpot existant, prioritairement par téléphone, puis par email si disponible
- créera ou mettra à jour le contact
- recherchera l’entreprise HubSpot correspondant à `source_slug`
- créera le deal dans le pipeline “Leads ToFrance”
- associera le deal au contact et à l’entreprise si trouvée
- loguera le résultat dans la base

4. Mapping HubSpot contact
Envoyer les propriétés demandées :
- `firstname`
- `phone`
- `email`
- `city`
- `diagnostic_id`
- `source_location`
- `source_slug`
- `langue_diagnostic`
- `niveau_francais`
- `lecture_ecriture_francais`
- `besoin_principal`
- `route_orientation`
- `secteur_metier`
- `freins_identifies`
- `disponibilite`
- `mobilite`
- `whatsapp`
- `consentement_rappel`
- `consentement_transmission`
- `date_diagnostic`
- `statut_lead = "Nouveau diagnostic"`
- `score_qualification`

Note : ces propriétés doivent exister dans HubSpot, sinon HubSpot rejettera l’écriture. Je gérerai les erreurs clairement dans les logs.

5. Gestion de l’entreprise source
- Chercher l’entreprise HubSpot par propriété `source_slug`.
- Si elle existe : l’associer au deal.
- Si elle n’existe pas :
  - créer quand même le contact et le deal
  - créer une note HubSpot indiquant que l’entreprise source est introuvable
  - journaliser un warning côté ToFrance
  - prévoir une notification admin via le mécanisme existant d’email/admin si possible

6. Création du deal
Créer un deal dans le pipeline “Leads ToFrance” avec :
- `dealname` : `[Prénom] - [Route orientation] - [Lieu source]`
- `dealstage` : `Nouveau diagnostic`
- si `score_qualification >= 70`, utiliser `À rappeler`
- `amount` : `0`
- `closedate` : aujourd’hui + 30 jours
- association au contact
- association à l’entreprise source si trouvée

Détail important : HubSpot utilise souvent des IDs internes pour les pipelines et stages, pas les libellés visibles. Je prévoirai une configuration claire côté code pour retrouver ou utiliser les bons IDs.

7. Brancher Marianne onboarding
À la fin de Marianne, après l’enregistrement de `onboarding_results` et des consentements :
- appeler `sync-hubspot-diagnostic`
- mapper les réponses existantes vers les propriétés HubSpot
- ne pas bloquer l’utilisateur si HubSpot répond en erreur : l’erreur sera loguée pour reprise admin

8. Brancher le diagnostic partagé
À la fin du diagnostic partagé, quand `shared_diagnostics.status` passe à `completed` :
- récupérer les réponses validées dans `shared_diagnostic_answers`
- construire le payload HubSpot
- appeler `sync-hubspot-diagnostic`
- ne pas bloquer le formateur en cas d’erreur HubSpot : afficher un message léger et journaliser l’échec

9. Interface admin minimale
Ajouter dans l’admin un panneau de suivi “Synchronisations HubSpot” avec :
- date
- type de diagnostic
- statut
- score
- IDs HubSpot si disponibles
- erreur/warning si besoin

10. Tests et validation
- Tester le calcul de score.
- Tester le mapping Marianne.
- Tester le mapping diagnostic partagé.
- Tester les cas : contact existant par téléphone, email absent, entreprise introuvable, score >= 70.
- Vérifier les logs backend après appel de la fonction.

Résultat attendu

```text
Diagnostic terminé
  -> Backend ToFrance
    -> Normalise et valide les données
    -> Calcule score_qualification
    -> Upsert contact HubSpot
    -> Recherche entreprise par source_slug
    -> Crée deal HubSpot
    -> Associe contact + entreprise
    -> Journalise succès/échec
```

Je garderai la gestion des leads HubSpot comme source principale, tout en conservant les données locales nécessaires à l’audit, au diagnostic et au bon fonctionnement de ToFrance.