import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendOutlookMail } from "../_shared/outlook-mail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedRoles = new Set(["benevole", "cip", "accueil", "formateur"]);

function isEmail(value: string) {
  return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(value);
}

const roleLabels: Record<string, string> = {
  benevole: "bénévole",
  cip: "CIP",
  accueil: "accueil",
  formateur: "formateur",
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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

    const appUrl = req.headers.get("origin") || "https://www.tofrance.life";
    const safeName = escapeHtml(fullName || email);
    const safeProvider = escapeHtml(provider.name);
    const safeRole = escapeHtml(roleLabels[role] || role);
    const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><div style="padding:32px 16px"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:28px"><h1 style="font-size:22px;margin:0 0 12px;color:#0f172a">Invitation ToFrance</h1><p style="font-size:15px;line-height:1.6;color:#334155">Bonjour ${safeName},</p><p style="font-size:15px;line-height:1.6;color:#334155">${safeProvider} vous a affilié à son espace structure avec le rôle <strong>${safeRole}</strong>.</p><p style="font-size:15px;line-height:1.6;color:#334155">Connectez-vous avec cette adresse email pour accéder au dashboard structure.</p><p style="margin:24px 0"><a href="${appUrl}/login" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700">Accéder à ToFrance</a></p><p style="font-size:12px;line-height:1.5;color:#64748b">Si vous n’attendiez pas cette invitation, vous pouvez ignorer cet email.</p></div></div></body></html>`;
    const inviteEmail = await sendOutlookMail({
      to: email,
      subject: `${provider.name} vous invite sur ToFrance`,
      html,
      log: {
        template: "provider-member-invitation",
        sourceFunction: "invite-provider-member",
        metadata: { providerId, role, existingUser: !!matchingUser },
      },
    });

    return new Response(JSON.stringify({ member, existing_user: !!matchingUser, email_sent: inviteEmail.ok }), {
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
