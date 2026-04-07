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

export interface UserProfile {
  first_name: string | null;
  main_goal: string | null;
  target_sector: string | null;
  french_level_cecrl: string | null;
  french_level: number | null;
  literacy: string | null;
}

/**
 * Fetches user profile for FLE context.
 * Identity fields come from profiles, orientation fields fall back to onboarding_results.
 */

// Theme metadata for display
export const THEME_META: Record<string, { label: string; icon: string }> = {
  sante: { label: "Santé", icon: "🏥" },
  transports: { label: "Transport", icon: "🚌" },
  logement: { label: "Logement", icon: "🏠" },
  courses: { label: "Courses", icon: "🛒" },
  ecole: { label: "École", icon: "🎒" },
  administratif: { label: "Démarches", icon: "📋" },
  telephone: { label: "Téléphone", icon: "📱" },
  banque: { label: "Banque", icon: "🏦" },
  droits: { label: "Droits", icon: "⚖️" },
  identite: { label: "Identité", icon: "🪪" },
  securite: { label: "Sécurité", icon: "🦺" },
  travail: { label: "Travail", icon: "💼" },
  entretien: { label: "Entretien", icon: "🤝" },
  cv: { label: "CV", icon: "📄" },
  hotellerie: { label: "Hôtellerie", icon: "🍽️" },
  proprete: { label: "Propreté", icon: "🧹" },
  logistique: { label: "Logistique", icon: "📦" },
  aide_personne: { label: "Aide à la personne", icon: "🤲" },
  // Certification themes
  delf_a1: { label: "DELF A1", icon: "🎧" },
  delf_a2: { label: "DELF A2", icon: "🎧" },
  tcf: { label: "TCF", icon: "📝" },
  // Culture themes
  republique: { label: "République", icon: "🇫🇷" },
  institutions: { label: "Institutions", icon: "🏛️" },
  droits_devoirs: { label: "Droits & Devoirs", icon: "⚖️" },
  vivre_ensemble: { label: "Vivre ensemble", icon: "🤝" },
  histoire: { label: "Histoire", icon: "📜" },
  examen_cir: { label: "Examen CIR", icon: "🎓" },
};

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

export function useUserProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-profile-fle", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch identity from profiles
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, main_goal, target_sector, french_level_cecrl, french_level, literacy")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      // Fetch orientation fallback from onboarding_results
      const { data: onboardingData } = await supabase
        .from("onboarding_results")
        .select("main_goal, target_sector, french_level_cecrl, literacy")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Merge: profiles identity + onboarding_results orientation as fallback
      if (!profileData && !onboardingData) return null;

      return {
        first_name: profileData?.first_name ?? null,
        main_goal: onboardingData?.main_goal ?? profileData?.main_goal ?? null,
        target_sector: onboardingData?.target_sector ?? profileData?.target_sector ?? null,
        french_level_cecrl: onboardingData?.french_level_cecrl ?? profileData?.french_level_cecrl ?? null,
        french_level: profileData?.french_level ?? null,
        literacy: onboardingData?.literacy ?? profileData?.literacy ?? null,
      } as UserProfile;
    },
    enabled: !!user,
  });
}
