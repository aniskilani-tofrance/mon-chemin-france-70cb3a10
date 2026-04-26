import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeToFranceStatus } from "../_shared/hubspot-status.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function hubspot(path: string, init: RequestInit = {}) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  const HUBSPOT_API_KEY = Deno.env.get("HUBSPOT_API_KEY");
  if (!HUBSPOT_API_KEY) throw new Error("HUBSPOT_API_KEY is not configured");

  const response = await fetch(`${GATEWAY_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": HUBSPOT_API_KEY,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const bodyText = await response.text();
  const data = bodyText ? JSON.parse(bodyText) : null;
  if (!response.ok) throw new Error(`HubSpot API call failed [${response.status}]: ${bodyText.slice(0, 1000)}`);
  return data;
}

async function logSync(supabaseAdmin: any, entry: Record<string, unknown>) {
  const { error } = await supabaseAdmin.from("sync_logs").insert({
    direction: "hubspot_to_tofrance",
    source_system: "hubspot",
    target_system: "tofrance",
    ...entry,
  });
  if (error) console.error("sync_logs insert failed:", error.message);
}

async function updateLocalStatus(supabaseAdmin: any, contactId: string, newStatus: string, payload: Record<string, unknown>) {
  const contact = await hubspot(`/crm/v3/objects/contacts/${contactId}?properties=diagnostic_id,statut_lead&associations=deals`);
  const diagnosticId = contact?.properties?.diagnostic_id || null;
  const hubspotStatus = contact?.properties?.statut_lead || newStatus;
  const normalizedStatus = normalizeToFranceStatus(hubspotStatus);
  const dealId = contact?.associations?.deals?.results?.[0]?.id || null;
  const timestamp = new Date().toISOString();

  let previousStatus: string | null = null;
  if (diagnosticId) {
    const { data } = await supabaseAdmin.from("onboarding_results").select("statut_lead").eq("id", diagnosticId).maybeSingle();
    previousStatus = data?.statut_lead || null;
  }
  if (!previousStatus) {
    const { data } = await supabaseAdmin.from("profiles").select("statut_lead").eq("hubspot_contact_id", contactId).maybeSingle();
    previousStatus = data?.statut_lead || null;
  }

  const values = {
    statut_lead: normalizedStatus,
    hubspot_contact_id: contactId,
    hubspot_deal_id: dealId,
    status_updated_from: "hubspot",
    status_updated_at: timestamp,
  };

  if (diagnosticId) {
    await supabaseAdmin.from("onboarding_results").update(values).eq("id", diagnosticId);
    await supabaseAdmin.from("profiles").update(values).eq("id", diagnosticId);
    await supabaseAdmin.from("leads").update(values).eq("profile_id", diagnosticId);
  }
  await supabaseAdmin.from("profiles").update(values).eq("hubspot_contact_id", contactId);
  await supabaseAdmin.from("leads").update(values).eq("hubspot_contact_id", contactId);

  await logSync(supabaseAdmin, {
    diagnostic_id: diagnosticId,
    hubspot_contact_id: contactId,
    hubspot_deal_id: dealId,
    previous_status: previousStatus,
    new_status: normalizedStatus,
    conflict_resolution: "hubspot_priority",
    status: "success",
    payload_summary: { hubspot_status: hubspotStatus, webhook: payload },
  });

  return { diagnosticId, contactId, dealId, status: normalizedStatus };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  try {
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];
    const statusEvents = events.filter((event: any) => event?.propertyName === "statut_lead" && event?.objectId);
    const results = [];

    for (const event of statusEvents) {
      try {
        results.push(await updateLocalStatus(supabaseAdmin, String(event.objectId), String(event.propertyValue || ""), event));
      } catch (error) {
        await logSync(supabaseAdmin, {
          hubspot_contact_id: String(event.objectId || ""),
          new_status: String(event.propertyValue || "unknown"),
          status: "failure",
          error_message: error instanceof Error ? error.message : "Erreur inconnue",
          payload_summary: { webhook: event },
        });
      }
    }

    return json({ success: true, processed: results.length, ignored: events.length - statusEvents.length, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("hubspot-status-webhook error:", message);
    return json({ success: false, error: message }, 500);
  }
});
