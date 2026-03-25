import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LANGUAGES, LanguageCode } from "@/lib/translations";
import { useLanguage } from "@/hooks/useLanguage";
import { Mic, MicOff, ArrowRight, Check, Volume2 } from "lucide-react";

type OnboardingStep = "language" | "listening" | "questions" | "complete";

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { language, setLanguage } = useLanguage();
  const [step, setStep] = useState<OnboardingStep>("language");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleLanguageSelect = (lang: LanguageCode) => {
    setLanguage(lang);
    setStep("listening");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate speech recognition
      setTimeout(() => {
        setTranscript("Je m'appelle...");
        setIsRecording(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-24">
      <div className="mx-auto max-w-2xl">
        <AnimatePresence mode="wait">
          {step === "language" && (
            <motion.div
              key="language"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="mb-8">
                <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                  Quelle est votre langue ?
                </h1>
                <p className="text-lg text-muted-foreground">
                  Choisissez la langue dans laquelle vous souhaitez être accompagné(e)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`group flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      language === lang.code
                        ? "border-primary bg-primary/5 shadow-glow"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <span className="text-4xl">{lang.flag}</span>
                    <span className="text-sm font-medium text-foreground">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "listening" && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card variant="elevated" className="mx-auto max-w-lg">
                <CardContent className="p-8">
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <button
                        onClick={toggleRecording}
                        className={`flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 ${
                          isRecording
                            ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30"
                            : "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105"
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="h-10 w-10" />
                        ) : (
                          <Mic className="h-10 w-10" />
                        )}
                      </button>
                      {isRecording && (
                        <>
                          <div className="absolute inset-0 animate-ping rounded-full bg-destructive/30" />
                          <div className="absolute inset-0 animate-pulse rounded-full bg-destructive/20" />
                        </>
                      )}
                    </div>
                  </div>

                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    {isRecording ? "Je vous écoute..." : "Parlez-moi de vous"}
                  </h2>
                  <p className="mb-6 text-muted-foreground">
                    {isRecording
                      ? "Dites votre prénom et d'où vous venez"
                      : "Appuyez sur le microphone et présentez-vous"}
                  </p>

                  {transcript && (
                    <div className="mb-6 rounded-xl bg-secondary p-4 text-left">
                      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Volume2 className="h-4 w-4" />
                        Transcription
                      </div>
                      <p className="text-foreground">{transcript}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("language")}
                    >
                      Retour
                    </Button>
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={() => setStep("questions")}
                    >
                      Continuer
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "questions" && (
            <motion.div
              key="questions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <Card variant="elevated" className="mx-auto max-w-lg">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                      <Volume2 className="h-8 w-8 text-accent" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-foreground">
                      Questionnaire professionnel
                    </h2>
                    <p className="text-muted-foreground">
                      Répondez aux questions suivantes pour personnaliser votre parcours
                    </p>
                  </div>

                  <div className="mb-6 space-y-3 text-left">
                    {[
                      "Quel était votre métier dans votre pays ?",
                      "Quelles sont vos compétences principales ?",
                      "Quel domaine vous intéresse en France ?",
                      "Quel est votre niveau de français estimé ?",
                    ].map((question, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <span className="text-foreground">{question}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("listening")}
                    >
                      Retour
                    </Button>
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={() => setStep("complete")}
                    >
                      Commencer
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card variant="elevated" className="mx-auto max-w-lg">
                <CardContent className="p-8">
                  <div className="mb-6 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-10 w-10 text-success" />
                    </div>
                  </div>

                  <h2 className="mb-2 text-2xl font-bold text-foreground">
                    Profil créé avec succès !
                  </h2>
                  <p className="mb-6 text-muted-foreground">
                    Nous avons préparé un parcours personnalisé pour vous
                  </p>

                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={onComplete}
                  >
                    Découvrir mon parcours
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
