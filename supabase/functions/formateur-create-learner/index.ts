import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Utilisateur non trouvé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check formateur or admin role
    const { data: isFormateur } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id, _role: "formateur",
    });
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id, _role: "admin",
    });

    if (!isFormateur && !isAdmin) {
      return new Response(JSON.stringify({ error: "Réservé aux formateurs" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, full_name, language } = body;

    if (!email || !full_name) {
      return new Response(JSON.stringify({ error: "Nom et email requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const tempPassword = generateTempPassword();

    // Try to create the user (or find existing)
    let learnerUserId: string | null = null;

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, created_by_formateur: user.id },
    });

    if (createErr) {
      // User may already exist — try to find them
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
      if (!existing) {
        console.error("Create user error:", createErr);
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      learnerUserId = existing.id;
    } else {
      learnerUserId = created.user!.id;
    }

    // Ensure 'user' role
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: learnerUserId, role: "user" }, { onConflict: "user_id,role" });

    // Ensure profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", learnerUserId)
      .maybeSingle();

    if (!existingProfile) {
      await supabaseAdmin.from("profiles").insert({
        user_id: learnerUserId,
        email: cleanEmail,
        full_name,
      });
    }

    // Link to formateur (idempotent)
    const { error: linkErr } = await supabaseAdmin
      .from("formateur_learners")
      .insert({ formateur_id: user.id, learner_id: learnerUserId });

    if (linkErr && !linkErr.message?.includes("duplicate")) {
      console.error("Link error:", linkErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        learner_id: learnerUserId,
        email: cleanEmail,
        temp_password: createErr ? null : tempPassword,
        already_existed: !!createErr,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
