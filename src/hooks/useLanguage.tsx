import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { LanguageCode, TRANSLATIONS } from "@/lib/translations";

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof TRANSLATIONS["fr"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("fr");
  const { i18n } = useTranslation();

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
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
