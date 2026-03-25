import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { LanguageCode } from "@/lib/translations";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageStep } from "./LanguageStep";
import { MarianneIntroStep } from "./MarianneIntroStep";
import { DecisionQuestion } from "./DecisionQuestion";
import { ConsentStep } from "./ConsentStep";
import { CompletionStep } from "./CompletionStep";
import { 
  ONBOARDING_TREE, 
  getNextQuestion, 
  estimateTotalQuestions, 
  calculateLeadScore,
  determineRoute,
  OnboardingAnswers as TreeOnboardingAnswers,
  LeadRoute
} from "@/lib/decisionTree";
import { supabase } from "@/integrations/supabase/client";

type OnboardingStep = "language" | "intro" | "consent" | "questions" | "complete";

export interface OnboardingAnswers extends TreeOnboardingAnswers {
  leadRoute?: LeadRoute;
  leadScore?: number;
}

interface VocalOnboardingProps {
  onComplete?: (answers: OnboardingAnswers) => void;
}

export function VocalOnboarding({ onComplete }: VocalOnboardingProps) {
  const { setLanguage } = useLanguage();
  const [step, setStep] = useState<OnboardingStep>("language");
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(ONBOARDING_TREE.startQuestion);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswers>({ tags: [] });
  const [onboardingStartedAt] = useState(() => Date.now());

  // Get the current question from the tree
  const currentQuestion = ONBOARDING_TREE.questions[currentQuestionId];
  
  // Calculate progress dynamically
  const estimatedTotal = estimateTotalQuestions(answers);
  const currentQuestionNumber = questionHistory.length + 1;

  // Determine current route for display
  const currentRoute = determineRoute(answers);

  const handleLanguageSelect = (lang: LanguageCode) => {
    setLanguage(lang);
    setStep("intro");
  };

  const handleIntroComplete = () => {
    // Move consent to the beginning (after intro)
    setStep("consent");
  };

  // Handle consent acceptance - now at the beginning
  const handleConsentAccept = useCallback(async (leadSharing: boolean, marketing: boolean) => {
    // Store consent choices in answers
    setAnswers(prev => ({
      ...prev,
      consent_lead_sharing: leadSharing,
      consent_marketing: marketing,
    }));
    
    // Proceed to questions
    setStep("questions");
  }, []);

  // Handle consent decline - still allow to continue but flag it
  const handleConsentDecline = useCallback(() => {
    setAnswers(prev => ({
      ...prev,
      consent_lead_sharing: false,
      consent_marketing: false,
      tags: [...prev.tags, "consent_declined"],
    }));
    
    // Still proceed to questions (user can see the flow but won't be shared with partners)
    setStep("questions");
  }, []);

  const handleAnswer = useCallback((answer: string | number | string[], tags?: string[]) => {
    // Handle multiChoice answers (arrays)
    const answerValue = Array.isArray(answer) ? answer.join(",") : answer;
    
    // Collect all tags from multiChoice selections
    let allTags = tags ? [...tags] : [];
    if (Array.isArray(answer)) {
      // For multiChoice, extract tags from each selected choice
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

    // Save the answer and tags
    const newAnswers: OnboardingAnswers = {
      ...answers,
      [currentQuestionId]: answerValue,
      tags: allTags.length > 0 ? [...answers.tags, ...allTags] : answers.tags,
    };
    setAnswers(newAnswers);

    // Determine next question dynamically
    const nextQuestionId = getNextQuestion(currentQuestionId, answerValue, newAnswers);

    if (nextQuestionId) {
      setQuestionHistory((prev) => [...prev, currentQuestionId]);
      setCurrentQuestionId(nextQuestionId);
    } else {
      // End of questions - calculate score and route
      const route = determineRoute(newAnswers);
      const score = calculateLeadScore(newAnswers);
      
      const finalAnswers: OnboardingAnswers = {
        ...newAnswers,
        leadRoute: route,
        leadScore: score.total,
      };
      setAnswers(finalAnswers);
      setStep("complete");
    }
  }, [currentQuestionId, answers]);

  const handleSkip = useCallback(() => {
    // Determine next question dynamically (same as handleAnswer but without saving)
    const nextQuestionId = getNextQuestion(currentQuestionId, "", answers);
    
    if (nextQuestionId) {
      setQuestionHistory((prev) => [...prev, currentQuestionId]);
      setCurrentQuestionId(nextQuestionId);
    } else {
      setStep("complete");
    }
  }, [currentQuestionId, answers]);

  // Complete onboarding and save to database
  const handleComplete = useCallback(async () => {
    const email = answers.contact_email as string | undefined;
    
    if (email) {
      // Store email in localStorage for data management page
      localStorage.setItem("user_email", email);

      try {
        // Save consent to database
        const consentLeadSharing = answers.consent_lead_sharing as boolean | undefined;
        const consentMarketing = answers.consent_marketing as boolean | undefined;

        const consentsToInsert = [
          {
            email,
            consent_type: "lead_sharing" as const,
            consented: consentLeadSharing ?? false,
            consented_at: consentLeadSharing ? new Date().toISOString() : null,
            consent_text_version: "2.0", // Updated version for new flow
          },
          {
            email,
            consent_type: "marketing" as const,
            consented: consentMarketing ?? false,
            consented_at: consentMarketing ? new Date().toISOString() : null,
            consent_text_version: "2.0",
          },
        ];

        await supabase.from("consents").upsert(consentsToInsert, {
          onConflict: "email,consent_type",
        });

        // Create profile & auto-match leads by sector
        await supabase.functions.invoke("match-leads", {
          body: { answers, onboardingStartedAt },
        });
      } catch (error) {
        console.error("Error saving consents or matching:", error);
      }
    }

    // Store answers in localStorage for later use
    localStorage.setItem("onboarding_answers", JSON.stringify(answers));
    onComplete?.(answers);
  }, [answers, onComplete]);

  // Convert answers to display format for completion step
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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {step === "language" && (
            <LanguageStep 
              key="language" 
              onSelect={handleLanguageSelect} 
          />
          )}

          {step === "intro" && (
            <MarianneIntroStep
              key="intro"
              onContinue={handleIntroComplete}
            />
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
  );
}
