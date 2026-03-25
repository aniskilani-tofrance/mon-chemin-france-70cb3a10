import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { to } = await req.json();
    if (!to) throw new Error("'to' email is required");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

    const htmlBody = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
    <div style="background: #1e3a5f; padding: 24px 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">ToFrance</h1>
      <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">Email de test</p>
    </div>
    <div style="padding: 32px; text-align: center;">
      <p style="font-size: 18px; color: #334155; font-weight: 600;">✅ Ça fonctionne !</p>
      <p style="font-size: 15px; color: #475569;">Cet email confirme que l'envoi via Resend avec le domaine <strong>tofrance.app</strong> est opérationnel.</p>
      <div style="margin: 24px 0;">
        <a href="https://tofrance.app" style="background: #1e3a5f; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
          Visiter ToFrance →
        </a>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">Envoyé le ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
    </div>
    <div style="background: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">ToFrance — Plateforme d'orientation pour primo-arrivants</p>
    </div>
  </div>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ToFrance <notifications@tofrance.app>",
        to: [to],
        subject: "✅ Test ToFrance — Email bien configuré",
        html: htmlBody,
      }),
    });

    const body = await res.text();

    if (!res.ok) {
      console.error("Resend error:", res.status, body);
      return new Response(JSON.stringify({ sent: false, error: body }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      });
    }

    console.log(`📧 Test email sent to ${to}`);
    return new Response(JSON.stringify({ sent: true, to }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
