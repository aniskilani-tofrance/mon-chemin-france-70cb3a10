## Module FLE complet

### 1. Peupler la base : 15 nouveaux modules + exercices
Insérer les modules prévus dans la mémoire projet (18 total) avec 3-5 exercices chacun, couvrant :

**Vie quotidienne (Alpha → A2) :**
- ✅ Se présenter (existe)
- ✅ Chez le médecin (existe)  
- 📍 Les transports
- 🛒 Faire les courses
- 🏠 Le logement
- 📞 Au téléphone
- 🏫 L'école des enfants
- 🏦 À la banque / La Poste
- 📋 Les papiers administratifs

**Professionnel (A1 → B1) :**
- ✅ Au travail : les bases (existe)
- 🏗️ Chantier et sécurité
- 🍽️ Hôtellerie-restauration
- 🏥 Aide à la personne
- 🧹 Propreté et entretien
- 🚚 Logistique
- 🤝 L'entretien d'embauche
- 📄 Le CV et la lettre
- 💼 Droits du travail

Chaque module aura 4 exercices variés (listen_repeat, listen_choose, oral_answer, complete_dialogue, role_play, etc.)

### 2. Test de placement
Nouvelle page `/fle/placement` avec :
- 5 questions progressives (compréhension orale + choix)
- Évaluation automatique du niveau CECRL (Alpha → B1)
- Sauvegarde du niveau estimé dans `fle_user_progress`
- Redirection vers le dashboard avec les modules débloqués selon le niveau
- Accessible au premier accès FLE (si `placement_completed = false`)

### 3. Améliorations UX
- **Mise à jour de la progression** : après chaque exercice terminé, mettre à jour `fle_module_progress` (exercises_done, score, completed_at)
- **Déblocage automatique** : quand un module est terminé, débloquer le suivant
- **Écran de fin de module** avec score, XP gagnés, et animation de félicitations
- **Accès direct depuis le dashboard utilisateur** : ajouter un bouton "Apprendre le français" sur le dashboard principal

### Fichiers modifiés
- `supabase insert` : 15 modules + ~60 exercices
- Nouvelle page : `src/pages/FLEPlacement.tsx`
- Modifié : `src/pages/FLEDashboard.tsx` (redirection placement, UX)
- Modifié : `src/pages/FLEExercise.tsx` (progression, écran de fin)
- Modifié : `src/App.tsx` (route placement)
- Modifié : `src/pages/Dashboard.tsx` (lien FLE)
