import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, RotateCcw } from "lucide-react";

interface ScenarioNode {
  id: string;
  text: string;
  options?: { label: string; next: ScenarioNode }[];
  score?: number;
}

interface ScenarioTreeExerciseProps {
  tree: ScenarioNode;
  onComplete: (isCorrect: boolean, score: number) => void;
}

export function ScenarioTreeExercise({ tree, onComplete }: ScenarioTreeExerciseProps) {
  const [history, setHistory] = useState<ScenarioNode[]>([tree]);
  const [choiceLabels, setChoiceLabels] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const currentNode = history[history.length - 1];
  const isLeaf = !currentNode.options || currentNode.options.length === 0;

  const handleChoice = useCallback((option: { label: string; next: ScenarioNode }) => {
    const nextNode = option.next;
    setHistory((prev) => [...prev, nextNode]);
    setChoiceLabels((prev) => [...prev, option.label]);

    if (!nextNode.options || nextNode.options.length === 0) {
      const score = nextNode.score ?? 50;
      setFinalScore(score);
      setCompleted(true);
      onComplete(score >= 60, score);
    }
  }, [onComplete]);

  const handleRestart = useCallback(() => {
    setHistory([tree]);
    setChoiceLabels([]);
    setCompleted(false);
    setFinalScore(0);
  }, [tree]);

  return (
    <div className="space-y-4">
      {/* Conversation history */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {history.map((node, i) => (
          <div key={`${node.id}-${i}`}>
            {/* System message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted text-foreground px-4 py-3 text-sm">
                {node.text}
              </div>
            </motion.div>

            {/* User choice (if there was one leading to the next node) */}
            {choiceLabels[i] && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end mt-2"
              >
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-3 text-sm">
                  {choiceLabels[i]}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Outcome */}
      {completed && isLeaf && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl border p-5 text-center ${
            finalScore >= 60
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-2xl mb-2">{finalScore >= 80 ? "🎉" : finalScore >= 60 ? "👍" : "💪"}</p>
          <p className="font-semibold text-foreground">{currentNode.text}</p>
          <span
            className={`inline-block mt-3 text-sm font-bold px-3 py-1 rounded-full ${
              finalScore >= 80
                ? "bg-green-100 text-green-700"
                : finalScore >= 60
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Score : {finalScore}/100
          </span>
        </motion.div>
      )}

      {/* Choices */}
      {!completed && currentNode.options && currentNode.options.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground text-center mb-2">Choisissez votre réponse :</p>
            {currentNode.options.map((option, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal"
                onClick={() => handleChoice(option)}
              >
                <ArrowRight className="h-4 w-4 mr-2 shrink-0" />
                {option.label}
              </Button>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Restart */}
      {completed && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleRestart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Recommencer le scénario
          </Button>
        </div>
      )}
    </div>
  );
}
