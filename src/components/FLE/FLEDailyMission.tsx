import { motion } from "framer-motion";
import { PlayCircle, Clock, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playWhoosh } from "@/lib/sounds";

interface FLEDailyMissionProps {
  moduleTitle: string;
  moduleIcon: string;
  exerciseType: string;
  durationMinutes: number;
  isCompleted: boolean;
  onStart: () => void;
}

export function FLEDailyMission({
  moduleTitle,
  moduleIcon,
  durationMinutes,
  isCompleted,
  onStart,
}: FLEDailyMissionProps) {
  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 p-5 dark:border-emerald-700/60 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/20"
      >
        {/* Confetti dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{
              background: ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"][i],
              top: `${10 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.3, delay: i * 0.2 }}
          />
        ))}
        <div className="relative flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </motion.div>
          <div>
            <p className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">
              Mission accomplie ! 🎉
            </p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
              Super travail ! Revenez demain pour continuer votre série 🔥
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/20 to-primary/5 p-5 shadow-lg shadow-primary/5"
    >
      {/* Animated glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <Zap className="h-5 w-5 text-primary" />
          </motion.div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-primary">
            Mission du jour
          </p>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border-2 border-primary/20 shadow-inner"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <span className="text-3xl">{moduleIcon}</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg truncate">{moduleTitle}</h3>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1 bg-card/80 rounded-full px-2 py-0.5 text-xs font-medium">
                <Clock className="h-3 w-3" />
                {durationMinutes} min
              </span>
              <span className="flex items-center gap-1 bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full px-2 py-0.5 text-xs font-bold">
                <Sparkles className="h-3 w-3" />
                +{durationMinutes * 3} XP
              </span>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              onClick={() => { playWhoosh(); onStart(); }}
              size="lg"
              className="gap-2 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 px-6"
            >
              <PlayCircle className="h-5 w-5" />
              Go !
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
