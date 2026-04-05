import { motion } from "framer-motion";
import { 
  Check, Sparkles, ArrowRight, MapPin, Mail, User, Languages, 
  GraduationCap, Briefcase, Users, Clock, MessageCircle, UserPlus,
  Globe, Shield, Target, Wrench, Car, Banknote, CalendarCheck,
  BookOpen, Phone, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";

// ── Route display config ──
const ROUTE_DISPLAY: Record<string, { label: string; icon: React.ReactNode; color: string; bgGradient: string; description: string; nextSteps: { title: string; desc: string; delay: string }[] }> = {
  route_a: {
    label: "Parcours FLE",
    icon: <Languages className="h-6 w-6" />,
    color: "text-blue-700 dark:text-blue-300",
    bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20",
    description: "Formation en français langue étrangère",
    nextSteps: [
      { title: "Mise en relation", desc: "Un organisme de formation FLE proche de chez vous sera identifié", delay: "Sous 24h" },
      { title: "Évaluation de niveau", desc: "Un conseiller vous contactera pour évaluer votre niveau de français", delay: "Sous 48h" },
      { title: "Début des cours", desc: "Vous démarrerez vos cours de français adaptés à votre niveau", delay: "Sous 2 semaines" },
    ],
  },
  route_b: {
    label: "Parcours Formation",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "text-purple-700 dark:text-purple-300",
    bgGradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20",
    description: "Formation professionnelle qualifiante",
    nextSteps: [
      { title: "Analyse de votre profil", desc: "Nous identifions les formations adaptées à votre secteur et votre niveau", delay: "Sous 24h" },
      { title: "Entretien d'orientation", desc: "Un organisme partenaire vous contactera pour un entretien personnalisé", delay: "Sous 48h" },
      { title: "Entrée en formation", desc: "Vous pourrez démarrer une formation qualifiante ou certifiante", delay: "Sous 1 mois" },
    ],
  },
  route_c: {
    label: "Parcours Emploi",
    icon: <Briefcase className="h-6 w-6" />,
    color: "text-green-700 dark:text-green-300",
    bgGradient: "from-green-50 to-green-100/50 dark:from-green-950/40 dark:to-green-900/20",
    description: "Accès direct au marché du travail",
    nextSteps: [
      { title: "Transmission du profil", desc: "Votre profil sera partagé avec les employeurs de votre secteur", delay: "Sous 24h" },
      { title: "Prise de contact", desc: "Un employeur ou recruteur vous contactera pour un entretien", delay: "Sous 1 semaine" },
      { title: "Accompagnement à la prise de poste", desc: "Un suivi sera mis en place pour faciliter votre intégration", delay: "Dès l'embauche" },
    ],
  },
  sas: {
    label: "Accompagnement personnalisé",
    icon: <Users className="h-6 w-6" />,
    color: "text-amber-700 dark:text-amber-300",
    bgGradient: "from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/20",
    description: "Orientation et accompagnement sur mesure",
    nextSteps: [
      { title: "Analyse approfondie", desc: "Un conseiller dédié analysera votre situation en détail", delay: "Sous 48h" },
      { title: "Plan d'action personnalisé", desc: "Vous recevrez un plan adapté à vos besoins spécifiques", delay: "Sous 1 semaine" },
      { title: "Mise en relation ciblée", desc: "Nous vous orienterons vers les dispositifs les plus pertinents", delay: "En continu" },
    ],
  },
};

// ── i18n texts ──
const TEXTS: Record<string, Record<string, string>> = {
  fr: { title: "Votre parcours est prêt !", subtitle: "Nous avons analysé vos réponses et identifié le meilleur parcours pour vous.", cta: "Retour à l'accueil", nextStepsTitle: "Prochaines étapes", signupCta: "Créer mon compte pour suivre mon dossier", contactTitle: "Besoin d'aide ?", profileTitle: "Votre profil", yourRoute: "Votre parcours recommandé" },
  en: { title: "Your path is ready!", subtitle: "We've analyzed your answers and identified the best path for you.", cta: "Back to home", nextStepsTitle: "Next steps", signupCta: "Create my account to track my case", contactTitle: "Need help?", profileTitle: "Your profile", yourRoute: "Your recommended path" },
  ar: { title: "مسارك جاهز!", subtitle: "لقد حللنا إجاباتك وحددنا أفضل مسار لك.", cta: "العودة للرئيسية", nextStepsTitle: "الخطوات التالية", signupCta: "إنشاء حسابي لمتابعة ملفي", contactTitle: "تحتاج مساعدة؟", profileTitle: "ملفك الشخصي", yourRoute: "مسارك المقترح" },
  es: { title: "¡Tu recorrido está listo!", subtitle: "Hemos analizado tus respuestas e identificado el mejor camino para ti.", cta: "Volver al inicio", nextStepsTitle: "Próximos pasos", signupCta: "Crear mi cuenta", contactTitle: "¿Necesitas ayuda?", profileTitle: "Tu perfil", yourRoute: "Tu recorrido recomendado" },
  pt: { title: "Seu percurso está pronto!", subtitle: "Analisamos suas respostas e identificamos o melhor caminho para você.", cta: "Voltar ao início", nextStepsTitle: "Próximos passos", signupCta: "Criar minha conta", contactTitle: "Precisa de ajuda?", profileTitle: "Seu perfil", yourRoute: "Seu percurso recomendado" },
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

function formatFieldValue(key: string, value: string): string {
  if (key === "main_goal") return GOAL_LABELS[value] || value;
  if (key === "french_level_cecrl") return LEVEL_LABELS[value] || value;
  if (key === "work_right") return WORK_LABELS[value] || value;
  if (key === "immediate_availability") return value === "yes" ? "Oui" : value === "no" ? "Non" : value;
  return value.replace(/_/g, " ");
}

const ConfirmationPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const storedAnswers = JSON.parse(localStorage.getItem("onboarding_answers") || "{}");
  const route = storedAnswers.leadRoute || storedAnswers.route || "sas";
  const routeInfo = ROUTE_DISPLAY[route] || ROUTE_DISPLAY.sas;
  const texts = TEXTS[language] || TEXTS.fr;

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

          {/* ── Recommended route ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
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
                            {tag.replace(/_/g, " ")}
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
