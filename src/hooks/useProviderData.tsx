import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Lead = Tables<"leads">;

export function useProviderProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["provider-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      await supabase.functions.invoke("accept-provider-membership");

      const { data: ownedProvider, error: ownedError } = await supabase
        .from("training_providers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (ownedError) throw ownedError;
      if (ownedProvider) return ownedProvider;

      const { data: membership, error: membershipError } = await supabase
        .from("provider_members")
        .select("provider_id")
        .neq("status", "disabled")
        .or(`user_id.eq.${user!.id},email.eq.${user!.email?.toLowerCase()}`)
        .limit(1)
        .maybeSingle();
      if (membershipError) throw membershipError;
      if (!membership) return null;

      const { data: provider, error: providerError } = await supabase
        .from("training_providers")
        .select("*")
        .eq("id", membership.provider_id)
        .maybeSingle();
      if (providerError) throw providerError;
      return provider;
    },
  });
}

export function useProviderLeads() {
  const { user } = useAuth();
  const { data: provider } = useProviderProfile();

  return useQuery({
    queryKey: ["provider-leads", provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      // Use edge function for server-side profile masking
      const { data, error } = await supabase.functions.invoke("get-provider-leads");
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      status,
      notes,
    }: {
      leadId: string;
      status: Lead["status"];
      notes?: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (notes !== undefined) updates.notes = notes;
      if (status === "contacted") updates.contacted_at = new Date().toISOString();
      if (status === "converted") updates.converted_at = new Date().toISOString();

      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-leads"] });
    },
  });
}

// usePurchaseLead removed — purchased_at is set exclusively by the Stripe webhook payment flow.
// The protect_purchased_at trigger blocks any direct client-side modification.

export function useProviderTrainings() {
  const { data: provider } = useProviderProfile();

  return useQuery({
    queryKey: ["provider-trainings", provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trainings")
        .select("*")
        .eq("provider_id", provider!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (training: {
      provider_id: string;
      title: string;
      training_type: "language" | "professional" | "both";
      certification_type?: "language" | "cqp" | "tp";
      description?: string;
      duration_weeks?: number;
      target_sectors?: string[];
      min_french_level?: number;
      is_remote?: boolean;
    }) => {
      const { error } = await supabase.from("trainings").insert(training);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-trainings"] });
    },
  });
}

export function useDeleteTraining() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trainings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-trainings"] });
    },
  });
}

export type ProviderMember = Tables<"provider_members">;

export function useProviderMembers() {
  const { data: provider } = useProviderProfile();

  return useQuery({
    queryKey: ["provider-members", provider?.id],
    enabled: !!provider,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_members")
        .select("*")
        .eq("provider_id", provider!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useInviteProviderMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: {
      provider_id: string;
      email: string;
      role: "benevole" | "cip" | "accueil" | "formateur";
      full_name?: string;
      phone?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("invite-provider-member", {
        body: member,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-members"] });
    },
  });
}

export function useManageProviderInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ member_id, action }: { member_id: string; action: "resend" | "revoke" }) => {
      const { data, error } = await supabase.functions.invoke("manage-provider-invitation", {
        body: { member_id, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider-members"] });
    },
  });
}
