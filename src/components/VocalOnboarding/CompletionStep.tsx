import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles, Loader2, Mail, User, MapPin, Phone, Star, Copy, AlertTriangle, CheckCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { mapAnswersToV2 } from "@/lib/mapAnswersToV2";
import {
  computeOrientation,
  OrientationResult,
  PARCOURS_META,
  SCORE_COLORS,
} from "@/lib/orientationEngine";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface CompletionStepProps {
  answers: Record<string, string>;
  onComplete: () => void;
  isLoading?: boolean;
}

export function CompletionStep({ answers, onComplete, isLoading = false }: CompletionStepProps) {
  const { t } = useLanguage();
  const { t: ti18n } = useTranslation();
  const [copied, setCopied] = useState(false);

  // Compute v2 orientation result
  const result: OrientationResult = useMemo(() => {
    const parsedAnswers = { ...answers, tags: answers.tags ? answers.tags.split(",").filter(Boolean) : [] };
    const v2Responses = mapAnswersToV2(parsedAnswers);
    return computeOrientation(v2Responses);
  }, [answers]);

  // Lead pack info
  const leadPackInfo = {
    name: [answers.contact_firstname, answers.contact_lastname].filter(Boolean).join(" "),
    email: answers.contact_email,
    phone: answers.contact_phone,
    location: answers.location,
  };

  const scoreColor = SCORE_COLORS[result.scoreLabel];

  const handleCopyWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(result.messageWhatsapp);
      setCopied(true);
      toast.success(ti18n("completion.copySuccess"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(ti18n("completion.copyError"));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center"
    >
      <Card variant="elevated" className="mx-auto max-w-lg">
        <CardContent className="p-6 sm:p-8">
          {/* Success icon */}
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

          <h2 className="mb-2 text-2xl font-bold text-foreground">
            {t.onboarding.profileCreated}
          </h2>

          {/* Personalized Plan */}
          <div className="mb-6 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-5 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold uppercase text-primary">
                {ti18n("completion.yourPlan")}
              </h3>
            </div>
            <PersonalizedPlanSteps
              route={result.parcours}
              distanceToJob={answers.distance_to_job ? parseInt(answers.distance_to_job) : undefined}
              adminStatus={answers.admin_status}
            />
            <p className="mt-3 text-sm font-medium text-primary">
              {ti18n("completion.onTrack")} 💪
            </p>
          </div>

          {/* Parcours indicator */}
          <div className="mb-6 rounded-xl bg-secondary/50 p-4">
            <div className="mb-2 text-3xl">{PARCOURS_META[result.parcours].emoji}</div>
            <p className="text-lg font-semibold text-foreground">{result.parcoursLabel}</p>
            <p className="mt-1 text-sm text-muted-foreground">{result.parcoursDescription}</p>
          </div>

          {/* Score badge */}
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <span className="font-medium">{ti18n("completion.score")}</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: scoreColor }}>
                {result.score}/100
              </span>
            </div>
            <Progress value={result.score} className="mb-2 h-2" />
            <Badge
              className="text-white"
              style={{ backgroundColor: scoreColor }}
            >
              {result.scoreLabel}
            </Badge>
          </div>

          {/* Admin status alert */}
          {answers.admin_status === "sans_papiers" && (
            <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>⚠️ {ti18n("completion.legalAlert")}</span>
            </div>
          )}

          {/* Alertes */}
          {result.alertes.length > 0 && (
            <div className="mb-6 space-y-2">
              {result.alertes.map((alerte, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{alerte}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions recommandées */}
          {result.actionsLabels.length > 0 && (
            <div className="mb-6 rounded-xl border border-border bg-secondary/30 p-4 text-left">
              <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                {ti18n("completion.nextSteps")}
              </h3>
              <ul className="space-y-2">
                {result.actionsLabels.map((action, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Métier recommandé */}
          {result.metier && (
            <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
              <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
                {ti18n("completion.recommendedJob")}
              </h3>
              <p className="font-semibold text-foreground">{result.metier.label}</p>
              <p className="text-sm text-muted-foreground">
                {result.metier.certification} · {result.metier.duree}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ti18n("completion.funding")} : {result.metier.financements.join(", ")}
              </p>
            </div>
          )}

          {/* Lead pack summary */}
          <div className="mb-6 space-y-2 rounded-xl border border-border bg-secondary/30 p-4 text-left">
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
              {ti18n("completion.summary")}
            </h3>
            {leadPackInfo.name && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{leadPackInfo.name}</span>
              </div>
            )}
            {leadPackInfo.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{leadPackInfo.email}</span>
              </div>
            )}
            {leadPackInfo.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{leadPackInfo.phone}</span>
              </div>
            )}
            {leadPackInfo.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{leadPackInfo.location}</span>
              </div>
            )}
          </div>

          {/* WhatsApp message copy */}
          <Button
            variant="outline"
            size="sm"
            className="mb-4 w-full gap-2"
            onClick={handleCopyWhatsApp}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? ti18n("completion.copied") : ti18n("completion.copyWhatsapp")}
          </Button>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={onComplete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {ti18n("completion.finalizing")}
              </>
            ) : (
              <>
                {t.onboarding.discoverPath}
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Personalized plan steps based on route
function PersonalizedPlanSteps({ route, distanceToJob, adminStatus }: { route: string; distanceToJob?: number; adminStatus?: string }) {
  const { t: ti18n } = useTranslation();
  const steps: { emoji: string; text: string }[] = [];

  if (adminStatus === "sans_papiers" || adminStatus === "demandeur_asile") {
    steps.push({ emoji: "📋", text: ti18n("completion.step_admin") });
  }

  if (route === "fle" || route === "fle_pro") {
    steps.push({ emoji: "📖", text: ti18n("completion.step_french") });
    steps.push({ emoji: "🎓", text: ti18n("completion.step_training") });
    steps.push({ emoji: "💼", text: ti18n("completion.step_job") });
  } else if (route === "formation") {
    steps.push({ emoji: "🎓", text: ti18n("completion.step_qualifying") });
    steps.push({ emoji: "📜", text: ti18n("completion.step_certif") });
    steps.push({ emoji: "💼", text: ti18n("completion.step_sector_job") });
  } else if (route === "emploi") {
    steps.push({ emoji: "🔍", text: ti18n("completion.step_employer") });
    steps.push({ emoji: "🤝", text: ti18n("completion.step_interview") });
    steps.push({ emoji: "💼", text: ti18n("completion.step_start_job") });
  } else {
    steps.push({ emoji: "🧭", text: ti18n("completion.step_orientation") });
    steps.push({ emoji: "📖", text: ti18n("completion.step_adapted") });
    steps.push({ emoji: "💼", text: ti18n("completion.step_insertion") });
  }

  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={i} className="flex items-center gap-2 text-sm">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
          <span>{step.emoji} {step.text}</span>
        </li>
      ))}
    </ol>
  );
}
