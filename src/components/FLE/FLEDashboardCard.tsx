import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFLEUserProgress, useFLEModuleProgress, useFLEModules } from "@/hooks/useFLEProgress";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Flame, Star } from "lucide-react";
import { FLELevelBadge } from "@/components/FLE/FLELevelBadge";

const MOTIVATIONAL_MESSAGES = [
  "Chaque minute compte, continuez !",
  "Vous êtes sur la bonne voie 💪",
  "Un pas de plus vers l'autonomie !",
  "Bravo pour votre régularité !",
  "Le français, c'est la liberté !",
];

export function FLEDashboardCard() {
  const { data: userProgress } = useFLEUserProgress();
  const { data: moduleProgress } = useFLEModuleProgress();
  const { data: modules } = useFLEModules();

  const progress = userProgress || { estimated_level: "a1", total_xp: 0, streak_days: 0 };
  const completedCount = moduleProgress?.filter((mp) => mp.completed_at).length || 0;
  const totalModules = modules?.length || 0;
  const overallPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const message = MOTIVATIONAL_MESSAGES[Math.floor(Date.now() / 86400000) % MOTIVATIONAL_MESSAGES.length];

  // Find next module
  const nextModule = modules?.find((m) => {
    const mp = moduleProgress?.find((p) => p.module_id === m.id);
    return !mp?.completed_at && (mp?.unlocked || true);
  });

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Mon français</h3>
              <p className="text-xs text-muted-foreground">{message}</p>
            </div>
          </div>
          <FLELevelBadge level={progress.estimated_level} size="sm" />
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm">
          {progress.streak_days > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-semibold">
              <Flame className="h-4 w-4" /> {progress.streak_days}j
            </span>
          )}
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <Star className="h-4 w-4" /> {progress.total_xp} XP
          </span>
          <span className="text-muted-foreground">{overallPercent}% terminé</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-border/40 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {nextModule && (
            <p className="text-xs text-muted-foreground truncate flex-1 mr-3">
              Prochain : <span className="font-medium text-foreground">{nextModule.icon} {nextModule.title}</span>
            </p>
          )}
          <Button asChild size="sm" className="gap-1.5 shrink-0">
            <Link to="/fle">
              Continuer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
