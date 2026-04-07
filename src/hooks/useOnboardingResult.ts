import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface OnboardingResult {
  id: string;
  user_id: string | null;
  email: string | null;
  language: string;
  answers: Record<string, unknown>;
  french_level_cecrl: string | null;
  main_goal: string | null;
  target_sector: string | null;
  lead_route: string | null;
  lead_score: number | null;
  distance_to_job: number | null;
  work_right: string | null;
  literacy: string | null;
  barriers: string[] | null;
  completed_at: string | null;
  created_at: string;
}

/**
 * Fetches the most recent onboarding result for the current authenticated user.
 * Falls back to null if no result exists (user hasn't completed onboarding).
 */
export function useOnboardingResult() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["onboarding-result", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Try by user_id first
      const { data, error } = await supabase
        .from("onboarding_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) return data as unknown as OnboardingResult;

      // Fallback: try by email
      if (user.email) {
        const { data: emailData, error: emailError } = await supabase
          .from("onboarding_results")
          .select("*")
          .eq("email", user.email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (emailError) throw emailError;
        return (emailData as unknown as OnboardingResult) || null;
      }

      return null;
    },
    enabled: !!user,
  });
}
