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

type SlackRouteConfig = {
  default?: string;
  byStatus?: Record<string, string>;
  bySource?: Record<string, string>;
};

function line(label: string, value?: string | null) {
  return value ? `*${label}:* ${value}` : null;
}

function lookup(map: Record<string, string> | undefined, key?: string | null) {
  if (!map || !key) return null;
  return map[key] || map[key.toLowerCase()] || map[key.trim()] || null;
}

export function resolveSlackWebhookUrl(input: { status?: string | null; source?: string | null } = {}) {
  const rawConfig = Deno.env.get("SLACK_WEBHOOK_ROUTES");
  if (rawConfig) {
    try {
      const config = JSON.parse(rawConfig) as SlackRouteConfig;
      const routed = lookup(config.byStatus, input.status) || lookup(config.bySource, input.source) || config.default;
      if (routed) return routed;
    } catch (error) {
      console.warn("SLACK_WEBHOOK_ROUTES is invalid JSON; falling back to SLACK_WEBHOOK_URL", error);
    }
  }
  return Deno.env.get("SLACK_WEBHOOK_URL");
}

export async function postSlackMessage(body: Record<string, unknown>, route: { status?: string | null; source?: string | null } = {}) {
  const webhookUrl = resolveSlackWebhookUrl(route);
  if (!webhookUrl) {
    console.warn("No Slack webhook configured; Slack notification skipped", route);
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Slack webhook failed [${response.status}]: ${bodyText.slice(0, 500)}`);
  }
}

export async function notifySlackLeadStatusChange(payload: LeadStatusNotification) {
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

  await postSlackMessage({ text: [title, ...fields].join("\n") }, { status: payload.newStatus, source: payload.source });
}