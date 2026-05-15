import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES, LanguageCode } from "@/lib/translations";
import { SEO } from "@/components/SEO";
import logoTofrance from "@/assets/logo-tofrance.png";

const STORAGE_KEY = "tofrance.language";

const GREETINGS: { code: LanguageCode; label: string }[] = [
  { code: "fr", label: "Choisissez votre langue" },
  { code: "ar", label: "اختر لغتك" },
  { code: "en", label: "Choose your language" },
  { code: "es", label: "Elija su idioma" },
  { code: "pt", label: "Escolha o seu idioma" },
  { code: "ru", label: "Выберите язык" },
];

export default function LanguageGate() {
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Si la langue est déjà choisie, on saute la gate
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        navigate("/home", { replace: true });
      }
    } catch {
      /* ignore */
    }
  }, [navigate]);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    navigate("/home");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4 py-12">
      <SEO
        title="ToFrance — Choose your language / Choisissez votre langue"
        description="Select your language to start your orientation in France."
        path="/"
      />

      {/* Décor */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

      <motion.img
        src={logoTofrance}
        alt="ToFrance"
        className="mb-8 h-24 w-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10 text-center"
      >
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {GREETINGS.map((g, i) => (
            <span key={g.code} dir={g.code === "ar" ? "rtl" : "ltr"}>
              {g.label}
              {i < GREETINGS.length - 1 && (
                <span className="mx-2 text-muted-foreground/50">·</span>
              )}
            </span>
          ))}
        </h1>
        <p className="text-sm text-muted-foreground">
          ToFrance · Bienvenue · Welcome · أهلا · Bienvenido · Bem-vindo · Добро пожаловать
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3"
      >
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            dir={lang.code === "ar" ? "rtl" : "ltr"}
            className="group flex items-center gap-3 rounded-2xl border border-primary/15 bg-card/80 p-5 text-left shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
          >
            <span className="text-3xl" aria-hidden="true">
              {lang.flag}
            </span>
            <span className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {lang.name}
              </span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {lang.code}
              </span>
            </span>
          </button>
        ))}
      </motion.div>

      <button
        onClick={() => {
          setLanguage("fr");
          navigate("/home");
        }}
        className="mt-10 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Passer / Skip →
      </button>
    </div>
  );
}
