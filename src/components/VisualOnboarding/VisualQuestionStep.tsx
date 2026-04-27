import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PhotoLanguageChoice,
  PhotoLanguageGrid,
} from "@/components/VocalOnboarding/PhotoLanguageChoice";
import type { VisualQuestion } from "@/lib/visualQuestions";
import type { useTTS } from "@/hooks/useTTS";
import { playPreSpeech } from "@/lib/sounds";

interface VisualQuestionStepProps {
  question: VisualQuestion;
  /** Valeur actuelle pour cette question (string ou string[]) */
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  progressPercent: number;
  questionNumber: number;
  totalQuestions: number;
  tts: ReturnType<typeof useTTS>;
}

export function VisualQuestionStep({
  question,
  value,
  onChange,
  onNext,
  onPrevious,
  isFirst,
  progressPercent,
  questionNumber,
  totalQuestions,
  tts,
}: VisualQuestionStepProps) {
  const { t } = useTranslation();
  const lastSpokenRef = useRef<string | null>(null);

  const title = t(question.titleKey);
  const subtitle = question.subtitleKey ? t(question.subtitleKey) : "";
  // Construit la lecture : titre + sous-titre + options numérotées « 1. … 2. … »
  // Pour les écrans "info", les "options" sont des illustrations pédagogiques (pas cliquables) :
  // on les énumère quand même à l'oral, mais sans logique de sélection.
  const optionsSpoken = question.options
    .map((opt, i) => `${i + 1}. ${t(opt.labelKey)}`)
    .join(". ");
  const intro = subtitle ? `${title}. ${subtitle}` : title;
  const ttsText = `${intro}. ${optionsSpoken}.`;

  // ─── TTS auto à chaque nouvelle question (avec ding pré-roll) ──────────────────
  useEffect(() => {
    if (!tts.isEnabled || !tts.isSupported) return;
    if (lastSpokenRef.current === question.id) return;
    lastSpokenRef.current = question.id;

    // Joue un petit "ding-ding" subtil immédiatement, puis la voix après le ding
    playPreSpeech();
    const t = setTimeout(() => tts.speak(ttsText), 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, tts.isEnabled, tts.isSupported]);

  useEffect(() => {
    requestAnimationFrame(() => {
      document.scrollingElement?.scrollTo({ top: 0, behavior: "smooth" });
    });
  }, [question.id]);

  const handleReplay = () => {
    playPreSpeech();
    setTimeout(() => tts.speak(ttsText), 280);
  };

  // ─── Sélection ───────────────────────────────────────────
  const selectedSet = useMemo(() => {
    if (Array.isArray(value)) return new Set(value);
    if (typeof value === "string") return new Set([value]);
    return new Set<string>();
  }, [value]);

  const handleToggle = (optionId: string) => {
    if (question.type === "single") {
      onChange(optionId);
      // Auto-avancer après sélection en single (UX fluide)
      setTimeout(() => onNext(), 280);
    } else {
      // multi
      const next = new Set(selectedSet);
      if (optionId === "none") {
        // "Aucune" exclut tout le reste
        next.clear();
        next.add("none");
      } else {
        next.delete("none");
        if (next.has(optionId)) next.delete(optionId);
        else next.add(optionId);
      }
      onChange(Array.from(next));
    }
  };

  const canContinue =
    question.optional ||
    (question.type === "single" && !!value) ||
    (question.type === "multi" && selectedSet.size > 0);

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 w-full"
    >
      {/* Barre de progression */}
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

      {/* Titre + bouton réécouter */}
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
        {subtitle && (
          <p className="text-sm sm:text-base text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Grille de cartes images */}
      <PhotoLanguageGrid columns={question.columns}>
        {question.options.map((option, index) => (
          <PhotoLanguageChoice
            key={option.id}
            choiceId={option.id}
            label={t(option.labelKey)}
            customIcon={option.icon}
            customImage={option.illustration}
            imagePriority={index < 2}
            isSelected={question.type === "info" ? false : selectedSet.has(option.id)}
            isMultiSelect={question.type === "multi"}
            onClick={() => {
              // Sur écran info, les cartes ne sont pas interactives
              if (question.type === "info") return;
              handleToggle(option.id);
            }}
            index={index}
          />
        ))}
      </PhotoLanguageGrid>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={isFirst}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("onboardingVisual.actions.previous")}
        </Button>

        {question.type === "multi" && (
          <Button onClick={onNext} disabled={!canContinue} className="gap-2">
            {t("onboardingVisual.actions.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {question.type === "info" && (
          <Button onClick={onNext} className="gap-2">
            {question.infoCtaKey ? t(question.infoCtaKey) : t("onboardingVisual.actions.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {question.type === "single" && question.optional && (
          <Button variant="outline" onClick={onNext} className="gap-2">
            {t("onboardingVisual.actions.skip")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
