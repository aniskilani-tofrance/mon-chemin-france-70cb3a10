import { motion } from "framer-motion";
import { PlayCircle, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        className="rounded-2xl border border-green-200 bg-green-50 p-5 dark:border-green-800/40 dark:bg-green-950/20"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-200">Mission du jour terminée !</p>
            <p className="text-sm text-green-700/80 dark:text-green-300/70">Revenez demain pour continuer votre série 🔥</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-5"
    >
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-primary/70">
        🎯 Mission du jour
      </p>
      <div className="flex items-center gap-4">
        <span className="text-4xl">{moduleIcon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{moduleTitle}</h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {durationMinutes} min
            </span>
          </div>
        </div>
        <Button onClick={onStart} className="gap-2 rounded-xl shrink-0">
          <PlayCircle className="h-4 w-4" />
          Go !
        </Button>
      </div>
    </motion.div>
  );
}
