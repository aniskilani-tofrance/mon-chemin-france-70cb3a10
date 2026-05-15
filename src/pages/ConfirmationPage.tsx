import { motion } from "framer-motion";
import {
  Check, Sparkles, MapPin, Mail, User, Languages,
  GraduationCap, Briefcase, Users, Clock, MessageCircle, UserPlus,
  Globe, Shield, Target, Wrench, Car, Banknote, CalendarCheck,
  BookOpen, Phone, ChevronRight, Download, Award, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateOnboardingPDF } from "@/lib/generateOnboardingPDF";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";
import { computeRecommendedPath } from "@/lib/orientationRouter";
import { getPathContent, getConfirmationTexts, type PathIconKey, type PathContent } from "@/lib/recommendedPathContent";

// ── Icon mapping for paths ──
const PATH_ICON: Record<PathIconKey, React.ReactNode> = {
  francais: <Languages className="h-6 w-6" />,
  emploi: <Briefcase className="h-6 w-6" />,
  formation: <GraduationCap className="h-6 w-6" />,
  diplome: <Award className="h-6 w-6" />,
  social: <Users className="h-6 w-6" />,
  numerique: <Smartphone className="h-6 w-6" />,
};


// ── Profile field labels ──
const FIELD_LABELS: Record<string, { icon: React.ReactNode; label: string }> = {
  origin_country: { icon: <Globe className="h-4 w-4" />, label: "Pays d'origine" },
  main_goal: { icon: <Target className="h-4 w-4" />, label: "Objectif" },
  french_level_cecrl: { icon: <Languages className="h-4 w-4" />, label: "Niveau de français" },
  work_right: { icon: <Shield className="h-4 w-4" />, label: "Droit de travail" },
  target_sector: { icon: <Wrench className="h-4 w-4" />, label: "Secteur visé" },
  previous_job: { icon: <Briefcase className="h-4 w-4" />, label: "Métier précédent" },
  mobility: { icon: <Car className="h-4 w-4" />, label: "Mobilité" },
  funding_status: { icon: <Banknote className="h-4 w-4" />, label: "Financement" },
  immediate_availability: { icon: <CalendarCheck className="h-4 w-4" />, label: "Disponibilité" },
  fle_type: { icon: <BookOpen className="h-4 w-4" />, label: "Type de cours FLE" },
  training_duration: { icon: <Clock className="h-4 w-4" />, label: "Durée de formation" },
};

const GOAL_LABELS: Record<string, string> = {
  learn_french: "Apprendre le français",
  find_job: "Trouver un emploi",
  get_training: "Suivre une formation",
  need_help: "Besoin d'aide pour choisir",
};

const LEVEL_LABELS: Record<string, string> = {
  alpha: "Ne parle pas français",
  post_alpha: "Quelques mots",
  a1: "Débutant (A1)",
  a2: "Se débrouille (A2)",
  b1: "Intermédiaire (B1)",
};

const WORK_LABELS: Record<string, string> = {
  has_right: "Oui",
  pending: "En cours de demande",
  no_right: "Pas encore",
  not_sure: "Ne sait pas",
};

// Human-readable tag labels (display only — storage keys unchanged for HubSpot sync)
const TAG_LABELS: Record<string, string> = {
  status_refugie: "Statut réfugié",
  status_demandeur_asile: "Demandeur d'asile",
  status_regularise: "Titre de séjour régularisé",
  needs_housing: "Besoin de logement",
  needs_transport: "Besoin de mobilité",
  needs_childcare: "Besoin de garde d'enfants",
  needs_french: "Besoin de cours de français",
  needs_funding: "Besoin de financement",
  urgent: "Situation urgente",
  family_with_kids: "Famille avec enfants",
  single_parent: "Parent isolé",
  young_adult: "Jeune adulte",
  senior: "Senior",
  high_qualification: "Diplômé",
  low_literacy: "Peu alphabétisé",
  ready_to_work: "Prêt à travailler",
};

function humanizeTag(tag: string): string {
  const key = tag.trim();
  return TAG_LABELS[key] || key.replace(/_/g, " ");
}

function formatFieldValue(key: string, value: unknown): string {
  // Normalise: arrays → CSV string, other → string
  const raw = Array.isArray(value)
    ? value.map((v) => String(v)).join(", ")
    : value == null
      ? ""
      : String(value);
  if (!raw) return "";
  if (key === "main_goal") {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.map((p) => GOAL_LABELS[p] || p.replace(/_/g, " ")).join(", ");
  }
  if (key === "french_level_cecrl") return LEVEL_LABELS[raw] || raw;
  if (key === "work_right") return WORK_LABELS[raw] || raw;
  if (key === "immediate_availability") return raw === "yes" ? "Oui" : raw === "no" ? "Non" : raw;
  return raw.replace(/_/g, " ");
}

const ConfirmationPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const storedAnswers = JSON.parse(localStorage.getItem("onboarding_answers") || "{}");
  const texts = getConfirmationTexts(language);

  // Compute primary + secondary recommended paths from stored answers
  const goalRaw = storedAnswers.main_goal;
  const mainGoal = Array.isArray(goalRaw) ? goalRaw[0] : goalRaw;
  const barriersRaw = storedAnswers.barriers;
  const barriers: string[] = Array.isArray(barriersRaw)
    ? barriersRaw
    : typeof barriersRaw === "string"
      ? barriersRaw.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
  const { primary, secondary } = computeRecommendedPath({
    leadRoute: storedAnswers.leadRoute || storedAnswers.route,
    main_goal: mainGoal,
    french_level_cecrl: storedAnswers.french_level_cecrl,
    barriers,
  });
  const primaryContent: PathContent = getPathContent(language, primary);
  const secondaryContent: PathContent | null = secondary ? getPathContent(language, secondary) : null;

  // Build profile items from stored answers
  const profileItems = Object.entries(FIELD_LABELS)
    .filter(([key]) => storedAnswers[key])
    .map(([key, meta]) => ({
      key,
      icon: meta.icon,
      label: meta.label,
      value: formatFieldValue(key, storedAnswers[key]),
    }));

  const fullName = [storedAnswers.contact_firstname, storedAnswers.contact_lastname].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 pt-24 pb-12">
        <div className="mx-auto max-w-2xl space-y-5">

          {/* ── Hero confirmation ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card variant="elevated">
              <CardContent className="p-6 sm:p-8">
                {/* Success animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                  className="mb-5 flex justify-center"
                >
                  <div className="relative">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-9 w-9 text-success" />
                    </div>
                    <motion.div
                      className="absolute -right-2 -top-2"
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="h-5 w-5 text-accent" />
                    </motion.div>
                  </div>
                </motion.div>

                <h1 className="mb-2 text-2xl font-bold text-foreground">
                  {fullName ? `${texts.title.replace("!", "")}, ${storedAnswers.contact_firstname} !` : texts.title}
                </h1>
                <p className="text-sm text-muted-foreground">{texts.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Human callback within 48h — promesse centrale ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Un conseiller vous rappelle sous 48h
                    </p>
                    <p className="text-base font-semibold text-foreground leading-snug">
                      Merci{storedAnswers.contact_firstname ? `, ${storedAnswers.contact_firstname}` : ""}. Votre demande a bien été reçue.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Un conseiller parlant votre langue vous rappellera dans les <strong className="text-foreground">48 heures</strong> au numéro <strong className="text-foreground">{storedAnswers.contact_phone || "que vous avez indiqué"}</strong> pour vous aider à avancer vers le bon parcours. Vous n'êtes pas seul·e.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Recommended route ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {texts.yourRoute}
                </p>
                <div className={`rounded-xl bg-gradient-to-br ${routeInfo.bgGradient} p-4`}>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ${routeInfo.color}`}>
                      {routeInfo.icon}
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${routeInfo.color}`}>{routeInfo.label}</p>
                      <p className="text-sm text-muted-foreground">{routeInfo.description}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Profile summary ── */}
          {(profileItems.length > 0 || fullName || storedAnswers.contact_email || storedAnswers.location) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <Card>
                <CardContent className="p-5">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    <User className="h-4 w-4" />
                    {texts.profileTitle}
                  </h2>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {/* Identity & contact */}
                    {fullName && (
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Nom</p>
                          <p className="text-sm font-medium text-foreground truncate">{fullName}</p>
                        </div>
                      </div>
                    )}
                    {storedAnswers.contact_email && (
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Email</p>
                          <p className="text-sm font-medium text-foreground truncate">{storedAnswers.contact_email}</p>
                        </div>
                      </div>
                    )}
                    {storedAnswers.location && (
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">Localisation</p>
                          <p className="text-sm font-medium text-foreground truncate">{storedAnswers.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Dynamic profile fields */}
                    {profileItems.map((item) => (
                      <div key={item.key} className="flex items-center gap-3 rounded-lg border border-border p-3">
                        <div className="text-muted-foreground shrink-0">{item.icon}</div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  {storedAnswers.tags && storedAnswers.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(Array.isArray(storedAnswers.tags) ? storedAnswers.tags : storedAnswers.tags.split(","))
                        .filter(Boolean)
                        .slice(0, 8)
                        .map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {humanizeTag(tag)}
                          </Badge>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── Next steps timeline ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {texts.nextStepsTitle}
                </h2>

                <div className="relative space-y-0">
                  {routeInfo.nextSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.15 }}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      {/* Timeline line */}
                      {i < routeInfo.nextSteps.length - 1 && (
                        <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 bg-border" />
                      )}

                      {/* Step number */}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                        {i + 1}
                      </div>

                      {/* Step content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground">{step.title}</p>
                          <Badge variant="outline" className="text-[10px] shrink-0">{step.delay}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── CTA buttons ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => navigate("/signup")}
            >
              <UserPlus className="h-5 w-5" />
              {texts.signupCta}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => generateOnboardingPDF(storedAnswers)}
            >
              <Download className="h-5 w-5" />
              Télécharger le récapitulatif PDF
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                {texts.cta}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/#contact")}
              >
                <MessageCircle className="h-4 w-4" />
                {texts.contactTitle}
              </Button>
            </div>

            {/* Data privacy link */}
            <div className="text-center pt-2">
              <button
                onClick={() => navigate("/mes-donnees")}
                className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                Gérer mes données personnelles
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ConfirmationPage;
