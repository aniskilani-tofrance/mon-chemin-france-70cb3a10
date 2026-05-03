---
name: Renommage UI lead → profil
description: Toute l'UI visible utilisateur (apprenant, CIP, formateur, directeur, partenaire) dit "profil" au lieu de "lead". "lead" reste uniquement dans le code interne, types TS, colonnes DB, edge functions et logs techniques.
type: preference
---

## Périmètre appliqué (V1.3)

UI renommée `lead → profil` :
- i18n (fr/en/es/pt) : `completion.scoreQualified`, `scoreToComplete`, `scoreToQualify`
- Pages partenaires : `PartnersInfo`, `PartnerSignup`, `PartnerProfile`, `PartnerDashboard`, `Partners`, `ContactForm`
- Admin : `AdminLeadsManager` (titres, dialog, toast), `AdminHubSpotLeads` (titre, SEO, csv, placeholders), `AdminFLEProgress` (Score profil), `AdminEmailPreview`
- Toasts realtime : "Nouveau profil Premium/Standard/Éco"
- Export CSV → `profils-tofrance-*.csv`, `profils-hubspot-*.csv`

## Ce qui reste "lead" (intentionnel)
- Noms de variables, fonctions, hooks (`leadId`, `leadScore`, `leadRoute`, `leads.map`)
- Colonnes DB et types : `leads`, `lead_score`, `lead_route`, `statut_lead`, `consent_type='lead_sharing'`
- Edge functions : `match-leads`, `verify-lead-payment`, `create-lead-payment`, `notify-partner-lead`, `slack-lead-reminders`, `admin-hubspot-leads`
- Routes URL admin : `/admin/leads` (compat back-office)
- Pitch B2B investisseurs (`Pitch.tsx`) : KPIs commerciaux conservent "leads/mois" (langage métier)
- Composants nommés : `LeadCard`, `PartnerLeadForm`, `AdminLeadsManager`
