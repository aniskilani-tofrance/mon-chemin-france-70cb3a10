import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LanguageCode, TRANSLATIONS } from "@/lib/translations";
import { supabase } from "@/integrations/supabase/client";

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
  const lastSyncedRef = useRef<{ userId: string; lang: LanguageCode } | null>(null);

  // Sync i18n + document on mount and whenever language changes
  useEffect(() => {
    applyDocumentLang(language);
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Restore preferred_language from the user's profile when they sign in
  // and persist any change back to the profile so it follows them across devices.
  useEffect(() => {
    let cancelled = false;

    const restoreFromProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("preferred_language")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      const remote = data?.preferred_language as LanguageCode | null | undefined;
      if (remote && SUPPORTED.includes(remote) && remote !== language) {
        setLanguageState(remote);
        try { window.localStorage.setItem(STORAGE_KEY, remote); } catch { /* ignore */ }
        lastSyncedRef.current = { userId, lang: remote };
      } else {
        lastSyncedRef.current = { userId, lang: language };
      }
    };

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) restoreFromProfile(data.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session?.user) restoreFromProfile(session.user.id);
      else lastSyncedRef.current = null;
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistToProfile = useCallback(async (lang: LanguageCode) => {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    if (lastSyncedRef.current?.userId === user.id && lastSyncedRef.current.lang === lang) return;
    lastSyncedRef.current = { userId: user.id, lang };
    await supabase
      .from("profiles")
      .update({ preferred_language: lang })
      .eq("user_id", user.id);
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    applyDocumentLang(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch { /* ignore */ }
    void persistToProfile(lang);
  }, [i18n, persistToProfile]);

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
