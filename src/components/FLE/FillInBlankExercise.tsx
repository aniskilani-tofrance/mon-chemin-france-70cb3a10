import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Send } from "lucide-react";

interface FillInBlankExerciseProps {
  sentence: string; // e.g. "Je ___ français" (blank marked with ___)
  correctAnswer: string;
  onComplete: (isCorrect: boolean, score: number) => void;
}

export function FillInBlankExercise({ sentence, correctAnswer, onComplete }: FillInBlankExerciseProps) {
  const [userInput, setUserInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const parts = sentence.split("___");

  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return;
    const normalized = userInput.trim().toLowerCase().replace(/['']/g, "'");
    const expected = correctAnswer.trim().toLowerCase().replace(/['']/g, "'");
    const correct = normalized === expected;
    setIsCorrect(correct);
    setChecked(true);
    onComplete(correct, correct ? 100 : 0);
  }, [userInput, correctAnswer, onComplete]);

  return (
    <div className="space-y-6">
      {/* Sentence with blank */}
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-lg font-medium text-foreground leading-relaxed">
          {parts[0]}
          {checked ? (
            <span
              className={`inline-block mx-1 px-3 py-1 rounded-lg font-bold ${
                isCorrect
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-red-100 text-red-700 border border-red-300 line-through"
              }`}
            >
              {userInput}
            </span>
          ) : (
            <span className="inline-block mx-1 border-b-2 border-primary min-w-[80px]" />
          )}
          {parts[1] || ""}
        </p>
      </div>

      {/* Input */}
      {!checked && (
        <div className="flex gap-2 max-w-sm mx-auto">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Tapez le mot manquant…"
            className="text-center text-lg"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
          <Button onClick={handleSubmit} disabled={!userInput.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-4 text-center ${
            isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}
        >
          {isCorrect ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Correct ! 🎉</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Pas tout à fait</span>
              </div>
              <p className="text-sm text-foreground">
                La bonne réponse : <strong className="text-green-700">{correctAnswer}</strong>
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
