---
name: Formateur dashboard
description: Dashboard formateur à /formateur/* avec sidebar, 5 onglets et redirection par rôle au login
type: feature
---
- Page `/formateur` avec nested routes (contenus, assignations, evaluations, afest)
- `FormateurRoute` guard vérifie le rôle `formateur`
- `useRoleCheck` hook + `detectUserRole` + `getRoleDashboardPath` pour la détection de rôle
- Login et OAuthRedirectHandler redirigent vers le bon dashboard selon le rôle (admin/directeur/formateur/user)
- 5 onglets : Apprenants, Contenus, Assignations, Évaluations audio, AFEST
- Sidebar avec `SidebarProvider` + `collapsible="icon"`
