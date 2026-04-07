import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { useFLEUserProgress, useFLEModuleProgress, useFLEModules, useUserProfile } from "@/hooks/useFLEProgress";
import { useFLESessionStats } from "@/hooks/useFLESession";
import { toast } from "sonner";

export function FLEExportPDF() {
  const { data: progress } = useFLEUserProgress();
  const { data: moduleProgress } = useFLEModuleProgress();
  const { data: modules } = useFLEModules();
  const { data: profile } = useUserProfile();
  const { data: sessionStats } = useFLESessionStats();
  const [generating, setGenerating] = useState(false);

  const handleExport = async () => {
    if (!progress) return;
    setGenerating(true);

    try {
      const completedModules = (moduleProgress || [])
        .filter(mp => mp.completed_at)
        .map(mp => {
          const mod = modules?.find(m => m.id === mp.module_id);
          return { title: mod?.title || "Module", score: mp.score, icon: mod?.icon || "📖" };
        });

      const content = [
        "═══════════════════════════════════",
        "    BILAN DE PROGRESSION FLE",
        "         ToFrance",
        "═══════════════════════════════════",
        "",
        `Apprenant : ${profile?.first_name || "Apprenant"}`,
        `Date : ${new Date().toLocaleDateString("fr-FR")}`,
        `Niveau estimé : ${(progress.estimated_level || "a1").toUpperCase()}`,
        "",
        "── Statistiques générales ──",
        `XP total : ${progress.total_xp}`,
        `Mots appris : ${progress.words_learned}`,
        `Score oral : ${progress.oral_score}%`,
        `Score compréhension : ${progress.comprehension_score}%`,
        `Série de jours : ${progress.streak_days}`,
        `Temps total : ${progress.total_time_minutes} minutes`,
        "",
        sessionStats ? `Temps cette semaine : ${sessionStats.weekMinutes} min` : "",
        "",
        "── Modules complétés ──",
        ...completedModules.map(m => `  ${m.icon} ${m.title} — Score : ${m.score}%`),
        completedModules.length === 0 ? "  Aucun module complété pour le moment" : "",
        "",
        "── Objectifs ──",
        `Objectif quotidien : ${progress.daily_goal_minutes} minutes`,
        `Objectif XP hebdo : ${progress.weekly_xp_target} XP`,
        "",
        "═══════════════════════════════════",
        "Généré par ToFrance — mon-chemin-france.lovable.app",
      ].filter(Boolean).join("\n");

      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bilan-fle-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Bilan exporté !");
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={generating || !progress}
      className="gap-2 rounded-full font-bold border-2"
    >
      {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      Exporter mon bilan
    </Button>
  );
}
