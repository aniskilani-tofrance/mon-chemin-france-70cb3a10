import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.25.76";
import { findDealStageId } from "../_shared/hubspot-status.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";
const CONTACT_PROPERTIES = [
  "firstname",
  "phone",
  "email",
  "source_location",
  "source_slug",
  "route_orientation",
  "statut_lead",
  "score_qualification",
  "date_diagnostic",
  "diagnostic_id",
  "langue_diagnostic",
  "niveau_francais",
  "besoin_principal",
  "secteur_metier",
  "freins_identifies",
  "disponibilite",
  "mobilite",
].join(",");

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list"), after: z.string().optional() }),
  z.object({ action: z.literal("owners") }),
  z.object({ action: z.literal("updateStatus"), contactId: z.string().min(1), dealId: z.string().optional().nullable(), diagnosticId: z.string().optional().nullable(), status: z.string().min(1).max(120) }),
  z.object({
    action: z.literal("createTask"),
    contactId: z.string().min(1),
    title: z.string().min(1).max(255),
    description: z.string().max(5000).optional().default(""),
    dueDate: z.string().min(1),
    ownerId: z.string().optional().nullable(),
  }),
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("Authentification requise");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("Session invalide");

  const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (roleError || !isAdmin) throw new Error("Accès admin requis");
}

async function getPortalId() {
  try {
    const data = await hubspot("/account-info/v3/details");
    return String(data?.portalId || data?.hub_id || "");
  } catch (_error) {
    return "";
  }
}

function normalizeContact(contact: any, portalId: string) {
  const dealId = contact.associations?.deals?.results?.[0]?.id || null;
  const props = contact.properties || {};
  return {
    id: contact.id,
    dealId,
    hubspotUrl: portalId ? `https://app.hubspot.com/contacts/${portalId}/contact/${contact.id}` : `https://app.hubspot.com/contacts/contact/${contact.id}`,
    firstname: props.firstname || "",
    phone: props.phone || "",
    email: props.email || "",
    source_location: props.source_location || "",
    source_slug: props.source_slug || "",
    route_orientation: props.route_orientation || "",
    statut_lead: props.statut_lead || "Nouveau diagnostic",
    score_qualification: props.score_qualification ? Number(props.score_qualification) : null,
    date_diagnostic: props.date_diagnostic || "",
    diagnostic_id: props.diagnostic_id || "",
    langue_diagnostic: props.langue_diagnostic || "",
    niveau_francais: props.niveau_francais || "",
    besoin_principal: props.besoin_principal || "",
    secteur_metier: props.secteur_metier || "",
    freins_identifies: props.freins_identifies || "",
    disponibilite: props.disponibilite || "",
    mobilite: props.mobilite || "",
  };
}

async function listContacts(after?: string) {
  const params = new URLSearchParams({
    limit: "100",
    properties: CONTACT_PROPERTIES,
    associations: "deals",
    archived: "false",
  });
  if (after) params.set("after", after);
  const [data, portalId] = await Promise.all([
    hubspot(`/crm/v3/objects/contacts?${params.toString()}`),
    getPortalId(),
  ]);
  const contacts = (data?.results || [])
    .map((contact: any) => normalizeContact(contact, portalId))
    .filter((contact: any) => contact.diagnostic_id || contact.source_location || contact.source_slug || contact.route_orientation);
  return { contacts, paging: data?.paging || null };
}

async function logStatusSync(entry: Record<string, unknown>) {
  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { error } = await supabaseAdmin.from("sync_logs").insert({
    direction: "tofrance_to_hubspot",
    source_system: "tofrance",
    target_system: "hubspot",
    ...entry,
  });
  if (error) console.error("sync_logs insert failed:", error.message);
}

async function updateLocalStatus(contactId: string, dealId: string | null | undefined, diagnosticId: string | null | undefined, status: string) {
  const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const values = { statut_lead: status, hubspot_contact_id: contactId, hubspot_deal_id: dealId ?? null, status_updated_from: "tofrance", status_updated_at: new Date().toISOString() };
  if (diagnosticId) await supabaseAdmin.from("onboarding_results").update(values).eq("id", diagnosticId);
  await supabaseAdmin.from("profiles").update(values).eq("hubspot_contact_id", contactId);
  await supabaseAdmin.from("leads").update(values).eq("hubspot_contact_id", contactId);
}

async function updateStatus(contactId: string, dealId: string | null | undefined, diagnosticId: string | null | undefined, status: string) {
  await hubspot(`/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: { statut_lead: status } }),
  });

  let dealstage: string | null = null;
  let dealUpdated = false;
  if (dealId) {
    const stage = await findDealStageId(hubspot, status);
    dealstage = stage.dealstage;
    await hubspot(`/crm/v3/objects/deals/${dealId}`, {
      method: "PATCH",
      body: JSON.stringify({ properties: { dealstage: stage.stageId } }),
    });
    dealUpdated = true;
  }
  await updateLocalStatus(contactId, dealId, diagnosticId, status);
  await logStatusSync({ diagnostic_id: diagnosticId, hubspot_contact_id: contactId, hubspot_deal_id: dealId, new_status: status, hubspot_dealstage: dealstage, status: "success" });
  return { contactUpdated: true, dealUpdated, dealstage, warning: dealId ? undefined : "Aucun deal associé à ce contact" };
}

async function listOwners() {
  const data = await hubspot("/crm/v3/owners?limit=100&archived=false");
  return {
    owners: (data?.results || []).map((owner: any) => ({
      id: owner.id,
      name: [owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.email || owner.id,
      email: owner.email || "",
    })),
  };
}

async function createTask(input: z.infer<typeof ActionSchema> & { action: "createTask" }) {
  const due = new Date(input.dueDate);
  if (Number.isNaN(due.getTime())) throw new Error("Date d'échéance invalide");

  const properties: Record<string, string> = {
    hs_timestamp: due.toISOString(),
    hs_task_subject: input.title,
    hs_task_body: input.description || "",
    hs_task_status: "NOT_STARTED",
  };
  if (input.ownerId) properties.hubspot_owner_id = input.ownerId;

  const data = await hubspot("/crm/v3/objects/tasks", {
    method: "POST",
    body: JSON.stringify({
      properties,
      associations: [{
        to: { id: input.contactId },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 204 }],
      }],
    }),
  });
  return { taskId: data?.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);

  try {
    await requireAdmin(req);
    const parsed = ActionSchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

    if (parsed.data.action === "list") return json(await listContacts(parsed.data.after));
    if (parsed.data.action === "owners") return json(await listOwners());
    if (parsed.data.action === "updateStatus") return json(await updateStatus(parsed.data.contactId, parsed.data.dealId, parsed.data.status));
    return json(await createTask(parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("admin-hubspot-leads error:", message);
    return json({ error: message }, message.includes("admin") || message.includes("Authentification") || message.includes("Session") ? 401 : 500);
  }
});
