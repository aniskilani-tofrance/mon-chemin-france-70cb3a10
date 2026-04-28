import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendOutlookMail } from "../_shared/outlook-mail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const roleLabels: Record<string, string> = {
  benevole: "bénévole",
  cip: "CIP",
  accueil: "accueil",
  formateur: "formateur",
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
    const memberId = String(body.member_id || "");
    const action = String(body.action || "");

    if (!memberId || !["resend", "revoke"].includes(action)) {
      return new Response(JSON.stringify({ error: "Action invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: member, error: memberError } = await supabaseAdmin
      .from("provider_members")
      .select("*, training_providers(id, name, user_id)")
      .eq("id", memberId)
      .maybeSingle();

    if (memberError) throw memberError;
    if (!member || !member.training_providers) {
      return new Response(JSON.stringify({ error: "Invitation introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (member.training_providers.user_id !== user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: "Accès réservé au responsable de la structure" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "revoke") {
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("provider_members")
        .update({ status: "disabled" })
        .eq("id", memberId)
        .select()
        .single();
      if (updateError) throw updateError;

      if (member.user_id) {
        await supabaseAdmin
          .from("user_roles")
          .delete()
          .eq("user_id", member.user_id)
          .eq("role", member.role);
      }

      return new Response(JSON.stringify({ member: updated }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("provider_members")
      .update({ status: member.user_id ? "active" : "invited", invited_at: new Date().toISOString() })
      .eq("id", memberId)
      .select()
      .single();
    if (updateError) throw updateError;

    const appUrl = req.headers.get("origin") || "https://www.tofrance.life";
    const safeName = escapeHtml(member.full_name || member.email);
    const safeProvider = escapeHtml(member.training_providers.name);
    const safeRole = escapeHtml(roleLabels[member.role] || member.role);
    const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><div style="padding:32px 16px"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:28px"><h1 style="font-size:22px;margin:0 0 12px;color:#0f172a">Rappel d'invitation ToFrance</h1><p style="font-size:15px;line-height:1.6;color:#334155">Bonjour ${safeName},</p><p style="font-size:15px;line-height:1.6;color:#334155">${safeProvider} vous a affilié à son espace structure avec le rôle <strong>${safeRole}</strong>.</p><p style="font-size:15px;line-height:1.6;color:#334155">Connectez-vous avec cette adresse email pour accéder au dashboard structure.</p><p style="margin:24px 0"><a href="${appUrl}/login" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:10px;padding:12px 18px;font-weight:700">Accéder à ToFrance</a></p></div></div></body></html>`;

    const inviteEmail = await sendOutlookMail({
      to: member.email,
      subject: `Rappel — ${member.training_providers.name} vous invite sur ToFrance`,
      html,
      log: {
        template: "provider-member-invitation-reminder",
        sourceFunction: "manage-provider-invitation",
        metadata: { providerId: member.provider_id, role: member.role, memberId },
      },
    });

    return new Response(JSON.stringify({ member: updated, email_sent: inviteEmail.ok }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("manage-provider-invitation error:", error);
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
