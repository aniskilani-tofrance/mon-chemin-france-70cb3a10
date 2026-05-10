
# Page de recrutement ToFrance — phase pilote

## Objectif
Créer une page publique `/recrutement` présentant les 3 stages ouverts pour la phase pilote, avec un ton startup à impact social, sobre et chaleureux, en réutilisant le design system existant (tokens HSL, composants shadcn, Header/Footer du site).

## Route
- Ajout de la route `/recrutement` dans `src/App.tsx` (lazy) → `src/pages/Recrutement.tsx`
- Ajout au sitemap `public/sitemap.xml`
- SEO via le composant existant `<SEO />` (titre + description optimisés, JSON-LD `JobPosting` x3 pour les 3 offres)

## Structure de la page (sections)

1. **Header** — réutilise `<Header />` existant
2. **Hero** — titre, sous-titre, paragraphe, 2 CTA (« Voir les postes » → ancre `#postes`, « Candidater » → ancre `#candidater`), badges (Stage 2-6 mois, Saint-Ouen / hybride, Début dès que possible, Impact social, IA · formation · emploi)
3. **Pourquoi ToFrance ?** — texte + grille de 5 cartes (Accès à la langue, Orientation formation, Parcours réfugiés, Reconnaissance des diplômes, Métiers en tension) avec icônes lucide
4. **Les 3 postes ouverts** (`#postes`) — 3 grandes cartes côte à côte (desktop) / empilées (mobile) :
   - Chargé(e) de projet pilote
   - UX / Produit no-code
   - Partenariats / Développement
   Chaque carte : titre, mission courte, liste missions, profil recherché, bouton « Candidater pour ce poste » (scroll vers `#candidater` + pré-remplit le poste)
5. **Ce que vous allez apprendre** — 6 cartes avec icônes
6. **Profil commun recherché** — texte + liste de qualités (chips/badges)
7. **Informations pratiques** — bloc structuré clair (Structure, Projet, Lieu, Format, Contrat, Durée, Début, Email)
8. **CTA final + Formulaire** (`#candidater`) — titre, texte, formulaire avec : prénom, nom, email, téléphone, poste choisi (Select), message, lien LinkedIn/portfolio, bouton envoyer + bouton secondaire `mailto:contact@parleremploi.fr` avec objet pré-rempli
9. **Footer** — réutilise `<Footer />`

## Formulaire — backend
Réutiliser la table `contact_requests` existante (déjà utilisée par `ContactForm`) en ajoutant un nouveau `request_type = "internship"` et en stockant les champs additionnels (poste, téléphone, lien) concaténés dans `message` pour éviter une migration. En complément : bouton mailto qui ouvre `contact@parleremploi.fr` avec objet `Candidature stage ToFrance – [poste]` et corps pré-rempli, garantissant un canal fonctionnel quoi qu'il arrive.

Validation zod côté client (nom 1-100, email valide, téléphone optionnel, poste obligatoire, message 10-2000, lien optionnel URL). Rate limit via `useRateLimit` existant.

## Design
- Tokens HSL existants (primary, accent, muted, background, card, border)
- Typo : conserver les fonts du site
- Cartes : variants `feature` / `elevated` du composant `Card` existant
- Animation légère au scroll : `AnimatedContainer` existant (fade-in + translate)
- Responsive : grilles `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, espacements généreux
- Pas d'emojis, icônes lucide-react uniquement (Languages, GraduationCap, Users, Award, Briefcase, Sparkles, MapPin, Clock, etc.)

## Fichiers
- **Créé** : `src/pages/Recrutement.tsx` (page complète, sections en composants internes pour rester lisible)
- **Édité** : `src/App.tsx` (ajout route lazy)
- **Édité** : `public/sitemap.xml` (ajout URL)

Aucun changement de logique métier ailleurs, aucune migration DB.
