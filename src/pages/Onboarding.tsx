import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Header } from "@/components/Header";
import { LanguageStep } from "@/components/VocalOnboarding/LanguageStep";
import { MarianneIntroStep } from "@/components/VocalOnboarding/MarianneIntroStep";
import { ConsentStep } from "@/components/VocalOnboarding/ConsentStep";
import { DecisionQuestion } from "@/components/VocalOnboarding/DecisionQuestion";
import { CompletionStep } from "@/components/VocalOnboarding/CompletionStep";
import { useLanguage } from "@/hooks/useLanguage";
import { useTTS, isTTSSupportedForLanguage } from "@/hooks/useTTS";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/lib/translations";
import {
  ONBOARDING_TREE,
  getNextQuestion,
  estimateTotalQuestions,
  calculateLeadScore,
  determineRoute,
  OnboardingAnswers as TreeOnboardingAnswers,
  LeadRoute,
} from "@/lib/decisionTree";

type OnboardingStep = "language" | "intro" | "consent" | "questions" | "complete";

interface OnboardingAnswers extends TreeOnboardingAnswers {
  leadRoute?: LeadRoute;
  leadScore?: number;
  consent_lead_sharing?: boolean;
  consent_marketing?: boolean;
}

const SOUND_TEXT: Record<LanguageCode, { on: string; off: string; enable: string; disable: string }> = {
  fr: { on: "Son ON", off: "Son OFF", enable: "Activer le son", disable: "Désactiver le son" },
  en: { on: "Sound ON", off: "Sound OFF", enable: "Enable sound", disable: "Disable sound" },
  ar: { on: "الصوت يعمل", off: "الصوت متوقف", enable: "تفعيل الصوت", disable: "إيقاف الصوت" },
  es: { on: "Sonido ON", off: "Sonido OFF", enable: "Activar sonido", disable: "Desactivar sonido" },
  pt: { on: "Som ON", off: "Som OFF", enable: "Ativar som", disable: "Desativar som" },
  ru: { on: "Звук ON", off: "Звук OFF", enable: "Включить звук", disable: "Выключить звук" },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const tts = useTTS({ language });
  const { track } = useAnalytics();
  const [step, setStep] = useState<OnboardingStep>("language");
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(ONBOARDING_TREE.startQuestion);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswers>({ tags: [] });
  const [onboardingStartedAt] = useState(() => Date.now());

  const currentQuestion = ONBOARDING_TREE.questions[currentQuestionId];
  const estimatedTotal = estimateTotalQuestions(answers);
  const currentQuestionNumber = questionHistory.length + 1;
  const currentRoute = determineRoute(answers);
  const isRTL = language === "ar";
  const soundText = SOUND_TEXT[language] || SOUND_TEXT.fr;

  // Track step changes
  useEffect(() => {
    track("onboarding_step", { step, question_number: currentQuestionNumber }, "/onboarding", language);
  }, [step, currentQuestionId]);

  const handleLanguageSelect = (lang: LanguageCode) => {
    track("onboarding_language_selected", { lang }, "/onboarding", lang);
    setLanguage(lang);
    setStep("intro");
  };

  const handleIntroComplete = () => {
    setStep("consent");
  };

  const handleConsentAccept = useCallback((leadSharing: boolean, marketing: boolean) => {
    track("onboarding_consent", { lead_sharing: leadSharing, marketing, accepted: true }, "/onboarding", language);
    setAnswers(prev => ({
      ...prev,
      consent_lead_sharing: leadSharing,
      consent_marketing: marketing,
    }));
    setStep("questions");
  }, [language, track]);

  const handleConsentDecline = useCallback(() => {
    setAnswers(prev => ({
      ...prev,
      consent_lead_sharing: false,
      consent_marketing: false,
      tags: [...prev.tags, "consent_declined"],
    }));
    setStep("questions");
  }, []);

  const handleAnswer = useCallback((answer: string | number | string[], tags?: string[]) => {
    const answerValue = Array.isArray(answer) ? answer.join(",") : answer;

    let allTags = tags ? [...tags] : [];
    if (Array.isArray(answer)) {
      const question = ONBOARDING_TREE.questions[currentQuestionId];
      if (question?.choices) {
        answer.forEach(choiceId => {
          const choice = question.choices?.find(c => c.id === choiceId);
          if (choice?.tags) {
            allTags = [...allTags, ...choice.tags];
          }
        });
      }
    }

    const newAnswers: OnboardingAnswers = {
      ...answers,
      [currentQuestionId]: answerValue,
      tags: allTags.length > 0 ? [...answers.tags, ...allTags] : answers.tags,
    };
    setAnswers(newAnswers);

    const nextQuestionId = getNextQuestion(currentQuestionId, answerValue, newAnswers);

    if (nextQuestionId) {
      setQuestionHistory(prev => [...prev, currentQuestionId]);
      setCurrentQuestionId(nextQuestionId);
    } else {
      const route = determineRoute(newAnswers);
      const score = calculateLeadScore(newAnswers);
      setAnswers({
        ...newAnswers,
        leadRoute: route,
        leadScore: score.total,
      });
      setStep("complete");
    }
  }, [currentQuestionId, answers]);

  const handleSkip = useCallback(() => {
    const nextQuestionId = getNextQuestion(currentQuestionId, "", answers);
    if (nextQuestionId) {
      setQuestionHistory(prev => [...prev, currentQuestionId]);
      setCurrentQuestionId(nextQuestionId);
    } else {
      setStep("complete");
    }
  }, [currentQuestionId, answers]);

  const handleComplete = useCallback(async () => {
    track("onboarding_completed", { route: answers.leadRoute ?? "unknown", score: answers.leadScore ?? 0 }, "/onboarding", language);
    const email = answers.contact_email as string | undefined;

    if (email) {
      localStorage.setItem("user_email", email);

      try {
        const consentsToInsert = [
          {
            email,
            consent_type: "lead_sharing" as const,
            consented: answers.consent_lead_sharing ?? false,
            consented_at: answers.consent_lead_sharing ? new Date().toISOString() : null,
            consent_text_version: "3.0",
          },
          {
            email,
            consent_type: "marketing" as const,
            consented: answers.consent_marketing ?? false,
            consented_at: answers.consent_marketing ? new Date().toISOString() : null,
            consent_text_version: "3.0",
          },
        ];

        await supabase.from("consents").upsert(consentsToInsert, {
          onConflict: "email,consent_type",
        });

        await supabase.functions.invoke("match-leads", {
          body: { answers, onboardingStartedAt },
        });
      } catch (error) {
        console.error("Error saving consents or matching:", error);
      }
    }

    localStorage.setItem("onboarding_answers", JSON.stringify(answers));
    navigate("/confirmation");
  }, [answers, navigate]);

  // Convert answers for CompletionStep display
  const displayAnswers: Record<string, string> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (value !== undefined && key !== "consent_lead_sharing" && key !== "consent_marketing") {
      if (key === "tags" && Array.isArray(value)) {
        displayAnswers[key] = value.join(",");
      } else if (typeof value === "boolean") {
        displayAnswers[key] = value ? "yes" : "no";
      } else {
        displayAnswers[key] = String(value);
      }
    }
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
      lang={language}
    >
      <Header />
      
      {step !== "language" && tts.isSupported && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={tts.toggle}
          className="fixed top-24 right-4 z-50 flex items-center gap-2 rounded-full border border-primary/20 bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-secondary sm:right-8"
          aria-label={tts.isEnabled ? soundText.disable : soundText.enable}
        >
          {tts.isEnabled ? (
            <Volume2 className="h-4 w-4 text-primary" />
          ) : (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs font-medium text-foreground">
            {tts.isEnabled ? soundText.on : soundText.off}
          </span>
        </motion.button>
      )}

      <div className="flex-1 flex items-center justify-center px-4 py-20 sm:py-24">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === "language" && (
              <LanguageStep key="language" onSelect={handleLanguageSelect} />
            )}

            {step === "intro" && (
              <MarianneIntroStep key="intro" onContinue={handleIntroComplete} />
            )}

            {step === "consent" && (
              <ConsentStep
                key="consent"
                onAccept={handleConsentAccept}
                onDecline={handleConsentDecline}
              />
            )}

            {step === "questions" && currentQuestion && (
              <DecisionQuestion
                key={`question-${currentQuestionId}`}
                question={currentQuestion}
                questionNumber={currentQuestionNumber}
                totalQuestions={estimatedTotal}
                currentRoute={currentRoute}
                onAnswer={handleAnswer}
                onSkip={handleSkip}
              />
            )}

            {step === "complete" && (
              <CompletionStep
                key="complete"
                answers={displayAnswers}
                onComplete={handleComplete}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
