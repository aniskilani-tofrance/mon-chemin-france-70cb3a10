## Email de résultats — maquettes HTML et schéma de données

Email transactionnel envoyé automatiquement à `candidate_email` juste après la soumission du test (idempotent : un seul envoi par `test_results.id`). Un bouton "Recevoir par email" sur la page résultats déclenche aussi un renvoi (même payload).

### Schéma de données (payload du template)

Données passées en `templateData` à `send-transactional-email` (template `placement-test-results`) :

```ts
type PlacementResultsEmailData = {
  // Identité candidat
  candidateName: string;            // "Marie Dupont"
  candidateEmail: string;           // destinataire (déjà dans recipientEmail)

  // Résultat principal
  level: "A1" | "A2" | "B1" | "B2"; // niveau CECRL atteint
  levelLabel: string;               // "Élémentaire", "Intermédiaire"…
  levelDescription: string;         // phrase pédagogique courte
  score: number;                    // 0-100
  durationMinutes: number;          // arrondi minute
  completedAt: string;              // ISO ou "12 mai 2026 à 14h32"

  // Détail par compétence (4-5 catégories agrégées)
  competences: Array<{
    label: string;                  // "Compréhension écrite"
    score: number;                  // 0-100
  }>;

  // Recommandations pédagogiques (3 items max, déjà mappés au niveau)
  recommendations: string[];        // ex: "Pratiquer la lecture quotidienne"

  // Liens utiles
  resultsUrl: string;               // /placement-test/results?id=<uuid> (relecture en ligne)
  pdfUrl?: string;                  // optionnel — sinon bouton "télécharger" dans l'app
  trainerName?: string;             // si test lancé par un formateur

  // Footer
  siteName: string;                 // baked-in côté template ("PEF — ToFrance")
};
```

Clé d'idempotence : `placement-results-${test_results.id}`. Pas besoin de nouvelle table — l'envoi est tracé dans `email_send_log` (créé par l'infra emails).

### Maquette HTML — version desktop/mobile (responsive single-column)

Structure React Email (`_shared/transactional-email-templates/placement-test-results.tsx`), rendu en HTML inline-style. Aperçu visuel :

```text
┌───────────────────────────────────────────────┐
│                  [Logo PEF]                   │
├───────────────────────────────────────────────┤
│                                               │
│   Bonjour Marie,                              │
│                                               │
│   Voici les résultats de votre test           │
│   de positionnement.                          │
│                                               │
│   ┌─────────────────────────────────────┐    │
│   │            NIVEAU CECRL              │    │
│   │                                      │    │
│   │             ┌─────┐                  │    │
│   │             │ B1  │                  │    │
│   │             └─────┘                  │    │
│   │          Intermédiaire               │    │
│   │                                      │    │
│   │   Vous pouvez vous débrouiller       │    │
│   │   dans la plupart des situations…    │    │
│   └─────────────────────────────────────┘    │
│                                               │
│   Score global :  72 / 100                    │
│   Durée :         18 min                      │
│   Passé le :      12 mai 2026                 │
│                                               │
│   ─── Détail par compétence ───               │
│                                               │
│   Compréhension orale     ████████░░  78 %   │
│   Compréhension écrite    ███████░░░  70 %   │
│   Production écrite       ██████░░░░  65 %   │
│   Grammaire / lexique     ███████░░░  72 %   │
│                                               │
│   ─── Nos recommandations ───                 │
│                                               │
│   •  Pratiquer la lecture quotidienne         │
│   •  Suivre un module FLE niveau B1           │
│   •  Échanger à l'oral 15 min / jour          │
│                                               │
│   ┌────────────────────────────────┐         │
│   │   Voir mes résultats en ligne  │         │
│   └────────────────────────────────┘         │
│                                               │
│   Test lancé par : Sophie Martin              │
│                                               │
│   ─────────────────────────────────────       │
│   PEF — Plateforme d'Évaluation du Français   │
│   Document non officiel à valeur indicative   │
│   [unsubscribe — ajouté automatiquement]      │
└───────────────────────────────────────────────┘
```

### Choix visuels

- **Fond Body** : `#ffffff` (règle email).
- **Conteneur** : largeur max 600 px, padding 32 px, fond `#f8fafa` (cohérent avec l'app).
- **Couleurs marque** : `#00504e` (titres/CTA), `#17c3b2` (accent badge niveau, barres compétences).
- **Police** : `Arial, Helvetica, sans-serif` (compat clients email — pas de fonts custom).
- **Badge niveau CECRL** : carré arrondi 80×80, fond gradient `#00504e → #17c3b2`, texte blanc 32 px bold.
- **Barres compétences** : `<table>` 2 colonnes (label / barre + %) — pas de flexbox (Outlook).
- **Bouton CTA** : padding 14×28, fond `#00504e`, texte blanc, radius 8.
- **Pas inclus** : pas de tableau question-par-question, pas de logo SIRET, pas de watermark "officiel" (cohérent décisions Phase 1).
- **Footer système** : unsubscribe ajouté automatiquement par l'infra, ne pas le coder.

### Sujet d'email

Fonction subject :
```ts
subject: (d) => `Votre niveau de français : ${d.level} (${d.levelLabel})`
```

Fallback statique : `"Vos résultats du test de positionnement PEF"`.

### Preview text (Preview component)

`Niveau ${level} — score ${score}/100. Voici vos recommandations.`

### Trigger côté app

1. **Auto-envoi** dans `PlacementTest.tsx` → `handleSubmit`, juste après insertion dans `test_results`, avec `idempotencyKey: placement-results-${data.id}`.
2. **Renvoi manuel** depuis le bouton existant "Recevoir par email" de `PlacementTestResults.tsx` (même payload, même clé → pas de doublon).

### Pré-requis bloquant

L'envoi nécessite un domaine email validé. Une fois le domaine ajouté :
1. `setup_email_infra` (création queues + log)
2. `scaffold_transactional_email` (génère `send-transactional-email`)
3. Création du template `placement-test-results.tsx` avec ce schéma
4. Déploiement edge function + branchement des deux triggers

Cette plan ne touche à aucun code tant que le domaine n'est pas configuré — il fige la spec maquette + schéma pour validation.
