import { motion } from "framer-motion";
import { Volume2, Mic, MicOff, RotateCcw, ArrowRight, CheckCircle2, Lightbulb, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Alpha-optimized exercise UI: huge buttons, pictograms, auto-play audio, minimal text.
 * Designed for illiterate / pre-A1 learners.
 */

interface AlphaExerciseProps {
  promptText: string | null;
  choices: string[] | null;
  exerciseType: string;
  isRecording: boolean;
  isLoadingAI: boolean;
  answered: boolean;
  selectedChoice: string | null;
  correctAnswer: string | null;
  aiFeedbackScore: number | null;
  aiFeedbackText: string | null;
  onListen: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onChoiceSelect: (choice: string) => void;
  onNext: () => void;
  onRetry: () => void;
  onShowHint: () => void;
  hintText: string | null;
  showHint: boolean;
  transcript: string;
}

const ACTION_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
  listen: { icon: <Volume2 className="h-10 w-10" />, label: "👂 Écouter" },
  speak: { icon: <Mic className="h-10 w-10" />, label: "🗣️ Parler" },
  stop: { icon: <MicOff className="h-10 w-10" />, label: "⏹️ Stop" },
  next: { icon: <ArrowRight className="h-10 w-10" />, label: "➡️ Suivant" },
  retry: { icon: <RotateCcw className="h-10 w-10" />, label: "🔄 Encore" },
  hint: { icon: <Lightbulb className="h-10 w-10" />, label: "💡 Aide" },
};

export function FLEAlphaExercise({
  promptText,
  choices,
  exerciseType,
  isRecording,
  isLoadingAI,
  answered,
  selectedChoice,
  correctAnswer,
  aiFeedbackScore,
  aiFeedbackText,
  onListen,
  onStartRecording,
  onStopRecording,
  onChoiceSelect,
  onNext,
  onRetry,
  onShowHint,
  hintText,
  showHint,
  transcript,
}: AlphaExerciseProps) {
  const isOral = ["listen_repeat", "oral_answer", "vocal_recognition", "reformulate", "role_play", "interview_sim", "vocal_dialogue"].includes(exerciseType);
  const isChoice = ["listen_choose", "image_word_audio", "complete_dialogue", "safety_instruction"].includes(exerciseType);
  const isCorrect = aiFeedbackScore !== null ? aiFeedbackScore >= 60 : selectedChoice === correctAnswer;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4">
      {/* Large prompt area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full rounded-3xl bg-card border-2 border-border p-8 text-center shadow-lg"
      >
        {promptText && (
          <p className="text-2xl font-bold text-foreground leading-relaxed mb-4">
            {promptText}
          </p>
        )}

        {/* Giant listen button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={onListen}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl"
          aria-label="Écouter"
        >
          <Volume2 className="h-10 w-10" />
        </motion.button>
        <p className="mt-2 text-lg font-bold text-muted-foreground">👂 Écouter</p>
      </motion.div>

      {/* Choice buttons - extra large for Alpha */}
      {isChoice && choices && !answered && (
        <div className="w-full grid grid-cols-1 gap-4">
          {choices.map((choice, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChoiceSelect(choice)}
              className="w-full rounded-2xl border-3 border-border bg-card p-6 text-xl font-bold text-foreground shadow-md hover:border-primary hover:bg-primary/5 transition-all active:bg-primary/10"
            >
              {choice}
            </motion.button>
          ))}
        </div>
      )}

      {/* Oral recording - giant mic button */}
      {isOral && !answered && (
        <div className="flex flex-col items-center gap-4">
          {isLoadingAI ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : isRecording ? (
            <>
              <motion.button
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                onClick={onStopRecording}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xl"
                aria-label="Arrêter"
              >
                <MicOff className="h-12 w-12" />
              </motion.button>
              <p className="text-lg font-bold text-destructive">⏹️ Appuyer pour arrêter</p>
              {transcript && (
                <p className="text-base text-muted-foreground italic">"{transcript}"</p>
              )}
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartRecording}
                className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl"
                aria-label="Parler"
              >
                <Mic className="h-12 w-12" />
              </motion.button>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">🗣️ Appuyer pour parler</p>
            </>
          )}
        </div>
      )}

      {/* Feedback - big & clear */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "w-full rounded-3xl border-3 p-8 text-center shadow-lg",
            isCorrect
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
              : "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
          )}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-6xl block mb-3"
          >
            {isCorrect ? "🎉" : "💪"}
          </motion.span>
          <p className={cn(
            "text-2xl font-extrabold",
            isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
          )}>
            {isCorrect ? "Bravo !" : "Essaie encore !"}
          </p>
          {aiFeedbackText && (
            <p className="mt-2 text-base text-foreground/80">{aiFeedbackText}</p>
          )}
        </motion.div>
      )}

      {/* Hint button */}
      {hintText && !showHint && !answered && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onShowHint}
          className="flex items-center gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-6 py-4 text-lg font-bold text-amber-700 dark:text-amber-300"
        >
          <Lightbulb className="h-8 w-8" />
          💡 Aide
        </motion.button>
      )}
      {showHint && hintText && (
        <div className="w-full rounded-2xl bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 p-6 text-lg text-amber-800 dark:text-amber-200 font-medium">
          💡 {hintText}
        </div>
      )}

      {/* Navigation - giant buttons */}
      {answered && (
        <div className="w-full flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-3 rounded-2xl border-2 border-border bg-card p-5 text-lg font-bold text-foreground shadow-md"
          >
            <RotateCcw className="h-7 w-7" />
            🔄 Encore
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-primary text-primary-foreground p-5 text-lg font-bold shadow-xl"
          >
            ➡️ Suivant
            <ArrowRight className="h-7 w-7" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
