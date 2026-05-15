import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, MessageCircle, CheckCircle2, XCircle, GraduationCap, Mail, Loader2 } from "lucide-react";
import { questions } from "@/lib/placementTestQuestionsV2";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { generatePlacementTestPDF, LEVEL_DESCRIPTIONS } from "@/lib/placementTestPDF";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69409edef41e4f2a833c897b/ac7782ec6_logopefpetit.png";

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
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

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
    const levelMap: Record<string, string> = { A1: "a1", A2: "a2", B1: "b1", B2: "b1", C1: "b1", C2: "b1" };
    const cecrlLevel = levelMap[result.level] || "a1";

    const syncLevel = async () => {
      const { data: existing } = await supabase
        .from("fle_user_progress").select("id").eq("user_id", user.id).maybeSingle();
      if (existing) {
        await supabase.from("fle_user_progress")
          .update({ estimated_level: cecrlLevel as any, placement_completed: true })
          .eq("user_id", user.id);
      } else {
        await supabase.from("fle_user_progress")
          .insert({ user_id: user.id, estimated_level: cecrlLevel as any, placement_completed: true });
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

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      const blob = await generatePlacementTestPDF({
        candidateName: result.candidate_name,
        candidateEmail: result.candidate_email,
        level: result.level,
        score: result.score,
        durationSeconds: result.duration_seconds,
        answers: result.answers,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bilan-positionnement-${result.candidate_name.replace(/\s+/g, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF téléchargé");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "placement-test-results",
          recipientEmail: result.candidate_email,
          idempotencyKey: `placement-result-${result.id}`,
          templateData: {
            candidateName: result.candidate_name,
            level: result.level,
            levelLabel: LEVEL_DESCRIPTIONS[result.level] || "",
            score: result.score,
          },
        },
      });
      if (error) throw error;
      toast.success("Email envoyé à " + result.candidate_email);
    } catch (e: any) {
      console.error(e);
      toast.error("L'envoi d'email n'est pas encore disponible");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafa]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-3 sm:px-4">
          <img src={LOGO_URL} alt="PEF — Plateforme d'Évaluation du Français" className="h-10 w-auto" />
          <span className="text-sm font-medium text-gray-500">Résultats</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-3 py-8 sm:px-4 sm:py-10">
        <h1 className="sr-only">Résultats du test de positionnement de {result.candidate_name}</h1>

        {/* Level card */}
        <section
          aria-labelledby="level-heading"
          className="rounded-2xl p-6 sm:p-8 text-center text-white shadow-xl"
          style={{ background: `linear-gradient(135deg, ${LEVEL_COLORS[result.level]}, #00504e)` }}
        >
          <GraduationCap className="mx-auto mb-4 h-12 w-12 opacity-80" aria-hidden="true" />
          <p className="text-sm uppercase tracking-wider opacity-80">Votre niveau estimé</p>
          <p id="level-heading" className="mt-2 text-5xl sm:text-6xl font-black" aria-label={`Niveau ${result.level}`}>
            {result.level}
          </p>
          <p className="mt-3 text-sm opacity-90">{LEVEL_DESCRIPTIONS[result.level]}</p>
        </section>

        {/* Score & Duration */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl border bg-white p-4 sm:p-5 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-bold text-[#17c3b2]" aria-label={`Score global : ${result.score} pour cent`}>{result.score}%</p>
            <p className="mt-1 text-xs text-gray-500">Score global</p>
          </div>
          <div className="rounded-xl border bg-white p-4 sm:p-5 text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-bold text-[#00504e]" aria-label={`Durée du test : ${durationMin} minutes ${durationSec} secondes`}>
              {durationMin}:{String(durationSec).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-gray-500">Durée du test</p>
          </div>
        </div>

        {/* Category Analysis */}
        <section aria-labelledby="cat-heading" className="mt-6 rounded-xl border bg-white p-5 sm:p-6 shadow-sm">
          <h2 id="cat-heading" className="mb-4 text-lg font-bold text-[#00504e]">Analyse par compétence</h2>
          <div className="space-y-3">
            {Array.from(categories.entries()).map(([cat, { correct, total }]) => {
              const pct = Math.round((correct / total) * 100);
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{cat}</span>
                    <span className="text-gray-600">{correct}/{total} ({pct}%)</span>
                  </div>
                  <div
                    className="h-2 rounded-full bg-gray-100"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat} : ${pct} pour cent`}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "#32cf8a" : pct >= 40 ? "#f59e0b" : "#ef4444" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Review toggle */}
        <button
          onClick={() => setShowReview(!showReview)}
          className="mt-6 w-full min-h-11 rounded-xl border bg-white p-4 text-left font-medium text-[#00504e] shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#17c3b2]"
          aria-expanded={showReview}
          aria-controls="review-panel"
        >
          {showReview ? "Masquer" : "Voir"} la révision des questions
        </button>

        {showReview && (
          <div id="review-panel" className="mt-4 space-y-3">
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
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-700" aria-label="Correct" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" aria-label="Incorrect" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800">{q.question}</p>
                        {!a.isCorrect && (
                          <p className="mt-1 text-xs text-gray-700">
                            Votre réponse : <span className="text-red-700">{a.answer || "(aucune)"}</span>
                            {" · "}Réponse correcte : <span className="font-semibold text-green-800">{q.correct}</span>
                          </p>
                        )}
                        {q.explanation && <p className="mt-1 text-xs text-gray-600">{q.explanation}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            onClick={handleDownloadPDF}
            disabled={generatingPDF}
            className="gap-2 text-white border-0 min-h-11 bg-[#00504e] hover:bg-[#003b39]"
            aria-label="Télécharger le bilan au format PDF"
          >
            {generatingPDF ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
            Télécharger le PDF
          </Button>
          <Button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            variant="outline"
            className="gap-2 min-h-11"
            aria-label={`Recevoir le bilan par email à ${result.candidate_email}`}
          >
            {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
            Recevoir par email
          </Button>
          <a href="https://wa.me/33652675393" target="_blank" rel="noopener noreferrer" aria-label="Nous contacter sur WhatsApp">
            <Button className="gap-2 text-white border-0 min-h-11 w-full sm:w-auto bg-[#25D366] hover:bg-[#1da851]">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Nous contacter
            </Button>
          </a>
          <Button variant="outline" onClick={() => navigate("/placement-test")} className="gap-2 min-h-11">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Nouveau test
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          Ce test est indicatif et ne constitue pas une certification officielle du niveau CECRL.
        </p>
      </main>
    </div>
  );
}
