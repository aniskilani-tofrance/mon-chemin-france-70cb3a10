import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedRoles = new Set(["benevole", "cip", "accueil", "formateur"]);

function isEmail(value: string) {
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(value);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Utilisateur non trouvé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const providerId = String(body.provider_id || "");
    const email = String(body.email || "").trim().toLowerCase();
    const role = String(body.role || "");
    const fullName = body.full_name ? String(body.full_name).trim() : null;
    const phone = body.phone ? String(body.phone).trim() : null;

    if (!providerId || !email || !role) {
      return new Response(JSON.stringify({ error: "Structure, email et rôle sont requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isEmail(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!allowedRoles.has(role)) {
      return new Response(JSON.stringify({ error: "Rôle non autorisé" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: provider, error: providerError } = await supabaseAdmin
      .from("training_providers")
      .select("id, name, user_id")
      .eq("id", providerId)
      .maybeSingle();

    if (providerError) throw providerError;
    if (!provider) {
      return new Response(JSON.stringify({ error: "Structure introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (provider.user_id !== user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: "Accès réservé au responsable de la structure" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const matchingUser = existingUsers.users.find((u) => u.email?.toLowerCase() === email);

    const membership = {
      provider_id: providerId,
      user_id: matchingUser?.id ?? null,
      email,
      role,
      full_name: fullName,
      phone,
      status: matchingUser ? "active" : "invited",
      accepted_at: matchingUser ? new Date().toISOString() : null,
      invited_by: user.id,
    };

    const { data: member, error: memberError } = await supabaseAdmin
      .from("provider_members")
      .upsert(membership, { onConflict: "provider_id,email" })
      .select()
      .single();

    if (memberError) throw memberError;

    if (matchingUser) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: matchingUser.id, role }, { onConflict: "user_id,role" });
    }

    return new Response(JSON.stringify({ member, existing_user: !!matchingUser }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("invite-provider-member error:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
