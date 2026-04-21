import { motion } from "framer-motion";
import { LANGUAGES, LanguageCode } from "@/lib/translations";
import { useLanguage } from "@/hooks/useLanguage";

interface LanguageStepProps {
  onSelect: (lang: LanguageCode) => void;
}

function PlanetLogo() {
  return (
    <motion.div
      className="relative h-20 w-20 sm:h-24 sm:w-24 cursor-pointer"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      tabIndex={0}
      aria-label="Logo planète - sélecteur de langues"
    >
      {/* Glow effect on hover/focus */}
      <motion.div
        className="absolute inset-[-8px] rounded-full bg-primary/20 blur-xl"
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        whileFocus={{ opacity: 1, scale: 1.1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Pulsing halo */}
      <motion.div
        className="absolute inset-[-4px] rounded-full border-2 border-primary/40"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Orbital ring */}
      <motion.div
        className="absolute inset-[-6px] rounded-full border-2 border-dashed border-primary/30"
        style={{ transform: "rotateX(60deg)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Planet body */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent shadow-2xl"
        whileHover={{ rotate: 10 }}
        transition={{ duration: 0.4 }}
      >
        {/* Continents SVG */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          <path
            d="M20,35 Q30,25 45,30 T65,35 Q75,45 70,55 T55,70 Q40,75 30,65 T20,45 Z"
            fill="hsl(var(--primary-foreground) / 0.9)"
          />
          <path
            d="M75,25 Q85,20 90,30 T88,50 Q80,45 75,35 Z"
            fill="hsl(var(--primary-foreground) / 0.7)"
          />
          <path
            d="M45,75 Q55,70 60,80 T50,90 Q40,85 45,75 Z"
            fill="hsl(var(--primary-foreground) / 0.8)"
          />
          {/* Meridians */}
          <ellipse cx="50" cy="50" rx="35" ry="48" fill="none" stroke="hsl(var(--primary-foreground) / 0.15)" strokeWidth="1" />
          <ellipse cx="50" cy="50" rx="20" ry="48" fill="none" stroke="hsl(var(--primary-foreground) / 0.15)" strokeWidth="1" />
          <line x1="50" y1="2" x2="50" y2="98" stroke="hsl(var(--primary-foreground) / 0.15)" strokeWidth="1" />
          <line x1="15" y1="35" x2="85" y2="65" stroke="hsl(var(--primary-foreground) / 0.1)" strokeWidth="1" />
        </svg>
        
        {/* Glossy reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
        <div className="absolute top-2 right-4 h-4 w-4 rounded-full bg-white/40 blur-[2px]" />
      </motion.div>
      
      {/* Satellite */}
      <motion.div
        className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent shadow-lg"
        animate={{ 
          x: [0, 4, 0, -4, 0],
          y: [0, -4, 0, 4, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Ring highlight on hover */}
      <motion.div
        className="absolute inset-0 rounded-full ring-4 ring-accent/50 ring-offset-2 ring-offset-background"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        whileFocus={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
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
      {/* Hero icon - Planet Logo avec micro-interactions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6 flex justify-center"
      >
        <PlanetLogo />
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
