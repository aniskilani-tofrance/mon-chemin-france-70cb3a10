import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Loader2, AlertCircle, Languages, GraduationCap, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Question, getTranslatedText, LeadRoute } from "@/lib/decisionTree";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { useTTS } from "@/hooks/useTTS";
import { AnimatedAgent } from "./AnimatedAgent";
import { PhotoLanguageChoice, PhotoLanguageGrid } from "./PhotoLanguageChoice";
import { GooglePlacesAutocomplete } from "./GooglePlacesAutocomplete";
import { z } from "zod";

// Email validation schema
const emailSchema = z.string().trim().email({ message: "Format email invalide" }).max(255);

// Route labels for display
const ROUTE_LABELS: Record<LeadRoute, { label: string; icon: React.ReactNode; color: string }> = {
  route_a: { label: "Parcours FLE", icon: <Languages className="h-3 w-3" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  route_b: { label: "Parcours Formation", icon: <GraduationCap className="h-3 w-3" />, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  route_c: { label: "Parcours Emploi", icon: <Briefcase className="h-3 w-3" />, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  sas: { label: "Accompagnement", icon: <Users className="h-3 w-3" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
};

interface DecisionQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentRoute?: LeadRoute;
  onAnswer: (answer: string | number | string[], tags?: string[]) => void;
  onSkip?: () => void;
}

export function DecisionQuestion({
  question,
  questionNumber,
  totalQuestions,
  currentRoute,
  onAnswer,
  onSkip,
}: DecisionQuestionProps) {
  const { language, t } = useLanguage();
  const { t: ti18n } = useTranslation();
  const tts = useTTS({ language });
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  // Try i18n first, fall back to inline Record<string, string>
  const i18nQuestionKey = `questionnaire.${question.id}.question`;
  const i18nSubtitleKey = `questionnaire.${question.id}.subtitle`;
  const questionText = ti18n(i18nQuestionKey) !== i18nQuestionKey
    ? ti18n(i18nQuestionKey)
    : getTranslatedText(question.question, language);
  const subtitleText = ti18n(i18nSubtitleKey) !== i18nSubtitleKey
    ? ti18n(i18nSubtitleKey)
    : getTranslatedText(question.subtitle, language);

  // Auto-speak question text
  useEffect(() => {
    if (tts.isSupported && tts.isEnabled && questionText) {
      const timer = setTimeout(() => tts.speak(questionText), 400);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedChoice(null);
    setSelectedChoices([]);
    setScaleValue(null);
    setTextValue("");
    setEmailError(null);
  }, [question.id]);

  // Handle single choice selection
  const handleChoiceSelect = (choiceId: string, tags?: string[]) => {
    setSelectedChoice(choiceId);
    // Small delay for visual feedback then auto-advance
    setTimeout(() => {
      onAnswer(choiceId, tags);
    }, 400);
  };

  // Groups of mutually exclusive choices (only one from each group can be selected)
  const EXCLUSIVE_GROUPS: string[][] = [
    ["find_job", "job_training", "start_business"],
  ];

  // Handle multi-choice toggle with mutual exclusivity
  const handleMultiChoiceToggle = (choiceId: string) => {
    // If selecting "none" or "need_help", deselect all others
    if (choiceId === "none" || choiceId === "need_help") {
      setSelectedChoices([choiceId]);
      return;
    }
    
    setSelectedChoices(prev => {
      // Remove "none"/"need_help" if present
      let updated = prev.filter(id => id !== "none" && id !== "need_help");

      if (updated.includes(choiceId)) {
        // Deselect
        return updated.filter(id => id !== choiceId);
      }

      // Check exclusive groups: remove any conflicting choice
      for (const group of EXCLUSIVE_GROUPS) {
        if (group.includes(choiceId)) {
          updated = updated.filter(id => !group.includes(id));
        }
      }

      return [...updated, choiceId];
    });
  };

  // Confirm multi-choice selection
  const handleMultiChoiceConfirm = () => {
    if (selectedChoices.length > 0) {
      onAnswer(selectedChoices);
    }
  };

  const handleScaleSelect = (value: number) => {
    setScaleValue(value);
  };

  // Helper: read Google Places input value from DOM (shadow DOM workaround)
  const getLocationValue = (): string => {
    if (textValue.trim()) return textValue.trim();
    // Try multiple methods to get the value from Google Places element
    try {
      const el = document.querySelector("gmp-place-autocomplete");
      if (el) {
        // Try open shadow DOM
        const sr = (el as any).shadowRoot;
        if (sr) {
          const input = sr.querySelector("input");
          if (input?.value) return input.value;
        }
        // Try direct child
        const directInput = el.querySelector("input");
        if (directInput?.value) return directInput.value;
        // Try reading the element's value property
        if ((el as any).value) return String((el as any).value);
      }
      // Last resort: find any input inside the wrapper
      const wrapper = document.querySelector(".google-places-wrapper");
      if (wrapper) {
        const inputs = wrapper.querySelectorAll("input");
        for (const input of inputs) {
          if ((input as HTMLInputElement).value) return (input as HTMLInputElement).value;
        }
      }
    } catch { /* ignore */ }
    return "";
  };

  const handleConfirm = () => {
    if (question.type === "scale" && scaleValue !== null) {
      onAnswer(scaleValue);
    } else if (question.type === "text") {
      const value = question.id === "location" ? getLocationValue() : textValue.trim();
      if (value) {
        onAnswer(value);
      }
    } else if (question.type === "email" && textValue.trim()) {
      // Validate email format
      const result = emailSchema.safeParse(textValue);
      if (result.success) {
        setEmailError(null);
        onAnswer(result.data);
      } else {
        setEmailError(result.error.errors[0]?.message || "Format email invalide");
      }
    } else if (question.type === "multiChoice" && selectedChoices.length > 0) {
      handleMultiChoiceConfirm();
    }
  };

  const handleEmailChange = (value: string) => {
    setTextValue(value);
    if (emailError) setEmailError(null);
  };

  const isConfirmDisabled =
    (question.type === "scale" && scaleValue === null) ||
    (question.type === "text" && question.id !== "location" && !textValue.trim()) ||
    (question.type === "email" && !textValue.trim()) ||
    (question.type === "multiChoice" && selectedChoices.length === 0);

  // Determine grid columns based on number of choices
  const getGridColumns = (): 2 | 3 | 4 => {
    const choiceCount = question.choices?.length || 0;
    if (choiceCount <= 2) return 2;
    if (choiceCount <= 4) return 2;
    if (choiceCount <= 6) return 3;
    return 4;
  };

  return (
    <Card variant="elevated" className={`mx-auto max-w-2xl ${question.id === "location" ? "" : "overflow-hidden"}`}>
      <CardContent className="p-4 sm:p-6 md:p-8">
        {/* Progress indicator with route badge */}
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {questionNumber} / {totalQuestions}
            </span>
            <AnimatePresence mode="wait">
              {currentRoute && ROUTE_LABELS[currentRoute] && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <Badge variant="secondary" className={`${ROUTE_LABELS[currentRoute].color} text-xs`}>
                    {ROUTE_LABELS[currentRoute].icon}
                    <span className="ml-1">{ROUTE_LABELS[currentRoute].label}</span>
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Progress bar */}
          <div className="flex h-2 w-24 overflow-hidden rounded-full bg-muted sm:w-32">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Animated Agent - click to replay */}
        <div className="mb-3 flex justify-center sm:mb-4">
          <AnimatedAgent state={tts.isSpeaking ? "speaking" : "idle"} size="sm" onClick={() => tts.speak(questionText)} />
        </div>

        {/* Question */}
        <motion.div 
          key={question.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-center sm:mb-6"
        >
          <h2 className="text-lg font-semibold text-foreground sm:text-xl md:text-2xl">
            {questionText}
          </h2>
          {subtitleText && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-sm text-muted-foreground"
            >
              {subtitleText}
            </motion.p>
          )}
        </motion.div>

        {/* Choice grid with Photo Language */}
        {question.type === "choice" && question.choices && (
          <PhotoLanguageGrid columns={getGridColumns()}>
            {question.choices.map((choice, index) => {
              const i18nChoiceKey = `questionnaire.${question.id}.choices.${choice.id}`;
              const choiceLabel = ti18n(i18nChoiceKey) !== i18nChoiceKey
                ? ti18n(i18nChoiceKey)
                : getTranslatedText(choice.label, language);
              const isSelected = selectedChoice === choice.id;

              return (
                <PhotoLanguageChoice
                  key={choice.id}
                  choiceId={choice.id}
                  label={choiceLabel}
                  customIcon={choice.icon}
                  isSelected={isSelected}
                  onClick={() => handleChoiceSelect(choice.id, choice.tags)}
                  index={index}
                  compact={question.choices!.length > 4}
                />
              );
            })}
          </PhotoLanguageGrid>
        )}

        {/* MultiChoice grid (multiple selection) with Photo Language */}
        {question.type === "multiChoice" && question.choices && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <PhotoLanguageGrid columns={getGridColumns()}>
              {question.choices.map((choice, index) => {
              const i18nMcKey = `questionnaire.${question.id}.choices.${choice.id}`;
                const choiceLabel = ti18n(i18nMcKey) !== i18nMcKey
                  ? ti18n(i18nMcKey)
                  : getTranslatedText(choice.label, language);
                const isSelected = selectedChoices.includes(choice.id);

                return (
                  <PhotoLanguageChoice
                    key={choice.id}
                    choiceId={choice.id}
                    label={choiceLabel}
                    customIcon={choice.icon}
                    isSelected={isSelected}
                    isMultiSelect
                    onClick={() => handleMultiChoiceToggle(choice.id)}
                    index={index}
                    compact={question.choices!.length > 4}
                  />
                );
              })}
            </PhotoLanguageGrid>
            
            {/* Confirm button for multi-choice */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="hero"
                className="w-full gap-2"
                onClick={handleMultiChoiceConfirm}
                disabled={selectedChoices.length === 0}
              >
                {selectedChoices.length > 0 && (
                  <Badge variant="secondary" className="mr-1 bg-primary-foreground/20 text-primary-foreground">
                    {selectedChoices.length}
                  </Badge>
                )}
                {t.onboarding.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Scale input (1-5) with visual improvements */}
        {question.type === "scale" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-center gap-2 sm:gap-3">
              {Array.from(
                { length: (question.scaleMax || 5) - (question.scaleMin || 1) + 1 },
                (_, i) => i + (question.scaleMin || 1)
              ).map((value, index) => (
                <motion.button
                  key={value}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleScaleSelect(value)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-all sm:h-14 sm:w-14 sm:text-xl ${
                    scaleValue === value
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "border-border bg-card text-foreground hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  {value}
                </motion.button>
              ))}
            </div>

            {question.scaleLabels && question.scaleLabels[language] && (
              <div className="flex justify-between px-2 text-xs text-muted-foreground sm:text-sm">
                <span>{question.scaleLabels[language]?.min || "1"}</span>
                <span>{question.scaleLabels[language]?.max || "5"}</span>
              </div>
            )}

            <Button
              variant="hero"
              className="mt-4 w-full gap-2"
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
            >
              {t.onboarding.next}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Text input - with Google Places for location */}
        {question.type === "text" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {question.id === "location" ? (
              <GooglePlacesAutocomplete
                value={textValue}
                onChange={setTextValue}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isConfirmDisabled) {
                    handleConfirm();
                  }
                }}
              />
            ) : (
              <div className="relative">
                <Input
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder=""
                  className="h-12 text-center text-lg transition-all focus:ring-2 focus:ring-primary/30"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isConfirmDisabled) {
                      handleConfirm();
                    }
                  }}
                />
              </div>
            )}

            <div className="flex gap-3">
              {onSkip && !question.required && (
                <Button variant="outline" className="flex-1" onClick={onSkip}>
                  {t.onboarding.skip}
                </Button>
              )}
              <Button
                variant="hero"
                className={`gap-2 ${onSkip && !question.required ? "flex-1" : "w-full"}`}
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
              >
                {t.onboarding.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Email input with validation */}
        {question.type === "email" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  value={textValue}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="exemple@email.com"
                  className={`h-12 text-center text-lg transition-all ${
                    emailError 
                      ? "border-destructive focus-visible:ring-destructive" 
                      : "focus:ring-2 focus:ring-primary/30"
                  }`}
                  autoFocus
                  autoComplete="email"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isConfirmDisabled) {
                      handleConfirm();
                    }
                  }}
                />
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {emailError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-3">
              {onSkip && !question.required && (
                <Button variant="outline" className="flex-1" onClick={onSkip}>
                  {t.onboarding.skip}
                </Button>
              )}
              <Button
                variant="hero"
                className={`gap-2 ${onSkip && !question.required ? "flex-1" : "w-full"}`}
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
              >
                {t.onboarding.finish}
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
