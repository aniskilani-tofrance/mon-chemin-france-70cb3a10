import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Pencil, Volume2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  VISUAL_QUESTIONS,
  type VisualQuestion,
  type AnswersMap,
} from "@/lib/visualQuestions";
import { PHOTO_LANGUAGE_ICONS } from "@/components/VocalOnboarding/PhotoLanguageChoice";
import type { useTTS } from "@/hooks/useTTS";
import { playPreSpeech } from "@/lib/sounds";

interface VisualRecapStepProps {
  answers: AnswersMap;
  /** Permet d'éditer une réponse : retourne à l'index de la question */
  onEditQuestion: (questionIndex: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  progressPercent: number;
  questionNumber: number;
  totalQuestions: number;
  tts: ReturnType<typeof useTTS>;
}

interface RecapItem {
  questionId: string;
  questionIndex: number;
  titleKey: string;
  selections: Array<{
    optionId: string;
    labelKey: string;
    icon: string;
    illustration?: string;
  }>;
}

/**
 * Image avec fallback emoji si elle ne se charge pas (cohérent avec PhotoLanguageChoice).
 */
function RecapThumb({
  illustration,
  emoji,
  alt,
}: {
  illustration?: string;
  emoji: string;
  alt: string;
}) {
  const [errored, setErrored] = useState(false);
  const showImg = illustration && !errored;
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-lg bg-secondary/30",
        "flex items-center justify-center"
      )}
    >
      {showImg ? (
        <img
          src={illustration}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="text-3xl sm:text-4xl" aria-hidden>
          {emoji}
        </span>
      )}
    </div>
  );
}

export function VisualRecapStep({
  answers,
  onEditQuestion,
  onNext,
  onPrevious,
  progressPercent,
  questionNumber,
  totalQuestions,
  tts,
}: VisualRecapStepProps) {
  const { t } = useTranslation();
  const spokenRef = useRef(false);

  // Construit la liste des questions actives avec leurs réponses sélectionnées
  const recapItems = useMemo<RecapItem[]>(() => {
    const activeQuestions: VisualQuestion[] = VISUAL_QUESTIONS.filter(
      (q) => !q.showIf || q.showIf(answers)
    );
    const items: RecapItem[] = [];
    activeQuestions.forEach((q, idx) => {
      // Les écrans "info" n'ont pas de sélection utilisateur
      if (q.type === "info") return;
      const raw = answers[q.id];
      const selectedIds: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string" && raw.length > 0
        ? [raw]
        : [];
      if (selectedIds.length === 0) return;
      const selections = selectedIds
        .map((optId) => {
          const opt = q.options.find((o) => o.id === optId);
          if (!opt) return null;
          return {
            optionId: opt.id,
            labelKey: opt.labelKey,
            icon: opt.icon || PHOTO_LANGUAGE_ICONS[opt.id] || "📌",
            illustration: opt.illustration,
          };
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);
      if (selections.length === 0) return;
      items.push({
        questionId: q.id,
        questionIndex: idx,
        titleKey: q.titleKey,
        selections,
      });
    });
    return items;
  }, [answers]);

  // Lecture vocale : "Voici votre récapitulatif. X réponses enregistrées."
  const ttsText = useMemo(() => {
    const intro = t("onboardingVisual.recap.tts_intro", {
      count: recapItems.length,
    });
    const list = recapItems
      .map(
        (it, i) =>
          `${i + 1}. ${t(it.titleKey)} : ${it.selections
            .map((s) => t(s.labelKey))
            .join(", ")}`
      )
      .join(". ");
    return `${intro}. ${list}.`;
  }, [recapItems, t]);

  useEffect(() => {
    if (!tts.isEnabled || !tts.isSupported) return;
    if (spokenRef.current) return;
    spokenRef.current = true;
    playPreSpeech();
    const id = setTimeout(() => tts.speak(ttsText), 380);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tts.isEnabled, tts.isSupported]);

  const handleReplay = () => {
    playPreSpeech();
    setTimeout(() => tts.speak(ttsText), 280);
  };

  return (
    <motion.div
      key="visual-recap"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="flex w-full flex-col gap-6"
    >
      {/* Progression */}
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

      {/* En-tête */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {t("onboardingVisual.recap.title")}
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
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("onboardingVisual.recap.subtitle")}
        </p>
      </div>

      {/* Liste des récaps */}
      <div className="flex flex-col gap-4">
        {recapItems.map((item, i) => (
          <motion.div
            key={item.questionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground sm:text-base">
                {t(item.titleKey)}
              </h3>
              <button
                type="button"
                onClick={() => onEditQuestion(item.questionIndex)}
                className="flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                aria-label={t("onboardingVisual.recap.edit")}
              >
                <Pencil className="h-3 w-3" />
                {t("onboardingVisual.recap.edit")}
              </button>
            </div>

            <div
              className={cn(
                "grid gap-3",
                item.selections.length === 1
                  ? "grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center"
                  : "grid-cols-2 sm:grid-cols-3"
              )}
            >
              {item.selections.map((sel) => (
                <div
                  key={sel.optionId}
                  className="flex flex-col items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-2"
                >
                  <RecapThumb
                    illustration={sel.illustration}
                    emoji={sel.icon}
                    alt={t(sel.labelKey)}
                  />
                  <span className="text-center text-xs font-medium leading-tight text-foreground sm:text-sm">
                    {t(sel.labelKey)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {recapItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            {t("onboardingVisual.recap.empty")}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="ghost" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("onboardingVisual.actions.previous")}
        </Button>
        <Button onClick={onNext} className="gap-2">
          {t("onboardingVisual.recap.confirm")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
