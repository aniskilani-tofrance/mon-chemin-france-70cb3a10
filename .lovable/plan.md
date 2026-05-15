# ToFrance — Boussole multilingue + rappel humain sous 48h

## Promesse centrale
**"Je suis perdu" → "Voici mon prochain pas".**
Diagnostic court multilingue → orientation automatique → **rappel humain sous 48h par un conseiller parlant la langue de la personne.**

L'IA comprend et structure. L'humain accompagne. La personne ne reste jamais seule devant un écran.

---

## 1. Page d'accueil (`/`) — refonte

Remplacer la home actuelle (3 CTA, sections employeurs) par une home mono-message centrée sur la promesse humaine.

**Contenu :**
- **Sélecteur de langue** visible en haut, immédiat
- **H1** : « Vous ne savez pas par où commencer en France ? »
- **Sous-titre** : « ToFrance vous aide à comprendre votre besoin, dans votre langue. Puis un conseiller vous rappelle sous 48h pour vous orienter vers le bon parcours. »
- **CTA principal unique** : « Commencer mon orientation » → `/orientation`
- **Bandeau de réassurance** sous le CTA :
  - « Gratuit · Confidentiel · Dans votre langue »
  - « Vous n'êtes pas seul·e. Après votre diagnostic, une personne vous rappelle pour vous accompagner. »
- **3 mini-cards** (icônes Lucide, sobres) : Diagnostic 5 min · Rappel sous 48h · Orientation vers le bon parcours
- **Bandeau partenaires** discret
- Sections employeurs / code d'accès / features avancées → déplacées vers `/partenaires`

## 2. Parcours « Orientation » (`/orientation`)

Nouveau parcours simple, conversationnel mais épuré, **10 à 14 questions max**, une par écran.

**Étapes :**
1. Confirmation langue (déjà choisie sur la home)
2. Ville / code postal
3. **Besoin principal** (question pivot, choix unique illustré) :
   - Apprendre le français
   - Travailler rapidement
   - Faire une formation métier
   - Faire reconnaître mon diplôme / valoriser mon expérience
   - Aide pour des démarches
   - Aide avec le numérique
   - Je ne sais pas par où commencer
4. Niveau de français ressenti (4 niveaux simples avec icônes)
5. Lecture / écriture en français (oui / un peu / non)
6. Expérience professionnelle (1 champ libre court ou « jamais travaillé »)
7. Diplôme dans le pays d'origine (oui / non / je ne sais pas)
8. Disponibilité (matin / après-midi / soir / week-end — multi)
9. Mobilité (à pied / transports / voiture / limitée)
10. Freins ressentis (multi-choix optionnel : logement, garde d'enfants, santé, papiers, transport, aucun)
11. Prénom + téléphone / WhatsApp
12. **Consentement rappel sous 48h** (case obligatoire pour finaliser)
13. **Consentement transmission partenaire** (case optionnelle, claire)

Règles UX : langage A1-A2, « Je ne sais pas » partout, retour visible, mobile-first, RTL pour l'arabe.

## 3. Moteur d'orientation — 6 parcours

À la fin, ToFrance affiche **un parcours recommandé** (et éventuellement un parcours secondaire si frein bloquant).

| Déclencheur | Parcours |
|---|---|
| « Apprendre le français » OU niveau « ne parle pas / quelques mots » | **Français** (FLE / Alpha / A1 / A2 / FR pro / préparation emploi) |
| « Travailler rapidement » + français suffisant | **Emploi** (métiers accessibles, métiers en tension, insertion) |
| « Faire une formation » | **Formation métier** (TP, CQP, qualifiante, courte, remise à niveau) |
| « Reconnaître mon diplôme » OU diplôme oui + objectif emploi/formation | **Diplôme étranger** (ENIC-NARIC, équivalence, passerelle, BPI/AGIR) |
| Frein bloquant (logement, papiers, santé) | **Social/Administratif** (en parcours prioritaire complémentaire) |
| « Aide numérique » | **Numérique** (FranceConnect, Pôle Emploi, ateliers) |

**Règles :**
- Frein bloquant → parcours Social affiché en premier, parcours principal en second
- « Ne parle pas » + objectif emploi → Français en priorité, Emploi en perspective
- Le **test FLE** et le **diagnostic pro partagé** ne sont **jamais la porte d'entrée**. Ils interviennent uniquement après orientation, comme « approfondir mon diagnostic », et seulement si pertinents pour le parcours retenu.

## 4. Écran de résultat (`/orientation/resultat`)

Pour la personne :
- **Reformulation humaine de son besoin** : « Vous voulez d'abord apprendre le français pour pouvoir travailler. »
- **Carte parcours recommandé** (illustrée, couleur, picto)
- **Prochain pas concret** : généralement « Être rappelé·e par un conseiller »
- **Confirmation du rappel** (encadré rassurant, vert doux) :
  > « Merci. Votre demande a bien été reçue. Un conseiller parlant votre langue vous rappellera sous 48h pour vous aider à avancer vers le bon parcours. »
- Action secondaire : « Recevoir mon diagnostic par email / SMS »

## 5. Modules spécialisés (en aval, jamais en entrée)

Conservés mais déplacés après l'orientation :
- **Test FLE de positionnement** — déclenché si parcours Français OU si français bloque emploi/formation OU si demandé par un partenaire
- **Diagnostic professionnel partagé** — déclenché si parcours Emploi / Formation / Diplôme
- **Reconnaissance de diplôme** — fiche ENIC-NARIC + checklist
- **Freins sociaux** — annuaire de structures locales par code postal
- **Numérique** — tutoriels démarches en ligne

Ces modules existent déjà (`FLEPlacement`, `SharedDiagnostic`) — on les garde, on les déplace.

## 6. Espace conseiller / partenaire — fiche bénéficiaire

Vue par défaut simplifiée, une seule colonne, lisible :
- Identité (prénom, langue, ville)
- Contact (téléphone / WhatsApp / email)
- Besoin principal + parcours recommandé
- Niveau français estimé · lecture/écriture
- Expérience · diplôme · mobilité · disponibilité · freins
- Consentements (rappel · transmission partenaire)
- **Statut de suivi** (workflow ci-dessous)
- **Notes du conseiller** (champ libre, historique)

**Statuts de suivi (workflow) :**
`Nouveau diagnostic → À rappeler → Contacté → Besoin confirmé → Orienté → RDV proposé → Inscrit → En formation → En accompagnement → En emploi → À relancer → Frein identifié → Sortie positive → Dossier clôturé`

Les vues actuelles complexes (scoring, tags techniques, lead score) sont conservées mais repliées dans « Détails avancés ».

## 7. Notification & relais humain (rappel 48h)

À la soumission du diagnostic :
- Création de la fiche bénéficiaire avec statut **« À rappeler »**
- Email + Slack au pool de conseillers correspondant à la langue
- SMS de confirmation à la personne (gabarit court multilingue) : « Merci, un conseiller vous rappelle sous 48h. »
- Tableau conseiller `/conseiller` filtrable par langue, ville, ancienneté → bouton « Marquer contacté » qui horodate

## 8. Ce qui est conservé / mis en pause

**Conservé :** auth, Lovable Cloud, profils, traductions, modules FLE, diagnostic pro, espace partenaire, HubSpot sync, Resend, TTS Marianne (option « Préférez-vous parler ? »).

**Mis en pause de l'entrée principale :**
- Marianne vocale comme porte d'entrée (devient option, pas défaut)
- Sections marketing employeurs sur la home
- Code d'accès pilote (déplacé vers `/partenaires`)
- Scoring lead complexe visible côté user
- 3 CTA concurrents sur le hero

## 9. Détails techniques (équipe dev)

- Nouvelle route `/orientation` ; `/onboarding` reste accessible pour pilotes
- Composants à créer :
  - `src/components/Orientation/OrientationFlow.tsx` (réutilise `DecisionQuestion`, `LanguageStep`, `ConsentStep`)
  - `src/components/Orientation/CallbackConfirmation.tsx`
  - `src/components/Conseiller/BeneficiaryCardSimple.tsx`
  - `src/components/Conseiller/StatusWorkflow.tsx`
- Logique :
  - `src/lib/orientationTreeSimple.ts` (10–14 questions)
  - `src/lib/orientationRouter.ts` (6 parcours + règles de priorité)
- Pages :
  - `src/pages/Orientation.tsx`, `src/pages/OrientationResult.tsx`
  - `src/pages/ConseillerDashboard.tsx` (file d'attente « À rappeler »)
- Refonte `src/components/HeroSection.tsx` (mono-message + promesse rappel 48h)
- Migration DB sur `onboarding_results` (ou `profiles`) :
  - `recommended_path` enum (`francais`, `emploi`, `formation`, `diplome`, `social`, `numerique`)
  - `secondary_path` enum nullable
  - `follow_up_status` enum (14 statuts)
  - `callback_consent` boolean, `callback_requested_at` timestamp
  - `callback_done_at`, `assigned_advisor_id` nullable
  - `advisor_notes` text
- Edge function `notify-advisor-callback` : email + Slack + SMS Twilio si dispo
- Pas de nouveau service externe obligatoire (Twilio optionnel)

## 10. Hors scope (plus tard)

IA conversationnelle libre, scoring prédictif, recommandations dynamiques, intégrations supplémentaires, application mobile dédiée. **D'abord prouver la valeur sur le terrain.**

---

**Livrable v1 :**
1. Home recentrée avec promesse rappel 48h
2. Parcours `/orientation` 10–14 questions
3. Moteur 6 parcours
4. Écran résultat + confirmation rappel
5. Notification conseiller + dashboard `/conseiller`
6. Fiche bénéficiaire simplifiée + 14 statuts de suivi
