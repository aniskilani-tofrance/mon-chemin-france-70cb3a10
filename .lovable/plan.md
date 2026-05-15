## PDF sobre — refonte 3 pages

Refonte de `src/lib/placementTestPDF.ts` : passage du PDF actuel (1 page dense) à un livret **3 pages** clair, sans mention juridique ni filigrane, avec un rythme aéré et un fil pédagogique.

### Structure cible

```
┌──────────────────────────────────────────┐
│  PAGE 1 — Niveau CECRL                   │
│  ─────────────────────                   │
│  Bandeau marque + logo PEF               │
│  Bloc identité (candidat, date, durée)   │
│                                          │
│         ┌─────────────┐                  │
│         │     B1      │  ← badge XL      │
│         └─────────────┘                  │
│           Intermédiaire                  │
│                                          │
│  Description longue du niveau            │
│  (3-4 phrases : ce que sait faire        │
│  le candidat, situations couvertes)      │
│                                          │
│  Repère sur l'échelle A1 → C2            │
│  ─●─○─○─○─○─○                            │
│                                          │
│  Score global : 72 %                     │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  PAGE 2 — Analyse par catégorie          │
│  ──────────────────────────              │
│  Une carte par catégorie (4-6) :         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ Compréhension orale         78 %   │ │
│  │ ████████░░                          │ │
│  │ Vous comprenez les messages         │ │
│  │ courants en situation quotidienne.  │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │ Production écrite           65 %   │ │
│  │ ██████░░░░                          │ │
│  │ Quelques structures à consolider.   │ │
│  └────────────────────────────────────┘ │
│  …                                       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  PAGE 3 — Recommandations                │
│  ────────────────────                    │
│  3 priorités numérotées :                │
│                                          │
│  ❶  Pratiquer la lecture quotidienne     │
│     2-3 lignes d'explication concrète    │
│                                          │
│  ❷  Renforcer la production orale        │
│     2-3 lignes d'explication             │
│                                          │
│  ❸  Travailler la grammaire seuil B1     │
│     2-3 lignes d'explication             │
│                                          │
│  Encadré « Prochaine étape »             │
│  Suggestion de module FLE adapté         │
└──────────────────────────────────────────┘

Footer sobre sur chaque page : "PEF — ToFrance · Page X/3"
Pas de disclaimer juridique, pas de filigrane.
```

### Choix éditoriaux

- **Suppression** du paragraphe « ne constitue pas une certification officielle… » et de la ligne décorative qui l'introduisait.
- **Suppression** de la mention « bilan indicatif » dans le footer.
- **Ton** : direct, factuel, orienté action — pas de juridique, pas de marketing.
- **Trois pages forcées** via `doc.addPage()` (pas de coupure organique) pour un livret lisible.

### Détails techniques

- Lib existante : `jspdf` (déjà installée, pas de nouvelle dépendance).
- Palette inchangée : `#00504e` (marque), `#17c3b2` (accent), barres tricolores (vert ≥70, ambre 40-69, rouge <40).
- **Page 1** :
  - Bandeau marque hauteur 36 pt + bloc identité.
  - Badge niveau : carré arrondi 120×120 pt centré, gradient via 2 rectangles superposés (jspdf ne fait pas de vrai gradient, on simule par un fond plein + accent).
  - Description longue niveau : nouveau dictionnaire `LEVEL_LONG_DESCRIPTIONS` (3-4 phrases par niveau A1→C2).
  - Échelle visuelle CECRL : 6 cercles alignés, celui du niveau atteint rempli en `#00504e`, les autres en gris.
  - Score global en bas de page.
- **Page 2** :
  - Titre « Analyse par compétence ».
  - Boucle sur les catégories agrégées depuis `data.answers` (Map<category, {correct,total}>).
  - Chaque carte : `roundedRect` fond `#ffffff` + bordure `#e5e9e9`, label + score à droite, barre fine, courte phrase contextuelle générée par règle (`pct ≥ 70` → maîtrise, `40-69` → consolidation, `<40` → à travailler).
  - Si > 6 catégories : continuer sur page 2bis automatiquement.
- **Page 3** :
  - Titre « Recommandations ».
  - Nouveau dictionnaire `RECOMMENDATIONS_DETAILED` : 3 items par niveau, chacun avec `title` + `body` (2-3 lignes).
  - Encadré final « Prochaine étape » : suggestion module FLE selon niveau (mapping simple).
- **Footer** uniforme via boucle `getNumberOfPages` : `"PEF — ToFrance"` à gauche, `"Page X / Y"` à droite. Plus de disclaimer.
- Conservation de la signature `generatePlacementTestPDF(data: PDFData): Promise<Blob>` — pas d'impact sur les appelants (bouton « Télécharger le PDF » de `PlacementTestResults.tsx`).

### QA visuelle obligatoire

Après génération : convertir le PDF en images avec `pdftoppm`, inspecter chaque page (overlap, débordement, page blanche, badge tronqué) et corriger avant livraison. Les images de QA sont temporaires (`/tmp`), pas livrées.

### Hors scope

- Pas de modification de l'email (sujet du chantier précédent).
- Pas d'ajout de tableau question-par-question (décision Phase 1 confirmée).
- Pas de génération côté serveur — reste 100 % client (download immédiat).
