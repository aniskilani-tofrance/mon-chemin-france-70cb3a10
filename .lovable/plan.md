

# Audit et plan de fiabilisation du parcours vocal

## Problèmes identifiés

1. **Accent TTS incohérent** : L'edge function `openai-tts` utilise des voix OpenAI (shimmer/nova) qui ont un accent anglophone résiduel sur certaines langues. Le modèle `tts-1-hd` ne garantit pas un accent natif parfait, surtout pour l'arabe et le russe.

2. **Pas d'indication de langue dans le prompt TTS** : Le texte est envoyé tel quel a OpenAI sans instruction explicite de langue. OpenAI infère la langue du texte, mais peut se tromper sur des phrases courtes ou mélangées.

3. **Fallback Web Speech API fragile** : Si OpenAI échoue, le fallback Web Speech API sélectionne la première voix disponible pour la langue, sans préférence de qualité. Sur mobile, les voix peuvent être robotiques.

4. **Pas de cache audio** : Chaque message Marianne déclenche un appel TTS, même pour des phrases récurrentes ("Merci", "C'est noté").

5. **Race conditions potentielles** : Si l'utilisateur interagit vite, l'audio précédent peut ne pas être stoppé avant le nouveau, causant des chevauchements.

6. **Pas de retry sur erreur réseau** : Un échec TTS tombe directement en fallback sans retry.

## Plan d'implémentation

### 1. Améliorer la qualité vocale OpenAI (edge function `openai-tts`)
- Ajouter un préfixe de langue invisible au texte envoyé pour forcer l'accent correct (ex: pour l'arabe, ajouter un caractère SSML-like ou un hint de langue)
- Passer au modèle `tts-1-hd` (déjà fait) mais ajouter le paramètre `language` si OpenAI le supporte dans les futures API
- Tester `alloy` comme alternative a `shimmer` pour le français (accent plus neutre)

### 2. Ajouter un cache audio côté client (`useTTS`)
- Maintenir un `Map<string, string>` (texte hash -> blob URL) pour éviter les appels répétés
- Limiter le cache à ~20 entrées (LRU simple)
- Réduire la latence et le coût API sur les phrases récurrentes

### 3. Fiabiliser le fallback Web Speech API
- Prioriser les voix Google ("Google français") sur Chrome quand disponibles
- Ajouter un délai `voiceschanged` pour attendre le chargement des voix sur mobile
- Filtrer les voix par qualité (préférer `localService: false` = voix cloud)

### 4. Ajouter un retry avec backoff sur l'edge function TTS
- 1 retry après 1s en cas d'erreur réseau (pas sur 429/402)
- Si le retry échoue, tomber en fallback Web Speech

### 5. Corriger les race conditions audio
- Ajouter un `requestId` incrémental : ignorer les réponses obsolètes
- S'assurer que `stop()` est toujours appelé avant `speak()`

### 6. Améliorer la sélection de voix par langue dans l'edge function
- Français : tester `echo` (plus masculin mais accent français natif) vs `shimmer` ; garder `shimmer` si meilleur
- Arabe : `nova` est bon, mais ajouter un fallback `alloy` si la prononciation est meilleure
- Ajouter un log de la voix utilisée pour debug

## Fichiers modifiés

| Fichier | Changement |
|---------|------------|
| `supabase/functions/openai-tts/index.ts` | Retry logic, meilleure sélection de voix, log voix |
| `src/hooks/useTTS.tsx` | Cache audio LRU, retry 1x, requestId anti-race, meilleure sélection voix fallback |
| `src/components/VocalOnboarding/ChatOnboarding.tsx` | Aucun changement structurel, bénéficie des améliorations TTS |

## Détails techniques

### Cache audio (useTTS)
```text
Map<hash(text+lang), blobURL>
  - Max 20 entries
  - Evict oldest on overflow
  - Skip cache for texts > 500 chars
```

### Retry pattern (useTTS)
```text
speak(text)
  -> call openai-tts
     -> if network error, retry 1x after 1s
        -> if still fails, fallbackSpeak()
     -> if 429/402, fallbackSpeak() immediately
```

### Voice selection improvement (fallback)
```text
Prefer: Google voices > other cloud voices > local voices
Filter: voice.lang starts with target BCP47
Sort: !localService first, then by name containing "Google"
```

