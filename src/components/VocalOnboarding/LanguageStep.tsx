import { motion } from "framer-motion";
import { Globe } from "lucide-react";
import { LANGUAGES, LanguageCode } from "@/lib/translations";
import { useLanguage } from "@/hooks/useLanguage";

interface LanguageStepProps {
  onSelect: (lang: LanguageCode) => void;
}

export function LanguageStep({ onSelect }: LanguageStepProps) {
  const { language, t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      {/* Hero icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6 flex justify-center"
      >
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 flex items-center justify-center ring-4 ring-primary/10 shadow-lg">
            <Globe className="h-10 w-10 text-primary" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-primary/15"
          />
        </div>
      </motion.div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl tracking-tight">
          {t.onboarding.selectLanguage}
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base max-w-md mx-auto">
          {t.onboarding.selectLanguageSubtitle}
        </p>
      </div>

      {/* Language grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-w-md mx-auto" role="radiogroup" aria-label={t.onboarding.selectLanguage}>
        {LANGUAGES.map((lang, index) => (
          <motion.button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.06, type: "spring", stiffness: 300, damping: 25 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            role="radio"
            aria-checked={language === lang.code}
            aria-label={lang.name}
            className={`group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 overflow-hidden ${
              language === lang.code
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border/60 bg-card hover:border-primary/40 hover:shadow-md"
            }`}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300" />
            
            <span className="relative text-4xl sm:text-5xl drop-shadow-sm" aria-hidden="true">{lang.flag}</span>
            <span className="relative text-sm font-semibold text-foreground sm:text-base tracking-wide">
              {lang.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Subtle helper */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-xs text-muted-foreground/60"
      >
        🌍 6 langues disponibles
      </motion.p>
    </motion.div>
  );
}
