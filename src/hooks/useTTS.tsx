import { useState, useRef, useCallback, useEffect } from "react";
import { LanguageCode } from "@/lib/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPPORTED_TTS_LANGUAGES: LanguageCode[] = ["fr", "en", "ar", "es", "pt", "ru"];
const TTS_ENABLED_KEY = "tts_enabled";
const MAX_CACHE_ENTRIES = 20;
const MAX_CACHEABLE_LENGTH = 500;

const MANUAL_PLAYBACK_MESSAGE: Record<LanguageCode, string> = {
  fr: "Le navigateur a bloqué le démarrage automatique de la voix. Appuyez sur « Réécouter Marianne ».",
  en: "Your browser blocked autoplay for voice. Press "Replay Marianne" to start it.",
  ar: "حظر المتصفح تشغيل الصوت تلقائيًا. اضغطوا على «إعادة تشغيل ماريان». ",
  es: "El navegador bloqueó el inicio automático de la voz. Pulsa «Volver a escuchar a Marianne».",
  pt: "O navegador bloqueou o início automático da voz. Toque em «Ouvir Marianne novamente».",
  ru: "Браузер заблокировал автозапуск голоса. Нажмите «Прослушать Марианну ещё раз».",
};

const LANGUAGE_TO_BCP47: Partial<Record<LanguageCode, string>> = {
  fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES", pt: "pt-BR", ru: "ru-RU",
};

// ─── Simple LRU audio cache ────────────────────────────────────────
function cacheKey(text: string, lang: string): string {
  // Simple hash – good enough for a 20-entry map
  let h = 0;
  const s = lang + "|" + text;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return String(h);
}

const audioCache = new Map<string, string>(); // key -> blobURL

function cacheGet(text: string, lang: string): string | undefined {
  const k = cacheKey(text, lang);
  const url = audioCache.get(k);
  if (url) {
    // Move to end (most-recently used)
    audioCache.delete(k);
    audioCache.set(k, url);
  }
  return url;
}

function cacheSet(text: string, lang: string, blobUrl: string) {
  if (text.length > MAX_CACHEABLE_LENGTH) return;
  const k = cacheKey(text, lang);
  if (audioCache.has(k)) {
    audioCache.delete(k);
  } else if (audioCache.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest
    const oldest = audioCache.keys().next().value;
    if (oldest !== undefined) {
      const oldUrl = audioCache.get(oldest);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      audioCache.delete(oldest);
    }
  }
  audioCache.set(k, blobUrl);
}

// ─── Exports ───────────────────────────────────────────────────────
export function isTTSSupportedForLanguage(language: LanguageCode): boolean {
  return SUPPORTED_TTS_LANGUAGES.includes(language);
}

export interface UseTTSOptions {
  language: LanguageCode;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface UseTTSReturn {
  isSpeaking: boolean;
  isEnabled: boolean;
  isSupported: boolean;
  speak: (text: string) => void;
  stop: () => void;
  toggle: () => void;
}

export function useTTS({ language, onStart, onEnd }: UseTTSOptions): UseTTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => {
    const stored = localStorage.getItem(TTS_ENABLED_KEY);
    return stored === null ? true : stored === "true";
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const manualPlaybackHintShownRef = useRef(false);
  const langSupported = isTTSSupportedForLanguage(language);

  const notifyManualPlaybackNeeded = useCallback(() => {
    if (manualPlaybackHintShownRef.current) return;
    manualPlaybackHintShownRef.current = true;
    toast.info(MANUAL_PLAYBACK_MESSAGE[language] || MANUAL_PLAYBACK_MESSAGE.fr);
  }, [language]);

  useEffect(() => { stop(); }, [language]);
  useEffect(() => { manualPlaybackHintShownRef.current = false; }, [language]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // ─── Improved Web Speech fallback ──────────────────────────────
  const fallbackSpeak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false);
      notifyManualPlaybackNeeded();
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const bcp47 = LANGUAGE_TO_BCP47[language] || "fr-FR";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = 0.72;

    // Pick the best available voice: prefer cloud / Google voices
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = bcp47.split("-")[0];
      const candidates = voices.filter(v => v.lang.startsWith(langPrefix));
      if (candidates.length === 0) return;

      // Sort: cloud voices first, then Google-named, then others
      candidates.sort((a, b) => {
        const aCloud = a.localService === false ? 0 : 1;
        const bCloud = b.localService === false ? 0 : 1;
        if (aCloud !== bCloud) return aCloud - bCloud;
        const aGoogle = a.name.toLowerCase().includes("google") ? 0 : 1;
        const bGoogle = b.name.toLowerCase().includes("google") ? 0 : 1;
        return aGoogle - bGoogle;
      });
      utterance.voice = candidates[0];
    };

    pickVoice();

    // On some mobile browsers voices load async
    if (window.speechSynthesis.getVoices().length === 0) {
      const handler = () => {
        pickVoice();
        window.speechSynthesis.removeEventListener("voiceschanged", handler);
      };
      window.speechSynthesis.addEventListener("voiceschanged", handler);
    }

    utterance.onstart = () => {
      manualPlaybackHintShownRef.current = false;
      setIsSpeaking(true);
      onStart?.();
    };
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); notifyManualPlaybackNeeded(); onEnd?.(); };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
      notifyManualPlaybackNeeded();
      onEnd?.();
    }
  }, [language, notifyManualPlaybackNeeded, onStart, onEnd]);

  // ─── Play a blob URL (shared by cache hit & fresh fetch) ───────
  const playBlobUrl = useCallback((url: string, myId: number) => {
    if (myId !== requestIdRef.current) return; // stale
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => { manualPlaybackHintShownRef.current = false; };
    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
      onEnd?.();
    };
    audio.onerror = () => {
      setIsSpeaking(false);
      audioRef.current = null;
      // don't revoke – might be cached
    };

    audio.play().catch((err) => {
      if (err?.name === "NotAllowedError" || /user gesture|interact/i.test(err?.message || "")) {
        notifyManualPlaybackNeeded();
      }
      setIsSpeaking(false);
      audioRef.current = null;
      onEnd?.();
    });
  }, [notifyManualPlaybackNeeded, onEnd]);

  // ─── Main speak function ───────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !langSupported || !text.trim()) return;

    stop();

    const myId = ++requestIdRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSpeaking(true);
    onStart?.();

    // 1. Check cache
    const cached = cacheGet(text, language);
    if (cached) {
      playBlobUrl(cached, myId);
      return;
    }

    // 2. Call edge function with 1 retry
    let attempt = 0;
    const MAX_ATTEMPTS = 2;
    let lastError: any = null;

    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      try {
        const { data, error } = await supabase.functions.invoke("openai-tts", {
          body: { text, language, speed: 0.9 },
        });

        if (controller.signal.aborted || myId !== requestIdRef.current) return;

        if (error || !data?.audio_base64) {
          lastError = error;
          if (attempt < MAX_ATTEMPTS) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          break;
        }

        // Decode & play
        const binaryString = atob(data.audio_base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);

        // Cache it
        cacheSet(text, language, url);

        if (myId !== requestIdRef.current) {
          URL.revokeObjectURL(url);
          return;
        }

        playBlobUrl(url, myId);
        return;
      } catch (err: any) {
        if (controller.signal.aborted || myId !== requestIdRef.current) return;
        lastError = err;
        // Don't retry on autoplay blocks
        if (err?.name === "NotAllowedError") break;
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    // All attempts failed → fallback
    if (myId !== requestIdRef.current) return;
    console.warn("[TTS] OpenAI failed after retries, using fallback:", lastError?.message);
    fallbackSpeak(text);
  }, [isEnabled, langSupported, language, stop, onStart, onEnd, fallbackSpeak, playBlobUrl, notifyManualPlaybackNeeded]);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(TTS_ENABLED_KEY, String(next));
      if (!next) stop();
      return next;
    });
  }, [stop]);

  return { isSpeaking, isEnabled, isSupported: langSupported, speak, stop, toggle };
}
