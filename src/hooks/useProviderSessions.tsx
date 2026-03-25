import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProviderProfile } from "./useProviderData";

export function useTrainingSessions(trainingId?: string) {
  return useQuery({
    queryKey: ["training-sessions", trainingId],
    enabled: !!trainingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("training_id", trainingId!)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useAllProviderSessions() {
  const { data: provider } = useProviderProfile();

  return useQuery({
    queryKey: ["provider-sessions", provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      const { data: trainings } = await supabase
        .from("trainings")
        .select("id")
        .eq("provider_id", provider!.id);
      if (!trainings?.length) return [];

      const ids = trainings.map((t) => t.id);
      const { data, error } = await supabase
        .from("training_sessions")
        .select("*, trainings(title)")
        .in("training_id", ids)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (session: {
      training_id: string;
      start_date: string;
      end_date?: string;
      max_seats?: number;
      location?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.from("training_sessions").insert(session);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training-sessions"] });
      qc.invalidateQueries({ queryKey: ["provider-sessions"] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.from("training_sessions").delete().eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training-sessions"] });
      qc.invalidateQueries({ queryKey: ["provider-sessions"] });
    },
  });
}
