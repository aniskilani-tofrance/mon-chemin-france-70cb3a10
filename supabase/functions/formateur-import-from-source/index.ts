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
    if (!authHeader) {
      return json({ error: "Non autorisé" }, 401);
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) return json({ error: "Utilisateur non trouvé" }, 401);

    const [{ data: isFormateur }, { data: isAdmin }] = await Promise.all([
      supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "formateur" }),
      supabaseAdmin.rpc("has_role", { _user_id: user.id, _role: "admin" }),
    ]);
    if (!isFormateur && !isAdmin) return json({ error: "Réservé aux formateurs" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "sources") {
      // Distinct list of sources/centres present in profiles or onboarding_results
      const { data: profilesSrc } = await supabaseAdmin
        .from("profiles")
        .select("source_location_id, source_name, source_type")
        .not("source_location_id", "is", null);

      const map = new Map<string, { id: string; name: string; type: string | null; count: number }>();
      (profilesSrc || []).forEach((row) => {
        const id = row.source_location_id!;
        const existing = map.get(id);
        if (existing) existing.count += 1;
        else map.set(id, { id, name: row.source_name || id, type: row.source_type, count: 1 });
      });

      return json({ sources: Array.from(map.values()).sort((a, b) => b.count - a.count) });
    }

    if (action === "list") {
      const sourceId = String(body.source_id || "").trim();
      if (!sourceId) return json({ error: "source_id requis" }, 400);

      // Profiles attached to this source
      const { data: profiles, error: pErr } = await supabaseAdmin
        .from("profiles")
        .select("user_id, email, full_name, first_name, last_name, city, postal_code, french_level_cecrl, source_name, source_location_id, created_at")
        .eq("source_location_id", sourceId)
        .not("user_id", "is", null);
      if (pErr) throw pErr;

      const learnerIds = (profiles || []).map((p) => p.user_id!).filter(Boolean);

      // Already-attached learners for this formateur
      const { data: existingLinks } = await supabaseAdmin
        .from("formateur_learners")
        .select("learner_id")
        .eq("formateur_id", user.id)
        .in("learner_id", learnerIds.length ? learnerIds : ["00000000-0000-0000-0000-000000000000"]);

      const attached = new Set((existingLinks || []).map((l) => l.learner_id));

      const learners = (profiles || []).map((p) => ({
        learner_id: p.user_id,
        email: p.email,
        full_name: p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || null,
        city: p.city,
        postal_code: p.postal_code,
        french_level_cecrl: p.french_level_cecrl,
        source_name: p.source_name,
        already_attached: attached.has(p.user_id!),
        created_at: p.created_at,
      }));

      return json({ learners, source_id: sourceId });
    }

    if (action === "attach") {
      const learnerIds: string[] = Array.isArray(body.learner_ids) ? body.learner_ids : [];
      if (!learnerIds.length) return json({ error: "Aucun apprenant sélectionné" }, 400);

      const rows = learnerIds.map((id) => ({ formateur_id: user.id, learner_id: id }));
      const { data, error } = await supabaseAdmin
        .from("formateur_learners")
        .upsert(rows, { onConflict: "formateur_id,learner_id", ignoreDuplicates: true })
        .select();

      if (error) throw error;
      return json({ success: true, attached_count: rows.length, inserted: data?.length || 0 });
    }

    return json({ error: "Action inconnue" }, 400);
  } catch (error) {
    console.error("formateur-import-from-source error:", error);
    return json({ error: String(error) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
