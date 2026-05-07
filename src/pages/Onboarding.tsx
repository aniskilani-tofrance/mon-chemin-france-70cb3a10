import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast as sonnerToast } from "sonner";
import { Header } from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LanguageStep } from "@/components/VocalOnboarding/LanguageStep";

import { CompletionStep } from "@/components/VocalOnboarding/CompletionStep";
import { VisualQuestionStep } from "@/components/VisualOnboarding/VisualQuestionStep";
import { VisualRecapStep } from "@/components/VisualOnboarding/VisualRecapStep";
import { PostalCodeStep } from "@/components/VisualOnboarding/PostalCodeStep";
import { ContactStep } from "@/components/VisualOnboarding/ContactStep";
import { EmailStep } from "@/components/VisualOnboarding/EmailStep";
import { MagicLinkSentStep } from "@/components/VisualOnboarding/MagicLinkSentStep";
import { useLanguage } from "@/hooks/useLanguage";
import { useTTS } from "@/hooks/useTTS";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useOnboardingCheckpoint } from "@/hooks/useOnboardingCheckpoint";
import { supabase } from "@/integrations/supabase/client";
import { LanguageCode } from "@/lib/translations";
import { VISUAL_QUESTIONS, getProgressPercent } from "@/lib/visualQuestions";
import { computeOrientation } from "@/lib/orientationEngine";
import { calculateUnifiedLeadScore } from "@/lib/leadScoring";
import { getLeadSourcePrefill, resolveLeadSource } from "@/lib/leadSources";
import { mapAnswersToV2 } from "@/lib/mapAnswersToV2";
import { toast } from "@/hooks/use-toast";
import { normalizeMarianneAccessCode } from "@/lib/marianneAccessCode";
import { preloadOnboardingIllustrations } from "@/lib/onboardingIllustrations";

type OnboardingStep = "language" | "visual-quiz" | "recap" | "postal-code" | "contact" | "email" | "magic-link-sent" | "complete";

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

// totalSteps dynamique : calculé via activeQuestions (certaines questions sont conditionnelles)

const Onboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const tts = useTTS({ language });
  const { track } = useAnalytics();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { saveCheckpoint, loadCheckpoint, markCompleted } = useOnboardingCheckpoint();

  const [step, setStep] = useState<OnboardingStep>("language");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<VisualAnswers>({});
  const [postalCode, setPostalCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [isResending, setIsResending] = useState(false);
  const [onboardingStartedAt] = useState(() => Date.now());
  const [completionAnswers, setCompletionAnswers] = useState<Record<string, string>>({});
  const [resumed, setResumed] = useState(false);
  
  const resumeAttemptedRef = useRef(false);
  const prefillAppliedRef = useRef<string | null>(null);

  const isRTL = language === "ar";
  const soundText = SOUND_TEXT[language] || SOUND_TEXT.fr;

  // Filtre les questions selon les conditions showIf (parcours conditionnels)
  const activeQuestions = useMemo(
    () => VISUAL_QUESTIONS.filter((q) => !q.showIf || q.showIf(answers)),
    [answers]
  );
  const totalSteps = activeQuestions.length + 3; // + postal + contact + email
  const leadSource = useMemo(() => resolveLeadSource(searchParams.get("source")), [searchParams]);

  // ─── Reprise via ?resume=1 ou utilisateur connecté ──────────
  useEffect(() => {
    if (resumeAttemptedRef.current) return;
    resumeAttemptedRef.current = true;
    const shouldResume = searchParams.get("resume") === "1" || !!user;
    if (!shouldResume) return;
    (async () => {
      const cp = await loadCheckpoint();
      if (!cp) return;
      if (cp.completed) {
        navigate("/confirmation");
        return;
      }
      // Restaure langue
      if (cp.language && cp.language !== language) {
        setLanguage(cp.language as LanguageCode);
      }
      const partial = (cp.partial_answers || {}) as VisualAnswers & { postal_code?: string };
      setAnswers(partial);
      if (partial.postal_code && typeof partial.postal_code === "string") {
        setPostalCode(partial.postal_code);
      }

      // Détermine la dernière question répondue → on saute à la SUIVANTE non répondue
      // (ou au postal-code / email si toutes les questions sont OK)
      let lastAnsweredIdx = -1;
      activeQuestions.forEach((q, i) => {
        const v = partial[q.id];
        const has = Array.isArray(v) ? v.length > 0 : !!v;
        if (has) lastAnsweredIdx = Math.max(lastAnsweredIdx, i);
      });

      // Step actuel persisté
      const cs = cp.current_step;
      let resolvedStep: OnboardingStep = "visual-quiz";
      let resolvedIdx = 0;

      if (cs === "email" || (partial.postal_code && partial.contact_firstname && partial.contact_phone)) {
        resolvedStep = "email";
      } else if (cs === "contact" || (partial.postal_code && (!partial.contact_firstname || !partial.contact_phone))) {
        resolvedStep = "contact";
      } else if (cs === "postal-code" || (lastAnsweredIdx === activeQuestions.length - 1 && !partial.postal_code)) {
        resolvedStep = "postal-code";
      } else {
        // Saut direct à la dernière question répondue (ou la suivante non répondue)
        resolvedStep = "visual-quiz";
        if (lastAnsweredIdx >= 0) {
          // On reprend SUR la dernière question répondue pour permettre de la modifier
          resolvedIdx = Math.min(lastAnsweredIdx, activeQuestions.length - 1);
        } else if (cs?.startsWith("q:")) {
          const qid = cs.slice(2);
          const idx = activeQuestions.findIndex((q) => q.id === qid);
          if (idx >= 0) resolvedIdx = idx;
        }
      }

      setStep(resolvedStep);
      setQuestionIndex(resolvedIdx);
      setResumed(true);

      // Toast sonner avec position dans le parcours
      const stepLabel =
        resolvedStep === "email"
          ? totalSteps
          : resolvedStep === "postal-code"
          ? activeQuestions.length + 1
          : resolvedIdx + 1;
      sonnerToast.success(t("onboardingVisual.resume.toast_title"), {
        description: t("onboardingVisual.resume.toast_description", {
          current: stepLabel,
          total: totalSteps,
        }),
        duration: 5000,
        icon: "👋",
      });

      track("onboarding_resumed", { from_step: cs, resumed_to: resolvedStep, idx: resolvedIdx }, "/onboarding", language);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, loadCheckpoint, navigate]);

  useEffect(() => {
    track("onboarding_step", { step }, "/onboarding", language);
  }, [step]);

  const persistCheckpoint = useCallback(
    (nextStep: string, nextAnswers: VisualAnswers, email?: string) => {
      saveCheckpoint({
        step: nextStep,
        answers: nextAnswers,
        email,
        language,
      });
    },
    [saveCheckpoint, language]
  );

  useEffect(() => {
    if (leadSource.slug === "tofrance" || prefillAppliedRef.current === leadSource.slug) return;
    prefillAppliedRef.current = leadSource.slug;
    const prefilled = getLeadSourcePrefill(leadSource);
    setAnswers((current) => {
      const next = { ...prefilled, ...current } as VisualAnswers;
      persistCheckpoint("language", next);
      return next;
    });
    track("onboarding_source_prefilled", { source: leadSource.slug, location: leadSource.name }, "/onboarding", language);
  }, [leadSource, persistCheckpoint, track, language]);

  const handleLanguageSelect = (lang: LanguageCode) => {
    track("onboarding_language_selected", { lang }, "/onboarding", lang);
    setLanguage(lang);
    setStep("visual-quiz");
    setQuestionIndex(0);
  };

  const currentQuestion = activeQuestions[questionIndex];

  useEffect(() => {
    if (step !== "visual-quiz") return;
    const nearbyImages = activeQuestions
      .slice(questionIndex, questionIndex + 3)
      .flatMap((question) => question.options.map((option) => option.illustration));
    preloadOnboardingIllustrations(nearbyImages);
  }, [activeQuestions, questionIndex, step]);

  const handleAnswerChange = (value: string | string[]) => {
    if (!currentQuestion) return;
    const next = { ...answers, [currentQuestion.id]: value };
    setAnswers(next);
    persistCheckpoint(`q:${currentQuestion.id}`, next);
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    track("onboarding_question_answered", { questionId: currentQuestion.id }, "/onboarding", language);

    if (questionIndex < activeQuestions.length - 1) {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      persistCheckpoint(`q:${activeQuestions[nextIdx].id}`, answers);
    } else {
      // Dernière question → écran récapitulatif
      setStep("recap");
      persistCheckpoint("recap", answers);
    }
  };

  const handleRecapConfirm = () => {
    track("onboarding_recap_confirmed", {}, "/onboarding", language);
    setStep("postal-code");
    persistCheckpoint("postal-code", answers);
  };

  const handleEditFromRecap = (idx: number) => {
    track("onboarding_recap_edit", { questionIndex: idx }, "/onboarding", language);
    setQuestionIndex(idx);
    setStep("visual-quiz");
  };

  const handlePrevious = () => {
    if (step === "email") {
      setStep("contact");
      return;
    }
    if (step === "contact") {
      setStep("postal-code");
      return;
    }
    if (step === "postal-code") {
      setStep("recap");
      return;
    }
    if (step === "recap") {
      setStep("visual-quiz");
      setQuestionIndex(activeQuestions.length - 1);
      return;
    }
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else {
      setStep("language");
    }
  };

  const handlePostalSubmit = (code: string) => {
    setPostalCode(code);
    const next = { ...answers, postal_code: code };
    setAnswers(next);
    persistCheckpoint("contact", next);
    setStep("contact");
  };

  const handleContactSubmit = (data: { firstname: string; phone: string }) => {
    const next = { ...answers, contact_firstname: data.firstname, contact_phone: data.phone };
    setAnswers(next);
    persistCheckpoint("email", next);
    setStep("email");
  };

  const handleEmailSubmit = useCallback(
    async (data: { email: string; consent_lead_sharing: boolean; consent_marketing: boolean }) => {
      setIsSubmitting(true);

      const flat: Record<string, any> = {
        ...getLeadSourcePrefill(leadSource),
        ...answers,
        postal_code: postalCode,
        source_location_id: leadSource.id,
        source_name: leadSource.name,
        source_type: leadSource.type,
        source_campaign: leadSource.campaign,
        source_slug: leadSource.slug,
        source_location: leadSource.name,
      };

      const v2Answers = mapAnswersToV2({
        main_goal: flat.main_goal,
        work_right: flat.work_right,
        french_level_cecrl: flat.french_level_cecrl,
        target_sector: flat.target_sector,
        barriers: flat.barriers,
        contact_48h: flat.contact_48h,
        diploma_level: flat.diploma_level,
        continue_field: flat.continue_field,
      });
      const orientation = computeOrientation(v2Answers);
      const leadScore = calculateUnifiedLeadScore({
        ...flat,
        contact_email: data.email,
        consent_lead_sharing: data.consent_lead_sharing,
      }).total;

      track("onboarding_completed", { route: orientation.parcours, score: leadScore, source: leadSource.slug }, "/onboarding", language);

      try {
        const { data: insertedResult, error: resultError } = await supabase.from("onboarding_results").insert([
          {
            user_id: user?.id ?? null,
            email: data.email,
            first_name: String(flat.contact_firstname || "").trim(),
            phone: String(flat.contact_phone || "").trim(),
            language,
            answers: JSON.parse(JSON.stringify({
              ...flat,
              contact_email: data.email,
              consent_lead_sharing: data.consent_lead_sharing,
              consent_marketing: data.consent_marketing,
            })),
            french_level_cecrl: (flat.french_level_cecrl as string) || null,
            main_goal: (flat.main_goal as string) || null,
            target_sector: (flat.target_sector as string) || null,
            lead_route: orientation.parcours,
            lead_score: leadScore,
            work_right: (flat.work_right as string) || null,
            literacy: (flat.literacy as string) || null,
            barriers: Array.isArray(flat.barriers) ? (flat.barriers as string[]) : null,
            source_location_id: leadSource.id,
            source_name: leadSource.name,
            source_type: leadSource.type,
            source_campaign: leadSource.campaign,
          } as any,
        ]).select("id").single();
        if (resultError) throw resultError;

        if (insertedResult?.id) {
          supabase.functions.invoke("sync-hubspot-diagnostic", {
            body: { diagnosticType: "marianne", diagnosticId: insertedResult.id },
          }).catch((error) => console.error("HubSpot sync error:", error));
        }
      } catch (error) {
        console.error("Error saving onboarding results:", error);
      }

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
        await supabase.from("consents").upsert(consentsToInsert, { onConflict: "email,consent_type" });

        await supabase.functions.invoke("match-leads", {
          body: {
            answers: { ...flat, contact_email: data.email, leadRoute: orientation.parcours, leadScore },
            onboardingStartedAt,
          },
        });
      } catch (error) {
        console.error("Error saving consents or matching:", error);
      }

      // Magic link → crée le compte automatiquement et permet la reprise
      let magicSent = false;
      if (!user) {
        try {
          const { error: otpError } = await supabase.auth.signInWithOtp({
            email: data.email,
            options: {
              emailRedirectTo: `${window.location.origin}/onboarding?resume=1`,
              shouldCreateUser: true,
              data: { language, source: "onboarding_visual" },
            },
          });
          if (otpError) {
            console.error("Magic link error:", otpError);
          } else {
            magicSent = true;
            setMagicLinkSent(true);
            setSubmittedEmail(data.email);
          }
        } catch (e) {
          console.error("OTP exception:", e);
        }
      }

      // Sauvegarde checkpoint avec email pour reprise
      persistCheckpoint("email", flat, data.email);

      const finalAnswers = {
        ...flat,
        contact_email: data.email,
        leadRoute: orientation.parcours,
        leadScore,
      };
      localStorage.setItem("onboarding_answers", JSON.stringify(finalAnswers));

      const display: Record<string, string> = {};
      for (const [key, value] of Object.entries(finalAnswers)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) display[key] = value.join(",");
        else display[key] = String(value);
      }
      setCompletionAnswers(display);

      await markCompleted();

      setIsSubmitting(false);
      // Si magic link envoyé → écran de confirmation, sinon directement complete
      setStep(magicSent ? "magic-link-sent" : "complete");
    },
    [answers, postalCode, language, onboardingStartedAt, track, user, persistCheckpoint, markCompleted, leadSource]
  );

  const handleResendMagicLink = useCallback(async () => {
    if (!submittedEmail || isResending) return;
    setIsResending(true);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: submittedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding?resume=1`,
          shouldCreateUser: true,
          data: { language, source: "onboarding_visual_resend" },
        },
      });
      if (otpError) {
        toast({
          title: "Erreur",
          description: otpError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email renvoyé",
          description: "Un nouveau lien magique vous a été envoyé.",
        });
      }
    } catch (e) {
      console.error("Resend OTP exception:", e);
    } finally {
      setIsResending(false);
    }
  }, [submittedEmail, isResending, language]);

  const handleComplete = useCallback(() => {
    navigate("/confirmation");
  }, [navigate]);

  // Numérotation pour la barre de progression
  // L'écran "recap" partage la position de la dernière question (pas une étape supplémentaire dans le compte)
  const stepNumber =
    step === "visual-quiz"
      ? questionIndex + 1
      : step === "recap"
      ? activeQuestions.length
      : step === "postal-code"
      ? activeQuestions.length + 1
      : step === "contact"
      ? activeQuestions.length + 2
      : step === "email"
      ? totalSteps
      : 1;

  const progressPercent =
    step === "visual-quiz"
      ? getProgressPercent(questionIndex, activeQuestions.length)
      : step === "recap"
      ? Math.round((activeQuestions.length / totalSteps) * 100)
      : step === "postal-code"
      ? Math.round(((activeQuestions.length + 1) / totalSteps) * 100)
      : step === "contact"
      ? Math.round(((activeQuestions.length + 2) / totalSteps) * 100)
      : 100;

  


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
          <AnimatePresence>
            {resumed && step !== "complete" && step !== "magic-link-sent" && step !== "language" && (
              <motion.div
                key="resume-banner"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-4 overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-foreground">
                      {t("onboardingVisual.resume.toast_title")}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {t("onboardingVisual.resume.banner")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResumed(false)}
                    aria-label="Close"
                    className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === "language" && <LanguageStep key="language" onSelect={handleLanguageSelect} />}


            {step === "visual-quiz" && currentQuestion && (
              <VisualQuestionStep
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={handleAnswerChange}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={questionIndex === 0}
                isLast={questionIndex === activeQuestions.length - 1}
                progressPercent={progressPercent}
                questionNumber={stepNumber}
                totalQuestions={totalSteps}
                tts={tts}
              />
            )}

            {step === "recap" && (
              <VisualRecapStep
                key="recap"
                answers={answers}
                onEditQuestion={handleEditFromRecap}
                onNext={handleRecapConfirm}
                onPrevious={handlePrevious}
                progressPercent={progressPercent}
                questionNumber={stepNumber}
                totalQuestions={totalSteps}
                tts={tts}
              />
            )}

            {step === "postal-code" && (
              <PostalCodeStep
                key="postal-code"
                initialValue={postalCode}
                onSubmit={handlePostalSubmit}
                onPrevious={handlePrevious}
                progressPercent={progressPercent}
                questionNumber={stepNumber}
                totalQuestions={totalSteps}
                tts={tts}
              />
            )}

            {step === "contact" && (
              <ContactStep
                key="contact"
                initialFirstname={(answers.contact_firstname as string) || ""}
                initialPhone={(answers.contact_phone as string) || ""}
                onSubmit={handleContactSubmit}
                onPrevious={handlePrevious}
                progressPercent={progressPercent}
                questionNumber={stepNumber}
                totalQuestions={totalSteps}
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
                questionNumber={totalSteps}
                totalQuestions={totalSteps}
                tts={tts}
              />
            )}

            {step === "magic-link-sent" && (
              <MagicLinkSentStep
                key="magic-link-sent"
                email={submittedEmail}
                onContinue={() => setStep("complete")}
                onResend={handleResendMagicLink}
                isResending={isResending}
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
