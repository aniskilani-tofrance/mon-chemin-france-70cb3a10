import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Header } from "@/components/Header";
import { LanguageStep } from "@/components/VocalOnboarding/LanguageStep";
import { OnboardingPathChoice } from "@/components/VocalOnboarding/OnboardingPathChoice";
import { CompletionStep } from "@/components/VocalOnboarding/CompletionStep";
import { VisualQuestionStep } from "@/components/VisualOnboarding/VisualQuestionStep";
import { EmailStep } from "@/components/VisualOnboarding/EmailStep";
import { useLanguage } from "@/hooks/useLanguage";
import { useTTS } from "@/hooks/useTTS";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/lib/translations";
import { VISUAL_QUESTIONS, getProgressPercent } from "@/lib/visualQuestions";
import { computeOrientation } from "@/lib/orientationEngine";
import { mapAnswersToV2 } from "@/lib/mapAnswersToV2";

type OnboardingStep = "language" | "path-choice" | "visual-quiz" | "email" | "complete";

interface VisualAnswers {
  [questionId: string]: string | string[];
}

const SOUND_TEXT: Record<LanguageCode, { on: string; off: string; enable: string; disable: string }> = {
  fr: { on: "Son ON", off: "Son OFF", enable: "Activer le son", disable: "Désactiver le son" },
  en: { on: "Sound ON", off: "Sound OFF", enable: "Enable sound", disable: "Disable sound" },
  ar: { on: "الصوت مُفعَّل", off: "الصوت مُعطَّل", enable: "تفعيل الصوت", disable: "إيقاف الصوت" },
  es: { on: "Sonido ON", off: "Sonido OFF", enable: "Activar sonido", disable: "Desactivar sonido" },
  pt: { on: "Som ON", off: "Som OFF", enable: "Ativar som", disable: "Desativar som" },
  ru: { on: "Звук ON", off: "Звук OFF", enable: "Включить звук", disable: "Выключить звук" },
};

const TOTAL_STEPS = VISUAL_QUESTIONS.length + 1; // +1 pour l'email

const Onboarding = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const tts = useTTS({ language });
  const { track } = useAnalytics();
  const { user } = useAuth();

  const [step, setStep] = useState<OnboardingStep>("language");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<VisualAnswers>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingStartedAt] = useState(() => Date.now());
  const [completionAnswers, setCompletionAnswers] = useState<Record<string, string>>({});

  const isRTL = language === "ar";
  const soundText = SOUND_TEXT[language] || SOUND_TEXT.fr;

  useEffect(() => {
    track("onboarding_step", { step }, "/onboarding", language);
  }, [step]);

  const handleLanguageSelect = (lang: LanguageCode) => {
    track("onboarding_language_selected", { lang }, "/onboarding", lang);
    setLanguage(lang);
    setStep("path-choice");
  };

  const handleSelectVisualPath = () => {
    track("onboarding_path_selected", { path: "visual" }, "/onboarding", language);
    setStep("visual-quiz");
    setQuestionIndex(0);
  };

  const currentQuestion = VISUAL_QUESTIONS[questionIndex];

  const handleAnswerChange = (value: string | string[]) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    track(
      "onboarding_question_answered",
      { questionId: currentQuestion.id },
      "/onboarding",
      language
    );

    if (questionIndex < VISUAL_QUESTIONS.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStep("email");
    }
  };

  const handlePrevious = () => {
    if (step === "email") {
      setStep("visual-quiz");
      setQuestionIndex(VISUAL_QUESTIONS.length - 1);
      return;
    }
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else {
      setStep("path-choice");
    }
  };

  const handleEmailSubmit = useCallback(
    async (data: { email: string; consent_lead_sharing: boolean; consent_marketing: boolean }) => {
      setIsSubmitting(true);

      // Normalisation : barriers en array, autres en string
      const flat: Record<string, any> = {};
      for (const [k, v] of Object.entries(answers)) {
        flat[k] = v;
      }

      // Calcul orientation via le moteur v2
      const v2Answers = mapAnswersToV2({
        main_goal: flat.main_goal,
        work_right: flat.work_right,
        french_level_cecrl: flat.french_level_cecrl,
        target_sector: flat.target_sector,
        barriers: flat.barriers,
        contact_48h: flat.contact_48h,
      });
      const orientation = computeOrientation(v2Answers);

      // Tracking complet
      track(
        "onboarding_completed",
        { route: orientation.parcours, score: orientation.score },
        "/onboarding",
        language
      );

      try {
        // 1. Insertion onboarding_results
        await supabase.from("onboarding_results").insert([
          {
            email: data.email,
            language,
            answers: JSON.parse(JSON.stringify({ ...flat, contact_email: data.email })),
            french_level_cecrl: (flat.french_level_cecrl as string) || null,
            main_goal: (flat.main_goal as string) || null,
            target_sector: (flat.target_sector as string) || null,
            lead_route: orientation.parcours,
            lead_score: orientation.score,
            work_right: (flat.work_right as string) || null,
            literacy: (flat.literacy as string) || null,
            barriers: Array.isArray(flat.barriers) ? (flat.barriers as string[]) : null,
          },
        ]);
      } catch (error) {
        console.error("Error saving onboarding results:", error);
      }

      // 2. Consents + match leads
      try {
        localStorage.setItem("user_email", data.email);
        const consentsToInsert = [
          {
            email: data.email,
            consent_type: "lead_sharing" as const,
            consented: data.consent_lead_sharing,
            consented_at: data.consent_lead_sharing ? new Date().toISOString() : null,
            consent_text_version: "4.0",
          },
          {
            email: data.email,
            consent_type: "marketing" as const,
            consented: data.consent_marketing,
            consented_at: data.consent_marketing ? new Date().toISOString() : null,
            consent_text_version: "4.0",
          },
        ];
        await supabase
          .from("consents")
          .upsert(consentsToInsert, { onConflict: "email,consent_type" });

        await supabase.functions.invoke("match-leads", {
          body: {
            answers: { ...flat, contact_email: data.email, leadRoute: orientation.parcours, leadScore: orientation.score },
            onboardingStartedAt,
          },
        });
      } catch (error) {
        console.error("Error saving consents or matching:", error);
      }

      const finalAnswers = {
        ...flat,
        contact_email: data.email,
        leadRoute: orientation.parcours,
        leadScore: orientation.score,
      };
      localStorage.setItem("onboarding_answers", JSON.stringify(finalAnswers));

      // Pour CompletionStep
      const display: Record<string, string> = {};
      for (const [key, value] of Object.entries(finalAnswers)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) display[key] = value.join(",");
        else display[key] = String(value);
      }
      setCompletionAnswers(display);

      setIsSubmitting(false);
      setStep("complete");
    },
    [answers, language, onboardingStartedAt, track]
  );

  const handleComplete = useCallback(() => {
    navigate("/confirmation");
  }, [navigate]);

  // ─── Rendu ───────────────────────────────────────────
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
          className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-full border border-primary/20 bg-card/90 px-4 py-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-secondary sm:right-8"
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

      <div className="flex-1 flex items-start justify-center px-4 pt-20 pb-8 sm:pt-24 overflow-y-auto">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === "language" && (
              <LanguageStep key="language" onSelect={handleLanguageSelect} />
            )}

            {step === "path-choice" && (
              <OnboardingPathChoice
                key="path-choice"
                onSelectVisual={handleSelectVisualPath}
              />
            )}

            {step === "visual-quiz" && currentQuestion && (
              <VisualQuestionStep
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={handleAnswerChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={questionIndex === 0}
                isLast={questionIndex === VISUAL_QUESTIONS.length - 1}
                progressPercent={getProgressPercent(questionIndex, VISUAL_QUESTIONS.length)}
                questionNumber={questionIndex + 1}
                totalQuestions={TOTAL_STEPS}
                tts={tts}
              />
            )}

            {step === "email" && (
              <EmailStep
                key="email"
                initialEmail={(answers.contact_email as string) || ""}
                onSubmit={handleEmailSubmit}
                onPrevious={handlePrevious}
                isSubmitting={isSubmitting}
                progressPercent={100}
                questionNumber={TOTAL_STEPS}
                totalQuestions={TOTAL_STEPS}
                tts={tts}
              />
            )}

            {step === "complete" && (
              <CompletionStep
                key="complete"
                answers={completionAnswers}
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
