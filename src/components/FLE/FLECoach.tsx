import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, RefreshCw, Sparkles } from "lucide-react";
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

  // Auto-play TTS when coach data is loaded
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
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!coachData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4"
    >
      <div className="flex items-start gap-3">
        {/* Avatar Marianne */}
        <motion.div
          animate={tts.isSpeaking ? { scale: [1, 1.08, 1] } : {}}
          transition={tts.isSpeaking ? { repeat: Infinity, duration: 1.2 } : {}}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg"
        >
          🇫🇷
        </motion.div>

        <div className="flex-1 min-w-0">
          {/* Greeting */}
          <p className="text-sm font-semibold text-foreground leading-snug">
            {coachData.greeting}
          </p>

          {/* Mission suggestion */}
          {coachData.mission_suggestion && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-snug">
              <Sparkles className="inline h-3.5 w-3.5 mr-1 text-amber-500" />
              {coachData.mission_suggestion}
            </p>
          )}

          {/* Encouragement */}
          {coachData.encouragement && (
            <p className="mt-1.5 text-xs text-primary font-medium">
              {coachData.encouragement}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs rounded-full"
          onClick={handleReplay}
          disabled={tts.isSpeaking}
        >
          <Volume2 className="h-3.5 w-3.5" />
          {tts.isSpeaking ? "Écoute..." : "Écouter"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs rounded-full"
          onClick={tts.toggle}
        >
          {tts.isEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {tts.isEnabled ? "Son activé" : "Son coupé"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs rounded-full ml-auto"
          onClick={fetchCoach}
          disabled={loading}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
