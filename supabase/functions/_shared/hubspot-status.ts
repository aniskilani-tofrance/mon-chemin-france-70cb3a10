export const HUBSPOT_STATUS_TO_TOFRANCE: Record<string, string> = {
  "Nouveau diagnostic": "Nouveau diagnostic",
  "À qualifier": "À qualifier",
  "À rappeler": "À rappeler",
  "Contacté": "Contacté",
  "Orientation proposée": "Orientation proposée",
  "Transmis au partenaire": "Transmis au partenaire",
  "RDV pris": "RDV pris",
  "WON": "Entré en formation",
  "LOST": "Abandonné",
};

export const TOFRANCE_STATUS_TO_DEALSTAGE: Record<string, string> = {
  "Nouveau diagnostic": "Nouveau diagnostic",
  "À qualifier": "À qualifier",
  "À rappeler": "À rappeler",
  "Contacté": "Contacté",
  "Orientation proposée": "Orientation proposée",
  "Transmis au partenaire": "Transmis au partenaire",
  "RDV pris": "RDV pris",
  "Entré en formation": "WON",
  "Non joignable": "LOST",
  "Non éligible": "LOST",
  "Abandonné": "LOST",
};

export const TOFRANCE_LEAD_STATUSES = Object.keys(TOFRANCE_STATUS_TO_DEALSTAGE);

export function normalizeToFranceStatus(status: unknown) {
  const value = String(status ?? "").trim();
  if (!value) return "Nouveau diagnostic";
  return HUBSPOT_STATUS_TO_TOFRANCE[value] || value;
}

export async function findDealStageId(hubspot: (path: string, init?: RequestInit) => Promise<any>, status: string) {
  const target = TOFRANCE_STATUS_TO_DEALSTAGE[status] || status;
  const pipelines = await hubspot("/crm/v3/pipelines/deals");
  const pipeline = pipelines?.results?.find((p: any) => p.label === "Leads ToFrance" || p.id === "leads_tofrance") || pipelines?.results?.[0];
  if (!pipeline) throw new Error("Aucun pipeline HubSpot disponible");

  if (target === "WON") {
    const won = pipeline.stages?.find((s: any) => s.id === "closedwon" || s.label === "WON" || s.label === "Entré en formation" || String(s.metadata?.isClosedWon) === "true" || String(s.metadata?.probability) === "1.0");
    if (won) return { pipelineId: pipeline.id as string, stageId: won.id as string, dealstage: "WON" };
  }

  if (target === "LOST") {
    const lost = pipeline.stages?.find((s: any) => s.id === "closedlost" || s.label === "LOST" || s.label === "Perdu" || s.label === "Abandonné" || (String(s.metadata?.isClosed) === "true" && String(s.metadata?.probability) === "0.0"));
    if (lost) return { pipelineId: pipeline.id as string, stageId: lost.id as string, dealstage: "LOST" };
  }

  const stage = pipeline.stages?.find((s: any) => s.label === target || s.id === target);
  if (!stage) throw new Error(`Dealstage HubSpot introuvable pour "${target}"`);
  return { pipelineId: pipeline.id as string, stageId: stage.id as string, dealstage: target };
}
