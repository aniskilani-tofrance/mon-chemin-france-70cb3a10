import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { questions, getTimerDuration, type PlacementQuestion } from "@/lib/placementTestQuestions";
import { supabase } from "@/integrations/supabase/client";
import { Volume2, Mic, MicOff, ChevronLeft, ChevronRight, SkipForward, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_69409edef41e4f2a833c897b/ac7782ec6_logopefpetit.png";

interface AnswerRecord {
  questionId: number;
  answer: string;
  isCorrect: boolean;
  level: string;
  category: string;
  timeTaken: number;
}

export default function PlacementTest() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [oralTranscript, setOralTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex];
  const isQCM = !currentQuestion.type;
  const isWritten = currentQuestion.type === "written";
  const isOral = currentQuestion.type === "oral";
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer
  useEffect(() => {
    if (isQCM) {
      const duration = getTimerDuration(currentQuestion.level);
      setTimeLeft(duration);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleNext(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setQuestionStartTime(Date.now());
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex]);

  // Reset selection on question change
  useEffect(() => {
    setSelectedOption(answers[currentQuestion.id] || null);
    setWrittenAnswer(answers[currentQuestion.id] || "");
    setOralTranscript(answers[currentQuestion.id] || "");
  }, [currentIndex]);

  const playAudio = useCallback(async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const { data, error } = await supabase.functions.invoke("openai-tts", {
        body: { text, voice: "nova", speed: 0.9 },
      });
      if (error) throw error;
      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch {
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("La reconnaissance vocale n'est pas supportée par ce navigateur.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) setOralTranscript(final);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const getCurrentAnswer = (): string => {
    if (isQCM) return selectedOption || "";
    if (isWritten) return writtenAnswer;
    if (isOral) return oralTranscript;
    return "";
  };

  const recordAnswer = (answer: string, skipped = false) => {
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const isCorrect = isQCM && !skipped ? answer === currentQuestion.correct : false;

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setAnswerRecords(prev => {
      const existing = prev.findIndex(r => r.questionId === currentQuestion.id);
      const record: AnswerRecord = {
        questionId: currentQuestion.id,
        answer: skipped ? "" : answer,
        isCorrect,
        level: currentQuestion.level,
        category: currentQuestion.category,
        timeTaken,
      };
      if (existing >= 0) {
        const newRecords = [...prev];
        newRecords[existing] = record;
        return newRecords;
      }
      return [...prev, record];
    });
    return { timeTaken };
  };

  const handleNext = (timedOut = false) => {
    const answer = timedOut ? "" : getCurrentAnswer();
    recordAnswer(answer, timedOut);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const answer = getCurrentAnswer();
      if (answer) recordAnswer(answer);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    recordAnswer("", true);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
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

    // Calculate scores
    const qcmAnswers = answerRecords.filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q && !q.type;
    });
    const correctCount = qcmAnswers.filter(a => a.isCorrect).length;
    const totalQCM = qcmAnswers.length || 1;
    const score = Math.round((correctCount / totalQCM) * 100);

    // Determine level from detailed analysis
    let level: string;
    if (score >= 80) {
      // Check C1/C2 performance
      const c1Answers = answerRecords.filter(a => a.level === "C1" && a.isCorrect);
      const c2Answers = answerRecords.filter(a => a.level === "C2" && a.isCorrect);
      const c1Total = answerRecords.filter(a => a.level === "C1").length;
      const c2Total = answerRecords.filter(a => a.level === "C2").length;
      
      if (c2Total > 0 && (c2Answers.length / c2Total) >= 0.6) level = "C2";
      else if (c1Total > 0 && (c1Answers.length / c1Total) >= 0.6) level = "C1";
      else level = "B2";
    } else if (score >= 65) level = "B1";
    else if (score >= 45) level = "A2";
    else level = "A1";

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    const resultData = {
      candidate_name: candidate.name,
      candidate_email: candidate.email,
      candidate_phone: candidate.phone || null,
      score,
      level,
      answers: answerRecords as any,
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

    sessionStorage.setItem("placement_result", JSON.stringify({
      id: data.id,
      ...resultData,
    }));

    navigate("/placement-test/results");
  };

  const timerColor = timeLeft <= 3 ? "#ef4444" : timeLeft <= 5 ? "#f59e0b" : "#17c3b2";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafa" }}>
      {/* Header */}
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
        {/* Level & Category badge */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ backgroundColor: "#00504e" }}
            >
              {currentQuestion.level}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {currentQuestion.category}
            </span>
          </div>
          {isQCM && (
            <div className="flex items-center gap-1.5 font-mono text-lg font-bold" style={{ color: timerColor }}>
              <Clock className="h-4 w-4" />
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Question card */}
        <div className="rounded-2xl border bg-white p-6 shadow-md">
          {/* Audio button for oral comprehension */}
          {currentQuestion.audioText && (
            <button
              onClick={() => playAudio(currentQuestion.audioText!)}
              disabled={isSpeaking}
              className="mb-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all"
              style={{ backgroundColor: isSpeaking ? "#94a3b8" : "#17c3b2" }}
            >
              <Volume2 className="h-4 w-4" />
              {isSpeaking ? "Lecture en cours..." : "🔊 Écouter"}
            </button>
          )}

          <h2 className="mb-6 text-lg font-semibold" style={{ color: "#00504e" }}>
            {currentQuestion.question}
          </h2>

          {/* QCM Options */}
          {isQCM && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                    selectedOption === opt
                      ? "border-transparent text-white shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  style={selectedOption === opt ? { backgroundColor: "#17c3b2" } : {}}
                >
                  <span className="text-sm font-medium">
                    {String.fromCharCode(65 + i)}.{" "}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Written answer */}
          {isWritten && (
            <div>
              <Textarea
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder={currentQuestion.placeholder || "Écrivez votre réponse ici..."}
                rows={5}
                className="resize-none"
              />
              {currentQuestion.minWords && (
                <p className="mt-2 text-xs text-gray-400">
                  Minimum {currentQuestion.minWords} mots
                  ({writtenAnswer.trim().split(/\s+/).filter(Boolean).length} mots écrits)
                </p>
              )}
            </div>
          )}

          {/* Oral answer */}
          {isOral && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition-all ${
                    isRecording ? "animate-pulse" : ""
                  }`}
                  style={{ backgroundColor: isRecording ? "#ef4444" : "#17c3b2" }}
                >
                  {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </button>
              </div>
              <p className="text-center text-sm text-gray-500">
                {isRecording ? "Enregistrement en cours... Cliquez pour arrêter." : "Cliquez pour commencer à parler."}
              </p>
              {oralTranscript && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-400 mb-1">Transcription :</p>
                  <p className="text-sm text-gray-700">{oralTranscript}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="gap-1 text-gray-400 hover:text-gray-600"
          >
            <SkipForward className="h-4 w-4" />
            Passer
          </Button>

          <Button
            onClick={() => handleNext(false)}
            disabled={submitting || (isQCM && !selectedOption)}
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
      </main>
    </div>
  );
}
