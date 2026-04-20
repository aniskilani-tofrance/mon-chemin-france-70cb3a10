---
name: FLE voice settings
description: Voix ElevenLabs natives pour Marianne sur toutes les langues (fallback OpenAI)
type: feature
---
Voix par langue (edge function `openai-tts`) :

**ElevenLabs `eleven_multilingual_v2`** (fournisseur PRIORITAIRE pour toutes les langues) :
- fr: Charlotte `XB0fDUnXU5powFXDhCwa` → française naturelle, chaleureuse
- en: Sarah `EXAVITQu4vr4xnSDxMaL` → US doux et clair
- es: Charlotte (multilingue) → bonne prosodie espagnole
- pt: Charlotte (multilingue) → rendu PT-BR correct
- ar: Sana `mZ8K1MPRiT5wDQaasg3i` → voix arabe NATIVE (pas d'accent anglais)
- ru: Charlotte (multilingue) → russe correct

Settings communs : stability 0.55, similarity_boost 0.8, style 0.25, speaker_boost true.
Toutes féminines (cohérence avec Marianne, conseillère).
Réponse inclut `provider: 'elevenlabs'`.

**OpenAI TTS `tts-1-hd` (FALLBACK uniquement)** — utilisé si ElevenLabs échoue ou clé absente :
- fr: nova, en: shimmer, es: nova, pt: nova, ar: shimmer, ru: shimmer
- speed 0.95
- Réponse inclut `provider: 'openai'`.

IMPORTANT :
- Ne JAMAIS ajouter de préfixe texte type "[Parle en français]" — TTS le lit littéralement.
- ELEVENLABS_API_KEY et OPENAI_API_KEY doivent être configurés comme secrets Supabase.
- Surveiller la consommation ElevenLabs (caractères) — cache LRU côté client (`useTTS.tsx`) limite les appels.

Fallback final : Web Speech API côté client si l'edge function échoue complètement.
