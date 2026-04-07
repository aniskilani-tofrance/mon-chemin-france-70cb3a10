import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { useFLEUserProgress } from "@/hooks/useFLEProgress";

export function FLESkillsRadar() {
  const { data: progress } = useFLEUserProgress();

  if (!progress) return null;

  const data = [
    { skill: "Oral", value: progress.oral_score || 0 },
    { skill: "Écoute", value: progress.comprehension_score || 0 },
    { skill: "Vocabulaire", value: Math.min(100, (progress.words_learned || 0) * 2) },
    { skill: "Régularité", value: Math.min(100, (progress.streak_days || 0) * 10) },
  ];

  return (
    <Card className="overflow-hidden border-2 border-violet-200/50 dark:border-violet-800/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
            <Brain className="h-4 w-4 text-violet-500" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Compétences</h3>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Radar
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
