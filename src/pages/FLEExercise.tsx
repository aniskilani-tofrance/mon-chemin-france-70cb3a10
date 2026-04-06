import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Volume2, Mic, MicOff, RotateCcw, ArrowRight, ArrowLeft, 
  CheckCircle2, XCircle, Lightbulb, Loader2 
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { callFLEVoiceAI } from "@/lib/fleVoiceAI";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface Exercise {
  id: string;
  exercise_type: string;
  prompt_text: string | null;
  correct_answer: string | null;
  choices: any;
  hint_text: string | null;
  sort_order: number;
}

interface AIFeedback {
  score: number;
  feedback: string;
  correction: string | null;
  encouragement: string;
  pronunciation_tip: string | null;
}

const EXERCISE_LABELS: Record<string, { icon: string; label: string; instruction: string }> = {
  listen_repeat: { icon: "🔊", label: "Écouter et répéter", instruction: "Écoutez, puis répétez à voix haute" },
  listen_choose: { icon: "👂", label: "Écouter et choisir", instruction: "Écoutez, puis choisissez la bonne réponse" },
  oral_answer: { icon: "🗣️", label: "Répondre à l'oral", instruction: "Répondez à la question à voix haute" },
  vocal_recognition: { icon: "🎤", label: "Prononciation", instruction: "Répétez la phrase le plus clairement possible" },
  image_word_audio: { icon: "🖼️", label: "Image et mot", instruction: "Associez l'image au bon mot" },
  reformulate: { icon: "✏️", label: "Reformuler", instruction: "Reformulez la phrase avec vos mots" },
  complete_dialogue: { icon: "💬", label: "Compléter le dialogue", instruction: "Complétez la phrase manquante" },
  role_play: { icon: "🎭", label: "Jeu de rôle", instruction: "Jouez votre rôle dans cette situation" },
  interview_sim: { icon: "🤝", label: "Simulation d'entretien", instruction: "Répondez comme dans un vrai entretien" },
  safety_instruction: { icon: "🦺", label: "Sécurité", instruction: "Comprenez cette consigne de sécurité" },
  vocal_dialogue: { icon: "🤖", label: "Dialogue avec Marianne", instruction: "Parlez avec Marianne" },
};

const FLEExercise = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const tts = useTTS({ language: "fr" });
  const stt = useSpeechRecognition({ language: "fr" });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Fetch exercises for this module
  const { data: exercises, isLoading } = useQuery({
    queryKey: ["fle-exercises", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fle_exercises")
        .select("*")
        .eq("module_id", moduleId!)
        .order("sort_order");
      if (error) throw error;
      return (data || []) as unknown as Exercise[];
    },
    enabled: !!moduleId,
  });

  // Fetch module info
  const { data: moduleInfo } = useQuery({
    queryKey: ["fle-module", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fle_modules")
        .select("title, cecrl_level, icon")
        .eq("id", moduleId!)
        .single();
      if (error) throw error;
      return data as { title: string; cecrl_level: string; icon: string };
    },
    enabled: !!moduleId,
  });

  const currentExercise = exercises?.[currentIndex];
  const totalExercises = exercises?.length || 0;
  const progressPercent = totalExercises > 0 ? ((currentIndex + (answered ? 1 : 0)) / totalExercises) * 100 : 0;
  const exerciseConfig = currentExercise ? EXERCISE_LABELS[currentExercise.exercise_type] || EXERCISE_LABELS.oral_answer : null;

  // Auto-play prompt when exercise changes
  useEffect(() => {
    if (currentExercise?.prompt_text && tts.isEnabled) {
      const timer = setTimeout(() => {
        tts.speak(currentExercise.prompt_text!);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentExercise?.id]);

  const handleListen = useCallback(() => {
    if (currentExercise?.prompt_text) {
      tts.speak(currentExercise.prompt_text);
    }
  }, [currentExercise, tts]);

  const handleStartRecording = useCallback(() => {
    stt.reset();
    stt.start();
  }, [stt]);

  const handleStopAndEvaluate = useCallback(async () => {
    stt.stop();
    const userAnswer = stt.transcript || stt.interimTranscript;
    if (!userAnswer.trim() || !currentExercise) return;

    setIsLoadingAI(true);
    try {
      const result = await callFLEVoiceAI({
        action: "feedback",
        user_answer: userAnswer,
        expected_answer: currentExercise.correct_answer || "",
        prompt_text: currentExercise.prompt_text || "",
        exercise_type: currentExercise.exercise_type,
        user_level: moduleInfo?.cecrl_level || "a1",
        language: "fr",
      });

      const feedback: AIFeedback = {
        score: result.score || 0,
        feedback: result.feedback || "Bien essayé !",
        correction: result.correction || null,
        encouragement: result.encouragement || "Continue !",
        pronunciation_tip: result.pronunciation_tip || null,
      };

      setAiFeedback(feedback);
      setAnswered(true);
      if (feedback.score >= 60) setCorrectCount((c) => c + 1);

      // Read feedback aloud
      if (tts.isEnabled) {
        tts.speak(feedback.feedback);
      }

      // Save result
      if (user) {
        await supabase.from("fle_exercise_results").insert({
          user_id: user.id,
          exercise_id: currentExercise.id,
          module_id: moduleId!,
          user_answer: userAnswer,
          is_correct: feedback.score >= 60,
          oral_score: feedback.score,
          ai_feedback: feedback.feedback,
        } as any);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'évaluation");
    } finally {
      setIsLoadingAI(false);
    }
  }, [stt, currentExercise, moduleInfo, user, moduleId, tts]);

  const handleChoiceSelect = useCallback(async (choice: string) => {
    if (answered) return;
    setSelectedChoice(choice);
    setAnswered(true);

    const isCorrect = choice === currentExercise?.correct_answer;
    if (isCorrect) setCorrectCount((c) => c + 1);

    setAiFeedback({
      score: isCorrect ? 100 : 0,
      feedback: isCorrect ? "Bravo, c'est la bonne réponse ! 🎉" : "Ce n'est pas tout à fait ça.",
      correction: isCorrect ? null : `La bonne réponse est : "${currentExercise?.correct_answer}"`,
      encouragement: isCorrect ? "Excellent travail !" : "Pas grave, tu apprends ! 💪",
      pronunciation_tip: null,
    });

    if (tts.isEnabled) {
      tts.speak(isCorrect ? "Bravo !" : "Essaie encore la prochaine fois !");
    }
  }, [answered, currentExercise, tts]);

  const handleNext = useCallback(async () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
      setAiFeedback(null);
      setSelectedChoice(null);
      setShowHint(false);
      stt.reset();
    } else {
      // Module complete — save progress
      if (user && moduleId) {
        try {
          const score = Math.round((correctCount / totalExercises) * 100);
          const { data: existing } = await supabase
            .from("fle_module_progress")
            .select("id")
            .eq("user_id", user.id)
            .eq("module_id", moduleId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("fle_module_progress")
              .update({
                exercises_done: totalExercises,
                exercises_total: totalExercises,
                score,
                completed_at: new Date().toISOString(),
              } as any)
              .eq("id", existing.id);
          } else {
            await supabase
              .from("fle_module_progress")
              .insert({
                user_id: user.id,
                module_id: moduleId,
                exercises_done: totalExercises,
                exercises_total: totalExercises,
                score,
                completed_at: new Date().toISOString(),
                unlocked: true,
              } as any);
          }
        } catch (err) {
          console.error("Error saving module progress:", err);
        }
      }
      navigate(`/fle`);
      toast.success(`Module terminé ! Score : ${correctCount}/${totalExercises} 🎉`);
    }
  }, [currentIndex, totalExercises, correctCount, navigate, stt, user, moduleId]);

  const handleRetry = useCallback(() => {
    setAnswered(false);
    setAiFeedback(null);
    setSelectedChoice(null);
    stt.reset();
  }, [stt]);

  const isOralExercise = currentExercise && [
    "listen_repeat", "oral_answer", "vocal_recognition", "reformulate",
    "role_play", "interview_sim", "vocal_dialogue"
  ].includes(currentExercise.exercise_type);

  const isChoiceExercise = currentExercise && [
    "listen_choose", "image_word_audio", "complete_dialogue", "safety_instruction"
  ].includes(currentExercise.exercise_type);

  const choices = currentExercise?.choices as string[] | null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pt-24 text-center">
          <p className="text-lg text-muted-foreground">Ce module n'a pas encore d'exercices.</p>
          <p className="text-sm text-muted-foreground mt-2">De nouveaux contenus arrivent bientôt ! 🚀</p>
          <Button onClick={() => navigate("/fle")} className="mt-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour au dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-2xl px-4 pt-20 pb-8 sm:pt-24 flex flex-col">
        {/* Progress header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => navigate("/fle")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Retour
            </button>
            <span className="text-sm font-medium text-foreground">
              {currentIndex + 1} / {totalExercises}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {moduleInfo && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {moduleInfo.icon} {moduleInfo.title}
            </p>
          )}
        </div>

        {/* Exercise card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex-1 flex flex-col"
          >
            {/* Exercise type badge */}
            {exerciseConfig && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{exerciseConfig.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{exerciseConfig.label}</p>
                  <p className="text-xs text-muted-foreground">{exerciseConfig.instruction}</p>
                </div>
              </div>
            )}

            {/* Prompt card */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-6 shadow-sm">
              <p className="text-xl font-semibold text-foreground leading-relaxed text-center">
                {currentExercise?.prompt_text || "…"}
              </p>

              {/* Listen button */}
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleListen}
                  className="rounded-full gap-2"
                  disabled={tts.isSpeaking}
                >
                  <Volume2 className={`h-5 w-5 ${tts.isSpeaking ? "animate-pulse text-primary" : ""}`} />
                  {tts.isSpeaking ? "Écoute en cours…" : "🔊 Écouter"}
                </Button>
              </div>
            </div>

            {/* Oral exercise: mic controls */}
            {isOralExercise && !answered && (
              <div className="flex flex-col items-center gap-4 mb-6">
                {/* Transcript display */}
                {(stt.transcript || stt.interimTranscript) && (
                  <div className="w-full rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Vous avez dit :</p>
                    <p className="text-lg font-medium text-foreground">
                      {stt.transcript}
                      {stt.interimTranscript && (
                        <span className="text-muted-foreground/60">{stt.interimTranscript}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Mic button */}
                <div className="flex gap-3">
                  {!stt.isListening ? (
                    <Button
                      size="lg"
                      onClick={handleStartRecording}
                      className="rounded-full h-16 w-16 p-0 bg-primary hover:bg-primary/90 shadow-lg"
                    >
                      <Mic className="h-7 w-7" />
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={handleStopAndEvaluate}
                      className="rounded-full h-16 w-16 p-0 bg-destructive hover:bg-destructive/90 shadow-lg animate-pulse"
                    >
                      <MicOff className="h-7 w-7" />
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {stt.isListening ? "🎤 Je vous écoute… Appuyez pour terminer" : "Appuyez pour parler"}
                </p>

                {stt.error && (
                  <p className="text-xs text-destructive">{stt.error}</p>
                )}

                {!stt.isSupported && (
                  <p className="text-xs text-destructive">
                    La reconnaissance vocale n'est pas disponible sur ce navigateur.
                  </p>
                )}
              </div>
            )}

            {/* Choice exercise */}
            {isChoiceExercise && choices && choices.length > 0 && (
              <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-2">
                {choices.map((choice: string, i: number) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrect = answered && choice === currentExercise?.correct_answer;
                  const isWrong = answered && isSelected && !isCorrect;
                  return (
                    <button
                      key={i}
                      onClick={() => handleChoiceSelect(choice)}
                      disabled={answered}
                      className={`rounded-xl border-2 p-4 text-left text-base font-medium transition-all ${
                        isCorrect
                          ? "border-green-500 bg-green-50 text-green-700"
                          : isWrong
                          ? "border-destructive bg-destructive/5 text-destructive"
                          : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/30 hover:bg-accent/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {isWrong && <XCircle className="h-5 w-5 text-destructive" />}
                        {choice}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* AI Loading */}
            {isLoadingAI && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Marianne analyse votre réponse…</span>
              </div>
            )}

            {/* AI Feedback */}
            {aiFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border p-5 mb-6 ${
                  aiFeedback.score >= 60
                    ? "border-green-200 bg-green-50"
                    : "border-amber-200 bg-amber-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{aiFeedback.score >= 60 ? "🎉" : "💪"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{aiFeedback.feedback}</p>
                    {aiFeedback.correction && (
                      <p className="text-sm text-foreground/80 mt-1">
                        ✏️ {aiFeedback.correction}
                      </p>
                    )}
                    {aiFeedback.pronunciation_tip && (
                      <p className="text-sm text-primary mt-2 flex items-start gap-1">
                        <Volume2 className="h-4 w-4 mt-0.5 shrink-0" />
                        {aiFeedback.pronunciation_tip}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {aiFeedback.encouragement}
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex items-center justify-center mt-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    aiFeedback.score >= 80 ? "bg-green-100 text-green-700" :
                    aiFeedback.score >= 60 ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    Score : {aiFeedback.score}/100
                  </span>
                </div>
              </motion.div>
            )}

            {/* Hint */}
            {!answered && currentExercise?.hint_text && (
              <div className="mb-4 text-center">
                {showHint ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground bg-accent/30 rounded-lg p-3"
                  >
                    💡 {currentExercise.hint_text}
                  </motion.p>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
                  >
                    <Lightbulb className="h-4 w-4" /> Besoin d'un indice ?
                  </button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-auto flex gap-3 justify-center pt-4">
              {answered && (
                <>
                  <Button variant="outline" onClick={handleRetry} className="gap-2">
                    <RotateCcw className="h-4 w-4" /> Réessayer
                  </Button>
                  <Button onClick={handleNext} className="gap-2">
                    {currentIndex < totalExercises - 1 ? (
                      <>Suivant <ArrowRight className="h-4 w-4" /></>
                    ) : (
                      <>Terminer 🎉</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FLEExercise;
