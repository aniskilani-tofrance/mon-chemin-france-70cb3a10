## Audit UI ToFrance — Plan de correction P1

Le brief identifie 5 correctifs P1. Voici comment les traiter dans la stack actuelle (Vite + React SPA + Lovable Cloud).

### Correctif 1 — `twitter:site = @Lovable` (Critique, < 5 min)
**Fichier** : `index.html` lignes 21-22
- Remplacer `content="@Lovable"` par `content="@tofrance_life"` sur `twitter:site`
- Ajouter `<meta name="twitter:creator" content="@tofrance_life" />`

### Correctif 2 — OG image sur URL Google Storage signée expirant le 28/07/2026 (Critique)
**Fichier** : `index.html` lignes 18 et 22
- Générer une image OG ToFrance (1200×630, PNG) via `imagegen` → `public/og-tofrance.png`
- Remplacer les deux URLs Google Storage par `https://tofrance.life/og-tofrance.png`
- Ajouter `og:image:width`, `og:image:height`, `og:image:alt`

### Correctif 3 — `meta author = "Bienvenue"` (Majeur, < 2 min)
**Fichier** : `index.html` ligne 13
- Remplacer par `<meta name="author" content="ToFrance" />`

### Correctif 4 — Support RTL pour l'arabe (Critique)
**Fichiers** : `src/hooks/useLanguage.tsx`, `src/index.css`, `index.html`
- Dans `useLanguage`, à chaque changement de langue : `document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"` et `document.documentElement.lang = lang`
- Ajouter dans `src/index.css` :
  - Police arabe : `@import` Noto Sans Arabic + sélecteur `[lang="ar"] { font-family: 'Noto Sans Arabic', ... }`
  - Quelques utilitaires logiques pour le chat Marianne si besoin (alignement basé sur `dir`)
- Tailwind v3 supporte déjà bien les propriétés logiques modernes via classes standard ; on ne refactor pas tout, on s'appuie sur `dir="rtl"` qui inverse `flex-row` en RTL natif et on ajoute des overrides ciblés pour le `Header` et le `ChatOnboarding` si visuellement cassés.

### Correctif 5 — SPA invisible aux crawlers (Stratégique, 1-2j)
**Hors scope frontend court-terme** : un vrai pré-rendu (`vite-plugin-prerender` / `react-snap`) demande une intégration build non triviale dans Lovable. Actions immédiates applicables maintenant :
- Vérifier que `public/sitemap.xml` existe (déjà présent) et est à jour
- Enrichir `index.html` avec un fallback `<noscript>` contenant H1 + description courte ToFrance, pour que les crawlers basiques voient au moins du contenu sémantique
- Le pré-rendu complet sera proposé en suivi séparé

### Hors plan
Pas de changement business logic, pas de refactor des composants UI au-delà de ce qui est nécessaire pour le RTL.

### Validation
- Inspection `index.html` après build
- Bascule en arabe dans l'app pour vérifier `dir="rtl"` et la lisibilité
- Test partage sur opengraph.xyz (côté utilisateur, après publish)
