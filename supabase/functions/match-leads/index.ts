import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendOutlookMail } from "../_shared/outlook-mail.ts";
import { calculateUnifiedLeadScore } from "../_shared/lead-scoring.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map questionnaire target_sector IDs to ToFrance sector labels
const SECTOR_MAP: Record<string, string[]> = {
  logistique: ["Logistique / Entrepôt"],
  transport: ["Transport / Livraison / Mobilité"],
  btp: ["BTP / Travaux publics / Réseaux"],
  proprete: ["Propreté / Hygiène"],
  hotellerie: ["Hôtellerie – Restauration"],
  sante: ["Santé – Médico-social / Aide à la personne"],
  commerce: ["Commerce / Vente / Relation client"],
  admin_accueil: ["Administration / Accueil / Secrétariat"],
  industrie: ["Industrie / Production / Maintenance"],
  securite: ["Sécurité / Sûreté"],
  transversal: ["Transversal (tous secteurs)"],
};

// Map lead routes to certification types
const ROUTE_TO_CERT: Record<string, string> = {
  route_a: "language",  // FLE
  route_b: "tp",        // Formation qualifiante
  route_c: "tp",        // Emploi direct → TP/CQP
  sas: "language",      // Accompagnement → FLE by default
};

// Simple in-memory rate limiter (per isolate instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per IP per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Email validation regex
const EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
const PHONE_REGEX = /^[+\d][\d\s().-]{7,29}$/;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("cf-connecting-ip")
      || "unknown";
    
    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Veuillez réessayer dans une minute." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { answers, onboardingStartedAt } = body;

    // Anti-bot: require onboarding start timestamp, must be >10s ago and <30min ago
    const startedAt = Number(onboardingStartedAt);
    const elapsed = Date.now() - startedAt;
    if (!startedAt || isNaN(startedAt) || elapsed < 10_000 || elapsed > 30 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: "Session d'onboarding invalide. Veuillez recommencer." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!answers || !answers.contact_email) {
      throw new Error("Email requis pour créer un profil");
    }

    // Validate email format strictly
    const email = String(answers.contact_email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(email) || email.length > 255) {
      throw new Error("Adresse email invalide");
    }
    answers.contact_email = email;

    // Sanitize string inputs (max lengths)
    const maxLen = (val: unknown, max: number): string | null => {
      if (typeof val !== "string") return null;
      return val.slice(0, max).trim() || null;
    };
    answers.contact_firstname = maxLen(answers.contact_firstname, 100);
    answers.contact_lastname = maxLen(answers.contact_lastname, 100);
    answers.contact_phone = maxLen(answers.contact_phone, 30);
    if (!answers.contact_firstname || String(answers.contact_firstname).length < 2) {
      throw new Error("Prénom requis");
    }
    if (!answers.contact_phone || !PHONE_REGEX.test(String(answers.contact_phone))) {
      throw new Error("Téléphone requis ou invalide");
    }
    answers.location = maxLen(answers.location, 100);
    answers.postal_code = maxLen(answers.postal_code, 10);
    answers.source_location_id = maxLen(answers.source_location_id, 120);
    answers.source_name = maxLen(answers.source_name, 200);
    answers.source_type = maxLen(answers.source_type, 80);
    answers.source_campaign = maxLen(answers.source_campaign, 120);

    // Determine route and score
    const route = determineRoute(answers);
    const score = calculateUnifiedLeadScore(answers).total;
    const targetSectorId = answers.target_sector || "transversal";
    const targetSectors = SECTOR_MAP[targetSectorId] || ["Transversal (tous secteurs)"];

    // 1. Create/upsert profile
    const profileData = {
      email: answers.contact_email,
      first_name: answers.contact_firstname || null,
      last_name: answers.contact_lastname || null,
      full_name: [answers.contact_firstname, answers.contact_lastname].filter(Boolean).join(" ") || null,
      phone: answers.contact_phone || null,
      french_level_cecrl: answers.french_level_cecrl || null,
      french_level: cecrlToNumber(answers.french_level_cecrl),
      origin_country: answers.origin_country || null,
      previous_job: answers.previous_job || null,
      city: answers.location || null,
      postal_code: answers.postal_code || null,
      target_sector: targetSectorId,
      main_goal: answers.main_goal || null,
      fle_type: answers.fle_type || null,
      fle_format: answers.fle_format || null,
      training_duration: answers.training_duration || null,
      mobility: answers.mobility || null,
      mobility_km: answers.mobility_km || null,
      funding_status: answers.funding_status || null,
      work_schedule: answers.work_schedule || null,
      work_right: answers.work_right || null,
      contact_48h: answers.contact_48h === "yes",
      immediate_availability: answers.immediate_availability === "yes",
      lead_score: score,
      lead_route: route,
      literacy: answers.literacy || null,
      skills: answers.tags || null,
      barriers: answers.barriers || null,
      worked_in_france: answers.worked_in_france || null,
      admin_status: answers.admin_status || null,
      real_comprehension_score: answers.real_comprehension_score || null,
      distance_to_job: answers.distance_to_job != null ? Number(answers.distance_to_job) : null,
      source_location_id: answers.source_location_id || null,
      source_name: answers.source_name || null,
      source_type: answers.source_type || null,
      source_campaign: answers.source_campaign || null,
    };

    // Check if profile already exists with this email
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", answers.contact_email)
      .maybeSingle();

    let profileId: string;

    if (existingProfile) {
      await supabaseAdmin
        .from("profiles")
        .update(profileData)
        .eq("id", existingProfile.id);
      profileId = existingProfile.id;
    } else {
      const { data: newProfile, error: profileErr } = await supabaseAdmin
        .from("profiles")
        .insert(profileData)
        .select("id")
        .single();
      if (profileErr) throw new Error(`Erreur profil: ${profileErr.message}`);
      profileId = newProfile.id;
    }

    // 2. Find consent_id for lead_sharing
    const { data: consent } = await supabaseAdmin
      .from("consents")
      .select("id")
      .eq("email", answers.contact_email)
      .eq("consent_type", "lead_sharing")
      .eq("consented", true)
      .maybeSingle();

    if (!consent) {
      // No consent for lead sharing → no leads created
      return new Response(
        JSON.stringify({ 
          profileId, 
          leadsCreated: 0, 
          message: "Profil créé, mais pas de consentement pour le partage de leads" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Match providers by sector
    // Get all active trainings with their sectors
    const { data: trainings, error: trainingsErr } = await supabaseAdmin
      .from("trainings")
      .select("id, provider_id, certification_type, target_sectors, training_type, title")
      .eq("is_active", true);

    if (trainingsErr) throw new Error(`Erreur trainings: ${trainingsErr.message}`);

    // Determine which certification types to match based on route
    const certTypes = getCertTypesForRoute(route);

    // Match trainings by sector + certification type
    const matchedTrainings = (trainings || []).filter(t => {
      // Check certification type match
      if (!certTypes.includes(t.certification_type || "language")) return false;
      
      // Check sector match
      const trainingSectors = t.target_sectors || [];
      
      // Transversal trainings match all prospects
      if (trainingSectors.includes("Transversal (tous secteurs)")) return true;
      
      // Prospect with transversal sector matches all trainings
      if (targetSectors.includes("Transversal (tous secteurs)")) return true;
      
      // Direct sector match
      return trainingSectors.some((s: string) => targetSectors.includes(s));
    });

    // Group by provider to create one lead per provider (best matching training)
    const providerBestTraining = new Map<string, { trainingId: string; score: number }>();
    
    for (const t of matchedTrainings) {
      const trainingSectors = t.target_sectors || [];
      // Score: direct sector match > transversal
      const sectorScore = trainingSectors.some((s: string) => targetSectors.includes(s) && s !== "Transversal (tous secteurs)") ? 10 : 0;
      const existing = providerBestTraining.get(t.provider_id);
      if (!existing || sectorScore > existing.score) {
        providerBestTraining.set(t.provider_id, { trainingId: t.id, score: sectorScore });
      }
    }

    // 4. Delete existing pending leads for this profile (re-matching)
    await supabaseAdmin
      .from("leads")
      .delete()
      .eq("profile_id", profileId)
      .eq("status", "pending")
      .is("purchased_at", null);

    // 5. Create leads
    const leadsToInsert = Array.from(providerBestTraining.entries()).map(([providerId, match]) => ({
      profile_id: profileId,
      provider_id: providerId,
      training_id: match.trainingId,
      consent_id: consent.id,
      status: "pending" as const,
      match_score: score,
      first_name: answers.contact_firstname || null,
      phone: answers.contact_phone || null,
      source_location_id: answers.source_location_id || null,
      source_name: answers.source_name || null,
      source_type: answers.source_type || null,
      source_campaign: answers.source_campaign || null,
    }));

    if (leadsToInsert.length > 0) {
      const { data: insertedLeads, error: leadsErr } = await supabaseAdmin
        .from("leads")
        .insert(leadsToInsert)
        .select("id, provider_id, match_score");
      if (leadsErr) throw new Error(`Erreur leads: ${leadsErr.message}`);

      // Notify partners asynchronously (don't block on failure)
      for (const lead of (insertedLeads || [])) {
        try {
          await supabaseAdmin.functions.invoke("notify-partner-lead", {
            body: { providerId: lead.provider_id, leadId: lead.id, matchScore: lead.match_score },
          });
        } catch (notifErr) {
          console.error("Notification error (non-blocking):", notifErr);
        }
      }
    }

    // 6. Send confirmation email to the candidate
    try {
      await sendCandidateConfirmation(answers, route, leadsToInsert.length);
    } catch (emailErr) {
      console.error("Candidate email error (non-blocking):", emailErr);
    }

    return new Response(
      JSON.stringify({ 
        profileId, 
        leadsCreated: leadsToInsert.length,
        route,
        score,
        matchedSectors: targetSectors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("match-leads error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Helper functions ──

function determineRoute(answers: Record<string, unknown>): string {
  const mainGoal = answers.main_goal as string | undefined;
  const frenchLevel = answers.french_level_cecrl as string | undefined;
  const workRight = answers.work_right as string | undefined;
  const workedInFrance = answers.worked_in_france as string | undefined;

  // Calculate distance to job
  let distanceToJob = 3;
  if (frenchLevel === "alpha") distanceToJob = 4;
  else if (frenchLevel === "a1") distanceToJob = 3;
  else if (frenchLevel === "a2") distanceToJob = workedInFrance === "yes" ? 1 : 2;
  else if (frenchLevel === "b1") distanceToJob = 0;

  // Route A: FLE
  if (mainGoal === "learn_french") return "route_a";
  if (frenchLevel === "alpha" || frenchLevel === "a1") return "route_a";

  // Route B: Formation — distance >= 2
  if (distanceToJob >= 2) return "route_b";

  // Route C: Emploi direct
  if (workRight === "yes" && distanceToJob <= 1) return "route_c";

  // Route B: formation
  if (mainGoal === "job_training" && (frenchLevel === "a2" || frenchLevel === "b1")) return "route_b";
  if (mainGoal === "find_job" && workRight !== "yes" && (frenchLevel === "a2" || frenchLevel === "b1")) return "route_b";

  return "sas";
}

function getCertTypesForRoute(route: string): string[] {
  switch (route) {
    case "route_a": return ["language"]; // FLE only
    case "route_b": return ["tp", "cqp", "language"]; // Qualifiantes + FLE pro
    case "route_c": return ["tp", "cqp"]; // Emploi → qualifiantes
    case "sas": return ["language", "cqp", "tp"]; // All
    default: return ["language", "cqp", "tp"];
  }
}

function cecrlToNumber(level?: string): number | null {
  const map: Record<string, number> = { alpha: 0, a1: 1, a2: 2, b1: 3, b2: 4, c1: 5 };
  return level ? (map[level] ?? null) : null;
}

function calculateScore(answers: Record<string, unknown>): number {
  let score = 0;
  
  // Completude (0-30)
  if (answers.contact_email) score += 10;
  if (answers.contact_firstname) score += 5;
  if (answers.contact_phone) score += 5;
  if (answers.location) score += 5;
  if (answers.main_goal && answers.main_goal !== "need_help") score += 5;

  // Fit (0-50)
  const level = answers.french_level_cecrl as string | undefined;
  if (level === "b1") score += 15;
  else if (level === "a2") score += 10;
  else if (level === "a1") score += 5;
  else if (level === "alpha") score += 2;

  if (answers.worked_in_france === "yes") score += 10;
  else if (answers.worked_in_france === "partial") score += 5;
  if (answers.real_comprehension_score === "yes") score += 5;

  if (answers.location) score += 10;
  if (answers.target_sector || answers.fle_type) score += 10;

  // Reactivity (0-20)
  if (answers.contact_48h === "yes") score += 10;
  if (answers.contact_email) score += 10;

  return Math.min(score, 100);
}

// ── Candidate confirmation email ──

const ROUTE_LABELS: Record<string, { label: string; emoji: string; desc: string; color: string }> = {
  route_a: { label: "Parcours FLE", emoji: "📘", desc: "Formation en français langue étrangère", color: "#3b82f6" },
  route_b: { label: "Parcours Formation", emoji: "🎓", desc: "Formation professionnelle qualifiante", color: "#8b5cf6" },
  route_c: { label: "Parcours Emploi", emoji: "💼", desc: "Accès direct au marché du travail", color: "#059669" },
  sas: { label: "Accompagnement", emoji: "🤝", desc: "Orientation et accompagnement personnalisé", color: "#d97706" },
};

const LOGO_URL = "https://tofrancebeta.lovable.app/assets/logo-tofrance.png";

async function sendCandidateConfirmation(
  answers: Record<string, unknown>,
  route: string,
  matchCount: number
) {
  const email = answers.contact_email as string;
  if (!email) return;

  const firstName = (answers.contact_firstname as string) || "";
  const routeInfo = ROUTE_LABELS[route] || ROUTE_LABELS.sas;

  const matchBlock = matchCount > 0
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin:0 0 28px">
        <p style="font-size:14px;color:#166534;margin:0;font-weight:500">
          ✅ <strong>${matchCount} organisme${matchCount > 1 ? "s" : ""}</strong> correspond${matchCount > 1 ? "ent" : ""} à votre profil. Vous serez recontacté(e) sous 48h.
        </p>
      </div>`
    : `<p style="font-size:14px;color:#475569;margin:0 0 28px">Nous recherchons les meilleurs organismes pour votre profil. Vous serez recontacté(e) prochainement.</p>`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f1f5f9">
  <div style="padding:40px 16px">
    <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2d5a8e 100%);padding:32px 40px 24px;text-align:center">
        <div style="background:#ffffff;display:inline-block;padding:14px 28px;border-radius:12px;margin-bottom:12px"><img src="${LOGO_URL}" alt="ToFrance" height="120" style="height:120px" /></div>
        <p style="color:#94b8db;margin:0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase">Confirmation de votre inscription</p>
      </div>
      <div style="padding:36px 40px">
        <p style="font-size:18px;color:#1e293b;margin:0 0 8px;font-weight:600">Bonjour${firstName ? ` ${firstName}` : ""} 👋</p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 24px">Merci d'avoir complété votre orientation sur ToFrance. Votre profil a bien été enregistré et nous avons identifié le meilleur parcours pour vous.</p>
        <div style="background:linear-gradient(135deg,${routeInfo.color}10 0%,${routeInfo.color}05 100%);border-radius:12px;padding:24px;margin:0 0 24px;border:1px solid ${routeInfo.color}20;border-left:4px solid ${routeInfo.color}">
          <p style="margin:0 0 6px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;font-weight:700">Votre parcours recommandé</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:#1e293b">${routeInfo.emoji} ${routeInfo.label}</p>
          <p style="margin:6px 0 0;font-size:14px;color:#475569;line-height:1.5">${routeInfo.desc}</p>
        </div>
        ${matchBlock}
        <div style="text-align:center;margin:0 0 24px">
          <a href="https://tofrance.app/mes-donnees" style="background:#1e3a5f;color:#ffffff;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;box-shadow:0 2px 8px rgba(30,58,95,0.3)">Gérer mes données →</a>
        </div>
        <p style="font-size:13px;color:#94a3b8;text-align:center;margin:0">Vous pouvez consulter, modifier ou supprimer vos données à tout moment.</p>
      </div>
      <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0">
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6">ToFrance — Plateforme d'orientation pour primo-arrivants<br><a href="https://tofrance.app/confidentialite" style="color:#64748b;text-decoration:underline">Politique de confidentialité</a></p>
      </div>
    </div>
  </div>
</body></html>`;

  const result = await sendOutlookMail({
    to: email,
    subject: `${routeInfo.emoji} Confirmation — Votre parcours ${routeInfo.label}`,
    html,
    log: {
      template: "candidate-orientation-confirmation",
      sourceFunction: "match-leads",
      metadata: { route: routeInfo.label },
    },
  });

  if (!result.ok) {
    console.error(
      `Candidate email FAIL to ${email} after ${result.attempts} attempt(s) — permanent=${result.permanent === true}: ${result.error}`
    );
  } else {
    console.log(
      `📧 Candidate confirmation OK to ${email} in ${result.attempts} attempt(s) (${result.durationMs}ms)`
    );
  }
}
