import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Optimised voice per language for Marianne (female advisor)
// All OpenAI TTS voices are multilingual but each has a distinct timbre / accent.
// Voices are restricted to feminine ones (nova / shimmer / alloy) to stay coherent
// with Marianne's character.
//
// - fr: nova    → warm, natural French, no English accent (validated)
// - en: shimmer → soft female with neutral US accent, clearer than nova for EN
// - es: nova    → excellent Spanish prosody, very natural
// - pt: nova    → close to PT-BR, warm tone
// - ar: shimmer → softer Arabic rendering than nova (less anglo accent)
// - ru: shimmer → more neutral Russian than nova (which sounds heavily EN)
//
// Web Speech fallback (handled client-side) covers cases where OpenAI's accent
// is too foreign — especially for AR.
const VOICE_MAP: Record<string, string> = {
  fr: "nova",
  en: "shimmer",
  es: "nova",
  pt: "nova",
  ar: "shimmer",
  ru: "shimmer",
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
