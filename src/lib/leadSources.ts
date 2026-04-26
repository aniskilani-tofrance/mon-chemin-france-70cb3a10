export interface LeadSource {
  id: string;
  slug: string;
  name: string;
  type: string;
  campaign: string;
}

export const PILOT_LEAD_SOURCES: Record<string, LeadSource> = {
  aurore: {
    id: "aurore",
    slug: "aurore",
    name: "Aurore",
    type: "association",
    campaign: "pilote-2026",
  },
  "emmaus-victoire": {
    id: "emmaus-victoire",
    slug: "emmaus-victoire",
    name: "Emmaüs Victoire",
    type: "association",
    campaign: "pilote-2026",
  },
  "mdq-landy": {
    id: "mdq-landy",
    slug: "mdq-landy",
    name: "Maison de quartier du Landy",
    type: "maison_quartier",
    campaign: "pilote-2026",
  },
};

export function normalizeSourceSlug(value?: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveLeadSource(value?: string | null): LeadSource {
  const slug = normalizeSourceSlug(value) || "tofrance";
  return PILOT_LEAD_SOURCES[slug] || {
    id: slug,
    slug,
    name: slug === "tofrance" ? "ToFrance" : slug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "),
    type: slug === "tofrance" ? "direct" : "lieu_partenaire",
    campaign: slug === "tofrance" ? "organique" : "pilote-2026",
  };
}
