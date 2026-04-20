import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MailCheck, ArrowRight, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MagicLinkSentStepProps {
  email: string;
  onContinue: () => void;
  onResend?: () => void;
  isResending?: boolean;
}

const COOLDOWN_SECONDS = 60;

export function MagicLinkSentStep({
  email,
  onContinue,
  onResend,
  isResending = false,
}: MagicLinkSentStepProps) {
  const { t } = useTranslation();
  // Démarre déjà en cooldown puisqu'un email vient d'être envoyé en arrivant sur cette étape.
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || isResending || !onResend) return;
    onResend();
    setCooldown(COOLDOWN_SECONDS);
  };

  const isDisabled = isResending || cooldown > 0;
  const progressPct = ((COOLDOWN_SECONDS - cooldown) / COOLDOWN_SECONDS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center gap-6 w-full text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10"
      >
        <MailCheck className="h-12 w-12 text-primary" strokeWidth={1.8} />
      </motion.div>

      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {t("onboardingVisual.magic_link_sent.title")}
        </h2>
        <p className="text-base text-muted-foreground">
          {t("onboardingVisual.magic_link_sent.subtitle")}
        </p>
        <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 inline-flex items-center gap-2 max-w-full">
          <span className="text-sm font-semibold text-foreground break-all">{email}</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-4 text-left w-full space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
            1
          </span>
          {t("onboardingVisual.magic_link_sent.step1")}
        </p>
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
            2
          </span>
          {t("onboardingVisual.magic_link_sent.step2")}
        </p>
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
            3
          </span>
          {t("onboardingVisual.magic_link_sent.step3")}
        </p>
      </div>

      <p className="text-xs text-muted-foreground italic">
        {t("onboardingVisual.magic_link_sent.spam_hint")}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
        {onResend && (
          <div className="w-full sm:w-auto flex flex-col gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={isDisabled}
              aria-live="polite"
              className="gap-2 w-full sm:w-auto relative overflow-hidden"
            >
              {cooldown > 0 ? (
                <>
                  <Clock className="h-4 w-4" />
                  <span>
                    {t("onboardingVisual.magic_link_sent.resend_in", { seconds: cooldown })}
                  </span>
                </>
              ) : (
                <>
                  <RefreshCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                  <span>{t("onboardingVisual.magic_link_sent.resend")}</span>
                </>
              )}
            </Button>
            {cooldown > 0 && (
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
            )}
          </div>
        )}
        <Button
          type="button"
          onClick={onContinue}
          className="gap-2 w-full sm:flex-1"
        >
          {t("onboardingVisual.magic_link_sent.continue")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
