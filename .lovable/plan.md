## Objectif

Garantir que chaque Deal HubSpot créé par `sync-hubspot-diagnostic` est associé à la bonne Company en se basant sur `source_slug`, en auto-créant la Company si elle n'existe pas encore côté HubSpot, et en associant aussi le Contact à cette Company.

## État actuel

Dans `supabase/functions/sync-hubspot-diagnostic/index.ts` :
- Une recherche est déjà faite : `searchObject("companies", "source_slug", payload.source_slug, …)` (ligne 669).
- Si la Company existe → le Deal est associé via `associationTypeId: 5` (deal→company).
- Si elle n'existe pas → log warning + note HubSpot + email admin, mais **le Deal n'a aucune Company**.
- Le Contact n'est jamais associé à la Company.

## Changements

### 1. Nouvelle fonction `findOrCreateCompanyBySlug(payload)`

- Cherche la Company via `source_slug` (existant).
- Si trouvée → retourne `{ id, created: false }`.
- Si non trouvée et `payload.source_slug` présent → crée une Company avec :
  - `name` = `payload.source_name || payload.source_location || payload.source_slug`
  - `source_slug` = `payload.source_slug`
  - `source_type` = mappé via `SOURCE_TYPE_MAP` si dispo
  - `source_campaign`, `source_location_id` si présents
  - Propriétés filtrées via `filterValidProperties("companies", …)` pour rester safe.
- Retourne `{ id, created: true }`.
- Si pas de `source_slug` → retourne `null` (comportement actuel : warning + note).

### 2. Association Contact ↔ Company

Après upsert du Contact et résolution de la Company :
- Appel `PUT /crm/v3/objects/contacts/{contactId}/associations/companies/{companyId}/279` (type primaire contact→company).
- Idempotent côté HubSpot, no-op si déjà associé.

### 3. Création du Deal

`createDeal` continue d'inclure l'association deal→company (`associationTypeId: 5`) quand `companyId` est fourni — déjà le cas, aucun changement.

### 4. Logging et statut

- Si Company créée automatiquement → log `info` (`company_auto_created: true`) dans `sync_logs.payload_summary`, status reste `success`.
- Si `source_slug` absent → comportement actuel conservé (status `warning`, note, email admin).
- L'erreur de création Company est non-bloquante : on logue, on continue avec `companyId = null` pour ne pas casser la synchro du Deal.

### 5. Test manuel

Après déploiement : appeler `sync-hubspot-diagnostic` sur un diagnostic récent dont le `source_slug` ne correspond à aucune Company existante, vérifier dans HubSpot :
- Company créée avec le bon `source_slug`.
- Contact lié à la Company.
- Deal lié à la Company.

## Fichier touché

- `supabase/functions/sync-hubspot-diagnostic/index.ts`
