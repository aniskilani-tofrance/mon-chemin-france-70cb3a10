import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FLEModule {
  id: string;
  title: string;
  description: string | null;
  category: string;
  cecrl_level: string;
  theme: string;
  sector: string | null;
  sort_order: number;
  icon: string;
  duration_minutes: number;
  prerequisites: string[];
}

export interface FLEUserProgress {
  id: string;
  estimated_level: string;
  total_xp: number;
  words_learned: number;
  phrases_mastered: number;
  oral_score: number;
  comprehension_score: number;
  streak_days: number;
  total_time_minutes: number;
  placement_completed: boolean;
  preferred_category: string;
  target_sector: string | null;
  daily_goal_minutes: number;
  weekly_xp_target: number;
  daily_mission_completed_at: string | null;
  last_streak_date: string | null;
}

export interface FLEModuleProgress {
  module_id: string;
  score: number;
  exercises_done: number;
  exercises_total: number;
  completed_at: string | null;
  unlocked: boolean;
}

export interface FLEBadge {
  key: string;
  title: string;
  description: string | null;
  icon: string;
  category: string;
  condition_type: string;
  condition_value: number;
}

export interface FLEUserBadge {
  badge_key: string;
  earned_at: string;
}

export function useFLEModules() {
  return useQuery({
    queryKey: ["fle-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fle_modules")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as FLEModule[];
    },
  });
}

export function useFLEUserProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fle-user-progress", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("fle_user_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as FLEUserProgress | null;
    },
    enabled: !!user,
  });
}

export function useFLEModuleProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fle-module-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("fle_module_progress")
        .select("module_id, score, exercises_done, exercises_total, completed_at, unlocked")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []) as unknown as FLEModuleProgress[];
    },
    enabled: !!user,
  });
}

export function useFLEBadges() {
  return useQuery({
    queryKey: ["fle-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fle_badges")
        .select("key, title, description, icon, category, condition_type, condition_value");
      if (error) throw error;
      return (data || []) as unknown as FLEBadge[];
    },
  });
}

export function useFLEUserBadges() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["fle-user-badges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("fle_user_badges")
        .select("badge_key, earned_at")
        .eq("user_id", user.id);
      if (error) throw error;
      return (data || []) as unknown as FLEUserBadge[];
    },
    enabled: !!user,
  });
}
