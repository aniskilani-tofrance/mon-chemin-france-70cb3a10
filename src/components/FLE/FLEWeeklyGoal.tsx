import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Target, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFLEUserProgress } from "@/hooks/useFLEProgress";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function FLEWeeklyGoal() {
  const { user } = useAuth();
  const { data: progress } = useFLEUserProgress();
  const queryClient = useQueryClient();

  const currentGoal = progress?.daily_goal_minutes || 5;
  const currentWeeklyXP = progress?.weekly_xp_target || 100;

  const [dailyGoal, setDailyGoal] = useState(currentGoal);
  const [weeklyXP, setWeeklyXP] = useState(currentWeeklyXP);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase
        .from("fle_user_progress")
        .update({
          daily_goal_minutes: dailyGoal,
          weekly_xp_target: weeklyXP,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      queryClient.invalidateQueries({ queryKey: ["fle-user-progress"] });
      toast.success("Objectifs mis à jour !");
      setChanged(false);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-amber-200/50 dark:border-amber-800/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
            <Target className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Mes objectifs</h3>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground font-medium">Minutes par jour</span>
              <span className="font-extrabold text-foreground">{dailyGoal} min</span>
            </div>
            <Slider
              value={[dailyGoal]}
              onValueChange={([v]) => { setDailyGoal(v); setChanged(true); }}
              min={3}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground font-medium">XP par semaine</span>
              <span className="font-extrabold text-foreground">{weeklyXP} XP</span>
            </div>
            <Slider
              value={[weeklyXP]}
              onValueChange={([v]) => { setWeeklyXP(v); setChanged(true); }}
              min={50}
              max={500}
              step={25}
              className="w-full"
            />
          </div>

          {changed && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="w-full gap-2"
            >
              <Check className="h-4 w-4" /> Enregistrer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
