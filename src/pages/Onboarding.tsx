import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { Header } from "@/components/Header";
import { LanguageStep } from "@/components/VocalOnboarding/LanguageStep";
import { OnboardingPathChoice } from "@/components/VocalOnboarding/OnboardingPathChoice";

import { CompletionStep } from "@/components/VocalOnboarding/CompletionStep";
import { ChatOnboarding } from "@/components/VocalOnboarding/ChatOnboarding";
import { useLanguage } from "@/hooks/useLanguage";
import { useTTS } from "@/hooks/useTTS";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/lib/translations";
import {
  calculateLeadScore,
  calculateDistanceToJob,
  determineRoute,
  OnboardingAnswers as TreeOnboardingAnswers,
  LeadRoute,
} from "@/lib/decisionTree";

type OnboardingStep = "language" | "path-choice" | "chat" | "complete";

interface OnboardingAnswers extends TreeOnboardingAnswers {
  leadRoute?: LeadRoute;
  leadScore?: number;
  consent_lead_sharing?: boolean;
  consent_marketing?: boolean;
}

const SOUND_TEXT: Record<LanguageCode, { on: string; off: string; enable: string; disable: string }> = {
  fr: { on: "Son ON", off: "Son OFF", enable: "Activer le son", disable: "Désactiver le son" },
  en: { on: "Sound ON", off: "Sound OFF", enable: "Enable sound", disable: "Disable sound" },
  ar: { on: "الصوت مُفعَّل", off: "الصوت مُعطَّل", enable: "تفعيل الصوت", disable: "إيقاف الصوت" },
  es: { on: "Sonido ON", off: "Sonido OFF", enable: "Activar sonido", disable: "Desactivar sonido" },
  pt: { on: "Som ON", off: "Som OFF", enable: "Ativar som", disable: "Desativar som" },
  ru: { on: "Звук ON", off: "Звук OFF", enable: "Включить звук", disable: "Выключить звук" },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const tts = useTTS({ language });
  const { track } = useAnalytics();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("language");
  const [answers, setAnswers] = useState<OnboardingAnswers>({ tags: [] });
  const [onboardingStartedAt] = useState(() => Date.now());
  const [resumeQuestion, setResumeQuestion] = useState<string | null>(null);
  const [resumeCheckpointId, setResumeCheckpointId] = useState<string | null>(null);
  const [checkpointLoaded, setCheckpointLoaded] = useState(false);

  const isRTL = language === "ar";
  const soundText = SOUND_TEXT[language] || SOUND_TEXT.fr;

  // Load checkpoint for authenticated users
  useEffect(() => {
    if (authLoading || checkpointLoaded) return;
    setCheckpointLoaded(true);
    if (!user) return;

    (async () => {
      try {
        const { data } = await supabase
          .from("onboarding_checkpoints")
          .select("id, partial_answers, current_step, language")
          .eq("user_id", user.id)
          .eq("completed", false)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && data.current_step && data.partial_answers) {
          const savedAnswers = data.partial_answers as Record<string, any>;
          setAnswers(prev => ({ ...prev, ...savedAnswers }));
          setResumeQuestion(data.current_step);
          setResumeCheckpointId(data.id);
          if (data.language) setLanguage(data.language as LanguageCode);
          setStep("chat");
          console.log("[Onboarding] Resuming from checkpoint:", data.current_step);
        }
      } catch (err) {
        console.error("Error loading checkpoint:", err);
      }
    })();
  }, [user, authLoading, checkpointLoaded]);

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
    setStep("chat");
  };

  const handleChatComplete = useCallback((chatAnswers: TreeOnboardingAnswers) => {
    const route = determineRoute(chatAnswers);
    const score = calculateLeadScore(chatAnswers);
    const distanceToJob = calculateDistanceToJob(chatAnswers);
    const finalAnswers: OnboardingAnswers = {
      ...answers,
      ...chatAnswers,
      leadRoute: route,
      leadScore: score.total,
      distance_to_job: distanceToJob,
    };
    setAnswers(finalAnswers);
    setStep("complete");
  }, [answers]);

  const handleComplete = useCallback(async () => {
    track("onboarding_completed", { route: answers.leadRoute ?? "unknown", score: answers.leadScore ?? 0 }, "/onboarding", language);
    const email = answers.contact_email as string | undefined;

    // 1. Save onboarding results to database FIRST (secure audit trail)
    try {
      await supabase.from("onboarding_results").insert([{
        email: email || null,
        language,
        answers: JSON.parse(JSON.stringify(answers)),
        french_level_cecrl: (answers.french_level_cecrl as string) || null,
        main_goal: (answers.main_goal as string) || null,
        target_sector: (answers.target_sector as string) || null,
        lead_route: answers.leadRoute ?? null,
        lead_score: answers.leadScore ?? null,
        distance_to_job: answers.distance_to_job ?? null,
        work_right: (answers.work_right as string) || null,
        literacy: (answers.literacy as string) || null,
        barriers: Array.isArray(answers.barriers) ? answers.barriers as string[] : null,
      }]);
    } catch (error) {
      console.error("Error saving onboarding results:", error);
    }

    // 2. Save consents and match leads
    if (email) {
      localStorage.setItem("user_email", email);

      try {
        const consentsToInsert = [
          {
            email,
            consent_type: "lead_sharing" as const,
            consented: answers.consent_lead_sharing ?? false,
            consented_at: answers.consent_lead_sharing ? new Date().toISOString() : null,
            consent_text_version: "4.0",
          },
          {
            email,
            consent_type: "marketing" as const,
            consented: answers.consent_marketing ?? false,
            consented_at: answers.consent_marketing ? new Date().toISOString() : null,
            consent_text_version: "4.0",
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
  }, [answers, navigate, language, track, onboardingStartedAt]);

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

      <div className="flex-1 flex items-start justify-center px-4 pt-20 pb-4 sm:pt-24 overflow-hidden">
        <div className="w-full max-w-2xl h-full">
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

            {step === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-[calc(100vh-7rem)]"
              >
                <ChatOnboarding
                  onComplete={handleChatComplete}
                  initialAnswers={answers}
                  resumeFromQuestion={resumeQuestion}
                  resumeCheckpointId={resumeCheckpointId}
                />
              </motion.div>
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
