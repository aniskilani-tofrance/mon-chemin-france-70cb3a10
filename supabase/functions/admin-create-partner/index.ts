import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Utilisateur non trouvé" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Accès réservé aux administrateurs" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      name, email, phone, website, description, provider_type,
      address, city, postal_code, is_active, create_access, tags,
      _existing_provider_id,
    } = body;
    const cleanTags = Array.isArray(tags)
      ? Array.from(new Set(tags.map((t: any) => String(t).trim()).filter(Boolean))).slice(0, 50)
      : [];

    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Nom et email requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optionally create an auth user and send invite email
    let partner_user_id: string | null = null;
    let invite_status: "sent" | "existing" | "skipped" | "failed" = "skipped";

    if (create_access) {
      try {
        const redirectTo = `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/partner-dashboard`;
        const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin
          .inviteUserByEmail(email, { redirectTo });

        if (inviteError) {
          // If user already exists, look it up
          if (`${inviteError.message}`.toLowerCase().includes("already")) {
            const { data: list } = await supabaseAdmin.auth.admin.listUsers();
            const existing = list?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
            partner_user_id = existing?.id ?? null;
            invite_status = existing ? "existing" : "failed";
          } else {
            invite_status = "failed";
            console.error("Invite error:", inviteError);
          }
        } else {
          partner_user_id = invited?.user?.id ?? null;
          invite_status = "sent";
        }
      } catch (e) {
        invite_status = "failed";
        console.error("Invite exception:", e);
      }
    }

    let provider: any = null;

    if (_existing_provider_id) {
      // Just attach the (possibly new) auth user to the existing partner record
      const { data, error } = await supabaseAdmin
        .from("training_providers")
        .update({ user_id: partner_user_id ?? undefined })
        .eq("id", _existing_provider_id)
        .select()
        .single();
      if (error) {
        console.error("Provider update error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      provider = data;
    } else {
      const { data, error: providerError } = await supabaseAdmin
        .from("training_providers")
        .insert({
          name,
          email,
          phone: phone || null,
          website: website || null,
          description: description || null,
          provider_type: provider_type || "training_org",
          address: address || null,
          city: city || null,
          postal_code: postal_code || null,
          is_active: is_active ?? true,
          user_id: partner_user_id,
          tags: cleanTags,
        })
        .select()
        .single();

      if (providerError) {
        console.error("Provider creation error:", providerError);
        return new Response(JSON.stringify({ error: providerError.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      provider = data;
    }

    return new Response(JSON.stringify({ provider, invite_status, partner_user_id }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
