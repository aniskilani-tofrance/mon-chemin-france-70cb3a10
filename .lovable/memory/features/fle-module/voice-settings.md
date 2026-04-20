---
name: FLE voice settings
description: Voix optimisées par langue pour Marianne (OpenAI + ElevenLabs natif pour l'arabe)
type: feature
---
Voix par langue (edge function `openai-tts`) :

**OpenAI TTS** (modèle `tts-1-hd`, speed 0.95) :
- fr: nova    → français chaleureux, accent natif FR
- en: shimmer → anglais US doux et féminin
- es: nova    → espagnol naturel
- pt: nova    → portugais (proche PT-BR)
- ru: shimmer → russe plus neutre que nova

**ElevenLabs** (modèle `eleven_multilingual_v2`) — UNIQUEMENT pour l'arabe :
- ar: voice_id `mZ8K1MPRiT5wDQaasg3i` (Sana, féminine native arabe)
- settings: stability 0.55, similarity_boost 0.8, style 0.25, speaker_boost true
- Fallback automatique sur OpenAI shimmer si ElevenLabs échoue ou clé absente
- Réponse inclut `provider: 'elevenlabs'` quand utilisée

Toutes les voix sont féminines (cohérence avec Marianne, conseillère).

IMPORTANT :
- Ne JAMAIS ajouter de préfixe texte type "[Parle en français]" — TTS le lit littéralement.
- ELEVENLABS_API_KEY doit être configurée comme secret Supabase.
- Les autres langues restent sur OpenAI pour préserver les crédits ElevenLabs.

Fallback final : Web Speech API côté client si l'edge function échoue complètement.
