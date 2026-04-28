import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, Mic, MicOff, Check, ChevronLeft, ChevronRight,
  Loader2, Globe, FileCheck2, Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DIAGNOSTIC_QUESTIONS,
  CATEGORY_META,
  SUPPORTED_LANGUAGES,
  type DiagnosticQuestion,
} from "@/lib/diagnosticQuestions";
import type { LanguageCode } from "@/lib/translations";
import { CreateLearnerDialog } from "@/components/Formateur/CreateLearnerDialog";
import { SharedDiagnosticCompetenceStep } from "@/components/DiagnosticCompetences/SharedDiagnosticCompetenceStep";

interface AnswerRow {
  id?: string;
  question_key: string;
  answer_fr: string;
  answer_native: string;
  validated_by_learner: boolean;
  validated_by_formateur: boolean;
}

const SharedDiagnostic = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const diagnosticIdParam = searchParams.get("id");
  const codeParam = searchParams.get("code");
  const trainerParam = searchParams.get("formateur");

  const [diagnosticId, setDiagnosticId] = useState<string | null>(diagnosticIdParam);
  const [learnerLanguage, setLearnerLanguage] = useState<LanguageCode>("fr");
  const [languageConfirmed, setLanguageConfirmed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRow>>({});
  const [showCompetenceStep, setShowCompetenceStep] = useState(false);
  const [competenceStepCompleted, setCompetenceStepCompleted] = useState(false);
  const needsAuthenticatedAccess = !!diagnosticIdParam || !!codeParam;
  const [loading, setLoading] = useState(needsAuthenticatedAccess);
  const [translating, setTranslating] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [updatingLanguage, setUpdatingLanguage] = useState(false);

  const confirmLanguage = async () => {
    if (!diagnosticId) return;
    setUpdatingLanguage(true);
    try {
      const { error } = await supabase
        .from("shared_diagnostics")
        .update({ learner_language: learnerLanguage })
        .eq("id", diagnosticId);
      if (error) throw error;
      setLanguageConfirmed(true);
    } catch (e: any) {
      toast.error("Erreur : " + (e.message || "inconnue"));
    } finally {
      setUpdatingLanguage(false);
    }
  };

  const learnerTTS = useTTS({ language: learnerLanguage });
  const formateurTTS = useTTS({ language: "fr" });

  const speech = useSpeechRecognition({
    language: learnerLanguage,
    continuous: false,
    interimResults: true,
  });

  const question: DiagnosticQuestion | undefined = DIAGNOSTIC_QUESTIONS[currentIndex];
  const total = DIAGNOSTIC_QUESTIONS.length + 1;
  const currentAnswer = question ? answers[question.key] : undefined;
  const validatedCount = Object.values(answers).filter(
    (a) => a.validated_by_learner && a.validated_by_formateur
  ).length;
  const progressPercent = ((validatedCount + (competenceStepCompleted ? 1 : 0)) / total) * 100;

  // ─── Load existing diagnostic (by id or by code) ──────────────
  useEffect(() => {
    if (!user) return;
    if (!diagnosticIdParam && !codeParam) return;
    let cancelled = false;
    (async () => {
      try {
        let query = supabase.from("shared_diagnostics").select("*");
        query = diagnosticIdParam
          ? query.eq("id", diagnosticIdParam)
          : query.eq("access_code", codeParam!.toUpperCase());

        const { data: diagnostic, error: dErr } = await query.maybeSingle();
        if (dErr || !diagnostic) {
          toast.error("Diagnostic introuvable.");
          navigate("/");
          return;
        }
        if (cancelled) return;

        // If learner is empty and we arrived via code, claim the diagnostic
        if (!diagnostic.learner_id && codeParam) {
          const { error: claimErr } = await supabase
            .from("shared_diagnostics")
            .update({ learner_id: user.id })
            .eq("id", diagnostic.id);
          if (claimErr) console.warn("Claim error", claimErr);
        }

        setDiagnosticId(diagnostic.id);
        setLearnerLanguage((diagnostic.learner_language as LanguageCode) || "fr");

        const { data: ans } = await supabase
          .from("shared_diagnostic_answers")
          .select("*")
          .eq("diagnostic_id", diagnostic.id);
        if (cancelled) return;
        const map: Record<string, AnswerRow> = {};
        (ans || []).forEach((row: any) => {
          map[row.question_key] = {
            id: row.id,
            question_key: row.question_key,
            answer_fr: row.answer_fr || "",
            answer_native: row.answer_native || "",
            validated_by_learner: !!row.validated_by_learner,
            validated_by_formateur: !!row.validated_by_formateur,
          };
        });
        setAnswers(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [diagnosticIdParam, codeParam, user, navigate]);

  // ─── Realtime sync (so the apprenant or another window sees updates) ──
  useEffect(() => {
    if (!diagnosticId) return;
    const channel = supabase
      .channel(`shared_diagnostic_${diagnosticId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shared_diagnostic_answers", filter: `diagnostic_id=eq.${diagnosticId}` },
        (payload) => {
          const row: any = payload.new || payload.old;
          if (!row?.question_key) return;
          if (payload.eventType === "DELETE") {
            setAnswers((prev) => {
              const c = { ...prev };
              delete c[row.question_key];
              return c;
            });
          } else {
            setAnswers((prev) => ({
              ...prev,
              [row.question_key]: {
                id: row.id,
                question_key: row.question_key,
                answer_fr: row.answer_fr || "",
                answer_native: row.answer_native || "",
                validated_by_learner: !!row.validated_by_learner,
                validated_by_formateur: !!row.validated_by_formateur,
              },
            }));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [diagnosticId]);

  // ─── Sync dictée vers la zone apprenant ────────────────────────
  useEffect(() => {
    if (!question || !speech.transcript) return;
    setAnswers((prev) => {
      const cur = prev[question.key] || {
        question_key: question.key,
        answer_fr: "",
        answer_native: "",
        validated_by_learner: false,
        validated_by_formateur: false,
      };
      return {
        ...prev,
        [question.key]: { ...cur, answer_native: speech.transcript },
      };
    });
  }, [speech.transcript, question]);

  // ─── Reset dictée quand on change de question ──────────────────
  useEffect(() => {
    speech.reset();
    if (speech.isListening) speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // ─── Update local answer ──────────────────────────────────────
  const updateAnswer = (patch: Partial<AnswerRow>) => {
    if (!question) return;
    setAnswers((prev) => {
      const cur = prev[question.key] || {
        question_key: question.key,
        answer_fr: "",
        answer_native: "",
        validated_by_learner: false,
        validated_by_formateur: false,
      };
      return { ...prev, [question.key]: { ...cur, ...patch } };
    });
  };

  // ─── Translate native → fr ────────────────────────────────────
  const translateNativeToFr = async () => {
    if (!currentAnswer?.answer_native?.trim()) {
      toast.info("Aucun texte à traduire.");
      return;
    }
    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate-diagnostic", {
        body: {
          text: currentAnswer.answer_native,
          source_lang: learnerLanguage,
          target_lang: "fr",
        },
      });
      if (error) throw error;
      if (data?.translation) {
        updateAnswer({ answer_fr: data.translation });
        toast.success("Traduction effectuée");
      }
    } catch (e: any) {
      toast.error("Erreur de traduction : " + (e.message || "inconnue"));
    } finally {
      setTranslating(false);
    }
  };

  // ─── Translate fr → native ────────────────────────────────────
  const translateFrToNative = async () => {
    if (!currentAnswer?.answer_fr?.trim()) {
      toast.info("Aucun texte à traduire.");
      return;
    }
    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate-diagnostic", {
        body: {
          text: currentAnswer.answer_fr,
          source_lang: "fr",
          target_lang: learnerLanguage,
        },
      });
      if (error) throw error;
      if (data?.translation) {
        updateAnswer({ answer_native: data.translation });
        toast.success("Traduit pour l'apprenant");
      }
    } catch (e: any) {
      toast.error("Erreur de traduction : " + (e.message || "inconnue"));
    } finally {
      setTranslating(false);
    }
  };

  // ─── Save answer ──────────────────────────────────────────────
  const saveCurrent = useCallback(async () => {
    if (!diagnosticId || !question || !currentAnswer) return false;
    setSavingAnswer(true);
    try {
      const payload = {
        diagnostic_id: diagnosticId,
        question_key: question.key,
        answer_fr: currentAnswer.answer_fr || "",
        answer_native: currentAnswer.answer_native || "",
        validated_by_learner: currentAnswer.validated_by_learner,
        validated_by_formateur: currentAnswer.validated_by_formateur,
        validated_at:
          currentAnswer.validated_by_learner && currentAnswer.validated_by_formateur
            ? new Date().toISOString()
            : null,
      };
      const { data, error } = await supabase
        .from("shared_diagnostic_answers")
        .upsert(payload, { onConflict: "diagnostic_id,question_key" })
        .select()
        .single();
      if (error) throw error;
      updateAnswer({ id: data.id });
      return true;
    } catch (e: any) {
      toast.error("Erreur enregistrement : " + (e.message || "inconnue"));
      return false;
    } finally {
      setSavingAnswer(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagnosticId, question, currentAnswer]);

  const validateLearner = async () => {
    updateAnswer({ validated_by_learner: !currentAnswer?.validated_by_learner });
    setTimeout(() => { saveCurrent(); }, 50);
  };
  const validateFormateur = async () => {
    updateAnswer({ validated_by_formateur: !currentAnswer?.validated_by_formateur });
    setTimeout(() => { saveCurrent(); }, 50);
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      saveCurrent();
      setCurrentIndex(currentIndex - 1);
    }
  };
  const goNext = async () => {
    const ok = await saveCurrent();
    if (!ok) return;
    if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) setCurrentIndex(currentIndex + 1);
    else setShowCompetenceStep(true);
  };

  const completeDiagnostic = async () => {
    if (!diagnosticId) return;
    setCompleting(true);
    try {
      if (!showCompetenceStep) await saveCurrent();
      const { error } = await supabase
        .from("shared_diagnostics")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", diagnosticId);
      if (error) throw error;
      supabase.functions.invoke("sync-hubspot-diagnostic", {
        body: { diagnosticType: "shared_diagnostic", diagnosticId },
      }).catch((syncError) => console.error("HubSpot sync error:", syncError));
      toast.success("Diagnostic terminé !");
      navigate("/formateur/apprenants");
    } catch (e: any) {
      toast.error("Erreur : " + (e.message || "inconnue"));
    } finally {
      setCompleting(false);
    }
  };

  if (!user) {
    return <FormateurLoginPrompt trainerId={trainerParam} />;
  }

  // ─── Setup screen (no diagnostic id yet) ─────────────────────
  if (!diagnosticId) {
    return (
      <SetupScreen
        learnerLanguage={learnerLanguage}
        setLearnerLanguage={setLearnerLanguage}
        onCreate={(id) => {
          setDiagnosticId(id);
          // Update URL so refresh works
          window.history.replaceState(null, "", `/diagnostic-partage?id=${id}`);
        }}
        preferredTrainerId={trainerParam}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Language confirmation screen — shown at the start of each session
  if (!languageConfirmed) {
    return (
      <LanguageConfirmScreen
        learnerLanguage={learnerLanguage}
        setLearnerLanguage={setLearnerLanguage}
        onConfirm={confirmLanguage}
        updating={updatingLanguage}
      />
    );
  }

  if (!question) return null;

  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === learnerLanguage);
  const isRTL = !!langMeta?.rtl;
  const bothValidated =
    !!currentAnswer?.validated_by_learner && !!currentAnswer?.validated_by_formateur;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-20 pb-12 sm:pt-24">
        {/* Progress header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5">
                <Sparkles className="h-3 w-3" />
                Diagnostic partagé
              </Badge>
              <span className="text-sm text-muted-foreground">
                Question {currentIndex + 1}/{total}
              </span>
              <Badge variant="secondary" className="gap-1">
                <FileCheck2 className="h-3 w-3" />
                {validatedCount}/{total} validées
              </Badge>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Globe className="h-3 w-3" />
              {langMeta?.flag} {langMeta?.label}
            </Badge>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question header */}
        <div className="mb-4 text-center">
          <Badge className="mb-2" variant="outline">
            <span className="mr-1">{CATEGORY_META[question.category].icon}</span>
            {CATEGORY_META[question.category].label}
          </Badge>
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-3xl">{question.icon}</span>
          </div>
        </div>

        {/* Split view */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {/* ─── APPRENANT ───────────────────────────────── */}
            <div
              className={cn(
                "rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-sm",
                isRTL && "text-right"
              )}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  👤 Apprenant
                </Badge>
                <span className="text-xs text-muted-foreground">{langMeta?.flag} {langMeta?.label}</span>
              </div>

              <p className="text-lg font-semibold text-foreground mb-3 leading-snug">
                {question.question[learnerLanguage] || question.question.fr}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => learnerTTS.speak(question.question[learnerLanguage] || question.question.fr)}
                disabled={learnerTTS.isSpeaking}
                className="mb-3 gap-2"
              >
                <Volume2 className={cn("h-4 w-4", learnerTTS.isSpeaking && "animate-pulse text-primary")} />
                {learnerTTS.isSpeaking ? "En cours…" : "Écouter"}
              </Button>

              <Textarea
                value={currentAnswer?.answer_native || ""}
                onChange={(e) => updateAnswer({ answer_native: e.target.value })}
                placeholder={isRTL ? "اكتب أو تحدث هنا…" : "Écrivez ou parlez ici…"}
                className="min-h-[120px] mb-3"
                dir={isRTL ? "rtl" : "ltr"}
              />
              {speech.interimTranscript && (
                <p className="text-xs text-muted-foreground italic mb-2">
                  🎙️ {speech.interimTranscript}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {speech.isSupported && (
                  <Button
                    variant={speech.isListening ? "default" : "outline"}
                    size="sm"
                    onClick={() => (speech.isListening ? speech.stop() : speech.start())}
                    className="gap-2"
                  >
                    {speech.isListening ? (
                      <><MicOff className="h-4 w-4" /> Arrêter</>
                    ) : (
                      <><Mic className="h-4 w-4" /> Dicter</>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={translateNativeToFr}
                  disabled={translating || !currentAnswer?.answer_native?.trim()}
                  className="gap-2"
                >
                  {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : "→ FR"}
                  Traduire en français
                </Button>
              </div>

              {/* Validation apprenant */}
              <Button
                onClick={validateLearner}
                variant={currentAnswer?.validated_by_learner ? "default" : "outline"}
                className={cn(
                  "w-full mt-4 gap-2",
                  currentAnswer?.validated_by_learner && "bg-success text-success-foreground hover:bg-success/90"
                )}
                disabled={!currentAnswer?.answer_native?.trim()}
              >
                <Check className="h-4 w-4" />
                {currentAnswer?.validated_by_learner
                  ? "Validé par l'apprenant ✓"
                  : isRTL
                  ? "أؤكد ردّي"
                  : "Je valide ma réponse"}
              </Button>
            </div>

            {/* ─── FORMATEUR ───────────────────────────────── */}
            <div className="rounded-2xl border-2 border-secondary/40 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">🧑‍🏫 Formateur / CIP</Badge>
                <span className="text-xs text-muted-foreground">🇫🇷 Français</span>
              </div>

              <p className="text-lg font-semibold text-foreground mb-1 leading-snug">
                {question.question.fr}
              </p>
              {question.helper_fr && (
                <p className="text-xs text-muted-foreground mb-3 italic">
                  💡 {question.helper_fr}
                </p>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => formateurTTS.speak(question.question.fr)}
                disabled={formateurTTS.isSpeaking}
                className="mb-3 gap-2"
              >
                <Volume2 className={cn("h-4 w-4", formateurTTS.isSpeaking && "animate-pulse text-primary")} />
                {formateurTTS.isSpeaking ? "En cours…" : "Écouter"}
              </Button>

              <Textarea
                value={currentAnswer?.answer_fr || ""}
                onChange={(e) => updateAnswer({ answer_fr: e.target.value })}
                placeholder="Reformulation en français — version officielle du diagnostic"
                className="min-h-[120px] mb-3"
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentAnswer?.answer_fr && formateurTTS.speak(currentAnswer.answer_fr)}
                  disabled={!currentAnswer?.answer_fr?.trim() || formateurTTS.isSpeaking}
                  className="gap-2"
                >
                  <Volume2 className="h-4 w-4" />
                  Relire la réponse
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={translateFrToNative}
                  disabled={translating || !currentAnswer?.answer_fr?.trim()}
                  className="gap-2"
                >
                  {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : `→ ${langMeta?.flag}`}
                  Traduire pour l'apprenant
                </Button>
              </div>

              {/* Validation formateur */}
              <Button
                onClick={validateFormateur}
                variant={currentAnswer?.validated_by_formateur ? "default" : "outline"}
                className={cn(
                  "w-full mt-4 gap-2",
                  currentAnswer?.validated_by_formateur && "bg-success text-success-foreground hover:bg-success/90"
                )}
                disabled={!currentAnswer?.answer_fr?.trim()}
              >
                <Check className="h-4 w-4" />
                {currentAnswer?.validated_by_formateur
                  ? "Validé par le formateur ✓"
                  : "Je valide cette réponse"}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0 || savingAnswer}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédente
          </Button>

          <div className="text-center text-sm flex-1 min-w-[180px]">
            {bothValidated ? (
              <span className="inline-flex items-center gap-1 text-success font-medium">
                <Check className="h-4 w-4" /> Question validée par les deux
              </span>
            ) : (
              <span className="text-muted-foreground">
                Validez chacun votre côté pour figer la réponse
              </span>
            )}
          </div>

          {currentIndex < total - 1 ? (
            <Button onClick={goNext} disabled={savingAnswer} className="gap-2">
              {savingAnswer && <Loader2 className="h-4 w-4 animate-spin" />}
              Suivante
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeDiagnostic}
              disabled={completing || validatedCount < total}
              className="gap-2 bg-success text-success-foreground hover:bg-success/90"
            >
              {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
              Terminer le diagnostic
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

function FormateurLoginPrompt({ trainerId }: { trainerId: string | null }) {
  const loginRedirect = trainerId
    ? `/login?redirect=${encodeURIComponent(`/diagnostic-partage?formateur=${trainerId}`)}`
    : "/login?redirect=/diagnostic-partage";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pt-20 pb-12 sm:pt-24">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Diagnostic partagé</h1>
          <p className="text-muted-foreground">
            Connectez-vous comme formateur pour choisir un apprenant et démarrer le diagnostic.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-4 text-center">
          <Button size="lg" className="w-full gap-2" asChild>
            <Link to={loginRedirect}>
              Connexion formateur
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Après connexion, vous pourrez sélectionner ou créer l'apprenant.
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Setup screen ────────────────────────────────────────────────
function SetupScreen({
  learnerLanguage,
  setLearnerLanguage,
  onCreate,
  preferredTrainerId,
}: {
  learnerLanguage: LanguageCode;
  setLearnerLanguage: (l: LanguageCode) => void;
  onCreate: (id: string) => void;
  preferredTrainerId: string | null;
}) {
  const { user } = useAuth();
  const [learners, setLearners] = useState<{ id: string; first_name: string | null; last_name: string | null; email: string | null }[]>([]);
  const [selectedLearner, setSelectedLearner] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadLearners = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: links } = await supabase
        .from("formateur_learners")
        .select("learner_id")
        .eq("formateur_id", user.id);
      const ids = (links || []).map((l: any) => l.learner_id);
      if (!ids.length) {
        setLearners([]);
        return;
      }
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, email")
        .in("user_id", ids);
      setLearners(
        (profs || []).map((p: any) => ({
          id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
        }))
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLearners();
  }, [loadLearners]);

  const create = async () => {
    const formateurId = preferredTrainerId || user?.id;
    if (!formateurId || !selectedLearner) {
      toast.error("Sélectionnez un apprenant.");
      return;
    }
    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("shared_diagnostics")
        .insert({
          learner_id: selectedLearner,
          formateur_id: formateurId,
          learner_language: learnerLanguage,
        })
        .select()
        .single();
      if (error) throw error;
      onCreate(data.id);
    } catch (e: any) {
      toast.error("Erreur : " + (e.message || "inconnue"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pt-20 pb-12 sm:pt-24">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Diagnostic partagé</h1>
          <p className="text-muted-foreground">
            Un entretien guidé en deux langues, validé par l'apprenant et le formateur.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5">
          {/* Apprenant */}
          <div>
            <div className="flex items-center justify-between mb-2 gap-2">
              <label className="text-sm font-medium">1. Apprenant</label>
              <CreateLearnerDialog onCreated={loadLearners} />
            </div>
            {loading ? (
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : learners.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-3">
                Aucun apprenant rattaché. Cliquez sur « Créer un apprenant » ci-dessus pour en ajouter un.
              </p>
            ) : (
              <select
                value={selectedLearner}
                onChange={(e) => setSelectedLearner(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— Sélectionner —</option>
                {learners.map((l) => (
                  <option key={l.id} value={l.id}>
                    {[l.first_name, l.last_name].filter(Boolean).join(" ") || l.email || l.id}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Langue */}
          <div>
            <label className="text-sm font-medium mb-2 block">2. Langue native de l'apprenant</label>
            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLearnerLanguage(lang.code as LanguageCode)}
                  className={cn(
                    "rounded-lg border-2 p-3 text-sm font-medium transition-all",
                    learnerLanguage === lang.code
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  <div className="text-xl mb-1">{lang.flag}</div>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={create}
            disabled={!selectedLearner || creating}
            size="lg"
            className="w-full gap-2"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Démarrer le diagnostic
          </Button>
        </div>
      </main>
    </div>
  );
}

// ─── Language confirmation screen (shown at start of each session) ────
function LanguageConfirmScreen({
  learnerLanguage,
  setLearnerLanguage,
  onConfirm,
  updating,
}: {
  learnerLanguage: LanguageCode;
  setLearnerLanguage: (l: LanguageCode) => void;
  onConfirm: () => void;
  updating: boolean;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pt-20 pb-12 sm:pt-24">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Globe className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Quelle est votre langue ?
          </h1>
          <p className="text-muted-foreground">
            Choisissez la langue de l'apprenant pour ce diagnostic.
            <br />
            <span className="text-sm">
              اختر لغتك · Choose your language · Elige tu idioma · Выберите язык
            </span>
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLearnerLanguage(lang.code as LanguageCode)}
                className={cn(
                  "rounded-xl border-2 p-4 text-base font-medium transition-all",
                  learnerLanguage === lang.code
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className="text-3xl mb-2">{lang.flag}</div>
                {lang.label}
              </button>
            ))}
          </div>

          <Button
            onClick={onConfirm}
            disabled={updating}
            size="lg"
            className="w-full gap-2"
          >
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Continuer
          </Button>
        </div>
      </main>
    </div>
  );
}

export default SharedDiagnostic;
