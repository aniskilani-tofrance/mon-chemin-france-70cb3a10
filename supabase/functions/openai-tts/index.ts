import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const adminClient = SUPABASE_URL && SERVICE_ROLE
  ? createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } })
  : null;

interface TTSLogEntry {
  request_id?: string;
  provider: string;
  language?: string;
  voice_id?: string;
  status_code?: number;
  success: boolean;
  latency_ms?: number;
  attempt?: number;
  error_message?: string;
  text_chars?: number;
  circuit_open?: boolean;
}

async function logTTS(entry: TTSLogEntry) {
  if (!adminClient) return;
  try {
    await adminClient.from("tts_logs").insert(entry);
  } catch (e) {
    console.warn("[tts] failed to log:", (e as Error)?.message);
  }
}

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

// ElevenLabs voices per language — TOUTES FÉMININES, NATIVES quand possible.
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  fr: "XB0fDUnXU5powFXDhCwa",
  en: "EXAVITQu4vr4xnSDxMaL",
  es: "Nh2zY9kknu6z4pZy6FhD",
  pt: "uVKHymY7OYMd6OailpG5",
  ar: "mZ8K1MPRiT5wDQaasg3i",
  ru: "ymDCYd8puC7gYjxIamPt",
};

// --- Circuit breaker (in-memory, par instance edge) ---------------------------
// Si ElevenLabs renvoie une erreur "définitive" (401/402/403 = clé/paiement),
// on coupe les tentatives pendant COOLDOWN_MS pour éviter de payer la latence
// d'un appel voué à l'échec à chaque requête → fallback OpenAI immédiat.
const COOLDOWN_MS = 5 * 60 * 1000; // 5 min
let elevenlabsCircuitOpenUntil = 0;
let elevenlabsCircuitReason = '';

function isCircuitOpen(): boolean {
  return Date.now() < elevenlabsCircuitOpenUntil;
}

function openCircuit(reason: string) {
  elevenlabsCircuitOpenUntil = Date.now() + COOLDOWN_MS;
  elevenlabsCircuitReason = reason;
  console.warn(`[tts] ElevenLabs circuit OPEN for ${COOLDOWN_MS / 1000}s — reason=${reason}`);
}

// --- Timeouts & retry --------------------------------------------------------
const ELEVENLABS_TIMEOUT_MS = 6000;  // bascule rapidement si lent
const OPENAI_TIMEOUT_MS = 15000;
const ELEVENLABS_MAX_ATTEMPTS = 2;   // 1 retry sur erreur transitoire

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAITTS(
  apiKey: string,
  text: string,
  voice: string,
  speed: number,
): Promise<Response> {
  return fetchWithTimeout(
    'https://api.openai.com/v1/audio/speech',
    {
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
    },
    OPENAI_TIMEOUT_MS,
  );
}

async function callElevenLabsTTS(
  apiKey: string,
  text: string,
  voiceId: string,
): Promise<Response> {
  return fetchWithTimeout(
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
    ELEVENLABS_TIMEOUT_MS,
  );
}

// Erreurs où retry est inutile (clé invalide / paiement / quota / contenu refusé)
function isFatalElevenLabsStatus(status: number): boolean {
  return status === 401 || status === 402 || status === 403 || status === 422;
}

async function tryElevenLabs(
  apiKey: string,
  text: string,
  voiceId: string,
  lang: string,
): Promise<{ ok: true; base64: string } | { ok: false; fatal: boolean; reason: string }> {
  for (let attempt = 1; attempt <= ELEVENLABS_MAX_ATTEMPTS; attempt++) {
    const t0 = Date.now();
    try {
      const resp = await callElevenLabsTTS(apiKey, text, voiceId);
      const latency = Date.now() - t0;

      if (resp.ok) {
        const buf = await resp.arrayBuffer();
        console.log(`[tts] ElevenLabs OK lang=${lang} voice=${voiceId} attempt=${attempt} ${latency}ms`);
        return { ok: true, base64: base64Encode(buf) };
      }

      const errText = await resp.text();
      const fatal = isFatalElevenLabsStatus(resp.status);
      console.warn(`[tts] ElevenLabs ${resp.status} (attempt ${attempt}/${ELEVENLABS_MAX_ATTEMPTS}, ${latency}ms): ${errText.slice(0, 200)}`);

      if (fatal) {
        return { ok: false, fatal: true, reason: `status ${resp.status}` };
      }
      // 5xx / 429 → retry une fois avec petit backoff
      if (attempt < ELEVENLABS_MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (err) {
      const latency = Date.now() - t0;
      const isAbort = (err as Error)?.name === 'AbortError';
      console.warn(`[tts] ElevenLabs ${isAbort ? 'TIMEOUT' : 'threw'} (attempt ${attempt}/${ELEVENLABS_MAX_ATTEMPTS}, ${latency}ms):`, (err as Error)?.message);
      if (attempt < ELEVENLABS_MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }
  return { ok: false, fatal: false, reason: 'exhausted retries' };
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
    const elevenKey = Deno.env.get('ELEVENLABS_API_KEY');

    const lang = language || 'fr';
    const truncatedText = text.slice(0, 4096);
    const selectedSpeed = speed || 0.95;

    const circuitOpen = isCircuitOpen();
    console.log(`[tts] lang=${lang} chars=${text.length} elevenlabs_key=${!!elevenKey} circuit_open=${circuitOpen}`);

    // 1) ElevenLabs (sauf si circuit ouvert ou clé absente)
    if (elevenKey && !circuitOpen) {
      const elVoiceId = ELEVENLABS_VOICE_MAP[lang] || ELEVENLABS_VOICE_MAP.fr;
      const result = await tryElevenLabs(elevenKey, truncatedText, elVoiceId, lang);
      if (result.ok) {
        return new Response(JSON.stringify({ audio_base64: result.base64, provider: 'elevenlabs' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (result.fatal) {
        openCircuit(result.reason);
      }
      // sinon → fallback OpenAI ci-dessous
    } else if (circuitOpen) {
      console.log(`[tts] Skipping ElevenLabs (circuit open: ${elevenlabsCircuitReason}) → OpenAI direct`);
    }

    // 2) Fallback OpenAI TTS
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
      await new Promise(r => setTimeout(r, 800));
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
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
