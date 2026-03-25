import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { providerId, leadId, matchScore } = await req.json();
    if (!providerId || !leadId) throw new Error("providerId et leadId requis");

    // Fetch provider info
    const { data: provider, error: provErr } = await supabaseAdmin
      .from("training_providers")
      .select("name, email")
      .eq("id", providerId)
      .single();

    if (provErr || !provider?.email) {
      console.log("Provider not found or no email:", providerId);
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not set, skipping email");
      return new Response(JSON.stringify({ skipped: true, reason: "no_api_key" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tier = (matchScore ?? 50) >= 80 ? "Premium" : (matchScore ?? 50) >= 50 ? "Standard" : "Éco";
    const dashboardUrl = "https://tofrance.app/partner-dashboard";
    const tierColor = tier === "Premium" ? "#16a34a" : tier === "Standard" ? "#2563eb" : "#f59e0b";
    const tierEmoji = tier === "Premium" ? "🌟" : tier === "Standard" ? "✅" : "📋";
    const logoUrl = "https://tofrancebeta.lovable.app/assets/logo-tofrance.png";
    const scoreVal = matchScore ?? 50;

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f1f5f9">
  <div style="padding:40px 16px">
    <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5a8e 100%);padding:32px 40px 24px;text-align:center">
        <div style="background:#ffffff;display:inline-block;padding:14px 28px;border-radius:12px;margin-bottom:12px"><img src="${logoUrl}" alt="ToFrance" height="120" style="height:120px" /></div>
        <p style="color:#94b8db;margin:0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase">Nouveau lead disponible</p>
      </div>
      <div style="padding:36px 40px">
        <p style="font-size:18px;color:#1e293b;margin:0 0 8px;font-weight:600">Bonjour ${provider.name} 👋</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px">Un nouveau candidat correspond à vos critères de formation. Consultez les détails ci-dessous.</p>
        <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:0 0 24px;border:1px solid #e2e8f0">
          <div style="margin-bottom:16px">
            <span style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:700">Qualité du lead</span>
            <span style="float:right;background:${tierColor};color:white;padding:5px 16px;border-radius:20px;font-size:13px;font-weight:700">${tierEmoji} ${tier}</span>
          </div>
          <div style="clear:both"></div>
          <div style="background:#ffffff;border-radius:8px;padding:12px 16px;border:1px solid #e2e8f0;margin-top:8px">
            <span style="font-size:14px;color:#64748b">Score de match</span>
            <span style="float:right;font-size:20px;font-weight:700;color:#1e293b">${scoreVal}%</span>
            <div style="clear:both;margin-top:8px;background:#e2e8f0;border-radius:4px;height:6px;overflow:hidden">
              <div style="width:${scoreVal}%;height:100%;background:${tierColor};border-radius:4px"></div>
            </div>
          </div>
        </div>
        <div style="text-align:center;margin:0 0 24px">
          <a href="${dashboardUrl}" style="background:#1e3a5f;color:#ffffff;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 2px 8px rgba(30,58,95,0.3)">Voir le lead →</a>
        </div>
        <p style="font-size:13px;color:#94a3b8;text-align:center;margin:0">Connectez-vous à votre espace partenaire pour consulter et débloquer ce lead.</p>
      </div>
      <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6">ToFrance — Plateforme d'orientation pour primo-arrivants</p>
      </div>
    </div>
  </div>
</body></html>`;
    // Send via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ToFrance <notifications@tofrance.app>",
        to: [provider.email],
        subject: `${tierEmoji} Nouveau lead ${tier} — Score ${matchScore ?? "—"}%`,
        html: htmlBody,
      }),
    });

    const resendBody = await resendRes.text();

    if (!resendRes.ok) {
      console.error("Resend error:", resendRes.status, resendBody);
      return new Response(JSON.stringify({ sent: false, error: resendBody }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 502,
      });
    }

    console.log(`📧 Email sent to ${provider.email} for lead ${leadId} (${tier})`);

    return new Response(
      JSON.stringify({ sent: true, provider: provider.name, leadId, matchScore, tier }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-partner-lead error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
