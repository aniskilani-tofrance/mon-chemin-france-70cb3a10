import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendOutlookMail } from "../_shared/outlook-mail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

function formatDateFr(d: Date): string {
  const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${days[d.getUTCDay()]} ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} à ${hh}h${mm} (UTC)`;
}

function buildPersonalizedSubject(p: PartnerLeadPayload): string {
  const structure = STRUCTURE_LABELS[p.structureType] ?? p.structureType;
  // Objet personnalisé : nom de la structure + type, dans la limite raisonnable
  const orgPart = p.organization.length > 50 ? p.organization.slice(0, 47) + "…" : p.organization;
  return `✅ ${orgPart} — votre demande de partenariat ToFrance (${structure})`;
}

function buildConfirmationEmail(p: PartnerLeadPayload): { subject: string; html: string } {
  const structure = STRUCTURE_LABELS[p.structureType] ?? p.structureType;
  const safeName = escapeHtml(p.name);
  const safeFirstName = escapeHtml(p.name.split(" ")[0] || p.name);
  const safeEmail = escapeHtml(p.email);
  const safeOrg = escapeHtml(p.organization);
  const safeStructure = escapeHtml(structure);
  const safeMessage = p.message
    ? escapeHtml(p.message).replace(/\n/g, "<br/>")
    : '<em style="color:#94a3b8">Aucun message complémentaire</em>';
  const submittedAt = formatDateFr(new Date());
  const logoUrl = "https://tofrance.app/assets/logo-tofrance.png";

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Demande de partenariat reçue</title></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f1f5f9;color:#1e293b">
  <div style="padding:40px 16px">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

      <!-- HEADER -->
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5a8e 100%);padding:32px 40px 28px;text-align:center">
        <div style="background:#ffffff;display:inline-block;padding:14px 28px;border-radius:12px;margin-bottom:14px">
          <img src="${logoUrl}" alt="ToFrance" height="80" style="height:80px;display:block" />
        </div>
        <p style="color:#94b8db;margin:0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;font-weight:600">Demande de partenariat reçue</p>
      </div>

      <!-- BODY -->
      <div style="padding:36px 40px 28px">
        <p style="font-size:18px;color:#1e293b;margin:0 0 8px;font-weight:600">Bonjour ${safeFirstName} 👋</p>
        <p style="font-size:15px;color:#475569;line-height:1.65;margin:0 0 22px">
          Merci d'avoir manifesté l'intérêt de <strong>${safeOrg}</strong> pour rejoindre le réseau
          <strong>ToFrance</strong>. Votre demande a bien été enregistrée et un membre de notre équipe
          va l'étudier avec attention.
        </p>

        <!-- RÉCAPITULATIF -->
        <div style="background:#f8fafc;border-radius:12px;padding:22px 24px;margin:0 0 24px;border:1px solid #e2e8f0">
          <p style="margin:0 0 14px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">📋 Récapitulatif de votre demande</p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
            <tr>
              <td style="padding:6px 0;color:#64748b;width:130px;vertical-align:top">Contact</td>
              <td style="padding:6px 0;font-weight:600;color:#1e293b">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;vertical-align:top">Email</td>
              <td style="padding:6px 0;color:#1e293b">${safeEmail}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;vertical-align:top">Structure</td>
              <td style="padding:6px 0;font-weight:600;color:#1e293b">${safeOrg}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;vertical-align:top">Type</td>
              <td style="padding:6px 0;color:#1e293b">
                <span style="display:inline-block;background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600">${safeStructure}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#64748b;vertical-align:top">Soumis le</td>
              <td style="padding:6px 0;color:#475569;font-size:13px">${submittedAt}</td>
            </tr>
            <tr>
              <td style="padding:10px 0 4px;color:#64748b;vertical-align:top" colspan="2">
                <p style="margin:0 0 6px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;font-weight:700">Votre besoin</p>
                <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:14px;color:#334155;line-height:1.55">${safeMessage}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- PROCHAINE ÉTAPE -->
        <div style="background:linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%);border-radius:12px;padding:18px 22px;margin:0 0 24px;border-left:4px solid #1e3a5f">
          <p style="margin:0 0 6px;font-size:13px;color:#1e3a5f;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">⏱ Prochaine étape</p>
          <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6">
            Un membre de l'équipe ToFrance vous contactera sous <strong>24h ouvrées</strong> à l'adresse
            <strong>${safeEmail}</strong> pour échanger sur vos besoins et vous présenter la plateforme.
          </p>
        </div>

        <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0 0 14px">
          En attendant, vous pouvez découvrir notre plateforme :
        </p>

        <div style="text-align:center;margin:0 0 8px">
          <a href="https://tofrance.app/landing" style="background:#1e3a5f;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">Découvrir ToFrance →</a>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="background:#f8fafc;padding:22px 40px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="font-size:12px;color:#94a3b8;margin:0 0 4px;line-height:1.6">
          <strong style="color:#64748b">ToFrance</strong> — IA pour l'insertion des publics éloignés de l'emploi
        </p>
        <p style="font-size:11px;color:#cbd5e1;margin:0;line-height:1.5">
          Vous recevez cet email car ${safeOrg} a soumis une demande de partenariat sur tofrance.app
        </p>
      </div>
    </div>
  </div>
</body></html>`;

  return {
    subject: buildPersonalizedSubject(p),
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

// (Outlook send logic moved to ../_shared/outlook-mail.ts with retry/backoff.)


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
      console.error(
        `Partner confirmation FAILED to ${body.email} after ${sendToPartner.attempts} attempt(s) — permanent=${sendToPartner.permanent === true}: ${sendToPartner.error}`
      );
      return new Response(
        JSON.stringify({
          confirmationSent: false,
          error: sendToPartner.error,
          attempts: sendToPartner.attempts,
          permanent: sendToPartner.permanent === true,
          internalSent,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `📧 Partner confirmation sent to ${body.email} in ${sendToPartner.attempts} attempt(s) (${sendToPartner.durationMs}ms)`
    );
    return new Response(
      JSON.stringify({ confirmationSent: true, attempts: sendToPartner.attempts, internalSent }),
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
