import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const LEVEL_ORDER = ["alpha", "post_alpha", "a1", "a2", "b1"];
const WINDOW_SIZE = 10;
const UPGRADE_THRESHOLD = 0.85;
const DOWNGRADE_THRESHOLD = 0.4;

export function useAdaptiveLearning() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const evaluateAndAdjust = useCallback(async () => {
    if (!user) return null;

    // Get last N exercise results
    const { data: results } = await supabase
      .from("fle_exercise_results")
      .select("is_correct, oral_score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(WINDOW_SIZE);

    if (!results || results.length < 5) return null; // Need minimum data

    const successRate = results.filter(r => r.is_correct).length / results.length;
    const avgOralScore = results
      .filter(r => r.oral_score !== null)
      .reduce((sum, r) => sum + (r.oral_score || 0), 0) / Math.max(1, results.filter(r => r.oral_score !== null).length);

    // Get current level
    const { data: progress } = await supabase
      .from("fle_user_progress")
      .select("estimated_level, oral_score, comprehension_score")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!progress?.estimated_level) return null;

    const currentIdx = LEVEL_ORDER.indexOf(progress.estimated_level);
    let newLevel = progress.estimated_level;
    let reason = "";

    if (successRate >= UPGRADE_THRESHOLD && currentIdx < LEVEL_ORDER.length - 1) {
      newLevel = LEVEL_ORDER[currentIdx + 1];
      reason = "adaptive_upgrade";
    } else if (successRate <= DOWNGRADE_THRESHOLD && currentIdx > 0) {
      newLevel = LEVEL_ORDER[currentIdx - 1];
      reason = "adaptive_downgrade";
    }

    if (newLevel !== progress.estimated_level) {
      // Update level
      await supabase
        .from("fle_user_progress")
        .update({
          estimated_level: newLevel as any,
          oral_score: Math.round(avgOralScore) || progress.oral_score,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      // Record in history
      await supabase
        .from("fle_level_history")
        .insert({
          user_id: user.id,
          level: newLevel as any,
          previous_level: progress.estimated_level as any,
          reason,
        } as any);

      queryClient.invalidateQueries({ queryKey: ["fle-user-progress"] });

      const direction = reason === "adaptive_upgrade" ? "up" : "down";
      if (direction === "up") {
        toast.success(`🎉 Bravo ! Vous passez au niveau ${newLevel.toUpperCase()} !`);
      } else {
        toast.info(`📚 Niveau ajusté à ${newLevel.toUpperCase()} pour renforcer vos bases`);
      }

      return { from: progress.estimated_level, to: newLevel, direction };
    }

    // Update scores even if level didn't change
    if (avgOralScore > 0) {
      await supabase
        .from("fle_user_progress")
        .update({
          oral_score: Math.round(avgOralScore),
          comprehension_score: Math.round(successRate * 100),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    return null;
  }, [user, queryClient]);

  return { evaluateAndAdjust };
}
