## Refonte UX/UI Espace Formateur — diagnostic & plan

### Diagnostic actuel

L'espace formateur est fonctionnel mais a une UX de "menu d'admin" plutôt que d'outil métier moderne :

- **Coquille plate** : sidebar sans hiérarchie ni compteurs, header générique ("Espace Formateur" en dur), pas d'identité du formateur connecté.
- **Pas de page d'accueil** : on atterrit directement sur la liste brute des apprenants — aucun aperçu (KPIs, alertes, activité récente).
- **Actions noyées** : "Positionnement rapide", "Diagnostic rapide", "Importer", "Créer apprenant" — 4 boutons côte à côte en haut de la table, pas de priorisation visuelle.
- **Liste apprenants pauvre** : pas de recherche, pas de tri, pas de filtre par niveau/activité, pas de drill-down vers une fiche apprenant.
- **Navigation dispersée** : 7 onglets à plat (Apprenants, Diagnostic partagé, Diagnostic papier, Contenus, Assignations, Évaluations, AFEST) sans regroupement logique.
- **Cohérence visuelle** : chaque écran a son propre layout, pas de pattern réutilisable (titre + sous-titre + actions + contenu).

### Vision cible

Un cockpit formateur clair, en 3 zones :
1. **Sidebar regroupée** par activité (Vue, Apprenants, Outils, Suivi) + compteurs live.
2. **Header riche** : breadcrumb, recherche globale, profil + déconnexion en menu.
3. **Page d'accueil = tableau de bord** : KPIs, apprenants actifs, actions rapides contextualisées, derniers diagnostics/tests.

### Plan en 3 phases

#### Phase A — Coquille & navigation (haut impact, faible risque)

```
┌─────────────────────────────────────────────────────────────┐
│ [≡] Tableau de bord                  [🔍 Rechercher]  [👤▾]│ ← header riche
├──────────┬──────────────────────────────────────────────────┤
│ ToFrance │                                                  │
│ Formateur│   PAGE                                           │
│          │                                                  │
│ VUE      │                                                  │
│ ● Accueil│                                                  │
│          │                                                  │
│ APPRENANTS                                                  │
│ ○ Liste  │                                                  │
│   (12)   │                                                  │
│          │                                                  │
│ OUTILS   │                                                  │
│ ○ Diagno │                                                  │
│   partagé│                                                  │
│ ○ Diagno │                                                  │
│   papier │                                                  │
│ ○ Conten │                                                  │
│   us     │                                                  │
│          │                                                  │
│ SUIVI    │                                                  │
│ ○ Assign │                                                  │
│ ○ Évalu  │                                                  │
│ ○ AFEST  │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

- Sidebar : groupes labellés (`Vue`, `Apprenants`, `Outils`, `Suivi`), badges compteurs (nombre d'apprenants, évaluations en attente), logo ToFrance en haut, profil + déconnexion en footer.
- Header : titre dynamique selon la route (breadcrumb), bouton recherche apprenant (⌘K-style), menu profil avec nom + rôle + déconnexion.
- Route `/formateur` → nouveau `FormateurAccueil` (dashboard). La liste apprenants devient `/formateur/apprenants`.

#### Phase B — Dashboard d'accueil & fiche apprenant (cœur métier)

**Page d'accueil (`FormateurAccueil`)** :
- 4 KPIs en cartes : Apprenants suivis · Tests de positionnement (7j) · Diagnostics en cours · Évaluations à corriger.
- Bloc "Actions rapides" : 3 gros boutons — Créer un apprenant, Lancer un diagnostic, Générer un code de positionnement.
- Bloc "Activité récente" : 5 derniers événements (test soumis, diagnostic terminé, nouvel apprenant) avec lien direct.
- Bloc "Apprenants actifs cette semaine" (top 5 par XP/activité).

**Liste apprenants (`FormateurApprenants` refondu)** :
- Barre de filtres : recherche texte (nom/email), filtre niveau CECRL, filtre activité (actif 7j / inactif 30j / tous), tri (récent, alphabétique, XP).
- Vue tableau + vue carte (toggle).
- Ligne cliquable → ouvre une **fiche apprenant** en panel latéral (Sheet) : infos profil, niveau, historique tests, derniers diagnostics, bouton actions (nouveau test, nouveau diagnostic, voir progression).
- Actions secondaires (importer, créer) déplacées dans un menu "Ajouter ▾" en haut à droite.

#### Phase C — Polish des écrans existants

- **Contenus** : header pattern unifié + carte par module au lieu de liste plate.
- **Assignations** : statuts en pills colorées, regroupement par apprenant.
- **Évaluations** : file d'attente claire (à corriger / corrigées), tri par date.
- **AFEST** : timeline plutôt que table.

### Choix techniques

- 100 % composants `@/components/ui/*` existants (sidebar shadcn, sheet, command, badge, card).
- Aucune nouvelle dépendance.
- Tokens sémantiques HSL existants — pas de couleurs en dur.
- Routes inchangées sauf : `/formateur` → accueil, `/formateur/apprenants` → liste (redirect ancien pattern pour ne rien casser).

### Phasage proposé

Je commence par **Phase A + Phase B** dans cette itération (coquille + dashboard + liste apprenants modernisée + fiche apprenant en panel) — c'est ce qui transforme la perception. Phase C en itération suivante quand tu auras vu le rendu.

### Hors scope

- Pas de nouvelle feature métier (pas de nouveau type de diagnostic, pas de nouveau module).
- Pas de refonte du module FLE ou du test de positionnement (déjà traités).
- Pas de changement de modèle de données.
