import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Volume2, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PhotoLanguageChoice,
  PhotoLanguageGrid,
} from "@/components/VocalOnboarding/PhotoLanguageChoice";
import type { VisualQuestion } from "@/lib/visualQuestions";
import type { useTTS } from "@/hooks/useTTS";
import { playPreSpeech } from "@/lib/sounds";
import { cn } from "@/lib/utils";

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
      className="flex flex-col gap-6 w-full pb-28 sm:pb-6"
    >
      {/* Barre de progression à pastilles */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2.5 rounded-full transition-all",
              i + 1 < questionNumber && "w-2.5 bg-primary",
              i + 1 === questionNumber && "w-8 bg-primary",
              i + 1 > questionNumber && "w-2.5 bg-muted"
            )}
            aria-hidden="true"
          />
        ))}
        <span className="sr-only">
          {t("onboardingVisual.progress.step", { current: questionNumber, total: totalQuestions })}
        </span>
      </div>

      {/* Titre */}
      <div className="space-y-3 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base text-muted-foreground">{subtitle}</p>
        )}
        {tts.isSupported && (
          <button
            type="button"
            onClick={handleReplay}
            aria-label={t("onboardingVisual.actions.replay")}
            className="mx-auto inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Volume2 className={`h-4 w-4 ${tts.isSpeaking ? "animate-pulse" : ""}`} />
            {t("onboardingVisual.actions.replay")}
          </button>
        )}
      </div>

      {/* Indication multi-sélection */}
      {question.type === "multi" && (
        <div className="mx-auto flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm text-foreground">
          <Hand className="h-4 w-4 text-primary" />
          Vous pouvez choisir plusieurs réponses
        </div>
      )}

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
              if (question.type === "info") return;
              handleToggle(option.id);
            }}
            index={index}
          />
        ))}
      </PhotoLanguageGrid>

      {/* Navigation — sticky bottom mobile pour les cas multi/info/optional */}
      {(question.type === "multi" || question.type === "info" || (question.type === "single" && question.optional)) && (
        <div className="sticky bottom-3 z-20 mx-[-1rem] sm:static sm:mx-0 sm:mt-2">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <Button
              variant="ghost"
              onClick={onPrevious}
              disabled={isFirst}
              size="lg"
              className="gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              {t("onboardingVisual.actions.previous")}
            </Button>

            <Button
              onClick={onNext}
              disabled={!canContinue}
              size="lg"
              className="h-12 flex-1 max-w-[260px] gap-2 text-base font-semibold"
            >
              {question.type === "info" && question.infoCtaKey
                ? t(question.infoCtaKey)
                : question.type === "single" && question.optional
                ? t("onboardingVisual.actions.skip")
                : t("onboardingVisual.actions.next")}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Pour les questions single non-optionnelles : juste un retour discret (auto-advance après tap) */}
      {question.type === "single" && !question.optional && (
        <div className="flex items-center justify-start pt-1">
          <Button
            variant="ghost"
            onClick={onPrevious}
            disabled={isFirst}
            size="sm"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("onboardingVisual.actions.previous")}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
