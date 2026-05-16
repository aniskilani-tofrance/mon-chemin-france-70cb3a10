import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FormateurStats {
  learnersCount: number;
  pendingEvaluations: number;
  diagnosticsInProgress: number;
  placementTests7d: number;
  loading: boolean;
}

const initial: FormateurStats = {
  learnersCount: 0,
  pendingEvaluations: 0,
  diagnosticsInProgress: 0,
  placementTests7d: 0,
  loading: true,
};

export function useFormateurStats() {
  const [stats, setStats] = useState<FormateurStats>(initial);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setStats({ ...initial, loading: false });
      return;
    }

    const { data: links } = await supabase
      .from("formateur_learners")
      .select("learner_id")
      .eq("formateur_id", user.id);

    const learnerIds = links?.map((l) => l.learner_id) || [];
    const learnersCount = learnerIds.length;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [pendingEvals, diagsInProg, placement7d] = await Promise.all([
      learnerIds.length
        ? supabase
            .from("audio_submissions")
            .select("id", { count: "exact", head: true })
            .in("learner_id", learnerIds)
            .eq("status", "pending")
        : Promise.resolve({ count: 0 } as any),
      supabase
        .from("shared_diagnostics")
        .select("id", { count: "exact", head: true })
        .eq("formateur_id", user.id)
        .eq("status", "in_progress"),
      supabase
        .from("placement_test_sessions")
        .select("id", { count: "exact", head: true })
        .eq("formateur_id", user.id)
        .gte("created_at", sevenDaysAgo),
    ]);

    setStats({
      learnersCount,
      pendingEvaluations: pendingEvals.count ?? 0,
      diagnosticsInProgress: diagsInProg.count ?? 0,
      placementTests7d: placement7d.count ?? 0,
      loading: false,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...stats, refresh };
}
