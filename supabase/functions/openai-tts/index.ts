import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Optimised voice per language for Marianne (female advisor)
// shimmer = expressive female, nova = warm female
const VOICE_MAP: Record<string, string> = {
  fr: "shimmer",
  en: "shimmer",
  ar: "nova",
  es: "nova",
  pt: "nova",
  ru: "shimmer",
};

// BCP-47 language hints – prepended as an invisible instruction so the model
// picks the right accent even on very short texts.
const LANG_HINT: Record<string, string> = {
  fr: "[Parle en français] ",
  en: "[Speak in English] ",
  ar: "[تحدث بالعربية] ",
  es: "[Habla en español] ",
  pt: "[Fale em português] ",
  ru: "[Говори по-русски] ",
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
    // Prepend invisible language hint for short texts to avoid accent confusion
    const hint = LANG_HINT[lang] || '';
    const truncatedText = (hint + text).slice(0, 4096);
    const selectedSpeed = speed || 1.05;

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
