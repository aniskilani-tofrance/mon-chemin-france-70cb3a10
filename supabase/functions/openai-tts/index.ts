import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// OpenAI fallback voices per language (used if ElevenLabs fails or key missing).
const OPENAI_VOICE_MAP: Record<string, string> = {
  fr: "nova",
  en: "shimmer",
  es: "nova",
  pt: "nova",
  ar: "shimmer",
  ru: "shimmer",
};

// ElevenLabs voices per language (toutes féminines, multilingual v2).
// Marianne = conseillère chaleureuse → voix douces et naturelles.
// - fr: Charlotte (XB0fDUnXU5powFXDhCwa) → française naturelle
// - en: Sarah (EXAVITQu4vr4xnSDxMaL) → US doux et clair
// - es: Charlotte → excellent en espagnol via multilingual v2
// - pt: Charlotte → bon rendu PT-BR
// - ar: Sana (mZ8K1MPRiT5wDQaasg3i) → voix native arabe
// - ru: Charlotte → russe correct via multilingual v2
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  fr: "XB0fDUnXU5powFXDhCwa", // Charlotte
  en: "EXAVITQu4vr4xnSDxMaL", // Sarah
  es: "XB0fDUnXU5powFXDhCwa", // Charlotte (multilingue)
  pt: "XB0fDUnXU5powFXDhCwa", // Charlotte (multilingue)
  ar: "mZ8K1MPRiT5wDQaasg3i", // Sana (native AR)
  ru: "XB0fDUnXU5powFXDhCwa", // Charlotte (multilingue)
};

async function callOpenAITTS(
  apiKey: string,
  text: string,
  voice: string,
  speed: number,
): Promise<Response> {
  return fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: text,
      voice,
      speed,
      response_format: 'mp3',
    }),
  });
}

// ElevenLabs – voix arabe native (Sana, féminine, multilingue v2)
// Voice ID "Sana" : mZ8K1MPRiT5wDQaasg3i — voix arabe native chaleureuse.
// Fallback : "Rachel" multilingue (21m00Tcm4TlvDq8ikWAM) si Sana indispo.
const ELEVENLABS_AR_VOICE_ID = 'mZ8K1MPRiT5wDQaasg3i';

async function callElevenLabsTTS(
  apiKey: string,
  text: string,
  voiceId: string,
): Promise<Response> {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    },
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, language, voice, speed } = await req.json();

  try {
    const { text, language, voice, speed } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');

    const lang = language || 'fr';
    const truncatedText = text.slice(0, 4096);
    const selectedSpeed = speed || 0.95;

    console.log(`[tts] lang=${lang} chars=${text.length} elevenlabs=${!!elevenKey}`);

    // ──────────────────────────────────────────────────────────────
    // 1) Tentative ElevenLabs (toutes langues) — voix natives premium
    // ──────────────────────────────────────────────────────────────
    if (elevenKey) {
      const elVoiceId = ELEVENLABS_VOICE_MAP[lang] || ELEVENLABS_VOICE_MAP.fr;
      try {
        const elResp = await callElevenLabsTTS(elevenKey, truncatedText, elVoiceId);
        if (elResp.ok) {
          const audioBuffer = await elResp.arrayBuffer();
          const base64 = base64Encode(audioBuffer);
          console.log(`[tts] ElevenLabs OK lang=${lang} voice=${elVoiceId}`);
          return new Response(JSON.stringify({ audio_base64: base64, provider: 'elevenlabs' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const errText = await elResp.text();
        console.warn(`[tts] ElevenLabs failed (${elResp.status}) lang=${lang}: ${errText} — fallback OpenAI`);
      } catch (err) {
        console.warn(`[tts] ElevenLabs threw lang=${lang}, fallback OpenAI:`, err);
      }
    }

    // ──────────────────────────────────────────────────────────────
    // 2) Fallback OpenAI TTS
    // ──────────────────────────────────────────────────────────────
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'No TTS provider available' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const selectedVoice = voice || OPENAI_VOICE_MAP[lang] || 'nova';
    let response = await callOpenAITTS(apiKey, truncatedText, selectedVoice, selectedSpeed);

    if (!response.ok && response.status >= 500) {
      console.warn(`[tts] OpenAI retry after ${response.status}`);
      await new Promise(r => setTimeout(r, 1000));
      response = await callOpenAITTS(apiKey, truncatedText, selectedVoice, selectedSpeed);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[tts] OpenAI error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'TTS generation failed', details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = base64Encode(audioBuffer);

    return new Response(JSON.stringify({ audio_base64: base64, provider: 'openai' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('TTS function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
  } catch (error) {
    console.error('TTS function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
