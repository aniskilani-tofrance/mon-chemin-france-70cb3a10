import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface FLEBadgeCardProps {
  icon: string;
  title: string;
  description?: string;
  earned: boolean;
  earnedAt?: string;
  compact?: boolean;
}

export function FLEBadgeCard({ icon, title, description, earned, compact }: FLEBadgeCardProps) {
  if (compact) {
    return (
      <motion.div
        whileHover={earned ? { scale: 1.12, rotate: 3, y: -4 } : { scale: 1.02 }}
        whileTap={earned ? { scale: 0.95 } : {}}
        className={cn(
          "flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 min-w-[76px] transition-all cursor-default",
          earned
            ? "border-amber-300 bg-gradient-to-b from-amber-50 to-orange-50/50 shadow-md shadow-amber-200/30 dark:border-amber-600/50 dark:from-amber-950/30 dark:to-orange-950/20 dark:shadow-amber-900/10"
            : "border-border/30 bg-muted/10 grayscale"
        )}
      >
        <motion.span
          className="text-2xl"
          animate={earned ? { y: [0, -2, 0] } : {}}
          transition={earned ? { repeat: Infinity, duration: 2, delay: Math.random() * 2 } : {}}
        >
          {earned ? icon : "🔒"}
        </motion.span>
        <span className={cn(
          "text-[10px] font-bold text-center leading-tight line-clamp-2",
          earned ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground/50"
        )}>
          {title}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      whileHover={earned ? { scale: 1.03 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 p-4 transition-all",
        earned
          ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/50 shadow-md dark:border-amber-600/50 dark:from-amber-950/30 dark:to-orange-950/20"
          : "border-border/30 bg-muted/10 grayscale opacity-60"
      )}
    >
      <motion.span
        className="text-3xl"
        animate={earned ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        {earned ? icon : "🔒"}
      </motion.span>
      <div className="min-w-0 flex-1">
        <p className={cn("font-bold text-sm", earned ? "text-foreground" : "text-muted-foreground")}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {!earned && <Lock className="h-4 w-4 text-muted-foreground/30 shrink-0" />}
    </motion.div>
  );
}
