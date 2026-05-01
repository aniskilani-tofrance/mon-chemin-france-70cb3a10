import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Non autorisé" }, 401);

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) return json({ error: "Utilisateur non trouvé" }, 401);

    // Reuse an existing in-progress diagnostic for this learner if any
    const { data: existing } = await supabaseAdmin
      .from("shared_diagnostics")
      .select("id, status")
      .eq("learner_id", user.id)
      .eq("status", "in_progress")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      return json({ success: true, diagnostic_id: existing.id, reused: true });
    }

    // Pick any formateur as owner of the demo (admin fallback)
    const { data: formateurRole } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "formateur")
      .limit(1)
      .maybeSingle();

    const formateurId = formateurRole?.user_id || user.id;

    const { data: codeData } = await supabaseAdmin.rpc("generate_access_code");
    const accessCode = codeData as string;

    const { data: diag, error } = await supabaseAdmin
      .from("shared_diagnostics")
      .insert({
        formateur_id: formateurId,
        learner_id: user.id,
        access_code: accessCode,
        learner_language: "fr",
        status: "in_progress",
      })
      .select()
      .single();

    if (error) throw error;

    return json({ success: true, diagnostic_id: diag.id, access_code: accessCode, reused: false });
  } catch (error) {
    console.error("learner-demo-diagnostic error:", error);
    return json({ error: String(error) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
