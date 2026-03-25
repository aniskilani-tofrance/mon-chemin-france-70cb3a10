import { motion } from "framer-motion";
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
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          {t.onboarding.selectLanguage}
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          {t.onboarding.selectLanguageSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" role="radiogroup" aria-label={t.onboarding.selectLanguage}>
        {LANGUAGES.map((lang, index) => (
          <motion.button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            role="radio"
            aria-checked={language === lang.code}
            aria-label={lang.name}
            className={`group flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all duration-200 sm:p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              language === lang.code
                ? "border-primary bg-primary/5 shadow-glow"
                : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
            }`}
          >
            <span className="text-3xl sm:text-4xl" aria-hidden="true">{lang.flag}</span>
            <span className="text-xs font-medium text-foreground sm:text-sm">
              {lang.name}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}