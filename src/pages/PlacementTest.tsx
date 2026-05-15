import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { questions } from "@/lib/placementTestQuestionsV2";
import { supabase } from "@/integrations/supabase/client";
import QuestionCard from "@/components/PlacementTest/QuestionCard";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69409edef41e4f2a833c897b/ac7782ec6_logopefpetit.png";

const FREE_RESPONSE_TYPES = ["written", "oral", "reformulate", "email_response"];

interface AnswerRecord {
  questionId: number | string;
  answer: string;
  isCorrect: boolean;
  level: string;
  category: string;
}

function evaluateAnswer(q: any, raw: string): boolean {
  if (!raw && raw !== "") return false;
  try {
    if (FREE_RESPONSE_TYPES.includes(q.type)) {
      if (!raw.trim()) return false;
      const wordCount = raw.trim().split(/\s+/).filter(Boolean).length;
      return wordCount >= (q.minWords || 5);
    }
    if (q.type === "match_pairs") {
      const matched = JSON.parse(raw);
      return q.pairs.every((p: any) => matched[p.left] === p.right);
    }
    if (q.type === "categorize") {
      const assigned = JSON.parse(raw);
      return q.items.every((item: any) => assigned[item.text] === item.category);
    }
    if (q.type === "order_sentences") {
      const ordered = JSON.parse(raw);
      return ordered.length === q.sentences.length &&
        ordered.every((item: any, i: number) => item.origIdx === q.correctOrder[i]);
    }
    if (q.type === "sentence_builder") {
      const built = raw.split("|").join(" ").trim().toLowerCase().replace(/\.$/, "");
      const correct = q.correctSentence.toLowerCase().replace(/\.$/, "");
      return built === correct;
    }
    if (q.type === "fill_keyboard") {
      const ans = raw.trim().toLowerCase();
      return q.acceptedAnswers.some((a: string) => a.toLowerCase() === ans);
    }
    if (q.type === "word_choice_text") {
      const choices = JSON.parse(raw);
      return q.correctBlanks.every((ans: string, i: number) => choices[i] === ans);
    }
    if (q.type === "complete_form") {
      const fields = JSON.parse(raw);
      const filled = Object.values(fields).filter((v: any) => v && String(v).trim()).length;
      return filled >= Math.ceil(q.formFields.length * 0.6);
    }
    if (q.type === "true_false_justify") {
      const { tf, justif } = JSON.parse(raw);
      return tf === q.correct && justif && justif.trim().length > 3;
    }
    return raw === q.correct;
  } catch {
    return false;
  }
}

export default function PlacementTest() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion: any = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[currentIndex] ?? "";

  useEffect(() => {
    if (!sessionStorage.getItem("placement_candidate")) {
      toast.error("Le test doit être lancé par un formateur connecté.");
      navigate("/placement-test", { replace: true });
    }
  }, [navigate]);

  // Timer per question
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const limit = currentQuestion?.timeLimit;
    if (!limit) {
      setTimeLeft(null);
      return;
    }
    setTimeLeft(limit);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCurrentIndex((idx) => Math.min(idx + 1, questions.length - 1));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const candidateStr = sessionStorage.getItem("placement_candidate");
    if (!candidateStr) {
      toast.error("Données candidat introuvables. Veuillez recommencer.");
      navigate("/placement-test");
      return;
    }
    const candidate = JSON.parse(candidateStr);

    let correctCount = 0;
    const records: AnswerRecord[] = [];
    const levelScores: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q: any, idx: number) => {
      const raw = answers[idx] ?? "";
      const isCorrect = evaluateAnswer(q, raw);
      if (isCorrect) correctCount++;
      records.push({
        questionId: q.id,
        answer: raw,
        isCorrect,
        level: q.level,
        category: q.category,
      });
      if (!levelScores[q.level]) levelScores[q.level] = { correct: 0, total: 0 };
      levelScores[q.level].total++;
      if (isCorrect) levelScores[q.level].correct++;
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // CECRL detailed: highest level where ≥60% correct (cumulative)
    const order = ["A1", "A2", "B1", "B2"] as const;
    let level = "A1";
    for (const lv of order) {
      const s = levelScores[lv];
      if (!s || s.total === 0) continue;
      const pct = (s.correct / s.total) * 100;
      if (pct >= 60) level = lv;
      else break;
    }

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    const resultData = {
      candidate_name: candidate.name,
      candidate_email: candidate.email,
      candidate_phone: candidate.phone || null,
      score,
      level,
      answers: records as any,
      duration_seconds: durationSeconds,
      gdpr_consent: candidate.gdpr_consent,
    };

    const { data, error } = await supabase
      .from("test_results")
      .insert(resultData)
      .select("id")
      .single();

    if (error) {
      toast.error("Erreur lors de l'enregistrement des résultats.");
      console.error(error);
      setSubmitting(false);
      return;
    }

    sessionStorage.setItem("placement_result", JSON.stringify({ id: data.id, ...resultData }));
    navigate("/placement-test/results");
  };

  const isAnswered = currentAnswer !== "" && currentAnswer !== null && currentAnswer !== undefined;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafa" }}>
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <img src={LOGO_URL} alt="PEF" className="h-10 w-auto" />
          <span className="text-sm font-medium" style={{ color: "#00504e" }}>
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border bg-white p-6 shadow-md">
          <QuestionCard
            question={currentQuestion}
            selectedAnswer={currentAnswer}
            onSelect={handleSelect}
            questionNumber={currentIndex}
            timeLeft={timeLeft}
            onStartTimer={() => {}}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentIndex === 0 || submitting}
            className="gap-1 text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <Button
            variant="ghost"
            onClick={goNext}
            disabled={submitting}
            className="gap-1 text-gray-400 hover:text-gray-600"
          >
            <SkipForward className="h-4 w-4" />
            Passer
          </Button>

          <Button
            onClick={goNext}
            disabled={submitting || !isAnswered}
            className="gap-1 text-white border-0"
            style={{ background: "linear-gradient(135deg, #00504e 0%, #17c3b2 100%)" }}
          >
            {submitting
              ? "Envoi..."
              : currentIndex === questions.length - 1
              ? "Terminer"
              : "Suivant"}
            {!submitting && currentIndex < questions.length - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {currentIndex < questions.length - 1 && Object.keys(answers).length >= 5 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (confirm("Terminer le test maintenant et calculer le niveau avec les réponses déjà données ?")) {
                  handleSubmit();
                }
              }}
              disabled={submitting}
              className="text-xs text-gray-400 underline hover:text-gray-600"
            >
              Terminer le test maintenant ({Object.keys(answers).length} réponses)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
