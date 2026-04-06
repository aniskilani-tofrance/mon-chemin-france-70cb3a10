import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Mic, Brain, Flame, Clock, Star, Trophy, Volume2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FLELevelBadge } from "@/components/FLE/FLELevelBadge";
import { FLEModuleCard } from "@/components/FLE/FLEModuleCard";
import { FLEStatsCard } from "@/components/FLE/FLEStatsCard";
import { useFLEModules, useFLEUserProgress, useFLEModuleProgress } from "@/hooks/useFLEProgress";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryFilter = "all" | "quotidien" | "professionnel";

const LEVEL_ORDER = ["alpha", "post_alpha", "a1", "a2", "b1"];

function shouldUnlock(moduleLevel: string, userLevel: string, moduleIndex: number, previousCompleted: boolean): boolean {
  if (moduleIndex === 0) return true;
  const moduleLevelIdx = LEVEL_ORDER.indexOf(moduleLevel);
  const userLevelIdx = LEVEL_ORDER.indexOf(userLevel);
  // Unlock if user level >= module level AND previous module in same level is completed
  return userLevelIdx >= moduleLevelIdx && previousCompleted;
}

const FLEDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: modules, isLoading: modulesLoading } = useFLEModules();
  const { data: userProgress, isLoading: progressLoading } = useFLEUserProgress();
  const { data: moduleProgress } = useFLEModuleProgress();
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const isLoading = modulesLoading || progressLoading;

  // No placement gate — direct access to courses

  const progress = userProgress || {
    estimated_level: "a1",
    total_xp: 0,
    words_learned: 0,
    phrases_mastered: 0,
    oral_score: 0,
    comprehension_score: 0,
    streak_days: 0,
    total_time_minutes: 0,
    placement_completed: false,
  };

  const getModuleProgress = (moduleId: string) => {
    return moduleProgress?.find((mp) => mp.module_id === moduleId);
  };

  const filteredModules = (modules || []).filter(
    (m) => filter === "all" || m.category === filter
  );

  const completedCount = moduleProgress?.filter((mp) => mp.completed_at).length || 0;
  const totalModules = modules?.length || 0;
  const overallProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

  // Don't render if placement not done
  if (!progressLoading && user && (!userProgress || !userProgress.placement_completed)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Header />

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Mon français 🇫🇷
            </h1>
            <FLELevelBadge level={progress.estimated_level} size="lg" />
          </div>
          <p className="text-muted-foreground text-sm">
            Progressez à votre rythme avec des leçons courtes et pratiques.
          </p>
        </motion.div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
            <FLEStatsCard
              icon={<Flame className="h-5 w-5" />}
              label="Série"
              value={`${progress.streak_days}j`}
              subtitle="jours consécutifs"
              color="text-orange-500"
            />
            <FLEStatsCard
              icon={<Star className="h-5 w-5" />}
              label="XP total"
              value={progress.total_xp}
              color="text-amber-500"
            />
            <FLEStatsCard
              icon={<Mic className="h-5 w-5" />}
              label="Score oral"
              value={`${progress.oral_score}%`}
              color="text-primary"
            />
            <FLEStatsCard
              icon={<Brain className="h-5 w-5" />}
              label="Compréhension"
              value={`${progress.comprehension_score}%`}
              color="text-indigo-500"
            />
          </div>
        )}

        {/* Overall progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Progression globale
            </span>
            <span className="text-sm font-bold text-primary">{overallProgress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-border/50 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{completedCount} modules terminés</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {progress.total_time_minutes} min au total
            </span>
          </div>
        </motion.div>

        {/* Quick stats row */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" /> {progress.words_learned} mots appris
          </span>
          <span className="flex items-center gap-1">
            <Volume2 className="h-4 w-4" /> {progress.phrases_mastered} phrases
          </span>
        </div>

        {/* Dialogue CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-xl border-primary/20 bg-primary/5 py-6 hover:bg-primary/10"
            onClick={() => navigate("/fle/dialogue")}
          >
            <MessageCircle className="h-5 w-5 text-primary" />
            <div className="text-left">
              <span className="block text-sm font-semibold text-foreground">Dialogues avec Marianne</span>
              <span className="block text-xs text-muted-foreground">Boulangerie, médecin, transports…</span>
            </div>
          </Button>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "all" as const, label: "📚 Tout" },
            { key: "quotidien" as const, label: "🏠 Quotidien" },
            { key: "professionnel" as const, label: "💼 Professionnel" },
          ]).map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === cat.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modules list */}
        <div className="space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          ) : filteredModules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucun module disponible pour le moment.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredModules.map((module, index) => {
                const mp = getModuleProgress(module.id);
                const moduleProgressPercent = mp
                  ? mp.exercises_total > 0
                    ? Math.round((mp.exercises_done / mp.exercises_total) * 100)
                    : 0
                  : 0;

                // Determine unlock: first module always unlocked, others based on level + previous completion
                const previousModule = index > 0 ? filteredModules[index - 1] : null;
                const previousMp = previousModule ? getModuleProgress(previousModule.id) : null;
                const previousCompleted = previousMp ? !!previousMp.completed_at : false;
                const isUnlocked = mp?.unlocked || shouldUnlock(
                  module.cecrl_level,
                  progress.estimated_level,
                  index,
                  previousCompleted
                );

                return (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <FLEModuleCard
                      title={module.title}
                      description={module.description}
                      icon={module.icon || "📖"}
                      cecrlLevel={module.cecrl_level}
                      category={module.category}
                      durationMinutes={module.duration_minutes || 7}
                      progress={moduleProgressPercent}
                      unlocked={isUnlocked}
                      completed={!!mp?.completed_at}
                      onClick={() => navigate(`/fle/exercise/${module.id}`)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default FLEDashboard;
