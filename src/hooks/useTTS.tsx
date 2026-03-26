import { useState, useRef, useCallback, useEffect } from "react";
import { LanguageCode } from "@/lib/translations";
import { supabase } from "@/integrations/supabase/client";

const SUPPORTED_TTS_LANGUAGES: LanguageCode[] = ["fr", "en", "ar", "es", "pt", "ru"];
const TTS_ENABLED_KEY = "tts_enabled";

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
  const langSupported = isTTSSupportedForLanguage(language);

  useEffect(() => {
    stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

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
    // Also stop Web Speech API fallback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const fallbackSpeak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSpeaking(false);
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();

    const LANGUAGE_TO_BCP47: Partial<Record<LanguageCode, string>> = {
      fr: "fr-FR", en: "en-US", ar: "ar-SA", es: "es-ES", pt: "pt-BR", ru: "ru-RU",
    };

    const bcp47 = LANGUAGE_TO_BCP47[language] || "fr-FR";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = 0.72;

    const voices = window.speechSynthesis.getVoices();
    const langPrefix = bcp47.split("-")[0];
    const candidates = voices.filter(v => v.lang.startsWith(langPrefix));
    if (candidates.length > 0) utterance.voice = candidates[0];

    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [language, onStart, onEnd]);

  const speak = useCallback(async (text: string) => {
    if (!isEnabled || !langSupported || !text.trim()) return;

    stop();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setIsSpeaking(true);
      onStart?.();

      const { data, error } = await supabase.functions.invoke("openai-tts", {
        body: { text, language, speed: 0.9 },
      });

      if (controller.signal.aborted) return;

      if (error || !data?.audio_base64) {
        console.warn("[TTS] Edge function error, falling back:", error);
        fallbackSpeak(text);
        return;
      }

      // Decode base64 to audio blob
      const binaryString = atob(data.audio_base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        onEnd?.();
      };

      audio.onerror = () => {
        console.warn("[TTS] Audio playback error, falling back");
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
        fallbackSpeak(text);
      };

      await audio.play();
    } catch (err: any) {
      if (controller.signal.aborted) return;
      console.warn("[TTS] OpenAI TTS failed, using fallback:", err.message);
      fallbackSpeak(text);
    }
  }, [isEnabled, langSupported, stop, onStart, onEnd, fallbackSpeak]);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(TTS_ENABLED_KEY, String(next));
      if (!next) stop();
      return next;
    });
  }, [stop]);

  return {
    isSpeaking,
    isEnabled,
    isSupported: langSupported,
    speak,
    stop,
    toggle,
  };
}
