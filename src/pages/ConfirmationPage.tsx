import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, MapPin, Mail, User, Phone, Languages, GraduationCap, Briefcase, Users, Clock, MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { useLanguage } from "@/hooks/useLanguage";
import { useNavigate } from "react-router-dom";

const ROUTE_DISPLAY: Record<string, { label: string; icon: React.ReactNode; color: string; description: string; nextSteps: string[] }> = {
  route_a: { 
    label: "Parcours FLE", 
    icon: <Languages className="h-6 w-6" />, 
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    description: "Formation en français langue étrangère",
    nextSteps: [
      "Vous serez mis en relation avec un organisme de formation FLE proche de chez vous",
      "Un conseiller vous contactera sous 48h pour évaluer votre niveau",
      "Vous pourrez commencer vos cours de français rapidement",
    ],
  },
  route_b: { 
    label: "Parcours Formation", 
    icon: <GraduationCap className="h-6 w-6" />, 
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    description: "Formation professionnelle qualifiante",
    nextSteps: [
      "Nous identifions les formations adaptées à votre profil et votre secteur",
      "Un organisme partenaire vous contactera pour un entretien d'orientation",
      "Vous pourrez démarrer une formation qualifiante ou certifiante",
    ],
  },
  route_c: { 
    label: "Parcours Emploi", 
    icon: <Briefcase className="h-6 w-6" />, 
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    description: "Accès direct au marché du travail",
    nextSteps: [
      "Votre profil sera transmis aux employeurs partenaires de votre secteur",
      "Vous pourrez être convié à un entretien d'embauche sous quelques jours",
      "Un accompagnement à la prise de poste peut être proposé",
    ],
  },
  sas: { 
    label: "Accompagnement", 
    icon: <Users className="h-6 w-6" />, 
    color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    description: "Orientation et accompagnement personnalisé",
    nextSteps: [
      "Un conseiller dédié analysera votre situation personnalisée",
      "Vous recevrez un plan d'action adapté à vos besoins",
      "Nous vous orienterons vers les dispositifs les plus pertinents",
    ],
  },
};

const TEXTS: Record<string, { title: string; subtitle: string; cta: string; nextStepsTitle: string; signupCta: string; contactTitle: string; contactDesc: string }> = {
  fr: { title: "Merci pour vos réponses !", subtitle: "Nous vous recontactons sous 48h avec des solutions adaptées à votre profil.", cta: "Retour à l'accueil", nextStepsTitle: "Prochaines étapes", signupCta: "Créer mon compte pour suivre mon dossier", contactTitle: "Besoin d'aide ?", contactDesc: "Envoyez-nous un message via notre formulaire de contact." },
  en: { title: "Thank you for your answers!", subtitle: "We will contact you within 48h with solutions tailored to your profile.", cta: "Back to home", nextStepsTitle: "Next steps", signupCta: "Create my account to track my case", contactTitle: "Need help?", contactDesc: "Send us a message through our contact form." },
  ar: { title: "شكرا لإجاباتك!", subtitle: "سنتواصل معك خلال 48 ساعة بحلول تناسب ملفك الشخصي.", cta: "العودة للرئيسية", nextStepsTitle: "الخطوات التالية", signupCta: "إنشاء حسابي لمتابعة ملفي", contactTitle: "تحتاج مساعدة؟", contactDesc: "أرسل لنا رسالة عبر نموذج الاتصال." },
  es: { title: "¡Gracias por tus respuestas!", subtitle: "Te contactaremos en 48h con soluciones adaptadas a tu perfil.", cta: "Volver al inicio", nextStepsTitle: "Próximos pasos", signupCta: "Crear mi cuenta para seguir mi caso", contactTitle: "¿Necesitas ayuda?", contactDesc: "Envíanos un mensaje a través de nuestro formulario de contacto." },
  pt: { title: "Obrigado pelas suas respostas!", subtitle: "Entraremos em contato em 48h com soluções adaptadas ao seu perfil.", cta: "Voltar ao início", nextStepsTitle: "Próximos passos", signupCta: "Criar minha conta para acompanhar meu caso", contactTitle: "Precisa de ajuda?", contactDesc: "Envie-nos uma mensagem pelo nosso formulário de contato." },
};

const ConfirmationPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const storedAnswers = JSON.parse(localStorage.getItem("onboarding_answers") || "{}");
  const route = storedAnswers.leadRoute || storedAnswers.route || "sas";
  const routeInfo = ROUTE_DISPLAY[route] || ROUTE_DISPLAY.sas;
  const texts = TEXTS[language] || TEXTS.fr;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg space-y-4"
        >
          {/* Main confirmation card */}
          <Card variant="elevated">
            <CardContent className="p-6 sm:p-8 text-center">
              {/* Success animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                    <Check className="h-10 w-10 text-success" />
                  </div>
                  <motion.div
                    className="absolute -right-2 -top-2"
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-6 w-6 text-accent" />
                  </motion.div>
                </div>
              </motion.div>

              <h1 className="mb-2 text-2xl font-bold text-foreground">{texts.title}</h1>
              <p className="mb-6 text-muted-foreground">{texts.subtitle}</p>

              {/* Route determined */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`mb-6 rounded-xl ${routeInfo.color} p-4`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
                    {routeInfo.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{routeInfo.label}</p>
                    <p className="text-sm opacity-80">{routeInfo.description}</p>
                  </div>
                </div>
              </motion.div>

              {/* Summary of collected info */}
              {(storedAnswers.contact_firstname || storedAnswers.contact_email || storedAnswers.location) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6 space-y-2 rounded-xl border border-border bg-secondary/30 p-4 text-left"
                >
                  <h3 className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Récapitulatif</h3>
                  {storedAnswers.contact_firstname && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{[storedAnswers.contact_firstname, storedAnswers.contact_lastname].filter(Boolean).join(" ")}</span>
                    </div>
                  )}
                  {storedAnswers.contact_email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{storedAnswers.contact_email}</span>
                    </div>
                  )}
                  {storedAnswers.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{storedAnswers.location}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tags */}
              {storedAnswers.tags && storedAnswers.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap justify-center gap-2">
                  {(Array.isArray(storedAnswers.tags) ? storedAnswers.tags : storedAnswers.tags.split(","))
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag.replace(/_/g, " ")}
                      </Badge>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next steps card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card>
              <CardContent className="p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                  <Clock className="h-5 w-5 text-primary" />
                  {texts.nextStepsTitle}
                </h2>
                <ol className="space-y-3">
                  {routeInfo.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>

          {/* CTA buttons */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="space-y-3">
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
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ConfirmationPage;
