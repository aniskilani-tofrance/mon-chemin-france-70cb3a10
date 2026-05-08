import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LanguageCode, TRANSLATIONS } from "@/lib/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof TRANSLATIONS["fr"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "tofrance.language";
const SUPPORTED: LanguageCode[] = ["fr", "en", "ar", "es", "pt", "ru"];

const applyDocumentLang = (lang: LanguageCode) => {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
};

const readInitialLanguage = (): LanguageCode => {
  if (typeof window === "undefined") return "fr";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch { /* ignore */ }
  return "fr";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readInitialLanguage);
  const { i18n } = useTranslation();

  // Sync i18n + document on mount and whenever language changes
  useEffect(() => {
    applyDocumentLang(language);
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    applyDocumentLang(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch { /* ignore */ }
  }, [i18n]);

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
