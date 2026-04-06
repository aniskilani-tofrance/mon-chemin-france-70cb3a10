import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, MessageCircle, CheckCircle2, XCircle, GraduationCap } from "lucide-react";
import { questions } from "@/lib/placementTestQuestions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69409edef41e4f2a833c897b/ac7782ec6_logopefpetit.png";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  A1: "Débutant – Vous comprenez des mots familiers et des expressions très courantes.",
  A2: "Élémentaire – Vous comprenez des phrases isolées sur des sujets familiers.",
  B1: "Intermédiaire – Vous comprenez les points essentiels d'un discours clair et standard.",
  B2: "Intermédiaire avancé – Vous comprenez des textes complexes et des discussions techniques.",
  C1: "Avancé – Vous comprenez des textes longs et exigeants, expression fluide.",
  C2: "Maîtrise – Compréhension et expression parfaites dans toutes les situations.",
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "#ef4444", A2: "#f59e0b", B1: "#17c3b2", B2: "#32cf8a", C1: "#00504e", C2: "#1e293b",
};

interface ResultData {
  id: string;
  candidate_name: string;
  candidate_email: string;
  score: number;
  level: string;
  answers: { questionId: number; answer: string; isCorrect: boolean; level: string; category: string; timeTaken: number }[];
  duration_seconds: number;
}

export default function PlacementTestResults() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [result, setResult] = useState<ResultData | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("placement_result");
    if (!stored) {
      navigate("/placement-test");
      return;
    }
    setResult(JSON.parse(stored));
  }, []);

  // Sync level to fle_user_progress when result + user are available
  useEffect(() => {
    if (!result || !user) return;

    // Map test level (A1-C2) to cecrl_level enum (alpha, post_alpha, a1, a2, b1)
    const levelMap: Record<string, string> = {
      A1: "a1",
      A2: "a2",
      B1: "b1",
      B2: "b1", // cap at b1 (max in enum)
      C1: "b1",
      C2: "b1",
    };
    const cecrlLevel = levelMap[result.level] || "a1";

    const syncLevel = async () => {
      // Try upsert: update if exists, insert if not
      const { data: existing } = await supabase
        .from("fle_user_progress")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("fle_user_progress")
          .update({
            estimated_level: cecrlLevel as any,
            placement_completed: true,
          })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("fle_user_progress")
          .insert({
            user_id: user.id,
            estimated_level: cecrlLevel as any,
            placement_completed: true,
          });
      }
    };

    syncLevel();
  }, [result, user]);

  if (!result) return null;

  // Category analysis
  const categories = new Map<string, { correct: number; total: number }>();
  for (const a of result.answers) {
    const q = questions.find(q => q.id === a.questionId);
    if (!q || q.type) continue;
    const cat = a.category;
    if (!categories.has(cat)) categories.set(cat, { correct: 0, total: 0 });
    const c = categories.get(cat)!;
    c.total++;
    if (a.isCorrect) c.correct++;
  }

  const durationMin = Math.floor(result.duration_seconds / 60);
  const durationSec = result.duration_seconds % 60;

  const handleDownloadPDF = () => {
    // Simple text-based PDF download using blob
    const content = `
TEST DE POSITIONNEMENT - RÉSULTATS
===================================

Candidat : ${result.candidate_name}
Email : ${result.candidate_email}
Date : ${new Date().toLocaleDateString("fr-FR")}

NIVEAU ESTIMÉ : ${result.level}
SCORE : ${result.score}%
DURÉE : ${durationMin}min ${durationSec}s

${LEVEL_DESCRIPTIONS[result.level] || ""}

ANALYSE PAR CATÉGORIE :
${Array.from(categories.entries())
  .map(([cat, { correct, total }]) => `- ${cat} : ${correct}/${total} (${Math.round((correct / total) * 100)}%)`)
  .join("\n")}

---
Ce test est indicatif et ne constitue pas une certification officielle.
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resultats-test-${result.candidate_name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafa" }}>
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <img src={LOGO_URL} alt="PEF" className="h-10 w-auto" />
          <span className="text-sm font-medium text-gray-500">Résultats</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Level card */}
        <div
          className="rounded-2xl p-8 text-center text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${LEVEL_COLORS[result.level]}, #00504e)` }}
        >
          <GraduationCap className="mx-auto mb-4 h-12 w-12 opacity-80" />
          <p className="text-sm uppercase tracking-wider opacity-80">Votre niveau estimé</p>
          <h1 className="mt-2 text-6xl font-black">{result.level}</h1>
          <p className="mt-3 text-sm opacity-90">{LEVEL_DESCRIPTIONS[result.level]}</p>
        </div>

        {/* Score & Duration */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-bold" style={{ color: "#17c3b2" }}>{result.score}%</p>
            <p className="mt-1 text-xs text-gray-500">Score global</p>
          </div>
          <div className="rounded-xl border bg-white p-5 text-center shadow-sm">
            <p className="text-3xl font-bold" style={{ color: "#00504e" }}>{durationMin}:{String(durationSec).padStart(2, "0")}</p>
            <p className="mt-1 text-xs text-gray-500">Durée du test</p>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold" style={{ color: "#00504e" }}>Analyse par catégorie</h2>
          <div className="space-y-3">
            {Array.from(categories.entries()).map(([cat, { correct, total }]) => {
              const pct = Math.round((correct / total) * 100);
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{cat}</span>
                    <span className="text-gray-500">{correct}/{total} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "#32cf8a" : pct >= 40 ? "#f59e0b" : "#ef4444" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review toggle */}
        <button
          onClick={() => setShowReview(!showReview)}
          className="mt-6 w-full rounded-xl border bg-white p-4 text-left font-medium shadow-sm transition-colors hover:bg-gray-50"
          style={{ color: "#00504e" }}
        >
          {showReview ? "Masquer" : "Voir"} la révision des questions
        </button>

        {showReview && (
          <div className="mt-4 space-y-3">
            {result.answers
              .filter(a => {
                const q = questions.find(q => q.id === a.questionId);
                return q && !q.type;
              })
              .map((a) => {
                const q = questions.find(q => q.id === a.questionId)!;
                return (
                  <div
                    key={a.questionId}
                    className={`rounded-lg border p-4 ${a.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex items-start gap-2">
                      {a.isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{q.question}</p>
                        {!a.isCorrect && (
                          <p className="mt-1 text-xs text-gray-500">
                            Votre réponse : <span className="text-red-600">{a.answer || "(aucune)"}</span>
                            {" · "}Réponse correcte : <span className="font-semibold text-green-700">{q.correct}</span>
                          </p>
                        )}
                        {q.explanation && <p className="mt-1 text-xs text-gray-400">{q.explanation}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            onClick={handleDownloadPDF}
            className="gap-2 text-white border-0"
            style={{ backgroundColor: "#00504e" }}
          >
            <Download className="h-4 w-4" />
            Télécharger les résultats
          </Button>
          <a
            href="https://wa.me/33652675393"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2 text-white border-0" style={{ backgroundColor: "#25D366" }}>
              <MessageCircle className="h-4 w-4" />
              Nous contacter
            </Button>
          </a>
          <Button variant="outline" onClick={() => navigate("/placement-test")} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Nouveau test
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Ce test est indicatif et ne constitue pas une certification officielle du niveau CECRL.
        </p>
      </main>
    </div>
  );
}
