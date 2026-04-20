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

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lang = language || 'fr';
    const selectedVoice = voice || VOICE_MAP[lang] || 'nova';
    // No language hint prefix – OpenAI TTS infers language from the text itself.
    // Adding text hints like "[Parle en français]" causes TTS to pronounce them literally.
    const truncatedText = text.slice(0, 4096);
    const selectedSpeed = speed || 0.95;

    console.log(`[openai-tts] lang=${lang} voice=${selectedVoice} speed=${selectedSpeed} chars=${text.length}`);

    // ──────────────────────────────────────────────────────────────
    // Arabe : tenter ElevenLabs (voix native) en priorité, fallback OpenAI
    // ──────────────────────────────────────────────────────────────
    if (lang === 'ar') {
      const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');
      if (elevenKey) {
        try {
          console.log('[openai-tts] Arabic → trying ElevenLabs native voice');
          const elResp = await callElevenLabsTTS(elevenKey, truncatedText, ELEVENLABS_AR_VOICE_ID);
          if (elResp.ok) {
            const audioBuffer = await elResp.arrayBuffer();
            const base64 = base64Encode(audioBuffer);
            console.log('[openai-tts] ElevenLabs success for Arabic');
            return new Response(JSON.stringify({ audio_base64: base64, provider: 'elevenlabs' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          const errText = await elResp.text();
          console.warn(`[openai-tts] ElevenLabs failed (${elResp.status}): ${errText} — falling back to OpenAI`);
        } catch (err) {
          console.warn('[openai-tts] ElevenLabs threw, falling back to OpenAI:', err);
        }
      } else {
        console.warn('[openai-tts] ELEVENLABS_API_KEY missing — using OpenAI for Arabic');
      }
    }

    // First attempt
    let response = await callOpenAITTS(apiKey, truncatedText, selectedVoice, selectedSpeed);

    // Retry once on transient errors (5xx, network)
    if (!response.ok && response.status >= 500) {
      console.warn(`[openai-tts] Retry after ${response.status}`);
      await new Promise(r => setTimeout(r, 1000));
      response = await callOpenAITTS(apiKey, truncatedText, selectedVoice, selectedSpeed);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[openai-tts] Error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'TTS generation failed', details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = base64Encode(audioBuffer);

    return new Response(JSON.stringify({ audio_base64: base64 }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('TTS function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
