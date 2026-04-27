## Plan

1. Corriger le garde d’accès de `/onboarding`
- Stabiliser la logique d’autorisation pour qu’un administrateur connecté puisse toujours entrer dans Marianne sans code.
- Éviter les états transitoires où la page reste bloquée alors que le rôle admin a déjà été confirmé.
- Conserver l’accès automatique pour les routes préconfigurées via `?source=` et `/to/:sourceSlug`.

2. Rendre le démarrage admin explicite dans l’interface
- Ajouter un point d’entrée clair depuis la home pour les administrateurs connectés afin de lancer Marianne sans passer par “Accès pilote”.
- Garder le flux par code pour les pilotes non-admins.

3. Afficher un message clair pour les non-autorisés
- Remplacer le blocage actuel par un message explicite : accès encore en phase de test, réservé aux pilotes.
- Ajouter un libellé cohérent entre la home, le header et la page bloquée pour éviter toute ambiguïté.

4. Vérifier les cas d’usage critiques
- Admin connecté sans code → accès direct à l’onboarding.
- Utilisateur avec code valide → accès maintenu.
- Utilisateur sans code et sans rôle autorisé → message de phase de test.
- Source partenaire (`/onboarding?source=...`) → préremplissage conservé.

## Ce que j’ai identifié
- Le backend confirme bien le rôle admin (`has_role = true`) dans les requêtes récentes.
- Le vrai problème est côté front : l’entrée principale de la home renvoie encore vers le bloc “Accès pilote”, ce qui donne l’impression que Marianne ne démarre pas, même pour un admin.
- La logique d’accès doit aussi être rendue plus robuste autour de la session auth réactive.

## Détails techniques
- Fichiers ciblés :
  - `src/pages/Onboarding.tsx`
  - `src/hooks/useAdminCheck.tsx`
  - `src/components/AccessCodeSection.tsx`
  - potentiellement `src/components/Header.tsx` ou une CTA d’accueil si nécessaire
- Aucune migration backend n’est nécessaire pour cette correction.
- Après implémentation, je ferai une vérification de build et je validerai les chemins d’accès clés côté app.