---
name: FLE voice settings
description: Voix OpenAI optimisées par langue pour l'agent Marianne
type: feature
---
Voix OpenAI TTS (modèle tts-1-hd, speed 0.95 par défaut côté edge function) :
- fr: nova    → français chaleureux, accent natif FR validé
- en: shimmer → anglais US doux et féminin, plus clair que nova
- es: nova    → espagnol très naturel
- pt: nova    → portugais (proche PT-BR), ton chaleureux
- ar: shimmer → arabe plus doux que nova (qui a un accent anglo trop marqué)
- ru: shimmer → russe plus neutre que nova

Toutes les voix sont féminines (cohérence avec Marianne, conseillère).

IMPORTANT : Ne JAMAIS ajouter de préfixe texte comme "[Parle en français]" au texte TTS.
OpenAI TTS prononce littéralement tout le texte envoyé, y compris les instructions entre crochets.
La langue est inférée automatiquement du contenu textuel.

Fallback : Web Speech API si OpenAI échoue (préférence voix cloud/Google).
Particulièrement utile pour l'arabe où aucune voix OpenAI n'est native.
