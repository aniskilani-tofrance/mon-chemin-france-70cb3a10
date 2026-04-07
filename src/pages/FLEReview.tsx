import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Mic, MicOff, RotateCcw, ArrowRight, ArrowLeft, CheckCircle2, XCircle, Loader2, Send, BookOpen, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { callFLEVoiceAI } from "@/lib/fleVoiceAI";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ReviewItem {
  id: string;
  exercise_id: string;
  module_id: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  exercise: {
    id: string;
    exercise_type: string;
    prompt_text: string | null;
    correct_answer: string | null;
    choices: any;
    hint_text: string | null;
  };
  module: {
    title: string;
    icon: string | null;
    cecrl_level: string;
  };
}

interface AIFeedback {
  score: number;
  feedback: string;
  correction: string | null;
  encouragement: string;
}

// SM-2 algorithm update
function sm2Update(item: ReviewItem, isCorrect: boolean) {
  if (isCorrect) {
    const reps = item.repetitions + 1;
    const ef = Math.max(1.3, item.ease_factor + 0.1);
    let interval: number;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(item.interval_days * ef);
    return { repetitions: reps, ease_factor: ef, interval_days: interval };
  } else {
    return { repetitions: 0, ease_factor: Math.max(1.3, item.ease_factor - 0.3), interval_days: 1 };
  }
}

const FLEReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const tts = useTTS({ language: "fr" });
  const stt = useSpeechRecognition({ language: "fr" });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const { data: reviewItems, isLoading } = useQuery({
    queryKey: ["fle-review-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get items due for review
      const { data: items, error } = await supabase
        .from("fle_review_items")
        .select("id, exercise_id, module_id, interval_days, ease_factor, repetitions")
        .eq("user_id", user.id)
        .lte("next_review_at", new Date().toISOString())
        .order("next_review_at")
        .limit(10);

      if (error) throw error;
      if (!items || items.length === 0) return [];

      // Fetch exercises and modules for these items
      const exerciseIds = items.map((i: any) => i.exercise_id);
      const moduleIds = [...new Set(items.map((i: any) => i.module_id))];

      const [{ data: exercises }, { data: modules }] = await Promise.all([
        supabase.from("fle_exercises").select("id, exercise_type, prompt_text, correct_answer, choices, hint_text").in("id", exerciseIds),
        supabase.from("fle_modules").select("id, title, icon, cecrl_level").in("id", moduleIds),
      ]);

      const exerciseMap = new Map((exercises || []).map((e: any) => [e.id, e]));
      const moduleMap = new Map((modules || []).map((m: any) => [m.id, m]));

      return items
        .map((item: any) => ({
          ...item,
          exercise: exerciseMap.get(item.exercise_id),
          module: moduleMap.get(item.module_id),
        }))
        .filter((item: any) => item.exercise && item.module) as ReviewItem[];
    },
    enabled: !!user,
  });

  const currentItem = reviewItems?.[currentIndex];
  const totalItems = reviewItems?.length || 0;
  const progressPercent = totalItems > 0 ? ((currentIndex + (answered ? 1 : 0)) / totalItems) * 100 : 0;

  useEffect(() => {
    if (currentItem?.exercise?.prompt_text && tts.isEnabled) {
      const timer = setTimeout(() => { tts.speak(currentItem.exercise.prompt_text!); }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentItem?.exercise?.id]);

  const updateReviewItem = useCallback(async (item: ReviewItem, isCorrect: boolean) => {
    const update = sm2Update(item, isCorrect);
    const nextReviewAt = new Date(Date.now() + update.interval_days * 86400000).toISOString();

    await supabase
      .from("fle_review_items")
      .update({
        repetitions: update.repetitions,
        ease_factor: update.ease_factor,
        interval_days: update.interval_days,
        next_review_at: nextReviewAt,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", item.id);
  }, []);

  const isOralExercise = currentItem?.exercise && [
    "listen_repeat", "oral_answer", "vocal_recognition", "reformulate",
    "role_play", "interview_sim", "vocal_dialogue"
  ].includes(currentItem.exercise.exercise_type);

  const isChoiceExercise = currentItem?.exercise && [
    "listen_choose", "image_word_audio", "complete_dialogue", "safety_instruction"
  ].includes(currentItem.exercise.exercise_type);

  const choices = currentItem?.exercise?.choices as string[] | null;

  const handleListen = useCallback(() => {
    if (currentItem?.exercise?.prompt_text) tts.speak(currentItem.exercise.prompt_text);
  }, [currentItem, tts]);

  const handleStartRecording = useCallback(() => { stt.reset(); stt.start(); }, [stt]);

  const submitOralAnswer = useCallback(async (userAnswer: string) => {
    if (!userAnswer.trim() || !currentItem) return;
    setIsLoadingAI(true);
    try {
      const result = await callFLEVoiceAI({
        action: "feedback",
        user_answer: userAnswer,
        expected_answer: currentItem.exercise.correct_answer || "",
        prompt_text: currentItem.exercise.prompt_text || "",
        exercise_type: currentItem.exercise.exercise_type,
        user_level: currentItem.module.cecrl_level || "a1",
        language: "fr",
      });
      const isCorrect = (result.score || 0) >= 60;
      if (isCorrect) setCorrectCount(c => c + 1);
      setAiFeedback({
        score: result.score || 0,
        feedback: result.feedback || "Bien essayé !",
        correction: result.correction || null,
        encouragement: result.encouragement || "Continue !",
      });
      setAnswered(true);
      if (tts.isEnabled) tts.speak(result.feedback || "Bien essayé !");
      await updateReviewItem(currentItem, isCorrect);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setIsLoadingAI(false);
    }
  }, [currentItem, tts, updateReviewItem]);

  const handleStopAndEvaluate = useCallback(async () => {
    stt.stop();
    await submitOralAnswer(stt.transcript || stt.interimTranscript);
  }, [stt, submitOralAnswer]);

  const handleValidateAnswer = useCallback(async () => {
    await submitOralAnswer(stt.transcript || stt.interimTranscript);
  }, [stt, submitOralAnswer]);

  const handleChoiceSelect = useCallback(async (choice: string) => {
    if (answered || !currentItem) return;
    setSelectedChoice(choice);
    setAnswered(true);
    const isCorrect = choice === currentItem.exercise.correct_answer;
    if (isCorrect) setCorrectCount(c => c + 1);
    setAiFeedback({
      score: isCorrect ? 100 : 0,
      feedback: isCorrect ? "Bravo ! 🎉" : "Ce n'est pas tout à fait ça.",
      correction: isCorrect ? null : `La bonne réponse : "${currentItem.exercise.correct_answer}"`,
      encouragement: isCorrect ? "Excellent !" : "Pas grave, on continue ! 💪",
    });
    if (tts.isEnabled) tts.speak(isCorrect ? "Bravo !" : "Essaie encore !");
    await updateReviewItem(currentItem, isCorrect);
  }, [answered, currentItem, tts, updateReviewItem]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(i => i + 1);
      setAnswered(false);
      setAiFeedback(null);
      setSelectedChoice(null);
      stt.reset();
    } else {
      setReviewDone(true);
      queryClient.invalidateQueries({ queryKey: ["fle-review-items"] });
    }
  }, [currentIndex, totalItems, stt, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No items to review
  if (!reviewItems || reviewItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <Sparkles className="h-16 w-16 mx-auto text-amber-400 mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Tout est à jour ! 🎉</h1>
            <p className="text-muted-foreground mb-6">Vous n'avez rien à réviser pour le moment. Revenez demain !</p>
            <Button onClick={() => navigate("/fle")} variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" /> Retour au dashboard
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  // Review complete
  if (reviewDone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ type: "spring" }}>
              <Sparkles className="h-16 w-16 mx-auto text-amber-400 mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Révision terminée ! 🎉</h1>
            <p className="text-muted-foreground mb-2">
              {correctCount}/{totalItems} bonnes réponses
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Les exercices révisés reviendront selon votre progression.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/fle")} className="gap-2">
                <BookOpen className="h-4 w-4" /> Dashboard
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-20 pb-8 sm:pt-24 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate("/fle")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <span className="text-sm font-medium text-foreground">
              🔄 Révision {currentIndex + 1}/{totalItems}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {currentItem?.module && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {currentItem.module.icon || "📖"} {currentItem.module.title}
            </p>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex-1 flex flex-col">
            {/* Prompt */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-6 shadow-sm">
              <p className="text-xl font-semibold text-foreground leading-relaxed text-center">
                {currentItem?.exercise?.prompt_text || "…"}
              </p>
              <div className="flex justify-center mt-4">
                <Button variant="outline" size="lg" onClick={handleListen} className="rounded-full gap-2" disabled={tts.isSpeaking}>
                  <Volume2 className={`h-5 w-5 ${tts.isSpeaking ? "animate-pulse text-primary" : ""}`} />
                  {tts.isSpeaking ? "Écoute…" : "🔊 Écouter"}
                </Button>
              </div>
            </div>

            {/* Oral */}
            {isOralExercise && !answered && (
              <div className="flex flex-col items-center gap-4 mb-6">
                {(stt.transcript || stt.interimTranscript) && (
                  <div className="w-full rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Vous avez dit :</p>
                    <p className="text-lg font-medium text-foreground">{stt.transcript}{stt.interimTranscript && <span className="text-muted-foreground/60">{stt.interimTranscript}</span>}</p>
                  </div>
                )}
                <div className="flex gap-3">
                  {!stt.isListening ? (
                    <Button size="lg" onClick={handleStartRecording} className="rounded-full h-16 w-16 p-0 bg-primary hover:bg-primary/90 shadow-lg">
                      <Mic className="h-7 w-7" />
                    </Button>
                  ) : (
                    <Button size="lg" onClick={handleStopAndEvaluate} className="rounded-full h-16 w-16 p-0 bg-destructive hover:bg-destructive/90 shadow-lg animate-pulse">
                      <MicOff className="h-7 w-7" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stt.isListening ? "🎤 Parlez…" : "Appuyez pour parler"}</p>
                {!stt.isListening && (stt.transcript || stt.interimTranscript) && !isLoadingAI && (
                  <Button size="lg" onClick={handleValidateAnswer} className="w-full max-w-xs gap-2 mt-2">
                    <Send className="h-5 w-5" /> Valider
                  </Button>
                )}
              </div>
            )}

            {/* Choices */}
            {isChoiceExercise && choices && choices.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
                {choices.map((choice: string, i: number) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrectChoice = answered && choice === currentItem?.exercise?.correct_answer;
                  const isWrong = answered && isSelected && !isCorrectChoice;
                  return (
                    <button
                      key={i}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={answered}
                      className={`rounded-xl border-2 p-4 text-left text-base font-medium transition-all ${
                        isCorrectChoice ? "border-green-500 bg-green-50 text-green-700"
                        : isWrong ? "border-destructive bg-destructive/5 text-destructive"
                        : isSelected ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isCorrectChoice && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {isWrong && <XCircle className="h-5 w-5 text-destructive" />}
                        {choice}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {isLoadingAI && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyse…</span>
              </div>
            )}

            {/* Feedback */}
            {aiFeedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 mb-6 ${aiFeedback.score >= 60 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{aiFeedback.score >= 60 ? "🎉" : "💪"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{aiFeedback.feedback}</p>
                    {aiFeedback.correction && <p className="text-sm text-foreground/80 mt-1">✏️ {aiFeedback.correction}</p>}
                    <p className="text-sm text-muted-foreground mt-2 italic">{aiFeedback.encouragement}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="mt-auto flex gap-3 justify-center pt-4">
              {answered && (
                <Button onClick={handleNext} className="gap-2">
                  {currentIndex < totalItems - 1 ? <>Suivant <ArrowRight className="h-4 w-4" /></> : <>Terminer 🎉</>}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FLEReview;
