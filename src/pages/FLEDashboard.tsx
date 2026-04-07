import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FLECoach } from "@/components/FLE/FLECoach";
import { BookOpen, Mic, Brain, Flame, Star, Trophy, Target, TrendingUp, TrendingDown, Sparkles, Info } from "lucide-react";
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
type ThemeFilter = string | null; // null = no theme filter

const LEVEL_ORDER = ["alpha", "post_alpha", "a1", "a2", "b1"];

// Sector → theme mapping for personalization
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

// Sort modules by relevance to user profile
function personalizeModules(modules: FLEModule[], profile: { main_goal?: string | null; target_sector?: string | null } | null): FLEModule[] {
  if (!profile) return modules;

  const priorityThemes = new Set<string>();

  // If goal is work → prioritize professional themes
  if (profile.main_goal === "travail" || profile.main_goal === "emploi") {
    ["travail", "entretien", "cv", "securite"].forEach(t => priorityThemes.add(t));
  }

  // If target sector is set → prioritize sector themes
  if (profile.target_sector) {
    const sectorKey = profile.target_sector.toLowerCase().replace(/[éè]/g, "e").replace(/\s+/g, "_");
    const themes = SECTOR_TO_THEMES[sectorKey] || [];
    themes.forEach(t => priorityThemes.add(t));
  }

  if (priorityThemes.size === 0) return modules;

  // Stable sort: priority modules first, rest after
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

  // Detect level change
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

  // Compute available themes from modules
  const availableThemes = useMemo(() => {
    if (!modules) return [];
    const themes = [...new Set(modules.map(m => m.theme))];
    return themes.filter(t => THEME_META[t]).sort();
  }, [modules]);

  // Filter & personalize modules
  const filteredModules = useMemo(() => {
    let result = modules || [];

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(m => m.category === categoryFilter);
    }

    // Theme filter
    if (themeFilter) {
      result = result.filter(m => m.theme === themeFilter);
    }

    // Personalize order if no specific theme filter active
    if (!themeFilter) {
      result = personalizeModules(result, userProfile);
    }

    return result;
  }, [modules, categoryFilter, themeFilter, userProfile]);

  const completedCount = moduleProgress?.filter((mp) => mp.completed_at).length || 0;
  const earnedBadgeKeys = new Set((userBadges || []).map((b) => b.badge_key));

  // Find next uncompleted unlocked module for daily mission
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

  const handleThemeClick = (theme: string) => {
    setThemeFilter(prev => prev === theme ? null : theme);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24">
        {/* Level change banner */}
        <LevelChangeBanner levelChange={levelChange} onDismiss={() => setLevelChange(null)} />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Mon français 🇫🇷</h1>
            <div className="flex items-center gap-2">
              {progress.streak_days > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-1 text-orange-500 font-bold text-sm"
                >
                  <Flame className="h-5 w-5" />
                  {progress.streak_days}
                </motion.div>
              )}
              <FLELevelBadge level={progress.estimated_level} size="lg" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Progressez à votre rythme avec des leçons courtes et pratiques.</p>

          {/* Personalized message */}
          {personalizedMsg && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-2 flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2"
            >
              <Info className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm text-foreground">{personalizedMsg}</p>
            </motion.div>
          )}

          <Button variant="outline" size="sm" className="mt-3 gap-2 rounded-full" onClick={() => navigate("/placement-test")}>
            <Target className="h-4 w-4" />
            {progress.placement_completed ? "Refaire le test de niveau" : "Passer le test de niveau"}
          </Button>
        </motion.div>

        {/* Daily Mission */}
        {!isLoading && nextModule && (
          <div className="mb-6">
            <FLEDailyMission
              moduleTitle={nextModule.title}
              moduleIcon={nextModule.icon || "📖"}
              exerciseType=""
              durationMinutes={nextModule.duration_minutes || 5}
              isCompleted={isMissionCompletedToday}
              onStart={() => navigate(`/fle/exercise/${nextModule.id}`)}
            />
          </div>
        )}

        {/* Weekly XP progress */}
        <div className="mb-6">
          <FLEWeeklyProgress currentXP={progress.total_xp} targetXP={progress.weekly_xp_target} />
        </div>

        {/* Stats grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
            <FLEStatsCard icon={<Star className="h-5 w-5" />} label="XP total" value={progress.total_xp} color="text-amber-500" />
            <FLEStatsCard icon={<Mic className="h-5 w-5" />} label="Score oral" value={`${progress.oral_score}%`} color="text-primary" />
            <FLEStatsCard icon={<Brain className="h-5 w-5" />} label="Compréhension" value={`${progress.comprehension_score}%`} color="text-indigo-500" />
            <FLEStatsCard icon={<Trophy className="h-5 w-5" />} label="Modules" value={`${completedCount}/${modules?.length || 0}`} color="text-green-500" />
          </div>
        )}

        {/* Quick access grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: "📖", label: "Leçon du jour", onClick: () => nextModule && navigate(`/fle/exercise/${nextModule.id}`) },
            { icon: "🔄", label: "Réviser", onClick: () => navigate("/fle/review") },
            { icon: "🗣️", label: "Pratiquer l'oral", onClick: () => navigate("/fle/dialogue") },
            { icon: "💼", label: "Français emploi", onClick: () => { setCategoryFilter("professionnel"); setThemeFilter(null); } },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={item.onClick}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-sm font-semibold text-foreground">{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Badges row */}
        {allBadges && allBadges.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <span>🏅</span> Badges
              <span className="text-xs text-muted-foreground font-normal">
                {earnedBadgeKeys.size}/{allBadges.length}
              </span>
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 mb-3">
          {([
            { key: "all" as const, label: "📚 Tout" },
            { key: "quotidien" as const, label: "🏠 Quotidien" },
            { key: "professionnel" as const, label: "💼 Pro" },
          ]).map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setCategoryFilter(cat.key); setThemeFilter(null); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                categoryFilter === cat.key && !themeFilter
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat.label}
            </button>
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
                <button
                  key={theme}
                  onClick={() => handleThemeClick(theme)}
                  className={`flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <span>{meta.icon}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Pathway map */}
        {isLoading ? (
          [...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl mb-2" />)
        ) : filteredModules.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Aucun module disponible pour ce filtre.</p>
            <Button variant="link" onClick={() => { setCategoryFilter("all"); setThemeFilter(null); }} className="mt-2">
              Voir tous les modules
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

// Level change banner extracted
function LevelChangeBanner({ levelChange, onDismiss }: {
  levelChange: { from: string; to: string; direction: "up" | "down" } | null;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      {levelChange && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", duration: 0.6 }}
          className={`mb-6 rounded-2xl border p-5 text-center shadow-lg ${
            levelChange.direction === "up"
              ? "border-green-300/50 bg-green-50 dark:border-green-500/30 dark:bg-green-950/30"
              : "border-amber-300/50 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/30"
          }`}
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="mb-3">
            {levelChange.direction === "up" ? (
              <Sparkles className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="mx-auto h-8 w-8 text-amber-600 dark:text-amber-400" />
            )}
          </motion.div>
          <p className={`text-lg font-bold ${levelChange.direction === "up" ? "text-green-800 dark:text-green-200" : "text-amber-800 dark:text-amber-200"}`}>
            {levelChange.direction === "up" ? "🎉 Niveau mis à jour !" : "Niveau ajusté"}
          </p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <FLELevelBadge level={levelChange.from} size="md" className="opacity-60" />
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              {levelChange.direction === "up" ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
            </motion.span>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: [1, 1.1, 1] }} transition={{ delay: 0.4, duration: 0.5 }}>
              <FLELevelBadge level={levelChange.to} size="lg" />
            </motion.div>
          </div>
          <p className={`mt-2 text-sm ${levelChange.direction === "up" ? "text-green-700 dark:text-green-300" : "text-amber-700 dark:text-amber-300"}`}>
            {levelChange.direction === "up"
              ? "Bravo, vous progressez ! Les modules adaptés sont maintenant débloqués."
              : "Votre niveau a été recalibré pour mieux vous accompagner."}
          </p>
          <button onClick={onDismiss} className="mt-3 text-xs text-muted-foreground underline hover:text-foreground">
            Fermer
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FLEDashboard;
