import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Mail, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { useTTS } from "@/hooks/useTTS";

interface EmailStepProps {
  initialEmail?: string;
  initialConsentLeadSharing?: boolean;
  initialConsentMarketing?: boolean;
  onSubmit: (data: {
    email: string;
    consent_lead_sharing: boolean;
    consent_marketing: boolean;
  }) => void;
  onPrevious: () => void;
  isSubmitting: boolean;
  progressPercent: number;
  questionNumber: number;
  totalQuestions: number;
  tts: ReturnType<typeof useTTS>;
}

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function EmailStep({
  initialEmail = "",
  initialConsentLeadSharing = false,
  initialConsentMarketing = false,
  onSubmit,
  onPrevious,
  isSubmitting,
  progressPercent,
  questionNumber,
  totalQuestions,
  tts,
}: EmailStepProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(initialEmail);
  const [consentLead, setConsentLead] = useState(initialConsentLeadSharing);
  const [consentMarketing, setConsentMarketing] = useState(initialConsentMarketing);
  const lastSpokenRef = useRef(false);

  const title = t("onboardingVisual.email.question");
  const subtitle = t("onboardingVisual.email.subtitle");

  // ─── TTS auto à l'affichage ──────────────────
  useEffect(() => {
    if (!tts.isEnabled || !tts.isSupported || lastSpokenRef.current) return;
    lastSpokenRef.current = true;
    const id = setTimeout(() => tts.speak(`${title}. ${subtitle}`), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tts.isEnabled, tts.isSupported]);

  const handleReplay = () => tts.speak(`${title}. ${subtitle}`);

  const isValid = EMAIL_REGEX.test(email.trim()) && consentLead;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    onSubmit({
      email: email.trim(),
      consent_lead_sharing: consentLead,
      consent_marketing: consentMarketing,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t("onboardingVisual.progress.step", {
              current: questionNumber,
              total: totalQuestions,
            })}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Titre */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {title}
          </h2>
          {tts.isSupported && (
            <button
              type="button"
              onClick={handleReplay}
              aria-label={t("onboardingVisual.actions.replay")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-card text-primary transition-colors hover:bg-primary/10"
            >
              <Volume2 className={`h-4 w-4 ${tts.isSpeaking ? "animate-pulse" : ""}`} />
            </button>
          )}
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
        <p className="text-xs text-muted-foreground/80 italic">
          {t("onboardingVisual.email.magic_link_note")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">
            {t("onboardingVisual.email.label")}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-10 text-base"
            />
          </div>
        </div>

        {/* Consents */}
        <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-lead"
              checked={consentLead}
              onCheckedChange={(c) => setConsentLead(c === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="consent-lead"
              className="text-sm leading-relaxed cursor-pointer"
            >
              {t("onboardingVisual.email.consent_lead")}{" "}
              <span className="text-destructive">*</span>
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-marketing"
              checked={consentMarketing}
              onCheckedChange={(c) => setConsentMarketing(c === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="consent-marketing"
              className="text-sm leading-relaxed cursor-pointer"
            >
              {t("onboardingVisual.email.consent_marketing")}
            </Label>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onPrevious}
            disabled={isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("onboardingVisual.actions.previous")}
          </Button>
          <Button type="submit" disabled={!isValid || isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("onboardingVisual.email.submit")}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
