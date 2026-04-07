import { motion } from "framer-motion";
import { Star, Trophy, Flame } from "lucide-react";

interface FLEWeeklyProgressProps {
  currentXP: number;
  targetXP: number;
}

export function FLEWeeklyProgress({ currentXP, targetXP }: FLEWeeklyProgressProps) {
  const percent = Math.min(100, Math.round((currentXP / targetXP) * 100));
  const isComplete = percent >= 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border-2 border-border/50 bg-card p-4 relative overflow-hidden"
    >
      {/* Background sparkle for complete */}
      {isComplete && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-100/30 via-yellow-100/20 to-amber-100/30 dark:from-amber-900/10 dark:via-yellow-900/5 dark:to-amber-900/10"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}

      <div className="relative flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-foreground flex items-center gap-2">
          <motion.div
            animate={isComplete ? { rotate: [0, 15, -15, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            {isComplete ? <Trophy className="h-5 w-5 text-amber-500" /> : <Star className="h-5 w-5 text-amber-500" />}
          </motion.div>
          Objectif semaine
        </span>
        <div className="flex items-center gap-1.5">
          <motion.span
            className="text-lg font-extrabold text-primary"
            key={currentXP}
            initial={{ scale: 1.4 }}
            animate={{ scale: 1 }}
          >
            {currentXP}
          </motion.span>
          <span className="text-sm text-muted-foreground font-medium">/ {targetXP} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-5 w-full rounded-full bg-muted/30 overflow-hidden border border-border/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`h-full rounded-full relative ${
            isComplete
              ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500"
              : "bg-gradient-to-r from-primary via-primary to-accent-foreground"
          }`}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
        </motion.div>

        {/* Percent label inside bar */}
        {percent > 15 && (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-primary-foreground drop-shadow-sm">
            {percent}%
          </span>
        )}
      </div>

      {isComplete && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm font-bold text-center"
        >
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            🏆 Objectif atteint ! Vous êtes en feu !
          </span>
        </motion.p>
      )}
    </motion.div>
  );
}
