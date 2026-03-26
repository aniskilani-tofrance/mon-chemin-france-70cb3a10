import { useState, useRef, useCallback, useEffect } from "react";

// Extend Window for webkit prefix
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}
const LANGUAGE_TO_BCP47: Record<string, string> = {
  fr: "fr-FR",
  en: "en-US",
  ar: "ar-SA",
  es: "es-ES",
  pt: "pt-BR",
  ru: "ru-RU",
};

export interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  error: string | null;
}

export function useSpeechRecognition({
  language = "fr",
  continuous = false,
  interimResults = true,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;
    const w = window as unknown as SpeechRecognitionWindow;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = LANGUAGE_TO_BCP47[language] || "fr-FR";
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;
    return recognition;
  }, [isSupported, language, continuous, interimResults]);

  const start = useCallback(() => {
    if (!isSupported) {
      setError("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = createRecognition();
    if (!recognition) return;

    setError(null);
    setInterimTranscript("");

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(`Erreur de reconnaissance : ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      setError("Impossible de démarrer la reconnaissance vocale.");
    }
  }, [isSupported, createRecognition]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    setInterimTranscript("");
    setError(null);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    start,
    stop,
    reset,
    error,
  };
}
