import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Send, Volume2, MapPin } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { OnboardingSignupWidget } from "./OnboardingSignupWidget";
import {
  ONBOARDING_TREE,
  getNextQuestion,
  determineRoute,
  getTranslatedText,
  OnboardingAnswers,
  LeadRoute,
} from "@/lib/decisionTree";

const emailSchema = z.string().trim().email().max(255);

// Validates that a city name has at least 2 characters
function isValidCity(value: string): boolean {
  return value.trim().length >= 2;
}

interface ChatMessage {
  role: "marianne" | "user";
  content: string;
}

// Questions that need a special inline widget instead of free text
const WIDGET_QUESTIONS = new Set(["location", "postal_code", "contact_email", "contact_firstname", "contact_lastname", "contact_phone"]);
// Questions where we accept free text directly (no AI parsing needed)
const DIRECT_TEXT_QUESTIONS = new Set(["location", "postal_code", "contact_firstname", "contact_lastname", "contact_email", "origin_country", "previous_job", "contact_phone"]);
// Minimum length for free text answers to avoid empty/meaningless submissions
const MIN_TEXT_LENGTH = 1;

interface ChatOnboardingProps {
  onComplete: (answers: OnboardingAnswers) => void;
  initialAnswers: OnboardingAnswers;
  resumeFromQuestion?: string | null;
  resumeCheckpointId?: string | null;
}

export function ChatOnboarding({ onComplete, initialAnswers, resumeFromQuestion, resumeCheckpointId }: ChatOnboardingProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>(resumeFromQuestion || ONBOARDING_TREE.startQuestion);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [isComplete, setIsComplete] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [rgpdAccepted, setRgpdAccepted] = useState(false);
  const [vocalMode, setVocalMode] = useState(true);
  const [showSignupCheckpoint, setShowSignupCheckpoint] = useState(false);
  const [checkpointDismissed, setCheckpointDismissed] = useState(false);
  const [checkpointId, setCheckpointId] = useState<string | null>(resumeCheckpointId || null);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);
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
  const isPhone = currentQuestionId === "contact_phone";
  const isPostalCode = currentQuestionId === "postal_code";
  const isRTL = language === "ar";
  const lastMarianneMessage = [...messages].reverse().find((msg) => msg.role === "marianne")?.content ?? "";

  // TTS with onEnd to auto-start mic
  const { speak, isSpeaking, wasCached } = useTTS({
    language,
    onEnd: () => {
      const qId = currentQuestionIdRef.current;
      const skipMic = qId === "location" || qId === "postal_code" || qId === "contact_email" || qId === "contact_firstname" || qId === "contact_lastname" || qId === "contact_phone";
      if (shouldAutoListen.current && vocalMode && sttSupported && !skipMic) {
        shouldAutoListen.current = false;
        setTimeout(() => startListening(), 300);
      }
    },
  });

  const { isListening, transcript, isSupported: sttSupported, start: startListening, stop: stopListening, reset: resetSTT } = useSpeechRecognition({
    language,
  });

  // CHECKPOINT: question that triggers signup prompt (after main_goal ~50%)
  const CHECKPOINT_AFTER_QUESTION = "main_goal";

  // Save checkpoint to database
  const saveCheckpoint = useCallback(async (userId: string | null, email: string | null, partialAnswers: OnboardingAnswers, step: string) => {
    try {
      if (checkpointId) {
        await supabase.from("onboarding_checkpoints").update({
          user_id: userId,
          email,
          partial_answers: JSON.parse(JSON.stringify(partialAnswers)),
          current_step: step,
          language,
        }).eq("id", checkpointId);
      } else {
        const { data } = await supabase.from("onboarding_checkpoints").insert({
          user_id: userId,
          email,
          partial_answers: JSON.parse(JSON.stringify(partialAnswers)),
          current_step: step,
          language,
        }).select("id").single();
        if (data) setCheckpointId(data.id);
      }
    } catch (err) {
      console.error("Error saving checkpoint:", err);
    }
  }, [checkpointId, language]);

  // Mark checkpoint as completed
  const markCheckpointComplete = useCallback(async () => {
    if (!checkpointId) return;
    try {
      await supabase.from("onboarding_checkpoints").update({
        completed: true,
        completed_at: new Date().toISOString(),
      }).eq("id", checkpointId);
    } catch (err) {
      console.error("Error marking checkpoint complete:", err);
    }
  }, [checkpointId]);

  // Handle signup completion from the widget (speak called in useEffect below)
  const pendingSignupAck = useRef<string | null>(null);
  const pendingSkipMsg = useRef<string | null>(null);

  const handleSignupComplete = useCallback(async (userId: string, signupEmail: string) => {
    await saveCheckpoint(userId, signupEmail, answers, currentQuestionId);
    setShowSignupCheckpoint(false);
    const ackMsg = language === "ar" ? "ممتاز! تم حفظ تقدّمكم. لنكمل معًا 😊" :
      language === "en" ? "Great! Your progress is saved. Let's continue 😊" :
      language === "es" ? "¡Genial! Tu progreso está guardado. Continuemos 😊" :
      "Parfait ! Votre progression est sauvegardée. Continuons ensemble 😊";
    setMessages(prev => [...prev, { role: "marianne", content: ackMsg }]);
    pendingSignupAck.current = ackMsg;
  }, [answers, currentQuestionId, saveCheckpoint, language]);

  const handleSkipSignup = useCallback(() => {
    setShowSignupCheckpoint(false);
    setCheckpointDismissed(true);
    const skipMsg = language === "ar" ? "لا مشكلة! لنكمل. يمكنكم إنشاء حساب لاحقًا." :
      language === "en" ? "No problem! Let's continue. You can create an account later." :
      language === "es" ? "¡Sin problema! Continuemos. Puedes crear una cuenta más tarde." :
      "Pas de souci ! Continuons. Vous pourrez créer un compte plus tard.";
    setMessages(prev => [...prev, { role: "marianne", content: skipMsg }]);
    pendingSkipMsg.current = skipMsg;
  }, [language]);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, showSignupCheckpoint]);

  // Sync transcript to input
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
      pendingTranscriptRef.current = transcript;
    }
  }, [transcript]);

  // Auto-submit when STT stops (final result) in vocal mode
  useEffect(() => {
    const qId = currentQuestionIdRef.current;
    const isSkipField = qId === "contact_firstname" || qId === "contact_lastname" || qId === "location" || qId === "postal_code";
    if (!isListening && pendingTranscriptRef.current && vocalMode && !isProcessing && !isEmail && !isPhone && !isSkipField) {
      const value = pendingTranscriptRef.current.trim();
      pendingTranscriptRef.current = "";
      if (value) {
        setTimeout(() => processAnswer(value), 200);
      }
    }
  }, [isListening]);

  // Build rich conversational summary for AI context
  const buildSummary = useCallback(() => {
    const parts: string[] = [];

    // Location & origin — geographic context
    if (answers.location) parts.push(`Habite à : ${answers.location}`);
    if (answers.origin_country) parts.push(`Vient de : ${answers.origin_country}`);

    // Identity
    if (answers.contact_firstname) parts.push(`Prénom : ${answers.contact_firstname}`);

    // Goals & motivation
    if (answers.main_goal) {
      const goalLabels: Record<string, string> = {
        learn_french: "apprendre le français",
        find_job: "trouver un emploi",
        get_training: "suivre une formation professionnelle",
        need_help: "a besoin d'aide pour se décider",
      };
      parts.push(`Objectif principal : ${goalLabels[answers.main_goal] || answers.main_goal}`);
    }

    // French level
    if (answers.french_level_cecrl) {
      const levelLabels: Record<string, string> = {
        alpha: "ne parle pas français (alpha)",
        post_alpha: "quelques mots (post-alpha)",
        a1: "niveau débutant (A1)",
        a2: "se débrouille (A2)",
        b1: "niveau intermédiaire (B1)",
      };
      parts.push(`Niveau de français : ${levelLabels[answers.french_level_cecrl] || answers.french_level_cecrl}`);
    }

    // Literacy
    if (answers.literacy) {
      const litLabels: Record<string, string> = {
        reads_writes_latin: "sait lire et écrire en alphabet latin",
        reads_writes_other: "sait lire et écrire dans un autre alphabet",
        no_read_write: "ne sait pas lire ni écrire",
      };
      parts.push(`Alphabétisation : ${litLabels[answers.literacy] || answers.literacy}`);
    }

    // Work situation
    if (answers.work_right) {
      const workLabels: Record<string, string> = {
        has_right: "a le droit de travailler",
        pending: "demande en cours",
        no_right: "pas encore le droit de travailler",
        not_sure: "ne sait pas",
      };
      parts.push(`Droit de travail : ${workLabels[answers.work_right] || answers.work_right}`);
    }
    if (answers.previous_job) parts.push(`Métier précédent : ${answers.previous_job}`);

    // Target sector & training preferences
    if (answers.target_sector) parts.push(`Secteur visé : ${answers.target_sector}`);
    if (answers.training_duration) parts.push(`Durée de formation souhaitée : ${answers.training_duration}`);
    if (answers.fle_type) parts.push(`Type de cours FLE souhaité : ${answers.fle_type}`);
    if (answers.fle_format) parts.push(`Format FLE : ${answers.fle_format}`);

    // Constraints & barriers
    if (answers.barriers) {
      const b = Array.isArray(answers.barriers) ? answers.barriers.join(", ") : answers.barriers;
      parts.push(`Freins identifiés : ${b}`);
    }
    if (answers.mobility) parts.push(`Mobilité : ${answers.mobility}`);
    if (answers.mobility_km) parts.push(`Distance max : ${answers.mobility_km}`);
    if (answers.funding_status) parts.push(`Financement : ${answers.funding_status}`);
    if (answers.immediate_availability) parts.push(`Disponibilité immédiate : ${answers.immediate_availability}`);
    if (answers.work_schedule) parts.push(`Horaires de travail : ${answers.work_schedule}`);

    // Contact preferences
    if (answers.contact_48h) parts.push(`Joignable sous 48h : ${answers.contact_48h}`);

    // Statut administratif & CIR/OFII (déclenche la règle d'or "OFII first")
    if (answers.admin_status) {
      const adminLabels: Record<string, string> = {
        titre_sejour: "titre de séjour",
        bpi_refugie: "réfugié OFPRA (BPI)",
        bpi_subsidiaire: "protection subsidiaire (BPI)",
        demandeur_asile: "demandeur d'asile",
        sans_papiers: "sans papiers",
        ne_sait_pas: "statut administratif inconnu",
      };
      parts.push(`Statut administratif : ${adminLabels[answers.admin_status as string] || answers.admin_status}`);
    }
    if (answers.cir_status) {
      const cirLabels: Record<string, string> = {
        signed_hours_left: "CIR signé — IL LUI RESTE DES HEURES OFII GRATUITES (priorité absolue : activer ces heures avant tout FLE payant)",
        signed_used: "CIR signé mais heures OFII épuisées",
        in_progress: "CIR en cours de signature",
        not_signed: "CIR non signé",
        not_concerned: "Non concerné par le CIR (UE, étudiant…)",
        dont_know: "ne sait pas pour le CIR",
      };
      parts.push(`CIR / OFII : ${cirLabels[answers.cir_status as string] || answers.cir_status}`);
    }

    if (parts.length === 0) return "";

    return `PROFIL DE L'UTILISATEUR (utilise ces infos pour personnaliser tes réactions et faire des liens pertinents entre les réponses) :\n${parts.join("\n")}`;
  }, [answers]);

  // Speak and auto-start mic after
  const speakAndListen = useCallback((text: string) => {
    shouldAutoListen.current = true;
    resetSTT();
    pendingTranscriptRef.current = "";
    speak(text);
  }, [speak, resetSTT]);

  // Speak pending signup/skip acknowledgment messages
  useEffect(() => {
    if (pendingSignupAck.current) {
      const msg = pendingSignupAck.current;
      pendingSignupAck.current = null;
      speakAndListen(msg);
    }
    if (pendingSkipMsg.current) {
      const msg = pendingSkipMsg.current;
      pendingSkipMsg.current = null;
      speakAndListen(msg);
    }
  }, [showSignupCheckpoint, speakAndListen]);

  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    if (resumeFromQuestion) {
      resumeGreet();
    } else {
      greet();
    }
  }, []);

  const resumeGreet = async () => {
    setIsProcessing(true);
    try {
      const question = ONBOARDING_TREE.questions[resumeFromQuestion!];
      const resumeMsg = language === "ar" ? "مرحبًا بعودتكم! لنكمل من حيث توقّفنا 😊" :
        language === "en" ? "Welcome back! Let's pick up where you left off 😊" :
        language === "es" ? "¡Bienvenido/a de nuevo! Continuemos donde lo dejamos 😊" :
        "Bon retour ! Reprenons là où vous en étiez 😊";
      
      const questionText = getTranslatedText(question as any, "text", language);
      const fullMsg = `${resumeMsg}\n\n${questionText}`;
      setMessages([{ role: "marianne", content: fullMsg }]);
      speakAndListen(fullMsg);
    } catch (err) {
      console.error("Resume greet error:", err);
      greet();
    } finally {
      setIsProcessing(false);
    }
  };

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
      const fallback = language === "ar" ? "مرحبًا بكم! أنا ماريان، مستشارتكم. أين تقيمون في فرنسا؟" :
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
          content: language === "ar" ? "يبدو أنَّ هذا البريد الإلكتروني غير صحيح. هل يمكنكم المحاولة مرّةً أخرى؟" :
            language === "en" ? "This email doesn't look right. Could you try again?" :
            "Cet email ne semble pas correct. Pouvez-vous réessayer ?"
        };
        setMessages(prev => [...prev, errorMsg]);
        speakAndListen(errorMsg.content);
        return;
      }
    }

    // Validate location (city name)
    if (currentQuestionId === "location" && !isValidCity(userText)) {
      const errMsg =
        language === "ar" ? "يُرجى إدخال اسم مدينتك" :
        language === "en" ? "Please enter your city name" :
        language === "es" ? "Por favor, ingresa el nombre de tu ciudad" :
        language === "pt" ? "Por favor, insira o nome da sua cidade" :
        language === "ru" ? "Пожалуйста, введите название вашего города" :
        "Veuillez entrer le nom de votre ville";
      setLocationError(errMsg);
      const errorMsg: ChatMessage = { role: "marianne", content: errMsg };
      setMessages(prev => [...prev, errorMsg]);
      speakAndListen(errMsg);
      return;
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
          // Trigger signup checkpoint after main_goal (if user not logged in and not already dismissed)
          if (currentQuestionId === CHECKPOINT_AFTER_QUESTION && !user && !checkpointDismissed) {
            setShowSignupCheckpoint(true);
          }
        } else {
          setIsComplete(true);
          markCheckpointComplete();
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

  // Direct choice click — bypasses AI parsing
  const handleChoiceClick = useCallback(async (choiceIds: string[]) => {
    if (isProcessing || isComplete || !currentQuestion?.choices) return;
    const isMulti = currentQuestion.type === "multiChoice";
    const matchedAnswer = isMulti ? choiceIds.join(",") : choiceIds[0];
    const allTags: string[] = [];
    const labels: string[] = [];
    choiceIds.forEach(id => {
      const c = currentQuestion.choices?.find(ch => ch.id === id);
      if (c?.tags) allTags.push(...c.tags);
      if (c) labels.push(getTranslatedText(c.label as any, "text", language));
    });

    const userMsg: ChatMessage = { role: "user", content: labels.join(" · ") };
    setMessages(prev => [...prev, userMsg]);
    setMultiSelected([]);
    setIsProcessing(true);

    try {
      const newAnswers: OnboardingAnswers = {
        ...answers,
        [currentQuestionId]: matchedAnswer,
        tags: allTags.length > 0 ? [...answers.tags, ...allTags] : answers.tags,
      };
      setAnswers(newAnswers);

      const nextQId = getNextQuestion(currentQuestionId, matchedAnswer, newAnswers);
      const nextQ = nextQId ? ONBOARDING_TREE.questions[nextQId] : null;

      let marianneText = "";
      try {
        const response = await callOnboardingChat({
          action: "onboarding_chat",
          phase: "parse",
          question: currentQuestion,
          user_answer: labels.join(", "),
          next_question: nextQ,
          language,
          conversation_summary: buildSummary(),
        });
        marianneText = response.marianne_message;
      } catch {
        marianneText = nextQ ? getTranslatedText(nextQ as any, "text", language) : "Merci !";
      }

      const marianneMsg: ChatMessage = { role: "marianne", content: marianneText };
      setMessages(prev => [...prev, marianneMsg]);
      speakAndListen(marianneText);

      if (nextQId) {
        setQuestionHistory(prev => [...prev, currentQuestionId]);
        setCurrentQuestionId(nextQId);
        if (currentQuestionId === CHECKPOINT_AFTER_QUESTION && !user && !checkpointDismissed) {
          setShowSignupCheckpoint(true);
        }
      } else {
        setIsComplete(true);
        markCheckpointComplete();
        setTimeout(() => onComplete(newAnswers), 1500);
      }
    } catch (err) {
      console.error("Choice click error:", err);
      toast.error("Erreur");
    } finally {
      setIsProcessing(false);
    }
  }, [currentQuestion, currentQuestionId, answers, isProcessing, isComplete, language, buildSummary, speakAndListen, user, checkpointDismissed, markCheckpointComplete, onComplete]);

  const toggleMulti = (id: string) => {
    setMultiSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

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
    if (!value.trim()) return;
    if (!isValidCity(value)) {
      setLocationError(
        language === "ar" ? "يُرجى إدخال اسم مدينتك" :
        language === "en" ? "Please enter your city name" :
        language === "es" ? "Por favor, ingresa el nombre de tu ciudad" :
        language === "pt" ? "Por favor, insira o nome da sua cidade" :
        language === "ru" ? "Пожалуйста, введите название вашего города" :
        "Veuillez entrer le nom de votre ville"
      );
      return;
    }
    setLocationError(null);
    processAnswer(value.trim());
  };

  const agentState = isProcessing ? "thinking" : isSpeaking ? "speaking" : isListening ? "listening" : "idle";



  const questionProgress = questionHistory.length + 1;

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl bg-card border border-border shrink-0">
        <div className="relative shrink-0" style={{ width: 48, height: 48 }}>
          {/* Pulsing ring when speaking */}
          {isSpeaking && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {/* Spinning ring when TTS is loading (processing but not yet speaking) */}
          {isProcessing && !isSpeaking && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/50"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
          <img
            src={marianneAvatar}
            alt="Marianne"
            className={`h-12 w-12 rounded-full object-cover object-top border-2 ${
              isSpeaking ? "border-primary" : "border-primary/30"
            } transition-colors duration-300`}
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
                    <Volume2 className="h-3 w-3" /> {language === "ar" ? "استمعوا" : "Écouter"}
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

        {showSignupCheckpoint && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-1">
            <OnboardingSignupWidget
              language={language}
              onSignupComplete={handleSignupComplete}
              onSkip={handleSkipSignup}
            />
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {!isComplete && !showSignupCheckpoint && (
        <div className="border-t border-border bg-background/80 backdrop-blur-sm pt-3 space-y-3">
          {lastMarianneMessage && (
            <Button
              type="button"
              variant="outline"
              onClick={() => speak(lastMarianneMessage)}
              disabled={isProcessing}
              className="w-full"
            >
              <Volume2 className="h-4 w-4" />
              {language === "ar" ? "إعادة تشغيل ماريان" : language === "en" ? "Replay Marianne" : "Réécouter Marianne"}
            </Button>
          )}

          {(currentQuestionId === "location" || isPostalCode) && (
            <p className="px-1 text-xs text-muted-foreground">
              {language === "ar"
                ? "في خطوة العنوان والرمز البريدي، يبقى الميكروفون متوقفًا أثناء الكتابة."
                : language === "en"
                ? "For address and postal code, the microphone stays off while you type."
                : "Pour l’adresse et le code postal, le micro reste coupé pendant la saisie."}
            </p>
          )}

          {currentQuestionId === "location" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-2 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {language === "ar" ? "📍 أين تقيمون في فرنسا؟" :
                   language === "en" ? "📍 Where do you live in France?" :
                   language === "es" ? "📍 ¿Dónde vives en Francia?" :
                   language === "pt" ? "📍 Onde você mora na França?" :
                   language === "ru" ? "📍 Где вы живёте во Франции?" :
                   "📍 Où habitez-vous en France ?"}
                </p>
              </div>
              <GooglePlacesAutocomplete
                ref={locationInputRef}
                value={inputText}
                onChange={(v) => { setInputText(v); if (locationError) setLocationError(null); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLocationSubmit();
                }}
              />
              {locationError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-destructive font-medium"
                >
                  {locationError}
                </motion.p>
              )}
              <Button
                onClick={handleLocationSubmit}
                disabled={isProcessing || !inputText.trim()}
                className="w-full mt-3"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {language === "ar" ? "تأكيد" :
                 language === "en" ? "Confirm" :
                 language === "es" ? "Confirmar" :
                 "Confirmer"}
              </Button>
            </motion.div>
          )}

          {isPostalCode && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-2 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {language === "ar" ? "📮 الرمز البريدي" :
                   language === "en" ? "📮 Your postal code" :
                   language === "es" ? "📮 Tu código postal" :
                   language === "pt" ? "📮 Seu código postal" :
                   language === "ru" ? "📮 Ваш почтовый индекс" :
                   "📮 Votre code postal"}
                </p>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                value={inputText}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 5);
                  setInputText(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && /^\d{5}$/.test(inputText)) {
                    processAnswer(inputText);
                  }
                }}
                placeholder="75001"
                className="text-center text-lg font-mono tracking-widest"
              />
              {inputText && !/^\d{5}$/.test(inputText) && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs text-destructive font-medium"
                >
                  {language === "ar" ? "يُرجى إدخال 5 أرقام" :
                   language === "en" ? "Please enter 5 digits" :
                   "Veuillez entrer 5 chiffres"}
                </motion.p>
              )}
              <Button
                onClick={() => { if (/^\d{5}$/.test(inputText)) processAnswer(inputText); }}
                disabled={isProcessing || !/^\d{5}$/.test(inputText)}
                className="w-full mt-3"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {language === "ar" ? "تأكيد" :
                 language === "en" ? "Confirm" :
                 language === "es" ? "Confirmar" :
                 "Confirmer"}
              </Button>
            </motion.div>
          )}

          {emailError && (
            <p className="mb-2 text-xs text-destructive px-1">{emailError}</p>
          )}

          {/* Vocal-first: mic button + always-visible text input */}
          {vocalMode && sttSupported && !isEmail && !isPhone && !isPostalCode && currentQuestionId !== "location" && currentQuestionId !== "contact_firstname" && currentQuestionId !== "contact_lastname" && (
            <div className="flex flex-col items-center gap-3">
              {isListening && (
                <p className="text-xs text-muted-foreground animate-pulse">
                  {language === "ar" ? "🎤 أستمع إليكم..." : "🎤 Je vous écoute..."}
                </p>
              )}
              {isSpeaking && !isListening && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {language === "ar" ? "🔊 ماريان تتحدّث..." : "🔊 Marianne parle..."}
                  {wasCached && <span className="text-yellow-500" title="Servi depuis le cache">⚡</span>}
                </p>
              )}
              <div className="flex items-center gap-2 w-full">
                <motion.button
                  onClick={handleMicToggle}
                  disabled={isProcessing || isSpeaking}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all shadow-md ${
                    isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : isSpeaking
                      ? "bg-muted text-muted-foreground cursor-wait"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </motion.button>
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputText.trim()) handleSubmit();
                  }}
                  placeholder={language === "ar" ? "أو اكتبوا إجابتكم هنا..." : language === "en" ? "Or type your answer here..." : "Ou tapez votre réponse ici..."}
                  className="flex-1 text-sm"
                  dir={isRTL ? "rtl" : "ltr"}
                  disabled={isProcessing}
                />
                <Button size="icon" onClick={handleSubmit} disabled={isProcessing || !inputText.trim()} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Fallback text input for email or non-vocal mode */}
          {(!vocalMode || !sttSupported || isEmail || isPhone || isPostalCode || currentQuestionId === "contact_firstname" || currentQuestionId === "contact_lastname") && currentQuestionId !== "location" && (
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

              {currentQuestionId !== "location" && !isPostalCode && (
                <Input
                  type={isEmail ? "email" : isPhone ? "tel" : "text"}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inputText.trim()) handleSubmit();
                  }}
                  placeholder={
                    isEmail ? "email@exemple.com" :
                    isPhone ? "+33 6 12 34 56 78" :
                    currentQuestionId === "contact_firstname" ? (
                      language === "ar" ? "اسمكم الأوّل..." :
                      language === "en" ? "Your first name..." :
                      language === "es" ? "Tu nombre..." :
                      language === "pt" ? "Seu primeiro nome..." :
                      language === "ru" ? "Ваше имя..." :
                      "Votre prénom..."
                    ) :
                    currentQuestionId === "contact_lastname" ? (
                      language === "ar" ? "اسم عائلتكم..." :
                      language === "en" ? "Your last name..." :
                      language === "es" ? "Tu apellido..." :
                      language === "pt" ? "Seu sobrenome..." :
                      language === "ru" ? "Ваша фамилия..." :
                      "Votre nom de famille..."
                    ) :
                    (language === "ar" ? "اكتبوا إجابتكم..." : "Tapez votre réponse...")
                  }
                  className="flex-1"
                  disabled={isProcessing}
                  dir={isRTL && !isEmail ? "rtl" : "ltr"}
                />
              )}

              <Button
                size="icon"
                onClick={
                  currentQuestionId === "location" ? handleLocationSubmit :
                  isPostalCode ? () => { if (/^\d{5}$/.test(inputText)) processAnswer(inputText); } :
                  handleSubmit
                }
                disabled={isProcessing || (!inputText.trim() && currentQuestionId !== "location") || (isPostalCode && !/^\d{5}$/.test(inputText))}
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
              {language === "ar" ? "أوافق على معالجة بياناتي الشخصية وفقًا لسياسة الخصوصية" : "J'accepte le traitement de mes données conformément à la politique de confidentialité"}
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
            {language === "ar" ? "🎉 شكرًا لكم! جارٍ تحليل ملفكم الشخصي..." : "🎉 Merci ! Analyse de votre profil en cours..."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
