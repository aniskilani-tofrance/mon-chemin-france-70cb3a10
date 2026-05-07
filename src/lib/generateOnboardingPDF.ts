/**
 * Generate a PDF recap of the onboarding journey using the browser print API.
 * No external dependency needed — we build an HTML document and print it to PDF.
 */

const ROUTE_LABELS: Record<string, { label: string; description: string; color: string }> = {
  route_a: { label: "Parcours FLE", description: "Formation en français langue étrangère", color: "#2563EB" },
  route_b: { label: "Parcours Formation", description: "Formation professionnelle qualifiante", color: "#7C3AED" },
  route_c: { label: "Parcours Emploi", description: "Accès direct au marché du travail", color: "#059669" },
  sas: { label: "Accompagnement personnalisé", description: "Orientation et accompagnement sur mesure", color: "#D97706" },
};

const NEXT_STEPS: Record<string, { title: string; desc: string; delay: string }[]> = {
  route_a: [
    { title: "Mise en relation", desc: "Un organisme de formation FLE proche de chez vous sera identifié", delay: "Sous 24h" },
    { title: "Évaluation de niveau", desc: "Un conseiller vous contactera pour évaluer votre niveau de français", delay: "Sous 48h" },
    { title: "Début des cours", desc: "Vous démarrerez vos cours de français adaptés à votre niveau", delay: "Sous 2 semaines" },
  ],
  route_b: [
    { title: "Analyse de votre profil", desc: "Nous identifions les formations adaptées à votre secteur et votre niveau", delay: "Sous 24h" },
    { title: "Entretien d'orientation", desc: "Un organisme partenaire vous contactera pour un entretien personnalisé", delay: "Sous 48h" },
    { title: "Entrée en formation", desc: "Vous pourrez démarrer une formation qualifiante ou certifiante", delay: "Sous 1 mois" },
  ],
  route_c: [
    { title: "Transmission du profil", desc: "Votre profil sera partagé avec les employeurs de votre secteur", delay: "Sous 24h" },
    { title: "Prise de contact", desc: "Un employeur ou recruteur vous contactera pour un entretien", delay: "Sous 1 semaine" },
    { title: "Accompagnement", desc: "Un suivi sera mis en place pour faciliter votre intégration", delay: "Dès l'embauche" },
  ],
  sas: [
    { title: "Analyse approfondie", desc: "Un conseiller dédié analysera votre situation en détail", delay: "Sous 48h" },
    { title: "Plan d'action personnalisé", desc: "Vous recevrez un plan adapté à vos besoins spécifiques", delay: "Sous 1 semaine" },
    { title: "Mise en relation ciblée", desc: "Nous vous orienterons vers les dispositifs les plus pertinents", delay: "En continu" },
  ],
};

const FIELD_LABELS: Record<string, string> = {
  origin_country: "Pays d'origine",
  main_goal: "Objectif",
  french_level_cecrl: "Niveau de français",
  work_right: "Droit de travail",
  target_sector: "Secteur visé",
  previous_job: "Métier précédent",
  mobility: "Mobilité",
  funding_status: "Financement",
  immediate_availability: "Disponibilité",
  fle_type: "Type de cours FLE",
  training_duration: "Durée de formation",
  work_schedule: "Horaires acceptés",
  mobility_km: "Rayon de déplacement",
  literacy: "Alphabétisation",
  barriers: "Freins identifiés",
  contact_48h: "Disponibilité contact",
};

const GOAL_LABELS: Record<string, string> = {
  learn_french: "Apprendre le français",
  find_job: "Trouver un emploi",
  job_training: "Formation professionnelle",
  validate_diploma: "Reconnaissance diplôme/expérience",
  start_business: "Créer son entreprise",
  need_help: "Besoin d'aide pour choisir",
};

const LEVEL_LABELS: Record<string, string> = {
  alpha: "Ne parle pas français",
  post_alpha: "Quelques mots",
  a1: "Débutant (A1)",
  a2: "Se débrouille (A2)",
  b1: "Intermédiaire (B1)",
};

const TAG_LABELS: Record<string, string> = {
  status_refugie: "Statut réfugié",
  status_demandeur_asile: "Demandeur d'asile",
  status_sans_papiers: "Sans-papiers",
  status_titre_sejour: "Titre de séjour",
  needs_housing: "Besoin de logement",
  needs_admin: "Aide administrative",
  needs_health: "Besoin santé",
  ready_to_work: "Prêt à travailler",
  has_diploma: "Diplôme à reconnaître",
  cir_signed: "CIR signé",
  cir_in_progress: "CIR en cours",
};

function humanizeTag(tag: string): string {
  return TAG_LABELS[tag.trim()] || tag.trim().replace(/_/g, " ");
}

const WORK_LABELS: Record<string, string> = {
  yes: "Oui",
  no: "Non",
  unknown: "Ne sait pas",
  has_right: "Oui",
  pending: "En cours",
  no_right: "Pas encore",
  not_sure: "Ne sait pas",
};

const SECTOR_LABELS: Record<string, string> = {
  btp: "Bâtiment et travaux publics",
  logistique: "Logistique",
  proprete: "Propreté",
  aide_personne: "Aide à la personne",
  sante: "Santé",
  hotellerie: "Hôtellerie-restauration",
  restauration: "Restauration",
  commerce: "Commerce",
  securite: "Sécurité",
  transport: "Transport",
  autre: "Autre",
  nsp: "Ne sait pas",
};

const MOBILITY_LABELS: Record<string, string> = {
  walk: "À pied",
  bike: "Vélo",
  car: "Voiture",
  transit: "Transports en commun",
  public_transport: "Transports en commun",
  none: "Aucune",
};

const LITERACY_LABELS: Record<string, string> = {
  yes: "Sait lire et écrire",
  partial: "Lecture/écriture partielle",
  no: "Ne sait pas lire ni écrire",
};

const BARRIER_LABELS: Record<string, string> = {
  transport: "Transport",
  childcare: "Garde d'enfants",
  schedule: "Horaires",
  housing: "Logement",
  health: "Santé",
  admin: "Démarches administratives",
  language: "Langue",
  none: "Aucun",
};

const FLE_TYPE_LABELS: Record<string, string> = {
  intensive: "Cours intensifs",
  evening: "Cours du soir",
  weekend: "Cours le week-end",
  online: "Cours en ligne",
  in_person: "Cours en présentiel",
  hybrid: "Cours hybrides",
};

const TRAINING_DURATION_LABELS: Record<string, string> = {
  short: "Courte (< 3 mois)",
  medium: "Moyenne (3-6 mois)",
  long: "Longue (> 6 mois)",
  flexible: "Flexible",
};

const WORK_SCHEDULE_LABELS: Record<string, string> = {
  day: "Journée",
  night: "Nuit",
  weekend: "Week-end",
  flexible: "Flexibles",
  any: "Tous horaires",
};

const FUNDING_LABELS: Record<string, string> = {
  cpf: "CPF",
  pole_emploi: "France Travail",
  france_travail: "France Travail",
  region: "Région",
  ofii: "OFII",
  none: "Aucun",
  unknown: "Ne sait pas",
};

const ADMIN_STATUS_LABELS: Record<string, string> = {
  titre_sejour: "Titre de séjour",
  bpi_refugie: "Statut de réfugié",
  bpi_subsidiaire: "Protection subsidiaire",
  demandeur_asile: "Demandeur d'asile",
  sans_papiers: "Sans-papiers",
  ue: "Citoyen UE",
  cir_signed: "CIR signé",
  cir_in_progress: "CIR en cours",
  dont_know: "Ne sait pas",
};

function humanizeFallback(v: string): string {
  const cleaned = v.replace(/_/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function mapList(value: unknown, dict: Record<string, string>, emptyLabel = "Aucun"): string {
  const arr = Array.isArray(value)
    ? value
    : String(value).split(",");
  const labels = arr
    .map((x) => String(x).trim())
    .filter(Boolean)
    .map((x) => dict[x] || humanizeFallback(x));
  return labels.length ? labels.join(", ") : emptyLabel;
}

function formatValue(key: string, value: unknown): string {
  const v = String(value);
  if (key === "main_goal") return mapList(value, GOAL_LABELS, "—");
  if (key === "french_level_cecrl") return LEVEL_LABELS[v] || humanizeFallback(v);
  if (key === "work_right") return WORK_LABELS[v] || humanizeFallback(v);
  if (key === "target_sector") return SECTOR_LABELS[v] || humanizeFallback(v);
  if (key === "mobility") return mapList(value, MOBILITY_LABELS, "—");
  if (key === "literacy") return LITERACY_LABELS[v] || humanizeFallback(v);
  if (key === "barriers") return mapList(value, BARRIER_LABELS, "Aucun");
  if (key === "fle_type") return FLE_TYPE_LABELS[v] || humanizeFallback(v);
  if (key === "training_duration") return TRAINING_DURATION_LABELS[v] || humanizeFallback(v);
  if (key === "work_schedule") return mapList(value, WORK_SCHEDULE_LABELS, "—");
  if (key === "funding_status") return FUNDING_LABELS[v] || humanizeFallback(v);
  if (key === "immediate_availability") return v === "yes" ? "Oui, immédiatement" : v === "soon" ? "Sous 1-2 semaines" : v === "later" ? "Plus tard" : humanizeFallback(v);
  if (key === "contact_48h") return v === "yes" ? "Oui, disponible" : v === "this_week" ? "Cette semaine" : v === "prefer_message" ? "Par message" : v === "no" ? "Pas tout de suite" : humanizeFallback(v);
  if (key === "mobility_km") return `${v} km`;
  return humanizeFallback(v);
}

export function buildOnboardingPDFHtml(
  answers: Record<string, unknown>,
  opts: { logoUrl?: string; date?: string } = {}
): string {
  const route = String(answers.leadRoute || answers.route || "sas");
  const routeInfo = ROUTE_LABELS[route] || ROUTE_LABELS.sas;
  const steps = NEXT_STEPS[route] || NEXT_STEPS.sas;
  const fullName = [answers.contact_firstname, answers.contact_lastname].filter(Boolean).join(" ");
  const date = opts.date ?? new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const logoUrl = opts.logoUrl ?? "/logo-tofrance.png";

  const profileRows: string[] = [];
  if (fullName) profileRows.push(row("Nom", fullName));
  if (answers.contact_email) profileRows.push(row("Email", String(answers.contact_email)));
  if (answers.location) profileRows.push(row("Localisation", String(answers.location)));

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    if (answers[key] !== undefined && answers[key] !== null && answers[key] !== "") {
      profileRows.push(row(label, formatValue(key, answers[key])));
    }
  }

  // ── CECRL block (always present) ──
  const rawLevel = answers.french_level_cecrl;
  const levelKey = typeof rawLevel === "string" ? rawLevel : "";
  const levelLabel = LEVEL_LABELS[levelKey] || (levelKey ? levelKey : "Non renseigné");
  const cecrlBlock = `
    <div class="cecrl-block" data-testid="pdf-cecrl">
      <div class="cecrl-label">Niveau de français (CECRL)</div>
      <div class="cecrl-value" data-level="${levelKey}">${levelLabel}</div>
    </div>
  `;

  // ── Tags badges (always present, humanized but raw key kept in data-key) ──
  const rawTags = answers.tags;
  const tagList: string[] = Array.isArray(rawTags)
    ? rawTags.filter((t): t is string => typeof t === "string" && t.trim() !== "")
    : typeof rawTags === "string" && rawTags.trim() !== ""
      ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  const tagsHtml = tagList.length > 0
    ? `<div class="tags" data-testid="pdf-tags">${tagList
        .map((t) => `<span class="tag-badge" data-key="${t}">${humanizeTag(t)}</span>`)
        .join("")}</div>`
    : `<div class="tags" data-testid="pdf-tags"><span class="tag-empty">Aucun tag</span></div>`;

  const stepsHtml = steps.map((s, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <div style="width:28px;height:28px;border-radius:50%;background:${routeInfo.color};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">${i + 1}</div>
      <div style="flex:1;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <strong style="font-size:14px;">${s.title}</strong>
          <span style="font-size:11px;color:#888;background:#f3f4f6;padding:2px 8px;border-radius:10px;">${s.delay}</span>
        </div>
        <p style="margin:4px 0 0;font-size:12px;color:#555;">${s.desc}</p>
      </div>
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Récapitulatif ToFrance - ${fullName || "Mon parcours"}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page-break { page-break-before: always; } }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#1a1a2e; padding:40px; max-width:760px; margin:0 auto; background:#fff; }
    .brand-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding-bottom:18px; border-bottom:3px solid ${routeInfo.color}; }
    .brand-header img { height:54px; width:auto; }
    .brand-header .meta { text-align:right; font-size:11px; color:#888; line-height:1.5; }
    .doc-title { margin: 22px 0 28px; }
    .doc-title h1 { font-size:24px; font-weight:700; margin-bottom:6px; }
    .route-box { background: linear-gradient(135deg, ${routeInfo.color}14, ${routeInfo.color}05); border-left: 5px solid ${routeInfo.color}; border-radius:8px; padding:22px 24px; margin-bottom:32px; }
    .route-box .label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:${routeInfo.color}; font-weight:700; margin-bottom:6px; }
    .route-box h2 { color:${routeInfo.color}; font-size:22px; margin-bottom:6px; }
    .section { margin-bottom:28px; }
    .section-title { font-size:12px; text-transform:uppercase; letter-spacing:1.5px; color:#666; font-weight:700; margin-bottom:14px; padding-bottom:6px; border-bottom:1px solid #e5e7eb; }
    table { width:100%; border-collapse:collapse; }
    td { padding:9px 10px; font-size:13px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
    td:first-child { color:#888; width:42%; font-size:12px; }
    .cecrl-block { background:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:16px 20px; margin-bottom:20px; }
    .cecrl-label { font-size:11px; text-transform:uppercase; letter-spacing:1.2px; color:#666; font-weight:700; margin-bottom:6px; }
    .cecrl-value { font-size:18px; font-weight:600; color:${routeInfo.color}; }
    .tags { display:flex; flex-wrap:wrap; gap:8px; }
    .tag-badge { display:inline-block; background:${routeInfo.color}15; color:${routeInfo.color}; border:1px solid ${routeInfo.color}40; border-radius:14px; padding:4px 12px; font-size:12px; font-weight:500; }
    .tag-empty { color:#999; font-size:12px; font-style:italic; }
    .footer { margin-top:40px; padding-top:18px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#888; }
    .footer img { height:28px; opacity:0.8; }
  </style>
</head>
<body>
  <div class="brand-header">
    <img src="${logoUrl}" alt="ToFrance" />
    <div class="meta"><strong>Récapitulatif de parcours</strong>Généré le ${date}</div>
  </div>

  <div class="doc-title">
    <h1>${fullName ? `Bonjour ${fullName},` : "Votre parcours d'orientation"}</h1>
    <p>Voici la synthèse de votre diagnostic et les prochaines étapes recommandées.</p>
  </div>

  <div class="route-box" data-testid="pdf-route" data-route="${route}">
    <div class="label">Parcours recommandé</div>
    <h2>${routeInfo.label}</h2>
    <p>${routeInfo.description}</p>
  </div>

  <div class="section">
    <div class="section-title">Niveau de français</div>
    ${cecrlBlock}
  </div>

  <div class="section">
    <div class="section-title">Tags du profil</div>
    ${tagsHtml}
  </div>

  <div class="section">
    <div class="section-title">Votre profil</div>
    <table>${profileRows.join("")}</table>
  </div>

  <div class="section">
    <div class="section-title">Prochaines étapes</div>
    ${stepsHtml}
  </div>

  <div class="footer">
    <img src="${logoUrl}" alt="ToFrance" />
    <div style="text-align:right;">
      <div>ToFrance • tofrance.life</div>
      <div>contact@tofrance.life</div>
    </div>
  </div>
</body>
</html>`;
}

export function generateOnboardingPDF(answers: Record<string, unknown>): void {
  const html = buildOnboardingPDFHtml(answers, {
    logoUrl: `${window.location.origin}/logo-tofrance.png`,
  });

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Veuillez autoriser les pop-ups pour télécharger le PDF.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };
}

function row(label: string, value: string): string {
  return `<tr><td>${label}</td><td>${value}</td></tr>`;
}
