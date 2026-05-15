## 🌍 Sélecteur de langue avant la homepage

**Objectif** : Le primo-arrivant choisit sa langue **avant** de voir la homepage, et toute la home s'affiche dans cette langue.

### 1. Nouvelle page d'accueil de langue (`/`)

Créer `src/pages/LanguageGate.tsx` montée sur `/` :
- Plein écran, fond sobre (gradient doux + logo ToFrance centré).
- Titre court répété dans 6 langues en rotation ou en liste : *« Choisissez votre langue / اختر لغتك / Choose your language / Elija su idioma / Escolha o seu idioma / Выберите язык »*.
- Grille de **6 grands boutons-drapeaux** : 🇫🇷 Français · 🇬🇧 English · 🇸🇦 العربية · 🇪🇸 Español · 🇵🇹 Português · 🇷🇺 Русский.
- Au clic : `setLanguage(code)` (hook existant `useLanguage`) + `localStorage` (déjà géré) + redirection vers `/home`.
- Lien discret en bas : *« Passer / Skip »* → `/home` en français.

### 2. Déplacer la homepage actuelle vers `/home`

- Le composant `Index.tsx` (Hero + sections) devient la route `/home`.
- `/` rend désormais `LanguageGate`.
- Header/Footer **non affichés** sur la language gate (immersif, sans distraction).

### 3. Logique « première visite »

- Si `localStorage.tofrance.language` existe → `/` redirige automatiquement vers `/home` (l'utilisateur ne revoit pas la gate).
- Si absent → la gate s'affiche.
- Bouton « Changer de langue » reste accessible via le `LanguageSelector` du Header sur toutes les autres pages.

### 4. Traduire la homepage (Hero + sections)

Aujourd'hui `HeroSection.tsx` et plusieurs sections (`EmployersSection`, `HowItWorksSection`, `FeaturesSection`, `CTASection`) contiennent du **texte en dur en français**. Pour que le choix de langue ait un vrai effet :
- Ajouter les clés manquantes dans `src/i18n/locales/{fr,en,ar,es,pt,ru}.json` :
  - `home.hero.badge`, `home.hero.title`, `home.hero.subtitle`, `home.hero.cta`, `home.hero.reassurance.*` (3 cartes), `home.hero.notAlone`.
  - Idem pour les autres sections de la home.
- Remplacer les chaînes en dur par `useTranslation()` / `t("...")`.
- RTL : déjà géré dans `useLanguage` (`dir="rtl"` pour l'arabe).

### 5. Routing (`src/App.tsx`)

```text
/             → LanguageGate (ou redirect vers /home si langue déjà choisie)
/home         → Index (homepage actuelle)
/orientation  → inchangé
... reste inchangé
```

### Détails techniques

- Pas de nouvelle dépendance.
- Pas de changement DB ni edge function.
- Tests à mettre à jour si certains pointent sur `/` pour la home.
- SEO : `LanguageGate` reçoit un `<SEO>` neutre (title bilingue), `/home` garde le SEO actuel + `hreflang` futur (hors scope ici).

### Hors scope

- Détection automatique de la langue navigateur (peut être ajouté ensuite comme suggestion par défaut sur la gate).
- Traduction des pages internes autres que la home (déjà partiellement faites via `t.*`).
