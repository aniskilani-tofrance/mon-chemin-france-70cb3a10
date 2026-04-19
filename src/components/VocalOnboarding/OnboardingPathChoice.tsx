import { motion } from "framer-motion";
import { Images, Mic, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageCode } from "@/lib/translations";

type PathTexts = {
  title: string;
  subtitle: string;
  visualTitle: string;
  visualSubtitle: string;
  visualBadge: string;
  vocalTitle: string;
  vocalSubtitle: string;
  vocalBadge: string;
};

const TEXTS: Record<LanguageCode, PathTexts> = {
  fr: {
    title: "Comment souhaites-tu répondre ?",
    subtitle: "Choisis le parcours qui te convient",
    visualTitle: "Questions & images",
    visualSubtitle: "Réponds à des questions simples avec des images",
    visualBadge: "Recommandé",
    vocalTitle: "Conversation vocale",
    vocalSubtitle: "Discute avec Marianne à l'oral",
    vocalBadge: "Bientôt disponible",
  },
  en: {
    title: "How would you like to answer?",
    subtitle: "Pick the path that suits you",
    visualTitle: "Questions & images",
    visualSubtitle: "Answer simple questions with images",
    visualBadge: "Recommended",
    vocalTitle: "Voice conversation",
    vocalSubtitle: "Chat with Marianne by voice",
    vocalBadge: "Coming soon",
  },
  ar: {
    title: "كيف ترغب في الإجابة؟",
    subtitle: "اختر المسار الذي يناسبك",
    visualTitle: "أسئلة وصور",
    visualSubtitle: "أجب على أسئلة بسيطة بالصور",
    visualBadge: "موصى به",
    vocalTitle: "محادثة صوتية",
    vocalSubtitle: "تحدث مع ماريان صوتياً",
    vocalBadge: "قريباً",
  },
  es: {
    title: "¿Cómo quieres responder?",
    subtitle: "Elige el camino que más te convenga",
    visualTitle: "Preguntas e imágenes",
    visualSubtitle: "Responde preguntas sencillas con imágenes",
    visualBadge: "Recomendado",
    vocalTitle: "Conversación por voz",
    vocalSubtitle: "Habla con Marianne por voz",
    vocalBadge: "Próximamente",
  },
  pt: {
    title: "Como você quer responder?",
    subtitle: "Escolha o caminho que mais lhe convém",
    visualTitle: "Perguntas e imagens",
    visualSubtitle: "Responda perguntas simples com imagens",
    visualBadge: "Recomendado",
    vocalTitle: "Conversa por voz",
    vocalSubtitle: "Converse com Marianne por voz",
    vocalBadge: "Em breve",
  },
  ru: {
    title: "Как вы хотите отвечать?",
    subtitle: "Выберите подходящий вам путь",
    visualTitle: "Вопросы и картинки",
    visualSubtitle: "Отвечайте на простые вопросы с картинками",
    visualBadge: "Рекомендуется",
    vocalTitle: "Голосовая беседа",
    vocalSubtitle: "Общайтесь с Марианной голосом",
    vocalBadge: "Скоро",
  },
};

interface OnboardingPathChoiceProps {
  onSelectVisual: () => void;
}

export function OnboardingPathChoice({ onSelectVisual }: OnboardingPathChoiceProps) {
  const { language } = useLanguage();
  const t = TEXTS[language] || TEXTS.fr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <div className="mb-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-2xl font-bold text-foreground sm:text-3xl"
        >
          {t.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-2 text-sm text-muted-foreground sm:text-base"
        >
          {t.subtitle}
        </motion.p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Visual path - active */}
        <motion.button
          type="button"
          onClick={onSelectVisual}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl"
          aria-label={t.visualTitle}
        >
          <Card
            variant="elevated"
            className="h-full border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card transition-all group-hover:border-primary group-hover:shadow-xl"
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Images className="h-7 w-7" />
                </div>
                <Badge className="bg-primary text-primary-foreground gap-1">
                  <Sparkles className="h-3 w-3" />
                  {t.visualBadge}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground sm:text-xl">
                {t.visualTitle}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {t.visualSubtitle}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                <span>→</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </motion.button>

        {/* Vocal path - locked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 0.45 }}
          aria-disabled="true"
        >
          <Card
            variant="elevated"
            className="h-full border-2 border-dashed border-muted bg-muted/30 cursor-not-allowed select-none"
          >
            <CardContent className="p-6 flex flex-col h-full">
              <div className="mb-4 flex items-start justify-between">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Mic className="h-7 w-7" />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80 text-background shadow">
                    <Lock className="h-3 w-3" />
                  </div>
                </div>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {t.vocalBadge}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-muted-foreground sm:text-xl">
                {t.vocalTitle}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground/80">
                {t.vocalSubtitle}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
