import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { callFLEVoiceAI } from "@/lib/fleVoiceAI";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FLEGenerateExerciseProps {
  userLevel: string;
  theme?: string;
  language?: string;
}

export function FLEGenerateExercise({ userLevel, theme, language }: FLEGenerateExerciseProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await callFLEVoiceAI({
        action: "generate_exercise",
        exercise_type: "listen_choose",
        user_level: userLevel,
        prompt_text: theme || "vie quotidienne en France",
        language: language || "fr",
      });

      if (result.error) {
        toast.error("Erreur lors de la génération");
        return;
      }

      // Store generated exercise in sessionStorage for the exercise page to pick up
      sessionStorage.setItem("fle-generated-exercise", JSON.stringify({
        prompt_text: result.prompt_text,
        correct_answer: result.correct_answer,
        choices: result.choices,
        hint_text: result.hint_text,
        difficulty: result.difficulty,
        exercise_type: "listen_choose",
        generated: true,
      }));

      toast.success("Exercice généré ! 🎉");
      navigate("/fle/exercise/generated");
    } catch (e) {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleGenerate}
        disabled={loading}
        variant="outline"
        className="w-full gap-2 rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-accent/10 py-6 font-bold hover:border-primary/50 hover:from-primary/10"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5 text-primary" />
        )}
        {loading ? "Génération en cours..." : "✨ Encore plus d'exercices"}
      </Button>
    </motion.div>
  );
}
