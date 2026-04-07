import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FLECoach } from "@/components/FLE/FLECoach";
import { BookOpen, Mic, Brain, Flame, Star, Trophy, Target, TrendingUp, TrendingDown, Sparkles, Info, Zap, RotateCcw, MessageCircle, Briefcase, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FLELevelBadge } from "@/components/FLE/FLELevelBadge";
import { FLEDailyMission } from "@/components/FLE/FLEDailyMission";
import { FLEWeeklyProgress } from "@/components/FLE/FLEWeeklyProgress";
import { FLEPathwayMap } from "@/components/FLE/FLEPathwayMap";
import { FLEBadgeCard } from "@/components/FLE/FLEBadgeCard";
import { FLEStatsCard } from "@/components/FLE/FLEStatsCard";
import {
  useFLEModules, useFLEUserProgress, useFLEModuleProgress,
  useFLEBadges, useFLEUserBadges, useUserProfile,
  THEME_META, FLEModule,
} from "@/hooks/useFLEProgress";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryFilter = "all" | "quotidien" | "professionnel";
type ThemeFilter = string | null;

const LEVEL_ORDER = ["alpha", "post_alpha", "a1", "a2", "b1"];

const SECTOR_TO_THEMES: Record<string, string[]> = {
  restauration: ["hotellerie"],
  hotellerie: ["hotellerie"],
  proprete: ["proprete"],
  logistique: ["logistique"],
  commerce: ["courses", "banque"],
  "aide_personne": ["aide_personne", "sante"],
  batiment: ["securite"],
  sante: ["sante"],
  transport: ["transports"],
};

function shouldUnlock(moduleLevel: string, userLevel: string, moduleIndex: number, previousCompleted: boolean): boolean {
  if (moduleIndex === 0) return true;
  const moduleLevelIdx = LEVEL_ORDER.indexOf(moduleLevel);
  const userLevelIdx = LEVEL_ORDER.indexOf(userLevel);
  return userLevelIdx >= moduleLevelIdx && previousCompleted;
}

function personalizeModules(modules: FLEModule[], profile: { main_goal?: string | null; target_sector?: string | null } | null): FLEModule[] {
  if (!profile) return modules;
  const priorityThemes = new Set<string>();
  if (profile.main_goal === "travail" || profile.main_goal === "emploi") {
    ["travail", "entretien", "cv", "securite"].forEach(t => priorityThemes.add(t));
  }
  if (profile.target_sector) {
    const sectorKey = profile.target_sector.toLowerCase().replace(/[éè]/g, "e").replace(/\s+/g, "_");
    const themes = SECTOR_TO_THEMES[sectorKey] || [];
    themes.forEach(t => priorityThemes.add(t));
  }
  if (priorityThemes.size === 0) return modules;
  return [...modules].sort((a, b) => {
    const aPriority = priorityThemes.has(a.theme) ? 0 : 1;
    const bPriority = priorityThemes.has(b.theme) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.sort_order - b.sort_order;
  });
}

function getPersonalizedMessage(profile: { main_goal?: string | null; target_sector?: string | null; french_level_cecrl?: string | null } | null): string | null {
  if (!profile) return null;
  if (profile.target_sector && (profile.main_goal === "travail" || profile.main_goal === "emploi")) {
    return `🎯 Parcours adapté pour l'emploi en ${profile.target_sector}`;
  }
  if (profile.main_goal === "travail" || profile.main_goal === "emploi") {
    return "🎯 Parcours adapté pour la recherche d'emploi";
  }
  if (profile.main_goal === "autonomie" || profile.main_goal === "vie_quotidienne") {
    return "🎯 Parcours adapté pour la vie quotidienne en France";
  }
  return null;
}

const QUICK_ACCESS = [
  { icon: "📖", label: "Leçon du jour", color: "from-sky-400/20 to-blue-400/10", borderColor: "border-sky-200 dark:border-sky-800", key: "lesson" },
  { icon: "🔄", label: "Réviser", color: "from-violet-400/20 to-purple-400/10", borderColor: "border-violet-200 dark:border-violet-800", key: "review" },
  { icon: "🗣️", label: "Oral", color: "from-emerald-400/20 to-green-400/10", borderColor: "border-emerald-200 dark:border-emerald-800", key: "oral" },
  { icon: "💼", label: "Emploi", color: "from-amber-400/20 to-orange-400/10", borderColor: "border-amber-200 dark:border-amber-800", key: "emploi" },
];

const FLEDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: modules, isLoading: modulesLoading } = useFLEModules();
  const { data: userProgress, isLoading: progressLoading } = useFLEUserProgress();
  const { data: moduleProgress } = useFLEModuleProgress();
  const { data: allBadges } = useFLEBadges();
  const { data: userBadges } = useFLEUserBadges();
  const { data: userProfile } = useUserProfile();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [themeFilter, setThemeFilter] = useState<ThemeFilter>(null);
  const [levelChange, setLevelChange] = useState<{ from: string; to: string; direction: "up" | "down" } | null>(null);
  const hasCheckedLevel = useRef(false);

  const isLoading = modulesLoading || progressLoading;

  useEffect(() => {
    if (progressLoading || !userProgress || hasCheckedLevel.current) return;
    hasCheckedLevel.current = true;
    const storageKey = `fle-level-${user?.id}`;
    const previousLevel = localStorage.getItem(storageKey);
    const currentLevel = userProgress.estimated_level;
    if (previousLevel && previousLevel !== currentLevel) {
      const prevIdx = LEVEL_ORDER.indexOf(previousLevel);
      const currIdx = LEVEL_ORDER.indexOf(currentLevel);
      setLevelChange({ from: previousLevel, to: currentLevel, direction: currIdx > prevIdx ? "up" : "down" });
      setTimeout(() => setLevelChange(null), 8000);
    }
    localStorage.setItem(storageKey, currentLevel);
  }, [progressLoading, userProgress, user?.id]);

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
    daily_goal_minutes: 5,
    weekly_xp_target: 100,
    daily_mission_completed_at: null,
  };

  const getModuleProgress = (moduleId: string) =>
    moduleProgress?.find((mp) => mp.module_id === moduleId);

  const availableThemes = useMemo(() => {
    if (!modules) return [];
    const themes = [...new Set(modules.map(m => m.theme))];
    return themes.filter(t => THEME_META[t]).sort();
  }, [modules]);

  const filteredModules = useMemo(() => {
    let result = modules || [];
    if (categoryFilter !== "all") result = result.filter(m => m.category === categoryFilter);
    if (themeFilter) result = result.filter(m => m.theme === themeFilter);
    if (!themeFilter) result = personalizeModules(result, userProfile);
    return result;
  }, [modules, categoryFilter, themeFilter, userProfile]);

  const completedCount = moduleProgress?.filter((mp) => mp.completed_at).length || 0;
  const earnedBadgeKeys = new Set((userBadges || []).map((b) => b.badge_key));

  const nextModule = filteredModules.find((module, index) => {
    const mp = getModuleProgress(module.id);
    if (mp?.completed_at) return false;
    const previousModule = index > 0 ? filteredModules[index - 1] : null;
    const previousMp = previousModule ? getModuleProgress(previousModule.id) : null;
    const previousCompleted = previousMp ? !!previousMp.completed_at : false;
    const isUnlocked = mp?.unlocked || shouldUnlock(module.cecrl_level, progress.estimated_level, index, previousCompleted);
    return isUnlocked;
  });

  const isMissionCompletedToday = (() => {
    if (!progress.daily_mission_completed_at) return false;
    const today = new Date().toDateString();
    return new Date(progress.daily_mission_completed_at).toDateString() === today;
  })();

  const personalizedMsg = getPersonalizedMessage(userProfile);

  const handleQuickAccess = (key: string) => {
    switch (key) {
      case "lesson": nextModule && navigate(`/fle/exercise/${nextModule.id}`); break;
      case "review": navigate("/fle/review"); break;
      case "oral": navigate("/fle/dialogue"); break;
      case "emploi": setCategoryFilter("professionnel"); setThemeFilter(null); break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24">
        {/* Level change banner */}
        <LevelChangeBanner levelChange={levelChange} onDismiss={() => setLevelChange(null)} />

        {/* Header - Fun & bold */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                Mon français
                <motion.span
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  🇫🇷
                </motion.span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {progress.streak_days > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-400/20 to-red-400/10 border-2 border-orange-300 dark:border-orange-700 px-3 py-1 font-extrabold text-foreground shadow-md"
                >
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">{progress.streak_days}</span>
                </motion.div>
              )}
              <FLELevelBadge level={progress.estimated_level} size="lg" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Chaque minute compte. Progressez à votre rythme ! 🚀
          </p>

          {personalizedMsg && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-3 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/10 border-2 border-primary/15 px-4 py-2.5"
            >
              <Target className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm font-bold text-foreground">{personalizedMsg}</p>
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" size="sm" className="mt-3 gap-2 rounded-full font-bold border-2" onClick={() => navigate("/placement-test")}>
              <Target className="h-4 w-4" />
              {progress.placement_completed ? "Refaire le test" : "Test de niveau"}
            </Button>
          </motion.div>
        </motion.div>

        {/* Coach Marianne */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <FLECoach
              userLevel={progress.estimated_level}
              streakDays={progress.streak_days}
              totalXp={progress.total_xp}
              modulesCompleted={completedCount}
              oralScore={progress.oral_score}
              comprehensionScore={progress.comprehension_score}
              lastModuleTitle={nextModule?.title}
              targetSector={userProfile?.target_sector}
              mainGoal={userProfile?.main_goal}
              firstName={userProfile?.first_name}
            />
          </motion.div>
        )}

        {/* Daily Mission */}
        {!isLoading && nextModule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <FLEDailyMission
              moduleTitle={nextModule.title}
              moduleIcon={nextModule.icon || "📖"}
              exerciseType=""
              durationMinutes={nextModule.duration_minutes || 5}
              isCompleted={isMissionCompletedToday}
              onStart={() => navigate(`/fle/exercise/${nextModule.id}`)}
            />
          </motion.div>
        )}

        {/* Weekly XP progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <FLEWeeklyProgress currentXP={progress.total_xp} targetXP={progress.weekly_xp_target} />
        </motion.div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
            <FLEStatsCard icon={<Star className="h-6 w-6" />} label="XP total" value={progress.total_xp} color="text-amber-500" bgGradient="from-amber-400/15 to-orange-400/5" />
            <FLEStatsCard icon={<Mic className="h-6 w-6" />} label="Oral" value={`${progress.oral_score}%`} color="text-sky-500" bgGradient="from-sky-400/15 to-blue-400/5" />
            <FLEStatsCard icon={<Brain className="h-6 w-6" />} label="Compréhension" value={`${progress.comprehension_score}%`} color="text-violet-500" bgGradient="from-violet-400/15 to-purple-400/5" />
            <FLEStatsCard icon={<Trophy className="h-6 w-6" />} label="Modules" value={`${completedCount}/${modules?.length || 0}`} color="text-emerald-500" bgGradient="from-emerald-400/15 to-green-400/5" />
          </div>
        )}

        {/* Quick access - fun colorful cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {QUICK_ACCESS.map((item, i) => (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.05, type: "spring" }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuickAccess(item.key)}
              className={`relative overflow-hidden flex flex-col items-center gap-2 rounded-2xl border-2 ${item.borderColor} bg-gradient-to-br ${item.color} p-5 text-center shadow-md transition-all`}
            >
              <motion.span
                className="text-3xl"
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              >
                {item.icon}
              </motion.span>
              <span className="text-sm font-extrabold text-foreground">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Badges row */}
        {allBadges && allBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-sm font-extrabold text-foreground mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Trophy className="h-4 w-4 text-amber-500" /> Trophées
              <span className="text-xs text-muted-foreground font-normal normal-case tracking-normal">
                {earnedBadgeKeys.size}/{allBadges.length}
              </span>
            </h2>
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {allBadges.map((badge) => (
                <FLEBadgeCard
                  key={badge.key}
                  icon={badge.icon}
                  title={badge.title}
                  earned={earnedBadgeKeys.has(badge.key)}
                  compact
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Section title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-2 mb-3"
        >
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-extrabold text-foreground">Mon parcours</h2>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 mb-3">
          {([
            { key: "all" as const, label: "📚 Tout" },
            { key: "quotidien" as const, label: "🏠 Quotidien" },
            { key: "professionnel" as const, label: "💼 Pro" },
          ]).map((cat) => (
            <motion.button
              key={cat.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setCategoryFilter(cat.key); setThemeFilter(null); }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-all border-2 ${
                categoryFilter === cat.key && !themeFilter
                  ? "bg-primary text-primary-foreground shadow-md border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-accent hover:border-accent-foreground/20"
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Theme filter chips */}
        {availableThemes.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {availableThemes.map((theme) => {
              const meta = THEME_META[theme];
              if (!meta) return null;
              const isActive = themeFilter === theme;
              return (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setThemeFilter(prev => prev === theme ? null : theme)}
                  className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all border-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md border-primary"
                      : "bg-card border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Pathway map */}
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl mb-3" />)
        ) : filteredModules.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/20 mb-3" />
            </motion.div>
            <p className="text-muted-foreground font-medium">Aucun module pour ce filtre.</p>
            <Button variant="link" onClick={() => { setCategoryFilter("all"); setThemeFilter(null); }} className="mt-2 font-bold">
              Voir tous les modules →
            </Button>
          </motion.div>
        ) : (
          <FLEPathwayMap
            modules={filteredModules.map((module, index) => {
              const mp = getModuleProgress(module.id);
              const moduleProgressPercent = mp && mp.exercises_total > 0
                ? Math.round((mp.exercises_done / mp.exercises_total) * 100) : 0;
              const previousModule = index > 0 ? filteredModules[index - 1] : null;
              const previousMp = previousModule ? getModuleProgress(previousModule.id) : null;
              const previousCompleted = previousMp ? !!previousMp.completed_at : false;
              const isUnlocked = mp?.unlocked || shouldUnlock(module.cecrl_level, progress.estimated_level, index, previousCompleted);
              return {
                id: module.id,
                title: module.title,
                icon: module.icon || "📖",
                cecrlLevel: module.cecrl_level,
                durationMinutes: module.duration_minutes || 7,
                progress: moduleProgressPercent,
                unlocked: isUnlocked,
                completed: !!mp?.completed_at,
              };
            })}
            onModuleClick={(id) => navigate(`/fle/exercise/${id}`)}
          />
        )}
      </main>
    </div>
  );
};

// Level change banner
function LevelChangeBanner({ levelChange, onDismiss }: {
  levelChange: { from: string; to: string; direction: "up" | "down" } | null;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {levelChange && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`mb-6 rounded-3xl border-2 p-6 text-center shadow-xl relative overflow-hidden ${
            levelChange.direction === "up"
              ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:border-emerald-600/50 dark:from-emerald-950/30 dark:via-green-950/20 dark:to-teal-950/20"
              : "border-amber-300 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:border-amber-600/50 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/20"
          }`}
        >
          {/* Confetti */}
          {levelChange.direction === "up" && [...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                background: ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"][i],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.15 }}
            />
          ))}

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-3"
          >
            {levelChange.direction === "up" ? (
              <span className="text-5xl">🎉</span>
            ) : (
              <TrendingDown className="mx-auto h-10 w-10 text-amber-500" />
            )}
          </motion.div>
          <p className={`text-xl font-extrabold ${levelChange.direction === "up" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
            {levelChange.direction === "up" ? "Level Up !" : "Niveau ajusté"}
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <FLELevelBadge level={levelChange.from} size="md" className="opacity-50" />
            <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
              {levelChange.direction === "up" ? (
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              ) : (
                <TrendingDown className="h-6 w-6 text-amber-500" />
              )}
            </motion.span>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <FLELevelBadge level={levelChange.to} size="lg" />
            </motion.div>
          </div>
          <p className={`mt-3 text-sm font-medium ${levelChange.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {levelChange.direction === "up"
              ? "Bravo ! De nouveaux modules sont débloqués 🔓"
              : "Recalibré pour mieux vous accompagner."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDismiss}
            className="mt-3 text-xs font-bold text-muted-foreground underline hover:text-foreground"
          >
            Fermer
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FLEDashboard;
