import { useState, useRef, useCallback, useEffect } from "react";
import { LanguageCode } from "@/lib/translations";

// Map language codes to BCP 47 for Web Speech API
const LANGUAGE_TO_BCP47: Partial<Record<LanguageCode, string>> = {
  fr: "fr-FR",
  en: "en-US",
  ar: "ar-SA",
  es: "es-ES",
  pt: "pt-BR",
  ru: "ru-RU",
};

// Languages supported for TTS
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

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;
  const langSupported = isTTSSupportedForLanguage(language);

  // Wait for voices to be loaded
  useEffect(() => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    const checkVoices = () => {
      if (synth.getVoices().length > 0) {
        setVoicesReady(true);
      }
    };
    checkVoices();
    synth.addEventListener("voiceschanged", checkVoices);
    return () => synth.removeEventListener("voiceschanged", checkVoices);
  }, [isSupported]);

  // Cancel speech when language changes
  useEffect(() => {
    stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !isEnabled || !langSupported) return;

    // Stop any current speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const bcp47 = LANGUAGE_TO_BCP47[language] || "fr-FR";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = 0.72;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find the best quality voice available
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = bcp47.split("-")[0];
    
    // Priority: premium/enhanced voices > exact locale match > language match
    const premiumKeywords = ["premium", "enhanced", "natural", "neural", "wavenet", "studio"];
    const lowQualityKeywords = ["compact", "espeak", "mbrola"];
    
    const candidates = voices.filter(
      (v) => v.lang.startsWith(langPrefix) && !lowQualityKeywords.some(k => v.name.toLowerCase().includes(k))
    );
    
    // Sort: premium first, then exact locale, then remote voices
    candidates.sort((a, b) => {
      const aScore = (premiumKeywords.some(k => a.name.toLowerCase().includes(k)) ? 100 : 0)
        + (a.lang === bcp47 ? 10 : 0)
        + (!a.localService ? 5 : 0);
      const bScore = (premiumKeywords.some(k => b.name.toLowerCase().includes(k)) ? 100 : 0)
        + (b.lang === bcp47 ? 10 : 0)
        + (!b.localService ? 5 : 0);
      return bScore - aScore;
    });
    
    if (candidates.length > 0) utterance.voice = candidates[0];

    utterance.onstart = () => {
      setIsSpeaking(true);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled" && e.error !== "interrupted") {
        console.warn("[TTS] Speech error:", e.error);
      }
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isEnabled, langSupported, language, onStart, onEnd]);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(TTS_ENABLED_KEY, String(next));
      if (!next) {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    isSpeaking,
    isEnabled,
    isSupported: isSupported && langSupported,
    speak,
    stop,
    toggle,
  };
}
