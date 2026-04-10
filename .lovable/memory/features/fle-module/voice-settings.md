---
name: FLE voice settings
description: Voix OpenAI optimisées par langue pour l'agent Marianne
type: feature
---
Voix OpenAI TTS (modèle tts-1-hd, speed 0.95) :
- fr: nova (accent français naturel, pas d'accent anglais)
- en: shimmer
- ar: nova
- es: nova
- pt: nova
- ru: nova

IMPORTANT : Ne JAMAIS ajouter de préfixe texte comme "[Parle en français]" au texte TTS.
OpenAI TTS prononce littéralement tout le texte envoyé, y compris les instructions entre crochets.
La langue est inférée automatiquement du contenu textuel.

Fallback : Web Speech API si OpenAI échoue (préférence voix cloud/Google).
