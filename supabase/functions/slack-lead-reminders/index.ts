import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Lead = {
  id: string;
  first_name: string | null;
  phone: string | null;
  statut_lead: string | null;
  status_updated_at: string | null;
  source_name: string | null;
  source_location_id: string | null;
  hubspot_contact_id: string | null;
  hubspot_deal_id: string | null;
  profile_id: string | null;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function leadLabel(lead: Lead) {
  return [lead.first_name, lead.phone].filter(Boolean).join(" · ") || `Lead ${lead.id.slice(0, 8)}`;
}

async function notifySlack(lead: Lead) {
  const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
  if (!webhookUrl) throw new Error("SLACK_WEBHOOK_URL is not configured");

  const status = lead.statut_lead || "Statut non renseigné";
  const since = lead.status_updated_at ? new Date(lead.status_updated_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" }) : "date inconnue";
  const fields = [
    `*Lead :* ${leadLabel(lead)}`,
    `*Statut inchangé :* ${status}`,
    `*Depuis :* ${since}`,
    lead.source_name ? `*Source :* ${lead.source_name}` : null,
    lead.source_location_id ? `*Lieu source :* ${lead.source_location_id}` : null,
    lead.hubspot_contact_id ? `*Contact HubSpot :* ${lead.hubspot_contact_id}` : null,
    lead.hubspot_deal_id ? `*Deal HubSpot :* ${lead.hubspot_deal_id}` : null,
  ].filter(Boolean);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: [`⏰ *Relance lead — statut inchangé depuis plus de 48h*`, ...fields, "Action attendue : vérifier le suivi ou changer le statut."].join("\n"),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed [${response.status}]: ${body.slice(0, 500)}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: leads, error } = await supabaseAdmin
      .from("leads")
      .select("id, first_name, phone, statut_lead, status_updated_at, source_name, source_location_id, hubspot_contact_id, hubspot_deal_id, profile_id")
      .not("statut_lead", "is", null)
      .not("status_updated_at", "is", null)
      .lte("status_updated_at", cutoff)
      .or("slack_reminder_sent_at.is.null,slack_reminder_sent_at.lt.status_updated_at")
      .limit(25);

    if (error) throw new Error(`Lecture des leads impossible: ${error.message}`);

    const results = [];
    for (const lead of (leads || []) as Lead[]) {
      try {
        await notifySlack(lead);
        const { error: updateError } = await supabaseAdmin
          .from("leads")
          .update({ slack_reminder_sent_at: new Date().toISOString() })
          .eq("id", lead.id);
        if (updateError) throw new Error(updateError.message);
        results.push({ id: lead.id, sent: true });
      } catch (error) {
        console.error("Slack lead reminder failed", lead.id, error);
        results.push({ id: lead.id, sent: false, error: (error as Error).message });
      }
    }

    return json({ checked: leads?.length || 0, results });
  } catch (error) {
    console.error("slack-lead-reminders error", error);
    return json({ error: (error as Error).message }, 500);
  }
});