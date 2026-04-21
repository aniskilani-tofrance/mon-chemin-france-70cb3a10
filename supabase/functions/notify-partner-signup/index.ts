import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/microsoft_outlook";

const STRUCTURE_LABELS: Record<string, string> = {
  of: "Organisme de formation",
  employer: "Employeur / Entreprise",
  association: "Association d'accompagnement",
  collectivite: "Collectivité / Service public",
  other: "Autre",
};

interface PartnerLeadPayload {
  name: string;
  email: string;
  organization: string;
  structureType: string;
  message?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildConfirmationEmail(p: PartnerLeadPayload): { subject: string; html: string } {
  const structure = STRUCTURE_LABELS[p.structureType] ?? p.structureType;
  const safeName = escapeHtml(p.name);
  const safeOrg = escapeHtml(p.organization);
  const safeStructure = escapeHtml(structure);
  const logoUrl = "https://tofrance.app/assets/logo-tofrance.png";

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f1f5f9">
  <div style="padding:40px 16px">
    <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5a8e 100%);padding:32px 40px 28px;text-align:center">
        <div style="background:#ffffff;display:inline-block;padding:14px 28px;border-radius:12px;margin-bottom:14px"><img src="${logoUrl}" alt="ToFrance" height="80" style="height:80px" /></div>
        <p style="color:#94b8db;margin:0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase">Demande de partenariat reçue</p>
      </div>
      <div style="padding:36px 40px">
        <p style="font-size:18px;color:#1e293b;margin:0 0 8px;font-weight:600">Bonjour ${safeName} 👋</p>
        <p style="font-size:15px;color:#475569;line-height:1.65;margin:0 0 20px">
          Merci d'avoir manifesté votre intérêt pour rejoindre le réseau <strong>ToFrance</strong>.
          Nous avons bien reçu votre demande et un membre de notre équipe va l'étudier avec attention.
        </p>

        <div style="background:#f8fafc;border-radius:12px;padding:20px 22px;margin:0 0 24px;border:1px solid #e2e8f0">
          <p style="margin:0 0 10px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:700">Récapitulatif</p>
          <p style="margin:4px 0;font-size:14px;color:#334155"><strong>Structure :</strong> ${safeOrg}</p>
          <p style="margin:4px 0;font-size:14px;color:#334155"><strong>Type :</strong> ${safeStructure}</p>
        </div>

        <p style="font-size:15px;color:#475569;line-height:1.65;margin:0 0 12px">
          <strong style="color:#1e293b">Prochaine étape :</strong> un membre de l'équipe vous contactera sous
          <strong>24h ouvrées</strong> pour échanger sur vos besoins et vous présenter la plateforme.
        </p>

        <p style="font-size:14px;color:#64748b;line-height:1.6;margin:18px 0 0">
          En attendant, vous pouvez découvrir la plateforme :
        </p>

        <div style="text-align:center;margin:18px 0 8px">
          <a href="https://tofrance.app/landing" style="background:#1e3a5f;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Découvrir ToFrance →</a>
        </div>
      </div>
      <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6">ToFrance — IA pour l'insertion des publics éloignés de l'emploi<br/>Vous recevez cet email car vous avez soumis une demande sur tofrance.app</p>
      </div>
    </div>
  </div>
</body></html>`;

  return {
    subject: "✅ Votre demande de partenariat ToFrance a bien été reçue",
    html,
  };
}

function buildInternalNotification(p: PartnerLeadPayload): { subject: string; html: string } {
  const structure = STRUCTURE_LABELS[p.structureType] ?? p.structureType;
  const message = p.message ? escapeHtml(p.message).replace(/\n/g, "<br/>") : "<em>(non renseigné)</em>";
  const html = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e2e8f0">
    <h2 style="margin:0 0 16px;color:#1e3a5f">🆕 Nouveau lead partenaire</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
      <tr><td style="padding:8px 0;color:#64748b;width:140px">Nom</td><td><strong>${escapeHtml(p.name)}</strong></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Email</td><td><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Structure</td><td>${escapeHtml(p.organization)}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Type</td><td>${escapeHtml(structure)}</td></tr>
    </table>
    <div style="margin-top:18px;padding-top:18px;border-top:1px solid #e2e8f0">
      <p style="margin:0 0 6px;color:#64748b;font-size:13px">Message :</p>
      <div style="font-size:14px;color:#334155;line-height:1.5">${message}</div>
    </div>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8">Suivi à effectuer sous 24h ouvrées.</p>
  </div>
</body></html>`;
  return { subject: `🆕 Lead partenaire — ${p.organization}`, html };
}

async function sendOutlookMail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return { ok: false, error: "LOVABLE_API_KEY not configured" };

  const OUTLOOK_KEY = Deno.env.get("MICROSOFT_OUTLOOK_API_KEY");
  if (!OUTLOOK_KEY) return { ok: false, error: "MICROSOFT_OUTLOOK_API_KEY not configured" };

  try {
    const res = await fetch(`${GATEWAY_URL}/me/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": OUTLOOK_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject: opts.subject,
          body: { contentType: "HTML", content: opts.html },
          toRecipients: [{ emailAddress: { address: opts.to } }],
        },
        saveToSentItems: true,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { ok: false, error: `Outlook ${res.status}: ${txt}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as PartnerLeadPayload & { internalRecipient?: string };

    if (!body.name || !body.email || !body.organization || !body.structureType) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Send confirmation to the partner
    const confirmation = buildConfirmationEmail(body);
    const sendToPartner = await sendOutlookMail({
      to: body.email,
      subject: confirmation.subject,
      html: confirmation.html,
    });

    // 2) Internal notification (best-effort) — defaults to the connected mailbox itself ("me")
    let internalSent: { ok: boolean; error?: string } | null = null;
    if (body.internalRecipient) {
      const internal = buildInternalNotification(body);
      internalSent = await sendOutlookMail({
        to: body.internalRecipient,
        subject: internal.subject,
        html: internal.html,
      });
    }

    if (!sendToPartner.ok) {
      console.error("Partner confirmation failed:", sendToPartner.error);
      return new Response(
        JSON.stringify({ confirmationSent: false, error: sendToPartner.error, internalSent }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📧 Partner confirmation sent via Outlook to ${body.email}`);
    return new Response(
      JSON.stringify({ confirmationSent: true, internalSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("notify-partner-signup error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
