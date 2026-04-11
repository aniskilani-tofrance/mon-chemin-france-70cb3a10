

# Plan : Cahier des Charges ToFrance (.docx)

## Objectif
Générer un document Word professionnel et complet, destiné à un prestataire technique externe, documentant l'intégralité de la plateforme ToFrance avec une attention particulière sur le module Onboarding vocal (à repenser).

## Structure du document

Le cahier des charges couvrira :

1. **Page de garde** - Logo, titre, version, date, destinataire
2. **Sommaire**
3. **Présentation générale** - Vision, contexte, public cible (primo-arrivants), objectifs business
4. **Architecture technique** - Stack (React/Vite/Tailwind/TypeScript/Supabase), hébergement, i18n (6 langues + RTL arabe)
5. **Rôles et permissions** - 5 rôles (admin, directeur, formateur, provider, user), matrice RBAC, RLS policies
6. **Modèle de données** - Schéma complet des 22 tables avec relations, enums, fonctions DB
7. **Module par module :**
   - **Landing page** - Sections, SEO, CTA
   - **Onboarding vocal (A REPENSER)** - Flow actuel (Marianne conversationnel + decision tree), problèmes identifiés, axes d'amélioration proposés
   - **Module FLE** - 30 modules, 14 types d'exercices, progression CECRL, adaptive learning, badges, spaced repetition, dialogue, offline
   - **Dashboard apprenant** - Profil, parcours, progression FLE, résultats onboarding
   - **Dashboard formateur** - 5 onglets (apprenants, contenus, assignations, évaluations audio, AFEST)
   - **Dashboard directeur** - Vue globale apprenants, progression, résultats onboarding, filtre formateur
   - **Dashboard admin** - Analytics, gestion users/rôles, leads, contact requests, FLE progress
   - **Marketplace leads/partenaires** - Providers, trainings, sessions, matching, Stripe payments
   - **Test de positionnement** - 71 questions A1-C2, cooldown 3 mois, mode formateur
   - **Authentification** - Email/password, Google OAuth, redirection par rôle
8. **Intégrations externes** - OpenAI (TTS + chat), Stripe (paiements), Resend (emails)
9. **Edge Functions** - 13 fonctions serverless documentées
10. **Points d'amélioration et recommandations** - Focus onboarding vocal : fiabilité TTS, simplification du flow, UX mobile

## Implémentation technique

- Script Node.js utilisant la bibliothèque `docx` pour générer le .docx
- Mise en page professionnelle : couleurs ToFrance (vert #00504e / turquoise #17c3b2), typographie Arial
- Tables pour le modèle de données et la matrice de rôles
- Section "A repenser" en encadré coloré pour l'onboarding vocal
- Export vers `/mnt/documents/cahier-des-charges-tofrance.docx`
- QA visuelle via conversion PDF + images

## Estimation
~40-60 pages, généré en un seul script.

