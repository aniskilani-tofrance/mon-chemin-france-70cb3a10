import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Tracks learning session duration.
 * Call startSession() when entering an exercise/dialogue page,
 * endSession() when leaving. Auto-ends on unmount.
 */
export function useFLESession(activityType: string = "exercise", moduleId?: string) {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startSession = useCallback(async () => {
    if (!user || sessionIdRef.current) return;
    startTimeRef.current = Date.now();
    const insertData: any = {
      user_id: user.id,
      activity_type: activityType,
      started_at: new Date().toISOString(),
    };
    if (moduleId) insertData.module_id = moduleId;
    const { data, error } = await supabase
      .from("fle_sessions")
      .insert(insertData)
      .select("id")
      .single();
    if (!error && data) {
      sessionIdRef.current = data.id;
    }
  }, [user, activityType, moduleId]);

  const endSession = useCallback(async () => {
    if (!sessionIdRef.current || !startTimeRef.current) return;
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    await supabase
      .from("fle_sessions")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", sessionIdRef.current);
    sessionIdRef.current = null;
    startTimeRef.current = null;
  }, []);

  // Auto-end on unmount
  useEffect(() => {
    return () => {
      if (sessionIdRef.current && startTimeRef.current) {
        const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
        // Fire-and-forget on unmount
        supabase
          .from("fle_sessions")
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: durationSeconds,
          })
          .eq("id", sessionIdRef.current);
      }
    };
  }, []);

  return { startSession, endSession };
}

/**
 * Fetches aggregated session stats for the current user.
 */
export function useFLESessionStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["fle-session-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1).toISOString();

      // Fetch all sessions this week
      const { data, error } = await supabase
        .from("fle_sessions")
        .select("started_at, duration_seconds")
        .eq("user_id", user.id)
        .gte("started_at", weekStart)
        .order("started_at", { ascending: true });

      if (error) throw error;

      const sessions = data || [];
      let todayMinutes = 0;
      let weekMinutes = 0;
      const dailyMinutes: Record<string, number> = {};

      for (const s of sessions) {
        const mins = (s.duration_seconds || 0) / 60;
        weekMinutes += mins;
        const day = new Date(s.started_at).toLocaleDateString("fr-FR", { weekday: "short" });
        dailyMinutes[day] = (dailyMinutes[day] || 0) + mins;
        if (s.started_at >= todayStart) {
          todayMinutes += mins;
        }
      }

      // Build chart data for 7 days of the week
      const dayNames = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
      const chartData = dayNames.map((d) => ({
        day: d,
        minutes: Math.round(dailyMinutes[d] || 0),
      }));

      return {
        todayMinutes: Math.round(todayMinutes),
        weekMinutes: Math.round(weekMinutes),
        chartData,
      };
    },
    enabled: !!user,
    refetchInterval: 60000, // refresh every minute
  });
}
