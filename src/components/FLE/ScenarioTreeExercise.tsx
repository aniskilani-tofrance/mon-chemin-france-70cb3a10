import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";

interface ScenarioNode {
  id: string;
  text: string;
  speaker?: "system" | "user";
  choices?: { label: string; next: string }[];
  outcome?: { title: string; description: string; score: number };
}

interface ScenarioTreeExerciseProps {
  nodes: Record<string, ScenarioNode>;
  startNodeId: string;
  onComplete: (isCorrect: boolean, score: number) => void;
}

export function ScenarioTreeExercise({ nodes, startNodeId, onComplete }: ScenarioTreeExerciseProps) {
  const [history, setHistory] = useState<string[]>([startNodeId]);
  const [completed, setCompleted] = useState(false);

  const currentNodeId = history[history.length - 1];
  const currentNode = nodes[currentNodeId];

  const handleChoice = useCallback((nextId: string) => {
    setHistory((prev) => [...prev, nextId]);
    const nextNode = nodes[nextId];
    if (nextNode?.outcome) {
      setCompleted(true);
      onComplete(nextNode.outcome.score >= 60, nextNode.outcome.score);
    }
  }, [nodes, onComplete]);

  const handleRestart = useCallback(() => {
    setHistory([startNodeId]);
    setCompleted(false);
  }, [startNodeId]);

  if (!currentNode) {
    return <p className="text-muted-foreground text-center">Scénario introuvable.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Conversation history */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {history.map((nodeId, i) => {
          const node = nodes[nodeId];
          if (!node) return null;
          const isSystem = node.speaker !== "user";

          return (
            <motion.div
              key={`${nodeId}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isSystem ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  isSystem
                    ? "bg-muted text-foreground rounded-bl-sm"
                    : "bg-primary text-primary-foreground rounded-br-sm"
                }`}
              >
                {node.text}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Outcome */}
      {completed && currentNode.outcome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl border p-5 text-center ${
            currentNode.outcome.score >= 60
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-2xl mb-2">{currentNode.outcome.score >= 60 ? "🎉" : "💪"}</p>
          <p className="font-semibold text-foreground">{currentNode.outcome.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{currentNode.outcome.description}</p>
          <span
            className={`inline-block mt-3 text-sm font-bold px-3 py-1 rounded-full ${
              currentNode.outcome.score >= 80
                ? "bg-green-100 text-green-700"
                : currentNode.outcome.score >= 60
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            Score : {currentNode.outcome.score}/100
          </span>
        </motion.div>
      )}

      {/* Choices */}
      {!completed && currentNode.choices && currentNode.choices.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground text-center mb-2">Choisissez votre réponse :</p>
            {currentNode.choices.map((choice, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal"
                onClick={() => handleChoice(choice.next)}
              >
                <ArrowRight className="h-4 w-4 mr-2 shrink-0" />
                {choice.label}
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
