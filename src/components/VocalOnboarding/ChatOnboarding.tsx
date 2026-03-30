import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import marianneAvatar from "@/assets/marianne-avatar.png";
import { GooglePlacesAutocomplete, type GooglePlacesAutocompleteHandle } from "./GooglePlacesAutocomplete";
import { callOnboardingChat } from "@/lib/onboardingChat";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { z } from "zod";
import {
  ONBOARDING_TREE,
  getNextQuestion,
  determineRoute,
  getTranslatedText,
  OnboardingAnswers,
  LeadRoute,
} from "@/lib/decisionTree";

const emailSchema = z.string().trim().email().max(255);

interface ChatMessage {
  role: "marianne" | "user";
  content: string;
}

// Questions that need a special inline widget instead of free text
const WIDGET_QUESTIONS = new Set(["location", "contact_email", "contact_firstname", "contact_lastname"]);
// Questions where we accept free text directly (no AI parsing needed)
const DIRECT_TEXT_QUESTIONS = new Set(["location", "contact_firstname", "contact_lastname", "contact_email", "origin_country"]);

interface ChatOnboardingProps {
  onComplete: (answers: OnboardingAnswers) => void;
  initialAnswers: OnboardingAnswers;
}

export function ChatOnboarding({ onComplete, initialAnswers }: ChatOnboardingProps) {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(ONBOARDING_TREE.startQuestion);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [isComplete, setIsComplete] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const [vocalMode, setVocalMode] = useState(true); // full vocal by default
  const chatEndRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<GooglePlacesAutocompleteHandle>(null);
  const hasGreeted = useRef(false);
  const shouldAutoListen = useRef(false);
  const pendingTranscriptRef = useRef<string>("");
  const currentQuestionIdRef = useRef(currentQuestionId);
  currentQuestionIdRef.current = currentQuestionId;

  const currentQuestion = ONBOARDING_TREE.questions[currentQuestionId];
  const isDirectText = DIRECT_TEXT_QUESTIONS.has(currentQuestionId);
  const isWidget = WIDGET_QUESTIONS.has(currentQuestionId);
  const isEmail = currentQuestionId === "contact_email";
  const isRTL = language === "ar";

  // TTS with onEnd to auto-start mic
  const { speak, isSpeaking } = useTTS({
    language,
    onEnd: () => {
      const qId = currentQuestionIdRef.current;
      const skipMic = qId === "contact_email" || qId === "contact_firstname" || qId === "contact_lastname";
      if (shouldAutoListen.current && vocalMode && sttSupported && !skipMic) {
        shouldAutoListen.current = false;
        setTimeout(() => startListening(), 300);
      }
    },
  });

  const { isListening, transcript, isSupported: sttSupported, start: startListening, stop: stopListening, reset: resetSTT } = useSpeechRecognition({
    language,
  });

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      pendingTranscriptRef.current = transcript;
    }
  }, [transcript]);

  // Auto-submit when STT stops (final result) in vocal mode
  useEffect(() => {
    if (!isListening && pendingTranscriptRef.current && vocalMode && !isProcessing && !isEmail) {
      const value = pendingTranscriptRef.current.trim();
      pendingTranscriptRef.current = "";
      if (value) {
        setTimeout(() => processAnswer(value), 200);
      }
    }
  }, [isListening]);

  // Build conversation summary for AI context
  const buildSummary = useCallback(() => {
    const parts: string[] = [];
    if (answers.location) parts.push(`Ville: ${answers.location}`);
    if (answers.origin_country) parts.push(`Pays: ${answers.origin_country}`);
    if (answers.main_goal) parts.push(`Objectif: ${answers.main_goal}`);
    if (answers.french_level_cecrl) parts.push(`Niveau français: ${answers.french_level_cecrl}`);
    if (answers.work_right) parts.push(`Droit travail: ${answers.work_right}`);
    if (answers.contact_firstname) parts.push(`Prénom: ${answers.contact_firstname}`);
    return parts.join(", ");
  }, [answers]);

  // Speak and auto-start mic after
  const speakAndListen = useCallback((text: string) => {
    shouldAutoListen.current = true;
    resetSTT();
    pendingTranscriptRef.current = "";
    speak(text);
  }, [speak, resetSTT]);

  // Greet on mount
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    greet();
  }, []);

  const greet = async () => {
    setIsProcessing(true);
    try {
      const question = ONBOARDING_TREE.questions[ONBOARDING_TREE.startQuestion];
      const response = await callOnboardingChat({
        action: "onboarding_chat",
        phase: "greet",
        question,
        language,
      });

      const msg: ChatMessage = { role: "marianne", content: response.marianne_message };
      setMessages([msg]);
      speakAndListen(response.marianne_message);
    } catch (err) {
      console.error("Greet error:", err);
      const fallback = language === "ar" ? "مرحباً! أنا ماريان. أين تسكن في فرنسا؟" :
        language === "en" ? "Hello! I'm Marianne. Where do you live in France?" :
        "Bonjour ! Je suis Marianne, votre conseillère. Où habitez-vous en France ?";
      setMessages([{ role: "marianne", content: fallback }]);
      speakAndListen(fallback);
    } finally {
      setIsProcessing(false);
      console.log("[DEBUG-LOC] greet done, isProcessing set to false");
    }
  };

  const processAnswer = useCallback(async (userText: string) => {
    console.log("[DEBUG-LOC] processAnswer called:", { userText, isProcessing, isComplete, currentQuestionId });
    if (!userText.trim() || isProcessing || isComplete) {
      console.warn("[DEBUG-LOC] processAnswer BLOCKED:", { emptyText: !userText.trim(), isProcessing, isComplete });
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: userText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setEmailError(null);

    if (isEmail) {
      const result = emailSchema.safeParse(userText);
      if (!result.success) {
        setEmailError("Format email invalide");
        const errorMsg: ChatMessage = {
          role: "marianne",
          content: language === "ar" ? "هذا البريد الإلكتروني غير صحيح، يرجى المحاولة مرة أخرى." :
            language === "en" ? "This email doesn't look right. Could you try again?" :
            "Cet email ne semble pas correct. Pouvez-vous réessayer ?"
        };
        setMessages(prev => [...prev, errorMsg]);
        speakAndListen(errorMsg.content);
        return;
      }
    }

    setIsProcessing(true);

    try {
      let answerValue = userText.trim();
      let newAnswers = { ...answers };

      if (isDirectText) {
        newAnswers = {
          ...newAnswers,
          [currentQuestionId]: answerValue,
        };
        setAnswers(newAnswers);

        const nextQId = getNextQuestion(currentQuestionId, answerValue, newAnswers);
        const nextQ = nextQId ? ONBOARDING_TREE.questions[nextQId] : null;

        // For location, skip AI vocal repeat (hard to transcribe city names across languages)
        if (currentQuestionId === "location") {
          if (nextQId && nextQ) {
            const shortAck = await callOnboardingChat({
              action: "onboarding_chat",
              phase: "parse",
              question: currentQuestion,
              user_answer: answerValue,
              next_question: nextQ,
              language,
              conversation_summary: buildSummary(),
            });
            const marianneMsg: ChatMessage = { role: "marianne", content: shortAck.marianne_message };
            setMessages(prev => [...prev, marianneMsg]);
            // For location, speak the ack but don't auto-listen (next Q needs widget or voice)
            speakAndListen(shortAck.marianne_message);
            setQuestionHistory(prev => [...prev, currentQuestionId]);
            setCurrentQuestionId(nextQId);
          } else {
            setIsComplete(true);
            setTimeout(() => onComplete(newAnswers), 1500);
          }
        } else {
          const response = await callOnboardingChat({
            action: "onboarding_chat",
            phase: "parse",
            question: currentQuestion,
            user_answer: answerValue,
            next_question: nextQ,
            language,
            conversation_summary: buildSummary(),
          });

          const marianneMsg: ChatMessage = { role: "marianne", content: response.marianne_message };
          setMessages(prev => [...prev, marianneMsg]);
          speakAndListen(response.marianne_message);

          if (nextQId) {
            setQuestionHistory(prev => [...prev, currentQuestionId]);
            setCurrentQuestionId(nextQId);
          } else {
            setIsComplete(true);
            setTimeout(() => onComplete(newAnswers), 1500);
          }
        }
      } else {
        const nextQIdPreview = getNextQuestion(currentQuestionId, "", newAnswers);
        const nextQPreview = nextQIdPreview ? ONBOARDING_TREE.questions[nextQIdPreview] : null;

        const response = await callOnboardingChat({
          action: "onboarding_chat",
          phase: "parse",
          question: currentQuestion,
          user_answer: answerValue,
          next_question: nextQPreview,
          language,
          conversation_summary: buildSummary(),
        });

        if (response.needs_clarification) {
          const marianneMsg: ChatMessage = { role: "marianne", content: response.marianne_message };
          setMessages(prev => [...prev, marianneMsg]);
          speakAndListen(response.marianne_message);
          setIsProcessing(false);
          return;
        }

        let matchedAnswer: string = "";
        let allTags: string[] = [];

        if (response.matched_choice_ids && response.matched_choice_ids.length > 0) {
          if (currentQuestion.type === "multiChoice") {
            matchedAnswer = response.matched_choice_ids.join(",");
            response.matched_choice_ids.forEach(choiceId => {
              const choice = currentQuestion.choices?.find(c => c.id === choiceId);
              if (choice?.tags) allTags.push(...choice.tags);
            });
          } else {
            matchedAnswer = response.matched_choice_ids[0];
            const choice = currentQuestion.choices?.find(c => c.id === matchedAnswer);
            if (choice?.tags) allTags.push(...choice.tags);
          }
        } else if (response.extracted_text) {
          matchedAnswer = response.extracted_text;
        } else {
          matchedAnswer = "";
        }

        newAnswers = {
          ...newAnswers,
          [currentQuestionId]: matchedAnswer,
          tags: allTags.length > 0 ? [...newAnswers.tags, ...allTags] : newAnswers.tags,
        };
        setAnswers(newAnswers);

        const nextQId = getNextQuestion(currentQuestionId, matchedAnswer, newAnswers);
        let finalMessage = response.marianne_message;

        if (nextQId !== nextQIdPreview && nextQId) {
          const actualNextQ = ONBOARDING_TREE.questions[nextQId];
          try {
            const transitionResponse = await callOnboardingChat({
              action: "onboarding_chat",
              phase: "parse",
              question: currentQuestion,
              user_answer: answerValue,
              next_question: actualNextQ,
              language,
              conversation_summary: buildSummary(),
            });
            finalMessage = transitionResponse.marianne_message;
          } catch {
            // Use original message as fallback
          }
        }

        const marianneMsg: ChatMessage = { role: "marianne", content: finalMessage };
        setMessages(prev => [...prev, marianneMsg]);
        speakAndListen(finalMessage);

        if (nextQId) {
          setQuestionHistory(prev => [...prev, currentQuestionId]);
          setCurrentQuestionId(nextQId);
        } else {
          setIsComplete(true);
          setTimeout(() => onComplete(newAnswers), 1500);
        }
      }
    } catch (err) {
      console.error("Process answer error:", err);
      toast.error("Erreur de connexion avec Marianne");
    } finally {
      setIsProcessing(false);
    }
  }, [currentQuestionId, currentQuestion, answers, isProcessing, isComplete, isDirectText, isEmail, language, speak, buildSummary, onComplete]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      // In vocal mode, auto-submit happens via the useEffect
      if (!vocalMode && transcript) setInputText(transcript);
    } else {
      resetSTT();
      pendingTranscriptRef.current = "";
      startListening();
    }
  };

  const handleSubmit = () => {
    pendingTranscriptRef.current = "";
    processAnswer(inputText);
  };

  const getLocationValue = (): string => {
    if (inputText.trim()) return inputText.trim();
    const refValue = locationInputRef.current?.getValue();
    if (refValue?.trim()) return refValue.trim();
    return "";
  };

  const handleLocationSubmit = () => {
    const value = getLocationValue();
    if (value.trim()) processAnswer(value.trim());
  };

  const agentState = isProcessing ? "thinking" : isSpeaking ? "speaking" : isListening ? "listening" : "idle";



  const questionProgress = questionHistory.length + 1;

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-card border border-border shrink-0">
        <div className="relative shrink-0" style={{ width: 48, height: 48 }}>
          <img
            src={marianneAvatar}
            alt="Marianne"
            className="h-12 w-12 rounded-full object-cover object-top border-2 border-primary/30"
          />
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-card text-[8px]"
            style={{
              backgroundColor: agentState === "listening" ? "hsl(0,84%,60%)" :
                agentState === "thinking" ? "hsl(45,93%,47%)" :
                "hsl(142,76%,36%)"
            }}
          >
            {agentState === "listening" ? "🎤" : agentState === "speaking" ? "🔊" : agentState === "thinking" ? "⏳" : "✓"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Marianne</p>
          <div className="flex items-center gap-2">
            <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-muted max-w-[120px]">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${Math.min((questionProgress / 12) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{questionProgress}/~12</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-3 px-1">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border rounded-bl-md"
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.role === "marianne" && (
                  <button
                    onClick={() => speak(msg.content)}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Volume2 className="h-3 w-3" /> {language === "ar" ? "استمع" : "Écouter"}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {!isComplete && (
        <div className="border-t border-border bg-background/80 backdrop-blur-sm pt-3 space-y-3">
          {currentQuestionId === "location" && (
            <div className="mb-2">
              <GooglePlacesAutocomplete
                ref={locationInputRef}
                value={inputText}
                onChange={setInputText}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLocationSubmit();
                }}
              />
            </div>
          )}

          {emailError && (
            <p className="mb-2 text-xs text-destructive px-1">{emailError}</p>
          )}

          {/* Vocal-first: big mic button for all questions except email */}
          {vocalMode && sttSupported && !isEmail && (
            <div className="flex flex-col items-center gap-2">
              <motion.button
                onClick={handleMicToggle}
                disabled={isProcessing || isSpeaking}
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-all shadow-lg ${
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse"
                    : isSpeaking
                    ? "bg-muted text-muted-foreground cursor-wait"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </motion.button>
              <p className="text-xs text-muted-foreground">
                {isListening
                  ? (language === "ar" ? "🎤 أتحدث..." : "🎤 Je vous écoute...")
                  : isSpeaking
                  ? (language === "ar" ? "🔊 ماريان تتحدث..." : "🔊 Marianne parle...")
                  : (language === "ar" ? "اضغط للتحدث" : "Appuyez pour parler")}
              </p>
              {inputText && !isListening && (
                <div className="flex items-center gap-2 w-full">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inputText.trim()) handleSubmit();
                    }}
                    className="flex-1 text-sm"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  <Button size="icon" onClick={handleSubmit} disabled={isProcessing || !inputText.trim()} className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Fallback text input for email or non-vocal mode */}
          {(!vocalMode || !sttSupported || isEmail) && (
            <div className="flex items-center gap-2">
              {sttSupported && !isWidget && (
                <Button
                  variant={isListening ? "destructive" : "outline"}
                  size="icon"
                  onClick={handleMicToggle}
                  disabled={isProcessing}
                  className="shrink-0"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}

              {currentQuestionId !== "location" && (
                <Input
                  type={isEmail ? "email" : "text"}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputText.trim()) handleSubmit();
                  }}
                  placeholder={isEmail ? "email@exemple.com" :
                    (language === "ar" ? "اكتب إجابتك..." : "Tapez votre réponse...")}
                  className="flex-1"
                  disabled={isProcessing}
                  dir={isRTL && !isEmail ? "rtl" : "ltr"}
                />
              )}

              <Button
                size="icon"
                onClick={currentQuestionId === "location" ? handleLocationSubmit : handleSubmit}
                disabled={isProcessing || (!inputText.trim() && currentQuestionId !== "location")}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center space-x-2 px-1">
            <Checkbox 
              id="rgpd" 
              checked={rgpdAccepted} 
              onCheckedChange={(checked) => setRgpdAccepted(!!checked)} 
            />
            <Label htmlFor="rgpd" className="text-xs text-muted-foreground">
              {language === "ar" ? "أوافق على معالجة بياناتي وفقاً لسياسة الخصوصية" : "J'accepte le traitement de mes données conformément à la politique de confidentialité"}
            </Label>
          </div>
        </div>
      )}

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            {language === "ar" ? "🎉 شكراً! جاري تحليل ملفك..." : "🎉 Merci ! Analyse de votre profil en cours..."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
