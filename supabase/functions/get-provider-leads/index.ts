import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const token = authHeader.replace("Bearer ", "");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: userData } = await supabaseClient.auth.getUser(token);
    if (!userData.user) throw new Error("Non authentifié");

    // Get provider for this user, either as owner or affiliated team member
    const { data: provider, error: provErr } = await supabaseClient
      .from("training_providers")
      .select("id")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (provErr) throw provErr;

    let providerId = provider?.id;
    if (!providerId) {
      const { data: membership, error: memberErr } = await supabaseClient
        .from("provider_members")
        .select("provider_id")
        .neq("status", "disabled")
        .or(`user_id.eq.${userData.user.id},email.eq.${userData.user.email?.toLowerCase()}`)
        .limit(1)
        .maybeSingle();
      if (memberErr) throw memberErr;
      providerId = membership?.provider_id;
    }

    if (!providerId) throw new Error("Pas un partenaire");

    // Get leads with profiles
    const { data: leads, error: leadsErr } = await supabaseClient
      .from("leads")
      .select("*, profiles(*), trainings(certification_type, target_sectors, title)")
      .eq("provider_id", providerId)
      .order("created_at", { ascending: false });

    if (leadsErr) throw leadsErr;

    // Filter sensitive profile data for unpurchased leads
    const filteredLeads = (leads || []).map((lead: any) => {
      if (lead.purchased_at) {
        // Unlocked: return full data
        return lead;
      }

      // Locked: mask sensitive fields
      const { profiles, ...leadData } = lead;
      return {
        ...leadData,
        profiles: profiles
          ? {
              id: profiles.id,
              city: profiles.city,
              postal_code: profiles.postal_code,
              target_sector: profiles.target_sector,
              french_level_cecrl: profiles.french_level_cecrl,
              main_goal: profiles.main_goal,
              lead_route: profiles.lead_route,
              lead_score: profiles.lead_score,
              barriers: profiles.barriers,
              work_right: profiles.work_right,
              // Masked fields
              full_name: null,
              first_name: null,
              last_name: null,
              email: null,
              phone: null,
              origin_country: null,
            }
          : null,
      };
    });

    return new Response(JSON.stringify(filteredLeads), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("get-provider-leads error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
