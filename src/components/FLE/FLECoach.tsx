import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, RefreshCw, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTTS } from "@/hooks/useTTS";
import { Skeleton } from "@/components/ui/skeleton";

interface CoachData {
  greeting: string;
  mission_suggestion: string;
  encouragement: string;
}

interface FLECoachProps {
  userLevel: string;
  streakDays: number;
  totalXp: number;
  modulesCompleted: number;
  oralScore: number;
  comprehensionScore: number;
  lastModuleTitle?: string;
  targetSector?: string | null;
  mainGoal?: string | null;
  firstName?: string | null;
}

export function FLECoach({
  userLevel, streakDays, totalXp, modulesCompleted,
  oralScore, comprehensionScore, lastModuleTitle,
  targetSector, mainGoal, firstName,
}: FLECoachProps) {
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const tts = useTTS({ language: "fr" });

  const fetchCoach = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("fle-voice-ai", {
        body: {
          action: "coach",
          user_level: userLevel,
          streak_days: streakDays,
          total_xp: totalXp,
          modules_completed: modulesCompleted,
          oral_score: oralScore,
          comprehension_score: comprehensionScore,
          last_module_title: lastModuleTitle,
          target_sector: targetSector,
          main_goal: mainGoal,
          first_name: firstName,
        },
      });

      if (fnError) throw fnError;

      if (data?.greeting) {
        setCoachData(data as CoachData);
      } else if (data?.raw) {
        setCoachData({ greeting: data.raw, mission_suggestion: "", encouragement: "" });
      } else {
        throw new Error("No coach data");
      }
    } catch (err) {
      console.error("[FLECoach] Error:", err);
      setError(true);
      setCoachData({
        greeting: firstName ? `Bonjour ${firstName} ! 👋` : "Bonjour ! 👋",
        mission_suggestion: "Faites un exercice de 5 minutes pour progresser aujourd'hui.",
        encouragement: "Chaque petit pas compte. Vous êtes sur la bonne voie ! 💪",
      });
    } finally {
      setLoading(false);
    }
  }, [userLevel, streakDays, totalXp, modulesCompleted, oralScore, comprehensionScore, lastModuleTitle, targetSector, mainGoal, firstName]);

  useEffect(() => {
    fetchCoach();
  }, [fetchCoach]);

  useEffect(() => {
    if (coachData && tts.isEnabled && !loading) {
      const fullText = [coachData.greeting, coachData.mission_suggestion, coachData.encouragement]
        .filter(Boolean)
        .join(". ");
      tts.speak(fullText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachData, loading]);

  const handleReplay = () => {
    if (!coachData) return;
    const fullText = [coachData.greeting, coachData.mission_suggestion, coachData.encouragement]
      .filter(Boolean)
      .join(". ");
    tts.speak(fullText);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 p-5">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!coachData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 p-5"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-accent/20 blur-2xl" />

      <div className="relative flex items-start gap-4">
        {/* Avatar Marianne */}
        <motion.div
          animate={tts.isSpeaking
            ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0 0px rgba(var(--primary), 0.2)", "0 0 0 8px rgba(var(--primary), 0)", "0 0 0 0px rgba(var(--primary), 0.2)"] }
            : {}
          }
          transition={tts.isSpeaking ? { repeat: Infinity, duration: 1.5 } : {}}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 text-xl shadow-lg border-2 border-primary/20"
        >
          🇫🇷
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Speech bubble */}
          <div className="relative rounded-2xl rounded-tl-sm bg-card/80 backdrop-blur-sm border border-border/50 p-3 shadow-sm">
            <p className="text-sm font-bold text-foreground leading-relaxed">
              {coachData.greeting}
            </p>

            {coachData.mission_suggestion && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                <Sparkles className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
                {coachData.mission_suggestion}
              </p>
            )}

            {coachData.encouragement && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-xs font-bold text-primary bg-primary/5 rounded-lg px-2.5 py-1.5 inline-block"
              >
                💪 {coachData.encouragement}
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative mt-3 flex items-center gap-2 pl-16">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-full border-primary/30 bg-primary/5 hover:bg-primary/10"
            onClick={handleReplay}
            disabled={tts.isSpeaking}
          >
            <Volume2 className="h-3.5 w-3.5" />
            {tts.isSpeaking ? "🔊 Écoute..." : "🔊 Écouter"}
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs rounded-full"
          onClick={tts.toggle}
        >
          {tts.isEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        </Button>

        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4 }} className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0"
            onClick={fetchCoach}
            disabled={loading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
