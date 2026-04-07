import { Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFLESessionStats } from "@/hooks/useFLESession";
import { motion } from "framer-motion";

export function FLETimeTracker() {
  const { data: stats, isLoading } = useFLESessionStats();

  if (isLoading || !stats) return null;

  const maxMinutes = Math.max(...stats.chartData.map((d) => d.minutes), 1);

  return (
    <Card className="overflow-hidden border-2 border-sky-200/50 dark:border-sky-800/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10">
            <Clock className="h-4.5 w-4.5 text-sky-500" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Temps d'apprentissage</h3>
          </div>
        </div>

        {/* Today + Week stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-gradient-to-br from-sky-400/10 to-blue-400/5 p-3 text-center">
            <p className="text-2xl font-extrabold text-foreground">{stats.todayMinutes}<span className="text-sm font-medium text-muted-foreground"> min</span></p>
            <p className="text-xs text-muted-foreground font-medium">Aujourd'hui</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-violet-400/10 to-purple-400/5 p-3 text-center">
            <p className="text-2xl font-extrabold text-foreground">{stats.weekMinutes}<span className="text-sm font-medium text-muted-foreground"> min</span></p>
            <p className="text-xs text-muted-foreground font-medium">Cette semaine</p>
          </div>
        </div>

        {/* Weekly bar chart */}
        <div className="flex items-end gap-1.5 h-16">
          {stats.chartData.map((d, i) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 4)}%` }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={`w-full rounded-t-md ${d.minutes > 0 ? "bg-sky-400" : "bg-muted/30"}`}
                style={{ minHeight: 2 }}
              />
              <span className="text-[10px] text-muted-foreground font-medium">{d.day.slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
