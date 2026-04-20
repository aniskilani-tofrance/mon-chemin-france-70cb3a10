---
name: FLE voice settings
description: Voix ElevenLabs féminines natives par langue pour Marianne (fallback OpenAI)
type: feature
---
Voix par langue (edge function `openai-tts`) — TOUTES FÉMININES.

**ElevenLabs `eleven_multilingual_v2`** (PRIORITAIRE pour toutes les langues) :
- fr: Charlotte `XB0fDUnXU5powFXDhCwa` → française conversationnelle
- en: Sarah     `EXAVITQu4vr4xnSDxMaL` → US doux et clair
- es: Lucía     `Nh2zY9kknu6z4pZy6FhD` → espagnole NATIVE (Espagne)
- pt: Camila    `uVKHymY7OYMd6OailpG5` → portugaise BR NATIVE
- ar: Sana      `mZ8K1MPRiT5wDQaasg3i` → arabe NATIVE
- ru: Tatyana   `ymDCYd8puC7gYjxIamPt` → russe NATIVE

Settings communs : stability 0.55, similarity_boost 0.8, style 0.25, speaker_boost true.
Réponse inclut `provider: 'elevenlabs'`.

**OpenAI TTS `tts-1-hd` (FALLBACK uniquement)** — utilisé si ElevenLabs échoue ou clé absente :
- fr: nova, en: shimmer, es: nova, pt: nova, ar: shimmer, ru: shimmer
- speed 0.95
- Réponse inclut `provider: 'openai'`.

IMPORTANT :
- Ne JAMAIS ajouter de préfixe texte type "[Parle en français]" — TTS le lit littéralement.
- ELEVENLABS_API_KEY et OPENAI_API_KEY doivent être configurés comme secrets Supabase.
- Cache LRU côté client (`useTTS.tsx`) limite la consommation ElevenLabs.
- Si une voice ID ElevenLabs renvoie 404, vérifier qu'elle est bien dans la voice library du compte (sinon l'ajouter via le dashboard ElevenLabs).

Fallback final : Web Speech API côté client si l'edge function échoue complètement.
