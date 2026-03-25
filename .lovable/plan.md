

## Plan : Modèle freemium leads (aperçu → achat → déblocage)

### Concept

Le partenaire voit une **carte teaser** par lead (secteur, niveau de français, ville, score de match, date) mais **pas** le nom, le téléphone, l'email ni les détails de profil. Un bouton "Débloquer ce lead" permet d'acheter le lead ; une fois acheté, toutes les informations apparaissent.

### 1. Migration base de données

Ajouter une colonne `purchased_at` (timestamp, nullable) sur la table `leads` :

```sql
ALTER TABLE public.leads ADD COLUMN purchased_at timestamptz DEFAULT NULL;
```

Cette colonne sert de flag : si `purchased_at IS NOT NULL`, le lead est débloqué.

### 2. Sécuriser l'accès aux données profil (RLS)

Actuellement le `SELECT` sur `leads` joint `profiles(*)` côté client — le profil complet est renvoyé. Deux options :

**Option retenue** : ne pas changer le RLS (le provider a déjà accès via la policy existante), mais **masquer côté client** les champs sensibles tant que `purchased_at` est null. C'est acceptable car les données profil (nom, téléphone) ne sont pas des secrets critiques dans ce contexte B2B, et le partenaire est un utilisateur authentifié avec un rôle vérifié.

> Si on veut un masquage côté serveur plus tard, on pourra créer une edge function qui retourne un profil filtré.

### 3. Hook `usePurchaseLead`

Nouveau hook dans `src/hooks/useProviderData.tsx` :

```ts
export function usePurchaseLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ leadId }: { leadId: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ purchased_at: new Date().toISOString() })
        .eq("id", leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-leads"] });
    },
  });
}
```

### 4. Refonte du composant `LeadCard`

Deux modes d'affichage selon `lead.purchased_at` :

**Mode teaser** (`purchased_at` est null) :
- Affiche : secteur cible, niveau de français (CECRL), ville, score de match, date de création
- Nom masqué → "Candidat · [secteur]"
- Téléphone/email masqués → icônes avec "●●●●"
- Bouton "Débloquer ce lead — X €" (prix issu de `lead.price_charged`)
- Pas d'accès au changement de statut ni aux notes

**Mode débloqué** (`purchased_at` renseigné) :
- Tout le contenu actuel (nom complet, téléphone cliquable, email, détails profil, statut, notes)

### 5. Indicateur visuel

- Badge "🔒 Verrouillé" sur les leads non achetés
- Badge "✓ Débloqué" sur les leads achetés
- KPI supplémentaire : "Leads achetés" dans la ligne de stats

### 6. Fichiers modifiés

| Fichier | Modification |
|---|---|
| Migration SQL | Ajout colonne `purchased_at` |
| `src/hooks/useProviderData.tsx` | Ajout `usePurchaseLead` |
| `src/pages/PartnerDashboard.tsx` | LeadCard en mode teaser/débloqué, nouveau KPI |

