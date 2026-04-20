import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useTTS } from "@/hooks/useTTS";
import { AnimatedAgent } from "./AnimatedAgent";
import { playPreSpeech } from "@/lib/sounds";

const MARIANNE_INTRO: Record<string, string> = {
  fr: "Bonjour ! Je suis Marianne, votre conseillère. Je suis là pour vous aider à trouver la formation idéale. Répondez à quelques questions et je vous proposerai des solutions adaptées à votre profil.",
  en: "Hello! I'm Marianne, your advisor. I'm here to help you find the ideal training. Answer a few questions and I'll suggest solutions tailored to your profile.",
  ar: "مرحباً! أنا ماريان، مستشارتك. أنا هنا لمساعدتك في العثور على التدريب المثالي. أجب على بعض الأسئلة وسأقترح عليك حلولاً تناسب ملفك الشخصي.",
  es: "¡Hola! Soy Marianne, tu asesora. Estoy aquí para ayudarte a encontrar la formation ideal. Responde algunas preguntas y te sugeriré soluciones adaptadas a tu perfil.",
  pt: "Olá! Sou Marianne, sua conselheira. Estou aqui para ajudá-lo a encontrar a formação ideal. Responda algumas perguntas e sugerirei soluções adaptadas ao seu perfil.",
  ru: "Здравствуйте! Я Марианна, ваш консультант. Я здесь, чтобы помочь вам найти идеальное обучение. Ответьте на несколько вопросов, и я предложу решения, подходящие для вашего профиля.",
};

const CONTINUE_TEXT: Record<string, string> = {
  fr: "Commencer",
  en: "Let's start",
  ar: "لنبدأ",
  es: "Empezar",
  pt: "Começar",
  ru: "Начнём",
};

const SUBTITLE_TEXT: Record<string, string> = {
  fr: "Votre conseillère",
  en: "Your advisor",
  ar: "مستشارتك",
  es: "Tu asesora",
  pt: "Sua conselheira",
  ru: "Ваш консультант",
};

interface MarianneIntroStepProps {
  onContinue: () => void;
}

export function MarianneIntroStep({ onContinue }: MarianneIntroStepProps) {
  const { language } = useLanguage();
  const tts = useTTS({ language });

  const introText = MARIANNE_INTRO[language] || MARIANNE_INTRO.fr;
  const continueText = CONTINUE_TEXT[language] || CONTINUE_TEXT.fr;
  const subtitleText = SUBTITLE_TEXT[language] || SUBTITLE_TEXT.fr;

  useEffect(() => {
    if (!tts.isSupported || !tts.isEnabled || !introText) return;

    // Petit "ding-ding" subtil avant que Marianne ne commence à parler
    playPreSpeech();
    const timer = window.setTimeout(() => {
      tts.speak(introText);
    }, 480);

    return () => {
      window.clearTimeout(timer);
      tts.stop();
    };
  }, [introText, tts.isSupported, tts.isEnabled, tts.speak, tts.stop]);

  const handleContinue = () => {
    tts.stop();
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center"
    >
      <Card variant="elevated" className="mx-auto max-w-lg">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6 flex justify-center">
            <AnimatedAgent state="idle" size="lg" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Marianne
            </h2>
            <p className="text-sm text-muted-foreground">
              {subtitleText}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 rounded-2xl bg-secondary/50 p-4 text-left"
          >
            <p className="text-sm leading-relaxed text-foreground sm:text-base">
              {introText}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleContinue}
            >
              {continueText}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}