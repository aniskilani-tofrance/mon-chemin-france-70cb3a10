import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Photo Language icons mapping - expressive visuals for each choice type
export const PHOTO_LANGUAGE_ICONS: Record<string, string> = {
  // Main goals
  learn_french: "📚",
  find_job: "💼",
  job_training: "🎓",
  need_help: "🤝",
  
  // Contact 48h
  yes: "✅",
  no: "⏰",
  
  // Literacy
  partial: "✍️",
  
  // French levels with visual metaphors
  alpha: "🌱", // Sprout - just starting
  a1: "🌿", // Growing plant
  a2: "🌳", // Tree - more established
  b1: "🌲", // Full tree - confident
  
  // Work right
  unknown: "🤔",
  
  // Barriers with expressive icons
  childcare: "👶",
  transport: "🚌",
  health: "💊",
  housing: "🏠",
  admin: "📋",
  schedule: "⏰",
  none: "✨",
  
  // FLE types
  general: "📖",
  professional: "👔",
  
  // FLE format
  daytime: "🌅",
  evening: "🌙",
  flexible: "🔄",
  
  // Sectors with vivid imagery
  btp: "🏗️",
  logistique: "📦",
  proprete: "🧹",
  aide_personne: "❤️",
  hotellerie: "🍽️",
  securite: "🛡️",
  agriculture: "🌻",
  
  // Training duration
  short: "⚡",
  medium: "📅",
  long: "📆",
  
  // Mobility
  local: "🏘️",
  regional: "🚗",
  national: "🚄",
  
  // Funding
  france_travail: "🏛️",
  cpf: "💳",
  other: "💰",
  no_funding: "❓",
  
  // Work schedule
  day_only: "☀️",
  night_possible: "🌃",
  weekend_ok: "📆",
  all_hours: "🔄",
  
  // Immediate availability
  immediate: "🚀",
  soon: "📅",
  later: "⏳",
  
  // Interests (for no-experience profiles)
  manual_work: "🔧",
  helping_people: "💖",
  outdoor_work: "🌳",
  customer_facing: "🗣️",
  precision_work: "🎯",
  cooking: "👨‍🍳",
};

interface PhotoLanguageChoiceProps {
  choiceId: string;
  label: string;
  customIcon?: string;
  /** Image illustrative (remplace l'icône emoji si fournie) */
  customImage?: string;
  isSelected: boolean;
  isMultiSelect?: boolean;
  onClick: () => void;
  index: number;
  compact?: boolean;
}

export function PhotoLanguageChoice({
  choiceId,
  label,
  customIcon,
  customImage,
  isSelected,
  isMultiSelect = false,
  onClick,
  index,
  compact = false,
}: PhotoLanguageChoiceProps) {
  // Get the best icon - custom first, then from mapping, then fallback
  const icon = customIcon || PHOTO_LANGUAGE_ICONS[choiceId] || "📌";
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.05, 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
      whileHover={{ 
        scale: 1.03, 
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 transition-all duration-300 overflow-hidden",
        compact ? "p-3 sm:p-4" : "p-3 sm:p-4",
        isSelected
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-2 ring-primary/30"
          : "border-border bg-card hover:border-primary/50 hover:bg-secondary/30 hover:shadow-md",
        customImage ? "min-h-[160px] sm:min-h-[200px]" : "min-h-[100px] sm:min-h-[120px]"
      )}
    >
      {/* Numéro d'option (synchronisé avec la lecture vocale "1. ... 2. ...") */}
      <div
        className={cn(
          "absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-background/90 text-foreground border border-border"
        )}
        aria-hidden="true"
      >
        {index + 1}
      </div>

      {/* Selection indicator for multi-select */}
      {isMultiSelect && (
        <div
          className={cn(
            "absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30 bg-background"
          )}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </div>
      )}

      {/* Image illustrative ou icône emoji */}
      {customImage ? (
        <motion.div
          animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={cn(
            "w-full aspect-square rounded-xl overflow-hidden bg-secondary/20 flex items-center justify-center",
            isSelected && "ring-2 ring-primary/30"
          )}
        >
          <img
            src={customImage}
            alt={label}
            loading="lazy"
            width={512}
            height={512}
            className="w-full h-full object-cover"
          />
        </motion.div>
      ) : (
        <motion.div
          animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={cn(
            "text-4xl sm:text-5xl transition-transform",
            isSelected && "drop-shadow-lg"
          )}
        >
          {icon}
        </motion.div>
      )}

      {/* Label */}
      <span
        className={cn(
          "text-center text-xs font-medium leading-tight transition-colors sm:text-sm relative z-10",
          isSelected ? "text-primary" : "text-foreground"
        )}
      >
        {label}
      </span>

      {/* Subtle check for single select */}
      {!isMultiSelect && isSelected && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-1 -right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md"
        >
          <Check className="h-3.5 w-3.5" />
        </motion.div>
      )}

      {/* Glow effect on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none",
          "bg-gradient-to-br from-primary/5 to-primary/10",
          "group-hover:opacity-100",
          isSelected && "opacity-100"
        )}
      />
    </motion.button>
  );
}

// Grid layout helper component
interface PhotoLanguageGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function PhotoLanguageGrid({ children, columns = 2 }: PhotoLanguageGridProps) {
  const gridClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3 sm:gap-4", gridClass[columns])}>
      {children}
    </div>
  );
}
