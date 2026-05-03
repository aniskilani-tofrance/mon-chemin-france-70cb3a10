import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendOutlookMail } from "../_shared/outlook-mail.ts";
import { calculateQualificationScore } from "../_shared/hubspot-score.ts";
import { postSlackMessage } from "../_shared/slack-notify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/hubspot";
const ADMIN_EMAIL = "contact@tofrance.app";

type DiagnosticType = "marianne" | "shared_diagnostic";
type SyncStatus = "success" | "failure" | "warning";

interface HubSpotPayload {
  firstname?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  diagnostic_id: string;
  source_location?: string | null;
  source_slug?: string | null;
  langue_diagnostic?: string | null;
  niveau_francais?: string | null;
  lecture_ecriture_francais?: string | null;
  besoin_principal?: string | null;
  route_orientation?: string | null;
  secteur_metier?: string | null;
  freins_identifies?: string | null;
  disponibilite?: string | null;
  mobilite?: string | null;
  whatsapp?: boolean;
  consentement_rappel?: boolean;
  consentement_transmission?: boolean;
  date_diagnostic: string;
  statut_lead: string;
  score_qualification: number;
  source_location_id?: string | null;
  source_name?: string | null;
  source_type?: string | null;
  source_campaign?: string | null;
}

const text = (value: unknown): string | null => {
  if (value == null) return null;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ").slice(0, 500) || null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed.slice(0, 500) : null;
};

const boolish = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  return ["true", "yes", "oui", "1", "whatsapp"].includes(normalized);
};

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
  if (!response.ok) {
    throw new Error(`HubSpot API call failed [${response.status}]: ${bodyText.slice(0, 1000)}`);
  }
  return data;
}

async function logSync(supabaseAdmin: any, entry: {
  diagnostic_type: DiagnosticType;
  diagnostic_id: string;
  hubspot_contact_id?: string | null;
  hubspot_company_id?: string | null;
  hubspot_deal_id?: string | null;
  score_qualification?: number | null;
  status: SyncStatus;
  error_message?: string | null;
  payload_summary?: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin.from("hubspot_diagnostic_sync_logs").insert({
    ...entry,
    payload_summary: entry.payload_summary ?? {},
  });
  if (error) console.error("hubspot sync log insert failed:", error.message);
}

async function rememberHubSpotStatus(supabaseAdmin: any, diagnosticType: DiagnosticType, diagnosticId: string, contactId: string, dealId: string | null, status: string) {
  const values = {
    statut_lead: status,
    hubspot_contact_id: contactId,
    hubspot_deal_id: dealId,
    status_updated_from: "tofrance",
    status_updated_at: new Date().toISOString(),
  };
  if (diagnosticType === "marianne") await supabaseAdmin.from("onboarding_results").update(values).eq("id", diagnosticId);
  await supabaseAdmin.from("profiles").update(values).eq("id", diagnosticId);
  await supabaseAdmin.from("leads").update(values).eq("profile_id", diagnosticId);
}

function sourceFromAnswers(answers: Record<string, unknown>) {
  const sourceSlug = text(answers.source_slug) || text(answers.sourceSlug) || text(answers.utm_source) || "tofrance";
  return {
    source_slug: sourceSlug,
    source_location: text(answers.source_location) || text(answers.sourceLocation) || text(answers.source_name) || "ToFrance",
    source_location_id: text(answers.source_location_id) || sourceSlug,
    source_name: text(answers.source_name) || text(answers.source_location) || "ToFrance",
    source_type: text(answers.source_type),
    source_campaign: text(answers.source_campaign),
  };
}

async function buildMariannePayload(supabaseAdmin: any, diagnosticId: string): Promise<HubSpotPayload> {
  const { data, error } = await supabaseAdmin
    .from("onboarding_results")
    .select("*")
    .eq("id", diagnosticId)
    .maybeSingle();
  if (error) throw new Error(`Lecture diagnostic Marianne impossible: ${error.message}`);
  if (!data) throw new Error("Diagnostic Marianne introuvable");

  const answers = (data.answers || {}) as Record<string, unknown>;
  const source = sourceFromAnswers(answers);
  const consentementRappel = boolish(answers.contact_48h);
  const consentementTransmission = boolish(answers.consent_lead_sharing) || boolish(answers.consentement_transmission);
  const niveauFrancais = text(data.french_level_cecrl) || text(answers.french_level_cecrl);
  const besoinPrincipal = text(data.main_goal) || text(answers.main_goal);
  const phone = text(answers.contact_phone);

  const score = calculateQualificationScore({
    phone,
    consentement_rappel: consentementRappel,
    consentement_transmission: consentementTransmission,
    besoin_principal: besoinPrincipal,
    niveau_francais: niveauFrancais,
  });

  return {
    firstname: text(answers.contact_firstname),
    phone,
    email: text(data.email) || text(answers.contact_email),
    city: text(answers.location),
    diagnostic_id: diagnosticId,
    source_location: source.source_location,
    source_slug: source.source_slug,
    source_location_id: source.source_location_id,
    source_name: source.source_name,
    source_type: source.source_type,
    source_campaign: source.source_campaign,
    langue_diagnostic: text(data.language),
    niveau_francais: niveauFrancais,
    lecture_ecriture_francais: text(data.literacy) || text(answers.literacy),
    besoin_principal: besoinPrincipal,
    route_orientation: text(data.lead_route) || text(answers.leadRoute),
    secteur_metier: text(data.target_sector) || text(answers.target_sector),
    freins_identifies: text(data.barriers) || text(answers.barriers),
    disponibilite: text(answers.immediate_availability) || text(answers.contact_48h),
    mobilite: text(answers.mobility) || text(answers.mobility_km),
    whatsapp: boolish(answers.whatsapp),
    consentement_rappel: consentementRappel,
    consentement_transmission: consentementTransmission,
    date_diagnostic: new Date().toISOString().slice(0, 10),
    statut_lead: "Nouveau diagnostic",
    score_qualification: score,
  };
}

async function buildSharedPayload(supabaseAdmin: any, diagnosticId: string): Promise<HubSpotPayload> {
  const { data: diagnostic, error: dErr } = await supabaseAdmin
    .from("shared_diagnostics")
    .select("id, learner_language, completed_at")
    .eq("id", diagnosticId)
    .maybeSingle();
  if (dErr) throw new Error(`Lecture diagnostic partagé impossible: ${dErr.message}`);
  if (!diagnostic) throw new Error("Diagnostic partagé introuvable");

  const { data: rows, error: aErr } = await supabaseAdmin
    .from("shared_diagnostic_answers")
    .select("question_key, answer_fr, answer_native")
    .eq("diagnostic_id", diagnosticId);
  if (aErr) throw new Error(`Lecture réponses impossible: ${aErr.message}`);

  const answers: Record<string, string | null> = {};
  for (const row of rows || []) answers[row.question_key] = text(row.answer_fr) || text(row.answer_native);

  const besoinPrincipal = answers.main_goal;
  const niveauFrancais = answers.french_level_felt;
  const score = calculateQualificationScore({
    phone: answers.contact_phone,
    consentement_rappel: true,
    consentement_transmission: true,
    besoin_principal: besoinPrincipal,
    niveau_francais: niveauFrancais,
  });

  return {
    firstname: answers.contact_firstname || null,
    phone: answers.contact_phone || null,
    email: answers.contact_email || null,
    city: answers.location || null,
    diagnostic_id: diagnosticId,
    source_location: "Diagnostic partagé",
    source_slug: "diagnostic-partage",
    source_location_id: "diagnostic-partage",
    source_name: "Diagnostic partagé",
    source_type: "formateur",
    source_campaign: "diagnostic-partage",
    langue_diagnostic: text(diagnostic.learner_language),
    niveau_francais: niveauFrancais,
    lecture_ecriture_francais: niveauFrancais,
    besoin_principal: besoinPrincipal,
    route_orientation: "diagnostic_partage",
    secteur_metier: answers.target_sector || null,
    freins_identifies: answers.barriers || null,
    disponibilite: answers.availability || null,
    mobilite: answers.mobility || null,
    whatsapp: false,
    consentement_rappel: true,
    consentement_transmission: true,
    date_diagnostic: new Date(diagnostic.completed_at || Date.now()).toISOString().slice(0, 10),
    statut_lead: "Nouveau diagnostic",
    score_qualification: score,
  };
}

// Properties not yet created in the HubSpot portal — skip to avoid PROPERTY_DOESNT_EXIST 400s.
const HUBSPOT_UNSUPPORTED_PROPERTIES = new Set<string>([
  "whatsapp",
  "source_location",
  "source_campaign",
  "disponibilite",
]);

function hubspotProperties(payload: HubSpotPayload) {
  return Object.fromEntries(Object.entries({
    firstname: payload.firstname,
    phone: payload.phone,
    email: payload.email,
    city: payload.city,
    diagnostic_id: payload.diagnostic_id,
    source_location: payload.source_location,
    source_slug: payload.source_slug,
    source_location_id: payload.source_location_id,
    source_name: payload.source_name,
    source_type: payload.source_type,
    source_campaign: payload.source_campaign,
    langue_diagnostic: payload.langue_diagnostic,
    niveau_francais: payload.niveau_francais,
    lecture_ecriture_francais: payload.lecture_ecriture_francais,
    besoin_principal: payload.besoin_principal,
    route_orientation: payload.route_orientation,
    secteur_metier: payload.secteur_metier,
    freins_identifies: payload.freins_identifies,
    disponibilite: payload.disponibilite,
    mobilite: payload.mobilite,
    whatsapp: payload.whatsapp,
    consentement_rappel: payload.consentement_rappel,
    consentement_transmission: payload.consentement_transmission,
    date_diagnostic: payload.date_diagnostic,
    statut_lead: payload.statut_lead,
    score_qualification: payload.score_qualification,
  }).filter(([, value]) => value !== null && value !== undefined && value !== ""));
}

async function searchObject(objectType: string, propertyName: string, value: string, properties: string[] = []) {
  const data = await hubspot(`/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName, operator: "EQ", value }] }],
      properties,
      limit: 1,
    }),
  });
  return data?.results?.[0] || null;
}

async function upsertContact(payload: HubSpotPayload): Promise<{ id: string; created: boolean }> {
  let existing = payload.phone ? await searchObject("contacts", "phone", payload.phone, ["phone", "email"]) : null;
  if (!existing && payload.email) existing = await searchObject("contacts", "email", payload.email, ["phone", "email"]);

  const properties = hubspotProperties(payload);
  if (existing?.id) {
    await hubspot(`/crm/v3/objects/contacts/${existing.id}`, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    return { id: existing.id as string, created: false };
  }

  const created = await hubspot("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
  return { id: created.id as string, created: true };
}

function diagnosticUrl(payload: HubSpotPayload) {
  return `https://mon-chemin-france.lovable.app/fiche/${encodeURIComponent(payload.diagnostic_id)}`;
}

function hubspotContactUrl(contactId: string) {
  return `https://app.hubspot.com/contacts/contact/${contactId}`;
}

async function notifySlackNewDiagnostic(payload: HubSpotPayload, contactId: string) {
  const needsCallback = payload.score_qualification >= 70 && payload.consentement_rappel === true;
  const blocks: any[] = [
    { type: "header", text: { type: "plain_text", text: "Nouveau diagnostic ToFrance", emoji: true } },
    { type: "section", fields: [
      { type: "mrkdwn", text: `*Prénom :*\n${payload.firstname || "—"}` },
      { type: "mrkdwn", text: `*Téléphone :*\n${payload.phone || "—"}` },
      { type: "mrkdwn", text: `*Lieu source :*\n${payload.source_location || "—"}` },
      { type: "mrkdwn", text: `*Langue :*\n${payload.langue_diagnostic || "—"}` },
      { type: "mrkdwn", text: `*Besoin :*\n${payload.besoin_principal || "—"}` },
      { type: "mrkdwn", text: `*Score qualification :*\n${payload.score_qualification}/100` },
      { type: "mrkdwn", text: `*Statut :*\n${payload.statut_lead || "—"}` },
    ] },
  ];
  if (needsCallback) {
    blocks.push({ type: "section", text: { type: "mrkdwn", text: "*Action requise : À rappeler dans les 24h*" } });
  }
  blocks.push({
    type: "actions",
    elements: [
      { type: "button", text: { type: "plain_text", text: "Voir dans HubSpot" }, url: hubspotContactUrl(contactId) },
      { type: "button", text: { type: "plain_text", text: "Voir fiche ToFrance" }, url: diagnosticUrl(payload) },
    ],
  });
  blocks.push({ type: "divider" });

  await postSlackMessage(
    { text: `Nouveau diagnostic ToFrance — ${payload.firstname || payload.phone || payload.diagnostic_id}`, blocks },
    { status: payload.statut_lead, source: "HubSpot" },
  );
}

async function findPipelineAndStage(score: number) {
  const pipelines = await hubspot("/crm/v3/pipelines/deals");
  const pipeline = pipelines?.results?.find((p: any) => p.label === "Leads ToFrance" || p.id === "leads_tofrance");
  if (!pipeline) throw new Error('Pipeline HubSpot "Leads ToFrance" introuvable');
  const targetLabel = score >= 70 ? "À rappeler" : "Nouveau diagnostic";
  const stage = pipeline.stages?.find((s: any) => s.label === targetLabel || s.id === targetLabel);
  if (!stage) throw new Error(`Dealstage HubSpot "${targetLabel}" introuvable dans le pipeline Leads ToFrance`);
  return { pipelineId: pipeline.id as string, stageId: stage.id as string };
}

async function createDeal(payload: HubSpotPayload, contactId: string, companyId?: string | null) {
  const { pipelineId, stageId } = await findPipelineAndStage(payload.score_qualification);
  const closeDate = new Date();
  closeDate.setDate(closeDate.getDate() + 30);

  const dealname = `${payload.firstname || "Bénéficiaire"} - ${payload.route_orientation || "Orientation"} - ${payload.source_location || "ToFrance"}`;
  const associations: any[] = [
    {
      to: { id: contactId },
      types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
    },
  ];
  if (companyId) {
    associations.push({
      to: { id: companyId },
      types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 5 }],
    });
  }

  const created = await hubspot("/crm/v3/objects/deals", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        dealname,
        pipeline: pipelineId,
        dealstage: stageId,
        amount: "0",
        closedate: closeDate.toISOString(),
      },
      associations,
    }),
  });
  return created.id as string;
}

async function createMissingCompanyNote(payload: HubSpotPayload, contactId: string, dealId?: string | null) {
  const body = `Entreprise source introuvable pour source_slug=${payload.source_slug || "—"}. Diagnostic ${payload.diagnostic_id}.`;
  const associations: any[] = [{
    to: { id: contactId },
    types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
  }];
  if (dealId) {
    associations.push({
      to: { id: dealId },
      types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 214 }],
    });
  }
  await hubspot("/crm/v3/objects/notes", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        hs_timestamp: new Date().toISOString(),
        hs_note_body: body,
      },
      associations,
    }),
  });
}

async function notifyMissingCompany(payload: HubSpotPayload) {
  try {
    await sendOutlookMail({
      to: ADMIN_EMAIL,
      subject: `HubSpot ToFrance — entreprise source introuvable (${payload.source_slug || "sans slug"})`,
      html: `<p>Le diagnostic <strong>${payload.diagnostic_id}</strong> a été synchronisé sans entreprise source.</p><p><strong>source_slug :</strong> ${payload.source_slug || "—"}<br><strong>source_location :</strong> ${payload.source_location || "—"}</p>`,
      log: {
        template: "hubspot-missing-source-company",
        sourceFunction: "sync-hubspot-diagnostic",
        metadata: { diagnostic_id: payload.diagnostic_id, source_slug: payload.source_slug },
      },
    });
  } catch (e) {
    console.warn("Admin notification failed:", (e as Error).message);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  let diagnosticType: DiagnosticType = "marianne";
  let diagnosticId = "unknown";

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Méthode non autorisée" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    diagnosticType = body.diagnosticType;
    diagnosticId = String(body.diagnosticId || "");

    if (!["marianne", "shared_diagnostic"].includes(diagnosticType) || !diagnosticId) {
      return new Response(JSON.stringify({ error: "diagnosticType et diagnosticId sont requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payload = diagnosticType === "marianne"
      ? await buildMariannePayload(supabaseAdmin, diagnosticId)
      : await buildSharedPayload(supabaseAdmin, diagnosticId);

    const contact = await upsertContact(payload);
    const contactId = contact.id;
    if (contact.created && payload.diagnostic_id) {
      try {
        await notifySlackNewDiagnostic(payload, contactId);
      } catch (slackErr) {
        console.warn("Slack diagnostic notification failed:", (slackErr as Error).message);
      }
    }
    const company = payload.source_slug ? await searchObject("companies", "source_slug", payload.source_slug, ["name", "source_slug"]) : null;
    const companyId = company?.id || null;
    const dealId = await createDeal(payload, contactId, companyId);
    await rememberHubSpotStatus(supabaseAdmin, diagnosticType, diagnosticId, contactId, dealId, payload.statut_lead);

    let status: SyncStatus = "success";
    let errorMessage: string | null = null;
    if (!companyId) {
      status = "warning";
      errorMessage = `Entreprise source introuvable pour source_slug=${payload.source_slug || "—"}`;
      try {
        await createMissingCompanyNote(payload, contactId, dealId);
      } catch (noteErr) {
        errorMessage += `; note HubSpot non créée: ${(noteErr as Error).message}`;
      }
      await notifyMissingCompany(payload);
    }

    await logSync(supabaseAdmin, {
      diagnostic_type: diagnosticType,
      diagnostic_id: diagnosticId,
      hubspot_contact_id: contactId,
      hubspot_company_id: companyId,
      hubspot_deal_id: dealId,
      score_qualification: payload.score_qualification,
      status,
      error_message: errorMessage,
      payload_summary: {
        firstname: payload.firstname,
        phone_present: !!payload.phone,
        email_present: !!payload.email,
        source_slug: payload.source_slug,
        route_orientation: payload.route_orientation,
        dealstage: payload.score_qualification >= 70 ? "À rappeler" : "Nouveau diagnostic",
      },
    });

    return new Response(JSON.stringify({ success: true, status, contactId, companyId, dealId, score: payload.score_qualification }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = (error as Error).message;
    console.error("sync-hubspot-diagnostic error:", message);
    await logSync(supabaseAdmin, {
      diagnostic_type: diagnosticType,
      diagnostic_id: diagnosticId,
      status: "failure",
      error_message: message,
      payload_summary: {},
    });
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
