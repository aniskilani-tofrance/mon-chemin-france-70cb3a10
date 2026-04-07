import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FLELevelBadge } from "@/components/FLE/FLELevelBadge";
import { ArrowRight, RotateCcw, Home, Star } from "lucide-react";
import { playFanfare } from "@/lib/sounds";

interface FLEModuleCompleteProps {
  moduleTitle: string;
  moduleIcon: string;
  cecrlLevel: string;
  score: number;
  totalExercises: number;
  correctCount: number;
  xpEarned: number;
  newBadges: { icon: string; title: string }[];
  onNext: () => void;
  onReview: () => void;
  onHome: () => void;
}

function getStars(score: number): number {
  if (score >= 90) return 3;
  if (score >= 60) return 2;
  return 1;
}

export function FLEModuleComplete({
  moduleTitle,
  moduleIcon,
  cecrlLevel,
  score,
  totalExercises,
  correctCount,
  xpEarned,
  newBadges,
  onNext,
  onReview,
  onHome,
}: FLEModuleCompleteProps) {
  const stars = getStars(score);

  useEffect(() => {
    playFanfare();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center px-4 py-8"
    >
      {/* Sparkle animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-4"
      >
        <span className="text-6xl">{moduleIcon}</span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-foreground mb-1"
      >
        Module terminé ! 🎉
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground mb-2"
      >
        {moduleTitle}
      </motion.p>

      <FLELevelBadge level={cecrlLevel} size="md" className="mb-6" />

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-2 mb-6"
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: i <= stars ? 1 : 0.6, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.15, type: "spring", stiffness: 200 }}
          >
            <Star
              className={`h-10 w-10 ${
                i <= stars
                  ? "text-amber-400 fill-amber-400"
                  : "text-border fill-border/30"
              }`}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 mb-6"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{score}%</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{correctCount}/{totalExercises}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
              className="text-2xl font-bold text-amber-500"
            >
              +{xpEarned}
            </motion.p>
            <p className="text-xs text-muted-foreground">XP gagnés</p>
          </div>
        </div>
      </motion.div>

      {/* New badges */}
      {newBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full max-w-sm mb-6"
        >
          <p className="text-sm font-semibold text-foreground mb-3">🏅 Nouveaux badges débloqués !</p>
          <div className="flex justify-center gap-3">
            {newBadges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 1.1 + i * 0.2, type: "spring" }}
                className="flex flex-col items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/40 dark:bg-amber-950/20"
              >
                <span className="text-3xl">{badge.icon}</span>
                <span className="text-[11px] font-medium text-foreground">{badge.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Button onClick={onNext} className="w-full gap-2">
          Module suivant <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onReview} className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" /> Réviser
          </Button>
          <Button variant="outline" onClick={onHome} className="flex-1 gap-2">
            <Home className="h-4 w-4" /> Accueil
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
