import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface FLEWeeklyProgressProps {
  currentXP: number;
  targetXP: number;
}

export function FLEWeeklyProgress({ currentXP, targetXP }: FLEWeeklyProgressProps) {
  const percent = Math.min(100, Math.round((currentXP / targetXP) * 100));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          Objectif de la semaine
        </span>
        <span className="text-sm font-bold text-primary">
          {currentXP}/{targetXP} XP
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-border/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
        />
      </div>
      {percent >= 100 && (
        <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
          🎉 Objectif atteint ! Bravo !
        </p>
      )}
    </motion.div>
  );
}
