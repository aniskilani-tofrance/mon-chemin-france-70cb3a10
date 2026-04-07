import { motion } from "framer-motion";
import { Lock, CheckCircle2, PlayCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { FLELevelBadge } from "./FLELevelBadge";

interface FLEModuleCardProps {
  title: string;
  description?: string;
  icon: string;
  cecrlLevel: string;
  category: string;
  durationMinutes: number;
  progress: number; // 0-100
  unlocked: boolean;
  completed: boolean;
  onClick: () => void;
}

export function FLEModuleCard({
  title,
  description,
  icon,
  cecrlLevel,
  category,
  durationMinutes,
  progress,
  unlocked,
  completed,
  onClick,
}: FLEModuleCardProps) {
  const isAccessible = unlocked || completed;

  return (
    <motion.button
      whileHover={isAccessible ? { scale: 1.02, y: -2 } : {}}
      whileTap={isAccessible ? { scale: 0.98 } : {}}
      onClick={isAccessible ? onClick : undefined}
      className={cn(
        "relative w-full rounded-2xl border p-5 text-left transition-all",
        isAccessible
          ? "bg-card border-border shadow-sm hover:shadow-md hover:border-primary/30 cursor-pointer"
          : "bg-muted/20 border-border/50 opacity-60 cursor-not-allowed"
      )}
    >
      {/* Status indicator */}
      <div className="absolute top-3 right-3">
        {completed ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : !unlocked ? (
          <Lock className="h-5 w-5 text-muted-foreground/50" />
        ) : progress > 0 ? (
          <PlayCircle className="h-6 w-6 text-primary" />
        ) : null}
      </div>

      {/* Icon + title */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base leading-tight truncate pr-8">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <FLELevelBadge level={cecrlLevel} size="sm" />
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {durationMinutes} min
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-foreground/70">
          {category === "quotidien" ? "🏠 Quotidien" : category === "professionnel" ? "💼 Pro" : category === "certification" ? "🎓 Certif" : category === "culture" ? "🇫🇷 Civique" : category}
        </span>
      </div>

      {/* Progress bar */}
      {isAccessible && progress > 0 && !completed && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.button>
  );
}
