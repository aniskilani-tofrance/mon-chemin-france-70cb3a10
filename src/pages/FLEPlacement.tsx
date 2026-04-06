import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FLELevelBadge } from "@/components/FLE/FLELevelBadge";
import { useTTS } from "@/hooks/useTTS";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PlacementQuestion {
  id: string;
  level: string;
  audioPrompt: string;
  question: string;
  choices: string[];
  correctIndex: number;
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "p1",
    level: "alpha",
    audioPrompt: "Bonjour !",
    question: "Que veut dire « Bonjour » ?",
    choices: ["Au revoir", "Bonjour / Hello", "Merci", "S'il vous plaît"],
    correctIndex: 1,
  },
  {
    id: "p2",
    level: "a1",
    audioPrompt: "Je m'appelle Marie. Et vous, comment vous appelez-vous ?",
    question: "Que demande Marie ?",
    choices: ["Votre âge", "Votre adresse", "Votre nom", "Votre métier"],
    correctIndex: 2,
  },
  {
    id: "p3",
    level: "a1",
    audioPrompt: "Le médecin est au deuxième étage, à gauche.",
    question: "Où est le médecin ?",
    choices: [
      "Au rez-de-chaussée",
      "Au premier étage à droite",
      "Au deuxième étage à gauche",
      "Au troisième étage",
    ],
    correctIndex: 2,
  },
  {
    id: "p4",
    level: "a2",
    audioPrompt: "Je voudrais prendre rendez-vous pour la semaine prochaine. Est-ce que le docteur Martin est disponible mardi après-midi ?",
    question: "Que veut faire cette personne ?",
    choices: [
      "Annuler un rendez-vous",
      "Prendre un rendez-vous mardi après-midi",
      "Acheter des médicaments",
      "Trouver un nouveau médecin",
    ],
    correctIndex: 1,
  },
  {
    id: "p5",
    level: "b1",
    audioPrompt: "Suite à notre entretien téléphonique, je me permets de vous adresser ma candidature pour le poste d'agent d'entretien. Disposant d'une expérience de trois ans dans ce domaine, je suis immédiatement disponible.",
    question: "Quel est l'objet de ce message ?",
    choices: [
      "Une demande de congé",
      "Une candidature pour un emploi",
      "Une réclamation",
      "Une demande de renseignement",
    ],
    correctIndex: 1,
  },
];

function calculateLevel(scores: boolean[]): string {
  const correct = scores.filter(Boolean).length;
  // Q1 = alpha, Q2-Q3 = A1, Q4 = A2, Q5 = B1
  if (correct === 0) return "alpha";
  if (!scores[0]) return "alpha"; // Can't even get basic greeting
  if (correct <= 2) return "post_alpha";
  if (correct <= 3) return "a1";
  if (correct <= 4) return "a2";
  return "b1";
}

const LEVEL_DESCRIPTIONS: Record<string, { title: string; desc: string; emoji: string }> = {
  alpha: { title: "Niveau Alpha", desc: "Vous débutez en français. Pas d'inquiétude, on commence ensemble !", emoji: "🌱" },
  post_alpha: { title: "Niveau Post-Alpha", desc: "Vous connaissez quelques mots. On va construire sur ces bases !", emoji: "🌿" },
  a1: { title: "Niveau A1 — Débutant", desc: "Vous comprenez des phrases simples. Continuons à progresser !", emoji: "⭐" },
  a2: { title: "Niveau A2 — Élémentaire", desc: "Vous pouvez communiquer dans des situations courantes. Bravo !", emoji: "🌟" },
  b1: { title: "Niveau B1 — Intermédiaire", desc: "Vous êtes à l'aise pour comprendre et vous exprimer. Excellent !", emoji: "💫" },
};

const FLEPlacement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tts = useTTS({ language: "fr" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<boolean[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const question = PLACEMENT_QUESTIONS[currentIndex];
  const total = PLACEMENT_QUESTIONS.length;
  const progressPercent = ((currentIndex + (answered ? 1 : 0)) / total) * 100;

  const handleChoice = useCallback((index: number) => {
    if (answered) return;
    setSelectedChoice(index);
    setAnswered(true);
    const isCorrect = index === question.correctIndex;
    setScores((prev) => [...prev, isCorrect]);
  }, [answered, question]);

  const handleNext = useCallback(async () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedChoice(null);
      setAnswered(false);
    } else {
      // Calculate result
      const allScores = [...scores];
      const level = calculateLevel(allScores);
      setResult(level);

      // Save to DB
      if (user) {
        setSaving(true);
        try {
          const { data: existing } = await supabase
            .from("fle_user_progress")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (existing) {
            await supabase
              .from("fle_user_progress")
              .update({
                estimated_level: level,
                placement_completed: true,
                last_activity_at: new Date().toISOString(),
              } as any)
              .eq("user_id", user.id);
          } else {
            await supabase
              .from("fle_user_progress")
              .insert({
                user_id: user.id,
                estimated_level: level,
                placement_completed: true,
                last_activity_at: new Date().toISOString(),
              } as any);
          }
        } catch (err) {
          console.error("Error saving placement result:", err);
        } finally {
          setSaving(false);
        }
      }
    }
  }, [currentIndex, total, scores, user]);

  const handleListen = () => {
    if (question?.audioPrompt) tts.speak(question.audioPrompt);
  };

  // Result screen
  if (result) {
    const levelInfo = LEVEL_DESCRIPTIONS[result] || LEVEL_DESCRIPTIONS.a1;
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <Header />
        <main className="mx-auto max-w-lg px-4 pt-24 pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
            >
              <span className="text-5xl">{levelInfo.emoji}</span>
            </motion.div>

            <h1 className="mb-2 text-2xl font-bold text-foreground">{levelInfo.title}</h1>
            <p className="mb-6 text-muted-foreground">{levelInfo.desc}</p>

            <div className="mb-8 flex justify-center">
              <FLELevelBadge level={result} size="lg" />
            </div>

            <div className="mb-6 rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Score : <span className="font-bold text-foreground">{scores.filter(Boolean).length}/{total}</span> bonnes réponses
              </p>
            </div>

            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate("/fle")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Commencer mes cours
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Header />
      <main className="mx-auto max-w-lg px-4 pt-20 pb-12 sm:pt-24">
        {/* Intro banner (first question only) */}
        {currentIndex === 0 && !answered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Test de niveau 🎯
            </h1>
            <p className="text-muted-foreground text-sm">
              5 questions pour évaluer votre français. Écoutez et choisissez la bonne réponse.
            </p>
          </motion.div>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Question {currentIndex + 1}/{total}</span>
            <FLELevelBadge level={question.level} size="sm" />
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
          >
            {/* Audio prompt */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-6 shadow-sm">
              <p className="text-lg font-medium text-foreground text-center leading-relaxed mb-4">
                🎧 Écoutez puis répondez
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={handleListen}
                className="w-full rounded-full gap-2"
                disabled={tts.isSpeaking}
              >
                <Volume2 className={`h-5 w-5 ${tts.isSpeaking ? "animate-pulse text-primary" : ""}`} />
                {tts.isSpeaking ? "Écoute en cours…" : "🔊 Écouter la phrase"}
              </Button>
            </div>

            {/* Question */}
            <p className="text-base font-semibold text-foreground mb-4 text-center">
              {question.question}
            </p>

            {/* Choices */}
            <div className="space-y-3 mb-6">
              {question.choices.map((choice, i) => {
                const isSelected = selectedChoice === i;
                const isCorrect = answered && i === question.correctIndex;
                const isWrong = answered && isSelected && !isCorrect;
                return (
                  <motion.button
                    key={i}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleChoice(i)}
                    disabled={answered}
                    className={`w-full rounded-xl border-2 p-4 text-left text-base transition-all ${
                      isCorrect
                        ? "border-green-500 bg-green-50 text-green-700"
                        : isWrong
                        ? "border-destructive bg-destructive/5 text-destructive"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
                      {choice}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Next button */}
            {answered && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleNext}
                >
                  {currentIndex < total - 1 ? "Question suivante" : "Voir mon résultat"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default FLEPlacement;
