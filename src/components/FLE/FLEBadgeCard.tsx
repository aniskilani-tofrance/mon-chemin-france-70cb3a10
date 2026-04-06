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
        whileHover={{ scale: 1.05 }}
        className={cn(
          "flex flex-col items-center gap-1 rounded-xl border p-3 min-w-[72px] transition-colors",
          earned
            ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20"
            : "border-border/50 bg-muted/20 opacity-50"
        )}
      >
        <span className="text-2xl">{earned ? icon : "🔒"}</span>
        <span className="text-[10px] font-medium text-center text-muted-foreground leading-tight line-clamp-2">
          {title}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 transition-colors",
        earned
          ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20"
          : "border-border/50 bg-muted/20 opacity-60"
      )}
    >
      <span className="text-3xl">{earned ? icon : "🔒"}</span>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold text-sm", earned ? "text-foreground" : "text-muted-foreground")}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {!earned && <Lock className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
    </motion.div>
  );
}
