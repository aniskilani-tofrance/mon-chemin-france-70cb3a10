import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DirecteurStats {
  totalLearners: number;
  totalFormateurs: number;
  modulesCompleted: number;
  avgCompletionRate: number;
  totalHours: number;
  onboardingLeads7d: number;
  hotLeads: number;
  loading: boolean;
}

const initial: DirecteurStats = {
  totalLearners: 0,
  totalFormateurs: 0,
  modulesCompleted: 0,
  avgCompletionRate: 0,
  totalHours: 0,
  onboardingLeads7d: 0,
  hotLeads: 0,
  loading: true,
};

export function useDirecteurStats() {
  const [stats, setStats] = useState<DirecteurStats>(initial);

  const refresh = useCallback(async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [linksRes, progressRes, sessionsRes, leads7dRes, hotLeadsRes] = await Promise.all([
      supabase.from("formateur_learners").select("formateur_id, learner_id"),
      supabase.from("fle_module_progress").select("completed_at"),
      supabase.from("fle_sessions").select("duration_seconds"),
      supabase
        .from("onboarding_results")
        .select("id", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
      supabase
        .from("onboarding_results")
        .select("id", { count: "exact", head: true })
        .gte("lead_score", 80),
    ]);

    const links = linksRes.data || [];
    const totalLearners = new Set(links.map((l) => l.learner_id)).size;
    const totalFormateurs = new Set(links.map((l) => l.formateur_id)).size;

    const progress = progressRes.data || [];
    const completed = progress.filter((p) => p.completed_at);
    const avg =
      progress.length > 0 ? Math.round((completed.length / progress.length) * 100) : 0;

    const totalSec = (sessionsRes.data || []).reduce(
      (s, r) => s + (r.duration_seconds || 0),
      0,
    );

    setStats({
      totalLearners,
      totalFormateurs,
      modulesCompleted: completed.length,
      avgCompletionRate: avg,
      totalHours: Math.round(totalSec / 3600),
      onboardingLeads7d: leads7dRes.count ?? 0,
      hotLeads: hotLeadsRes.count ?? 0,
      loading: false,
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...stats, refresh };
}
