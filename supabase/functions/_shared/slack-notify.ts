type LeadStatusNotification = {
  source: "HubSpot" | "Admin ToFrance";
  previousStatus?: string | null;
  newStatus: string;
  contactId?: string | null;
  dealId?: string | null;
  diagnosticId?: string | null;
  firstname?: string | null;
  email?: string | null;
  phone?: string | null;
  sourceLocation?: string | null;
  routeOrientation?: string | null;
};

function line(label: string, value?: string | null) {
  return value ? `*${label}:* ${value}` : null;
}

export async function notifySlackLeadStatusChange(payload: LeadStatusNotification) {
  const webhookUrl = Deno.env.get("SLACK_WEBHOOK_URL");
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL is not configured; Slack notification skipped");
    return;
  }

  if (payload.previousStatus && payload.previousStatus === payload.newStatus) return;

  const title = `🔔 Statut lead synchronisé — ${payload.newStatus}`;
  const fields = [
    line("Origine", payload.source),
    line("Ancien statut", payload.previousStatus || "Non renseigné"),
    line("Nouveau statut", payload.newStatus),
    line("Contact", [payload.firstname, payload.email, payload.phone].filter(Boolean).join(" · ")),
    line("Lieu source", payload.sourceLocation),
    line("Orientation", payload.routeOrientation),
    line("Diagnostic ID", payload.diagnosticId),
    line("Contact HubSpot", payload.contactId),
    line("Deal HubSpot", payload.dealId),
  ].filter(Boolean);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: [title, ...fields].join("\n") }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Slack webhook failed [${response.status}]: ${body.slice(0, 500)}`);
  }
}