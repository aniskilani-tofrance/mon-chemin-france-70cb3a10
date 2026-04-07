import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const LEVEL_VALUES: Record<string, number> = {
  alpha: 0, post_alpha: 1, a1: 2, a2: 3, b1: 4,
};
const LEVEL_LABELS: Record<string, string> = {
  alpha: "Alpha", post_alpha: "Post-α", a1: "A1", a2: "A2", b1: "B1",
};

export function FLEProgressChart() {
  const { user } = useAuth();

  const { data: history } = useQuery({
    queryKey: ["fle-level-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("fle_level_history")
        .select("level, changed_at")
        .eq("user_id", user.id)
        .order("changed_at", { ascending: true });
      if (error) throw error;
      return (data || []) as { level: string; changed_at: string }[];
    },
    enabled: !!user,
  });

  if (!history || history.length === 0) return null;

  const chartData = history.map((h) => ({
    date: format(new Date(h.changed_at), "dd MMM", { locale: fr }),
    level: LEVEL_VALUES[h.level] ?? 2,
    label: LEVEL_LABELS[h.level] || h.level.toUpperCase(),
  }));

  return (
    <Card className="overflow-hidden border-2 border-emerald-200/50 dark:border-emerald-800/50">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Progression CECRL</h3>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="levelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(v) => Object.entries(LEVEL_VALUES).find(([, val]) => val === v)?.[0]?.toUpperCase() || ""}
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg bg-card border px-3 py-1.5 text-xs shadow-lg">
                      <p className="font-bold">{payload[0].payload.label}</p>
                      <p className="text-muted-foreground">{payload[0].payload.date}</p>
                    </div>
                  );
                }}
              />
              <Area type="stepAfter" dataKey="level" stroke="hsl(var(--primary))" fill="url(#levelGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
