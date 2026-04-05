

# Audit MVP — ToFrance

## Ce qui est déjà construit (acquis)

| Module | État | Détails |
|--------|------|---------|
| **Landing page** | ✅ Complet | Hero, features, CTA, SEO, footer |
| **Onboarding vocal Marianne** | ✅ Complet | Chat hybride, arbre de décision, TTS OpenAI, 6 langues, RTL arabe |
| **Scoring & orientation** | ✅ Complet | Score de qualification, parcours (FLE/Formation/Emploi/SAS), moteur d'orientation v2 |
| **Gestion des leads** | ✅ Complet | Matching automatique, profils, statuts détaillés (14 statuts), prix dynamique par score |
| **Partenaires (OF/Employeurs)** | ✅ Complet | Inscription, dashboard, achat leads, profil, Stripe paiement |
| **Admin** | ✅ Complet | Dashboard analytics, gestion users, leads, emails, rôles (admin/provider/user) |
| **Module FLE** | ✅ Structure | Tables DB, modules, exercices, progression, dialogue vocal |
| **Auth** | ✅ Complet | Login/signup, reset password, OAuth, routes protégées |
| **Conformité** | ✅ Complet | RGPD, consentements, mentions légales, page "mes données" |
| **i18n** | ✅ 6 langues | FR, EN, AR, ES, PT, RU |

## Ce qui manque pour un vrai MVP

### 1. Priorité haute — Expérience utilisateur post-onboarding

- **Email de confirmation automatique** : Après l'onboarding, l'utilisateur ne reçoit aucun email. Un email récapitulatif avec le parcours recommandé et les prochaines étapes est essentiel pour le MVP.
- **Page de confirmation enrichie** : La page `/confirmation` est basique. Ajouter un récapitulatif clair du parcours, un CTA vers l'inscription, et les contacts utiles.

### 2. Priorité haute — Contenu FLE réel

- Les tables `fle_modules` et `fle_exercises` existent mais sont probablement vides en base. Le module FLE ne fonctionne pas sans contenu seedé. Il faut au minimum 2-3 modules avec des exercices réels pour démontrer la valeur.

### 3. Priorité moyenne — Mobile & UX

- **Responsive testing** : Le parcours onboarding et le header doivent être vérifiés sur mobile (le logo agrandi peut poser problème).
- **Loading states** : Certaines pages manquent peut-être d'états de chargement cohérents.
- **Error handling vocal** : Que se passe-t-il si le micro est refusé ? Message clair à l'utilisateur.

### 4. Priorité moyenne — Fiabilité backend

- **Edge function match-leads** : Vérifier qu'elle fonctionne avec des partenaires réels en base.
- **Webhook Stripe** : Tester le flux complet achat lead → notification partenaire.
- **Rate limiting** : Le hook `useRateLimit` existe, vérifier qu'il est bien appliqué sur l'onboarding.

### 5. Priorité basse — Nice-to-have MVP

- **Notifications email partenaire** : Quand un nouveau lead matche, le partenaire devrait être notifié (edge function `notify-partner-lead` existe, vérifier le branchement).
- **Analytics dashboard** : Les events sont trackés, mais le dashboard admin pourrait afficher des métriques clés (taux de complétion onboarding, conversion).

---

## Prochaines améliorations recommandées (post-MVP)

1. **Email automatique post-onboarding** — Envoyer un récapitulatif via Resend après complétion
2. **Seed du contenu FLE** — Injecter 3 modules de base avec exercices pour démo
3. **Notification temps réel partenaires** — Alerter les partenaires quand un lead matche
4. **PWA / mode offline** — Pour les utilisateurs avec connexion instable
5. **Dashboard utilisateur enrichi** — Suivi de la progression, historique, documents

