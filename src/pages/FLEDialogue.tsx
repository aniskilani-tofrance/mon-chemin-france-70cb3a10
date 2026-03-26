import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, MicOff, Volume2, Send, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedAgent } from "@/components/VocalOnboarding/AnimatedAgent";
import { callFLEVoiceAI } from "@/lib/fleVoiceAI";
import { useTTS } from "@/hooks/useTTS";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "sonner";

interface ChatMessage {
  role: "marianne" | "user";
  content: string;
  suggestion?: string | null;
}

const SCENARIOS = [
  {
    id: "boulangerie",
    icon: "🥖",
    title: "À la boulangerie",
    description: "Achetez du pain et des viennoiseries",
    prompt: "Tu es un(e) boulanger(ère) sympathique dans une boulangerie de quartier en France. Le client entre dans la boutique. Commence par l'accueillir chaleureusement.",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "medecin",
    icon: "🏥",
    title: "Chez le médecin",
    description: "Prenez rendez-vous et expliquez vos symptômes",
    prompt: "Tu es un(e) secrétaire médical(e) accueillant(e) dans un cabinet médical en France. Le patient arrive pour prendre rendez-vous ou consulter. Accueille-le chaleureusement.",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "transport",
    icon: "🚌",
    title: "Dans les transports",
    description: "Demandez votre chemin et achetez un ticket",
    prompt: "Tu es un(e) agent(e) sympathique au guichet d'une gare ou d'un arrêt de bus en France. Un voyageur s'approche pour demander des informations. Accueille-le.",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "marche",
    icon: "🛒",
    title: "Au marché",
    description: "Achetez des fruits et légumes frais",
    prompt: "Tu es un(e) marchand(e) de fruits et légumes jovial(e) sur un marché en France. Un client s'approche de ton étal. Accueille-le chaleureusement et propose-lui tes produits.",
    color: "from-red-500/20 to-pink-500/20",
  },
  {
    id: "poste",
    icon: "📮",
    title: "À la poste",
    description: "Envoyez un colis ou achetez des timbres",
    prompt: "Tu es un(e) agent(e) postal(e) aimable dans un bureau de poste en France. Un client arrive au guichet. Accueille-le et demande-lui ce dont il a besoin.",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    id: "restaurant",
    icon: "🍽️",
    title: "Au restaurant",
    description: "Commandez un repas et demandez l'addition",
    prompt: "Tu es un(e) serveur(se) sympathique dans un petit restaurant français. Un client vient de s'asseoir à une table. Accueille-le et propose-lui le menu.",
    color: "from-rose-500/20 to-red-500/20",
  },
];

const FLEDialogue = () => {
  const navigate = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isDialogueEnded, setIsDialogueEnded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { speak, isSpeaking, isEnabled: ttsEnabled } = useTTS({
    language: "fr",
  });

  const { isListening, transcript, startListening, stopListening, isSupported: sttSupported } = useSpeechRecognition({
    language: "fr-FR",
    onResult: (text) => {
      setInputText(text);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const agentState = isProcessing ? "thinking" : isSpeaking ? "speaking" : isListening ? "listening" : "idle";

  const startScenario = useCallback(async (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setIsDialogueEnded(false);
    setIsProcessing(true);

    try {
      const response = await callFLEVoiceAI({
        action: "dialogue",
        prompt_text: scenario.prompt,
        user_answer: "[Le client entre dans le lieu]",
        user_level: "A1",
        language: "fr",
      });

      const marianneMsg: ChatMessage = {
        role: "marianne",
        content: response.response || "Bonjour ! Comment puis-je vous aider ?",
        suggestion: response.suggestion,
      };
      setMessages([marianneMsg]);

      if (ttsEnabled && marianneMsg.content) {
        speak(marianneMsg.content);
      }
    } catch (err) {
      toast.error("Erreur de connexion avec Marianne");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [speak, ttsEnabled]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !selectedScenario || isProcessing) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await callFLEVoiceAI({
        action: "dialogue",
        prompt_text: selectedScenario.prompt,
        user_answer: text.trim(),
        user_level: "A1",
        language: "fr",
      });

      const marianneMsg: ChatMessage = {
        role: "marianne",
        content: response.response || "Je n'ai pas bien compris, pouvez-vous répéter ?",
        suggestion: response.suggestion,
      };
      setMessages((prev) => [...prev, marianneMsg]);

      if (response.is_end) {
        setIsDialogueEnded(true);
      }

      if (ttsEnabled && marianneMsg.content) {
        speak(marianneMsg.content);
      }
    } catch (err) {
      toast.error("Erreur lors de la réponse de Marianne");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedScenario, isProcessing, speak, ttsEnabled]);

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) setInputText(transcript);
    } else {
      startListening();
    }
  };

  const resetDialogue = () => {
    setSelectedScenario(null);
    setMessages([]);
    setIsDialogueEnded(false);
    setInputText("");
  };

  // Scenario selection view
  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pb-24 pt-20 sm:pt-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/fle")} className="mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" /> Retour
            </Button>

            <div className="mb-6 flex items-center gap-4">
              <AnimatedAgent state="idle" size="sm" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Dialogues avec Marianne</h1>
                <p className="text-sm text-muted-foreground">
                  Entraînez-vous à parler français dans des situations réelles
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SCENARIOS.map((scenario) => (
                <motion.button
                  key={scenario.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startScenario(scenario)}
                  className="text-left"
                >
                  <Card className="h-full border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${scenario.color}`}>
                        <span className="text-2xl">{scenario.icon}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{scenario.title}</h3>
                      <p className="text-xs text-muted-foreground">{scenario.description}</p>
                    </CardContent>
                  </Card>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Chat view
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-secondary/5">
      <Header />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pt-20 sm:pt-24">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={resetDialogue}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Changer
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{selectedScenario.icon}</span>
            <span className="text-sm font-medium text-foreground">{selectedScenario.title}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => startScenario(selectedScenario)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Marianne avatar + state */}
        <div className="mb-4 flex justify-center">
          <AnimatedAgent state={agentState} size="sm" />
        </div>

        {/* Chat messages */}
        <div className="flex-1 space-y-3 overflow-y-auto pb-4">
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
                  {msg.suggestion && (
                    <button
                      onClick={() => setInputText(msg.suggestion!)}
                      className="mt-2 block w-full rounded-lg bg-secondary/50 px-3 py-1.5 text-left text-xs text-muted-foreground hover:bg-secondary transition-colors"
                    >
                      💡 {msg.suggestion}
                    </button>
                  )}
                  {msg.role === "marianne" && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Volume2 className="h-3 w-3" /> Écouter
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

        {/* Dialogue ended */}
        {isDialogueEnded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-center"
          >
            <p className="text-sm font-medium text-foreground">🎉 Bravo ! Dialogue terminé !</p>
            <div className="mt-3 flex gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={resetDialogue}>
                Autre situation
              </Button>
              <Button size="sm" onClick={() => startScenario(selectedScenario)}>
                Recommencer
              </Button>
            </div>
          </motion.div>
        )}

        {/* Input area */}
        {!isDialogueEnded && (
          <div className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-sm py-3">
            <div className="flex items-center gap-2">
              {sttSupported && (
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
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                placeholder={isListening ? "🎤 Je vous écoute..." : "Tapez votre réponse..."}
                className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                disabled={isProcessing}
              />
              <Button
                size="icon"
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isProcessing}
                className="shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FLEDialogue;
