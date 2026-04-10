import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, UserCheck, UserX, RotateCcw, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { subDays } from "date-fns";

type PeriodFilter = "7" | "30" | "90" | "all";

interface Checkpoint {
  id: string;
  user_id: string | null;
  email: string | null;
  language: string;
  current_step: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  reminder_1h_sent: boolean;
  reminder_24h_sent: boolean;
  reminder_72h_sent: boolean;
}

const PIE_COLORS = ["hsl(142,70%,40%)", "hsl(0,70%,50%)", "hsl(45,90%,50%)"];

export function AdminCheckpointAnalytics() {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>("all");

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("onboarding_checkpoints")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    setCheckpoints((data as Checkpoint[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    if (period === "all") return checkpoints;
    const cutoff = subDays(new Date(), Number(period)).toISOString();
    return checkpoints.filter((c) => c.created_at >= cutoff);
  }, [checkpoints, period]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const withAccount = filtered.filter((c) => c.user_id);
    const withoutAccount = filtered.filter((c) => !c.user_id);
    const completed = filtered.filter((c) => c.completed);
    const abandoned = filtered.filter((c) => !c.completed);

    // Resumed = checkpoints where a reminder was sent AND then completed
    const reminded = filtered.filter(
      (c) => c.reminder_1h_sent || c.reminder_24h_sent || c.reminder_72h_sent
    );
    const remindedCompleted = reminded.filter((c) => c.completed);

    // Step distribution for abandoned
    const stepMap: Record<string, number> = {};
    abandoned.forEach((c) => {
      stepMap[c.current_step] = (stepMap[c.current_step] || 0) + 1;
    });
    const abandonedByStep = Object.entries(stepMap)
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count);

    // Language distribution
    const langMap: Record<string, number> = {};
    filtered.forEach((c) => {
      langMap[c.language] = (langMap[c.language] || 0) + 1;
    });

    // Conversion pie data
    const pieData = [
      { name: "Complétés", value: completed.length },
      { name: "Abandonnés", value: abandoned.length },
    ];

    // Account creation pie
    const accountPie = [
      { name: "Avec compte", value: withAccount.length },
      { name: "Sans compte", value: withoutAccount.length },
    ];

    return {
      total,
      completed: completed.length,
      abandoned: abandoned.length,
      completionRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
      withAccount: withAccount.length,
      withoutAccount: withoutAccount.length,
      accountRate: total > 0 ? Math.round((withAccount.length / total) * 100) : 0,
      reminded: reminded.length,
      remindedCompleted: remindedCompleted.length,
      reengagementRate: reminded.length > 0 ? Math.round((remindedCompleted.length / reminded.length) * 100) : 0,
      abandonedByStep,
      pieData,
      accountPie,
      langMap,
    };
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RotateCcw className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Analytics Checkpoints</h2>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(v) => v && setPeriod(v as PeriodFilter)}
            size="sm"
          >
            <ToggleGroupItem value="7">7j</ToggleGroupItem>
            <ToggleGroupItem value="30">30j</ToggleGroupItem>
            <ToggleGroupItem value="90">90j</ToggleGroupItem>
            <ToggleGroupItem value="all">Tout</ToggleGroupItem>
          </ToggleGroup>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" />
              Total parcours
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Complétés
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">{stats.completionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <UserCheck className="h-4 w-4" />
              Avec compte
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.withAccount}</p>
            <p className="text-xs text-muted-foreground">{stats.accountRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <UserX className="h-4 w-4" />
              Sans compte
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.withoutAccount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <RotateCcw className="h-4 w-4" />
              Relancés → complétés
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {stats.remindedCompleted}/{stats.reminded}
            </p>
            <p className="text-xs text-muted-foreground">{stats.reengagementRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Conversion pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Complétion des parcours</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <p className="text-center text-muted-foreground py-8">Pas encore de données</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Abandon by step */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Étape d'abandon</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.abandonedByStep.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun abandon</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.abandonedByStep} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="step" type="category" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Abandons" fill="hsl(0,70%,50%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account creation + languages */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Création de compte</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <p className="text-center text-muted-foreground py-8">Pas encore de données</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.accountPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="hsl(210,70%,50%)" />
                    <Cell fill="hsl(0,0%,70%)" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Langues des parcours</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.langMap).length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune donnée</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.langMap)
                  .sort((a, b) => b[1] - a[1])
                  .map(([lang, count]) => (
                    <div key={lang} className="flex items-center justify-between">
                      <Badge variant="outline" className="uppercase">{lang}</Badge>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
