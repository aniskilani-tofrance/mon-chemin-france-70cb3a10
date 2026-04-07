import { useState, useEffect, useRef, useMemo } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { motion, AnimatePresence } from "framer-motion";
import { FLECoach } from "@/components/FLE/FLECoach";
import { BookOpen, Mic, Brain, Flame, Star, Trophy, Target, TrendingUp, TrendingDown, Sparkles, Zap, RotateCcw, MessageCircle, Briefcase, Volume2, VolumeX, PlayCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FLETimeTracker } from "@/components/FLE/FLETimeTracker";
import { FLEGenerateExercise } from "@/components/FLE/FLEGenerateExercise";
import { FLEInstallPrompt } from "@/components/FLE/FLEInstallPrompt";
import { FLEProgressChart } from "@/components/FLE/FLEProgressChart";
import { FLESkillsRadar } from "@/components/FLE/FLESkillsRadar";
import { FLEWeeklyGoal } from "@/components/FLE/FLEWeeklyGoal";
import { FLEExportPDF } from "@/components/FLE/FLEExportPDF";
import { FLEOfflineIndicator } from "@/components/FLE/FLEOfflineIndicator";
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
import { isSoundEnabled, toggleSound, playDing } from "@/lib/sounds";

type CategoryFilter = "all" | "quotidien" | "professionnel" | "certification" | "culture";
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
    return `Parcours adapté pour l'emploi en ${profile.target_sector}`;
  }
  if (profile.main_goal === "travail" || profile.main_goal === "emploi") {
    return "Parcours adapté pour la recherche d'emploi";
  }
  if (profile.main_goal === "autonomie" || profile.main_goal === "vie_quotidienne") {
    return "Parcours adapté pour la vie quotidienne en France";
  }
  return null;
}

const QUICK_ACCESS = [
  { icon: PlayCircle, label: "Leçon du jour", description: "Continuer votre parcours", color: "bg-sky-500/10 text-sky-600 dark:text-sky-400", key: "lesson" },
  { icon: RotateCcw, label: "Réviser", description: "Revoir les acquis", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400", key: "review" },
  { icon: MessageCircle, label: "Oral", description: "Pratiquer le dialogue", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", key: "oral" },
  { icon: Briefcase, label: "Emploi", description: "Modules professionnels", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400", key: "emploi" },
];

/* ─── Section wrapper ────────────────────────────────────── */
function Section({ children, title, icon, delay = 0, className = "" }: {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
        </div>
      )}
      {children}
    </motion.section>
  );
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
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
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

  const overallPercent = modules && modules.length > 0
    ? Math.round((completedCount / modules.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Header />
      <FLEOfflineIndicator />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24 space-y-6">
        <DemoBanner />

        {/* Level change banner */}
        <LevelChangeBanner levelChange={levelChange} onDismiss={() => setLevelChange(null)} />

        {/* ━━━ HERO HEADER ━━━ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-accent/10 to-primary/5 border border-primary/10 p-6"
        >
          {/* Decorative */}
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl leading-tight">
                  Mon français 🇫🇷
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {personalizedMsg ? `🎯 ${personalizedMsg}` : "Chaque minute compte. Progressez à votre rythme !"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { const s = toggleSound(); setSoundOn(s); if (s) playDing(); }}
                  className="flex items-center justify-center h-8 w-8 rounded-full bg-card border border-border shadow-sm"
                  title={soundOn ? "Sons activés" : "Sons désactivés"}
                >
                  {soundOn ? <Volume2 className="h-3.5 w-3.5 text-primary" /> : <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />}
                </motion.button>
                <FLELevelBadge level={progress.estimated_level} size="lg" />
              </div>
            </div>

            {/* Stats row inside hero */}
            <div className="flex items-center gap-4 mt-4">
              {progress.streak_days > 0 && (
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-extrabold text-foreground">{progress.streak_days}</span>
                  <span className="text-xs text-muted-foreground">jours</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-extrabold text-foreground">{progress.total_xp}</span>
                <span className="text-xs text-muted-foreground">XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-extrabold text-foreground">{completedCount}/{modules?.length || 0}</span>
                <span className="text-xs text-muted-foreground">modules</span>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-primary/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">{overallPercent}% du parcours terminé</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-xs h-8 border-primary/20 hover:border-primary/40" onClick={() => navigate("/placement-test")}>
                <Target className="h-3.5 w-3.5" />
                {progress.placement_completed ? "Refaire le test" : "Test de niveau"}
              </Button>
              <FLEExportPDF />
            </div>
          </div>
        </motion.div>

        {/* ━━━ COACH MARIANNE ━━━ */}
        {!isLoading && (
          <Section delay={0.1}>
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
          </Section>
        )}

        {/* ━━━ DAILY MISSION ━━━ */}
        {!isLoading && nextModule && (
          <Section delay={0.15}>
            <FLEDailyMission
              moduleTitle={nextModule.title}
              moduleIcon={nextModule.icon || "📖"}
              exerciseType=""
              durationMinutes={nextModule.duration_minutes || 5}
              isCompleted={isMissionCompletedToday}
              onStart={() => navigate(`/fle/exercise/${nextModule.id}`)}
            />
          </Section>
        )}

        {/* ━━━ QUICK ACCESS GRID ━━━ */}
        <Section delay={0.2} title="Accès rapide" icon={<Zap className="h-4 w-4 text-primary" />}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_ACCESS.map((item, i) => (
              <motion.button
                key={item.key}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleQuickAccess(item.key)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border/60 p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-foreground leading-tight">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* ━━━ STATS CARDS ━━━ */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        ) : (
          <Section delay={0.25}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <FLEStatsCard icon={<Star className="h-5 w-5" />} label="XP total" value={progress.total_xp} color="text-amber-500" bgGradient="from-amber-400/10 to-orange-400/5" />
              <FLEStatsCard icon={<Mic className="h-5 w-5" />} label="Oral" value={`${progress.oral_score}%`} color="text-sky-500" bgGradient="from-sky-400/10 to-blue-400/5" />
              <FLEStatsCard icon={<Brain className="h-5 w-5" />} label="Compréhension" value={`${progress.comprehension_score}%`} color="text-violet-500" bgGradient="from-violet-400/10 to-purple-400/5" />
              <FLEStatsCard icon={<Trophy className="h-5 w-5" />} label="Modules" value={`${completedCount}/${modules?.length || 0}`} color="text-emerald-500" bgGradient="from-emerald-400/10 to-green-400/5" />
            </div>
          </Section>
        )}

        {/* ━━━ ANALYTICS: Time + Charts + Goals ━━━ */}
        <Section delay={0.3} title="Progression" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}>
          <div className="space-y-3">
            <FLETimeTracker />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FLEProgressChart />
              <FLESkillsRadar />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FLEWeeklyGoal />
              <FLEWeeklyProgress currentXP={progress.total_xp} targetXP={progress.weekly_xp_target} />
            </div>
          </div>
        </Section>

        {/* ━━━ BADGES ━━━ */}
        {allBadges && allBadges.length > 0 && (
          <Section delay={0.35} title={`Trophées · ${earnedBadgeKeys.size}/${allBadges.length}`} icon={<Trophy className="h-4 w-4 text-amber-500" />}>
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
          </Section>
        )}

        {/* ━━━ AI GENERATE ━━━ */}
        <Section delay={0.38}>
          <FLEGenerateExercise
            userLevel={progress.estimated_level}
            theme={userProfile?.target_sector || undefined}
          />
        </Section>

        {/* ━━━ MODULES PATHWAY ━━━ */}
        <Section delay={0.4} title="Mon parcours" icon={<Sparkles className="h-4 w-4 text-primary" />}>
          {/* Category filter */}
          <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {([
              { key: "all" as const, label: "📚 Tout" },
              { key: "quotidien" as const, label: "🏠 Quotidien" },
              { key: "professionnel" as const, label: "💼 Pro" },
              { key: "certification" as const, label: "🎓 DELF/TCF" },
              { key: "culture" as const, label: "🇫🇷 Civique" },
            ]).map((cat) => (
              <button
                key={cat.key}
                onClick={() => { setCategoryFilter(cat.key); setThemeFilter(null); }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  categoryFilter === cat.key && !themeFilter
                    ? "bg-primary text-primary-foreground shadow-sm border-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-accent/50 hover:border-border"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Theme chips */}
          {availableThemes.length > 0 && (
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {availableThemes.map((theme) => {
                const meta = THEME_META[theme];
                if (!meta) return null;
                const isActive = themeFilter === theme;
                return (
                  <button
                    key={theme}
                    onClick={() => setThemeFilter(prev => prev === theme ? null : theme)}
                    className={`flex items-center gap-1 shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm border-primary"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-accent/50"
                    }`}
                  >
                    <span>{meta.icon}</span>
                    {meta.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Module list */}
          {isLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl mb-2" />)
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground font-medium text-sm">Aucun module pour ce filtre.</p>
              <Button variant="link" onClick={() => { setCategoryFilter("all"); setThemeFilter(null); }} className="mt-2 font-bold text-sm">
                Voir tous les modules →
              </Button>
            </div>
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
        </Section>
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
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`rounded-2xl border p-5 text-center shadow-lg relative overflow-hidden ${
            levelChange.direction === "up"
              ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:border-emerald-700 dark:from-emerald-950/30 dark:to-green-950/20"
              : "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 dark:border-amber-700 dark:from-amber-950/30 dark:to-yellow-950/20"
          }`}
        >
          {levelChange.direction === "up" && [...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full"
              style={{
                background: ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"][i],
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.15 }}
            />
          ))}

          <div className="relative">
            <span className="text-4xl">{levelChange.direction === "up" ? "🎉" : "📊"}</span>
            <p className={`text-lg font-extrabold mt-2 ${levelChange.direction === "up" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
              {levelChange.direction === "up" ? "Level Up !" : "Niveau ajusté"}
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <FLELevelBadge level={levelChange.from} size="md" className="opacity-50" />
              {levelChange.direction === "up" ? <TrendingUp className="h-5 w-5 text-emerald-500" /> : <TrendingDown className="h-5 w-5 text-amber-500" />}
              <FLELevelBadge level={levelChange.to} size="lg" />
            </div>
            <p className={`mt-2 text-xs font-medium ${levelChange.direction === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {levelChange.direction === "up" ? "Bravo ! De nouveaux modules sont débloqués 🔓" : "Recalibré pour mieux vous accompagner."}
            </p>
            <button onClick={onDismiss} className="mt-2 text-xs text-muted-foreground underline hover:text-foreground">
              Fermer
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FLEDashboard;
export { FLEInstallPrompt };
