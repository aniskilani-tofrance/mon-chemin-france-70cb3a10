import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, MapPin, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { useTTS } from "@/hooks/useTTS";

interface PostalCodeStepProps {
  initialValue?: string;
  onSubmit: (postalCode: string) => void;
  onPrevious: () => void;
  progressPercent: number;
  questionNumber: number;
  totalQuestions: number;
  tts: ReturnType<typeof useTTS>;
}

const POSTAL_REGEX = /^\d{5}$/;

export function PostalCodeStep({
  initialValue = "",
  onSubmit,
  onPrevious,
  progressPercent,
  questionNumber,
  totalQuestions,
  tts,
}: PostalCodeStepProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const lastSpokenRef = useRef(false);

  const title = t("onboardingVisual.postal_code.question");
  const subtitle = t("onboardingVisual.postal_code.subtitle");

  useEffect(() => {
    if (!tts.isEnabled || !tts.isSupported || lastSpokenRef.current) return;
    lastSpokenRef.current = true;
    const id = setTimeout(() => tts.speak(`${title}. ${subtitle}`), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tts.isEnabled, tts.isSupported]);

  const isValid = POSTAL_REGEX.test(value.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onSubmit(value.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full"
    >
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

      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            {title}
          </h2>
          {tts.isSupported && (
            <button
              type="button"
              onClick={() => tts.speak(`${title}. ${subtitle}`)}
              aria-label={t("onboardingVisual.actions.replay")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-card text-primary transition-colors hover:bg-primary/10"
            >
              <Volume2 className={`h-4 w-4 ${tts.isSpeaking ? "animate-pulse" : ""}`} />
            </button>
          )}
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="postal_code" className="text-base">
            {t("onboardingVisual.postal_code.label")}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="postal_code"
              type="text"
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              autoComplete="postal-code"
              required
              placeholder="75001"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 5))}
              onBlur={() => setTouched(true)}
              className="h-14 pl-10 text-lg tracking-widest"
            />
          </div>
          {touched && !isValid && (
            <p className="text-sm text-destructive">
              {t("onboardingVisual.postal_code.error")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onPrevious} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("onboardingVisual.actions.previous")}
          </Button>
          <Button type="submit" disabled={!isValid} className="gap-2">
            {t("onboardingVisual.actions.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
