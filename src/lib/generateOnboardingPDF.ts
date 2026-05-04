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

function formatValue(key: string, value: unknown): string {
  const v = String(value);
  if (key === "main_goal") {
    // Handle multi-choice (comma-separated)
    return v.split(",").map(g => GOAL_LABELS[g.trim()] || g.trim()).join(", ");
  }
  if (key === "french_level_cecrl") return LEVEL_LABELS[v] || v;
  if (key === "work_right") return WORK_LABELS[v] || v;
  if (key === "immediate_availability") return v === "yes" ? "Oui, immédiatement" : v === "soon" ? "Sous 1-2 semaines" : v === "later" ? "Plus tard" : v;
  if (key === "contact_48h") return v === "yes" ? "Oui, disponible" : v === "this_week" ? "Cette semaine" : v === "prefer_message" ? "Par message" : v === "no" ? "Pas tout de suite" : v;
  if (key === "barriers") {
    const arr = Array.isArray(value) ? value : v.split(",");
    return arr.map((b: string) => b.trim().replace(/_/g, " ")).join(", ") || "Aucun";
  }
  return v.replace(/_/g, " ");
}

export function generateOnboardingPDF(answers: Record<string, unknown>): void {
  const route = String(answers.leadRoute || answers.route || "sas");
  const routeInfo = ROUTE_LABELS[route] || ROUTE_LABELS.sas;
  const steps = NEXT_STEPS[route] || NEXT_STEPS.sas;
  const fullName = [answers.contact_firstname, answers.contact_lastname].filter(Boolean).join(" ");
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  // Build profile rows
  const profileRows: string[] = [];

  if (fullName) profileRows.push(row("Nom", fullName));
  if (answers.contact_email) profileRows.push(row("Email", String(answers.contact_email)));
  if (answers.location) profileRows.push(row("Localisation", String(answers.location)));

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    if (answers[key] !== undefined && answers[key] !== null && answers[key] !== "") {
      profileRows.push(row(label, formatValue(key, answers[key])));
    }
  }

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

  const logoUrl = `${window.location.origin}/logo-tofrance.png`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <title>Récapitulatif ToFrance - ${fullName || "Mon parcours"}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color:#1a1a2e; padding:40px; max-width:760px; margin:0 auto; background:#fff; }
    .brand-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; padding-bottom:18px; border-bottom:3px solid ${routeInfo.color}; }
    .brand-header img { height:54px; width:auto; }
    .brand-header .meta { text-align:right; font-size:11px; color:#888; line-height:1.5; }
    .brand-header .meta strong { display:block; color:#1a1a2e; font-size:13px; margin-bottom:2px; }
    .doc-title { margin: 22px 0 28px; }
    .doc-title h1 { font-size:24px; font-weight:700; color:#1a1a2e; margin-bottom:6px; }
    .doc-title p { font-size:13px; color:#666; }
    .route-box { background: linear-gradient(135deg, ${routeInfo.color}14, ${routeInfo.color}05); border-left: 5px solid ${routeInfo.color}; border-radius:8px; padding:22px 24px; margin-bottom:32px; }
    .route-box .label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:${routeInfo.color}; font-weight:700; margin-bottom:6px; }
    .route-box h2 { color:${routeInfo.color}; font-size:22px; margin-bottom:6px; }
    .route-box p { font-size:13px; color:#444; }
    .section { margin-bottom:28px; }
    .section-title { font-size:12px; text-transform:uppercase; letter-spacing:1.5px; color:#666; font-weight:700; margin-bottom:14px; padding-bottom:6px; border-bottom:1px solid #e5e7eb; }
    table { width:100%; border-collapse:collapse; }
    td { padding:9px 10px; font-size:13px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
    td:first-child { color:#888; width:42%; font-size:12px; }
    td:last-child { font-weight:500; color:#1a1a2e; }
    .footer { margin-top:40px; padding-top:18px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#888; }
    .footer img { height:28px; opacity:0.8; }
  </style>
</head>
<body>
  <div class="brand-header">
    <img src="${logoUrl}" alt="ToFrance" />
    <div class="meta">
      <strong>Récapitulatif de parcours</strong>
      Généré le ${date}
    </div>
  </div>

  <div class="doc-title">
    <h1>${fullName ? `Bonjour ${fullName},` : "Votre parcours d'orientation"}</h1>
    <p>Voici la synthèse de votre diagnostic et les prochaines étapes recommandées.</p>
  </div>

  <div class="route-box">
    <div class="label">Parcours recommandé</div>
    <h2>${routeInfo.label}</h2>
    <p>${routeInfo.description}</p>
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

  // Open print dialog in a new window
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
