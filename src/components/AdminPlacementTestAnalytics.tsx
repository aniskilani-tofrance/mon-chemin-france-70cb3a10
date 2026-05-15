import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, TrendingUp, Clock, Download, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, LineChart, Line, CartesianGrid,
} from "recharts";

interface TestResult {
  id: string;
  candidate_name: string;
  candidate_email: string;
  score: number;
  level: string;
  duration_seconds: number;
  trainer_name: string | null;
  created_at: string;
  answers: any;
}

interface Session {
  id: string;
  status: string;
  test_result_id: string | null;
  created_at: string;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: "#ef4444", A2: "#f59e0b", B1: "#17c3b2", B2: "#32cf8a", C1: "#00504e", C2: "#1e293b",
};

const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function AdminPlacementTestAnalytics() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const [r, s] = await Promise.all([
        supabase.from("test_results").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("placement_test_sessions").select("id,status,test_result_id,created_at").order("created_at", { ascending: false }).limit(1000),
      ]);
      setResults((r.data as TestResult[]) || []);
      setSessions((s.data as Session[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const ms30d = 30 * 24 * 3600 * 1000;
    const last30 = results.filter(r => now - new Date(r.created_at).getTime() <= ms30d);

    // Completion rate (sessions vs results)
    const completed = sessions.filter(s => s.test_result_id || s.status === "completed").length;
    const completionRate = sessions.length > 0 ? Math.round((completed / sessions.length) * 100) : null;

    // Avg duration
    const durations = results.map(r => r.duration_seconds || 0).filter(d => d > 0);
    const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    // Avg / median score
    const scores = results.map(r => Number(r.score || 0));
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Level distribution
    const levelMap: Record<string, number> = {};
    LEVEL_ORDER.forEach(l => { levelMap[l] = 0; });
    results.forEach(r => {
      if (LEVEL_ORDER.includes(r.level)) levelMap[r.level]++;
    });
    const levelData = LEVEL_ORDER.map(l => ({ name: l, value: levelMap[l], fill: LEVEL_COLORS[l] }));

    // Median level (by mode for simplicity)
    const dominantLevel = LEVEL_ORDER.reduce((a, b) => (levelMap[b] > levelMap[a] ? b : a), "A1");

    // 30d line chart
    const dayMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = 0;
    }
    last30.forEach(r => {
      const key = new Date(r.created_at).toISOString().slice(0, 10);
      if (key in dayMap) dayMap[key]++;
    });
    const lineData = Object.entries(dayMap).map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));

    // Top error categories
    const catMap: Record<string, { wrong: number; total: number }> = {};
    results.forEach(r => {
      const answers = Array.isArray(r.answers) ? r.answers : [];
      answers.forEach((a: any) => {
        const cat = a.category || "Autre";
        if (!catMap[cat]) catMap[cat] = { wrong: 0, total: 0 };
        catMap[cat].total++;
        if (!a.isCorrect) catMap[cat].wrong++;
      });
    });
    const errorData = Object.entries(catMap)
      .map(([cat, { wrong, total }]) => ({
        category: cat,
        errorRate: total > 0 ? Math.round((wrong / total) * 100) : 0,
        total,
      }))
      .filter(d => d.total >= 3)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 8);

    return {
      total: results.length,
      last30: last30.length,
      completionRate,
      avgDuration,
      avgScore,
      dominantLevel,
      levelData,
      lineData,
      errorData,
    };
  }, [results, sessions]);

  const exportCSV = () => {
    const headers = ["date", "nom", "email", "niveau", "score", "duree_sec", "formateur"];
    const rows = results.map(r => [
      new Date(r.created_at).toISOString(),
      r.candidate_name,
      r.candidate_email,
      r.level,
      r.score,
      r.duration_seconds,
      r.trainer_name || "",
    ].map(csvEscape).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tests-positionnement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12" role="status" aria-label="Chargement des statistiques">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}min ${sec.toString().padStart(2, "0")}s`;
  };

  return (
    <section aria-labelledby="placement-analytics-title" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-primary" aria-hidden="true" />
          <h2 id="placement-analytics-title" className="text-2xl font-bold text-foreground">
            Tests de positionnement
          </h2>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2" aria-label="Exporter les résultats au format CSV">
          <Download className="h-4 w-4" aria-hidden="true" />
          Exporter CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="h-4 w-4" aria-hidden="true" />
              Total
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              30 jours
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.last30}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Taux complétion</div>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {stats.completionRate === null ? "—" : `${stats.completionRate}%`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm">Niveau dominant</div>
            <p className="mt-1 text-2xl font-bold text-foreground">{stats.dominantLevel}</p>
            <p className="text-xs text-muted-foreground">Score moy. {stats.avgScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Durée moy.
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{fmtDuration(stats.avgDuration)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Level distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition par niveau CECRL</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <p className="text-center text-muted-foreground py-8">Pas encore de données</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.levelData.filter(d => d.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={90}
                    label={(d: any) => `${d.name} (${d.value})`}
                  >
                    {stats.levelData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 30d line chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tests sur 30 jours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={stats.lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top error categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Catégories avec le plus d'erreurs</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.errorData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Pas assez de données</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.errorData} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(v: number) => `${v}% d'erreurs`} />
                <Bar dataKey="errorRate" radius={[0, 6, 6, 0]}>
                  {stats.errorData.map((entry, i) => (
                    <Cell key={i} fill={entry.errorRate >= 60 ? "#ef4444" : entry.errorRate >= 40 ? "#f59e0b" : "#17c3b2"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            Catégories avec au moins 3 réponses analysées.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
