import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, BookOpen, TrendingUp, Clock, Download, BarChart3 } from "lucide-react";
import { DemoBanner } from "@/components/DemoBanner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FormateurRow {
  id: string;
  name: string;
  learnerCount: number;
  completedModules: number;
  avgScore: number;
}

interface SectorData {
  sector: string;
  count: number;
}

const SECTOR_COLORS = [
  "hsl(var(--primary))",
  "hsl(210,70%,50%)",
  "hsl(45,90%,50%)",
  "hsl(280,60%,50%)",
  "hsl(142,70%,40%)",
  "hsl(0,70%,50%)",
  "hsl(30,80%,50%)",
];

export default function DirecteurDashboard() {
  const [loading, setLoading] = useState(true);
  const [formateurs, setFormateurs] = useState<FormateurRow[]>([]);
  const [totalLearners, setTotalLearners] = useState(0);
  const [totalModulesCompleted, setTotalModulesCompleted] = useState(0);
  const [avgCompletionRate, setAvgCompletionRate] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [sectorData, setSectorData] = useState<SectorData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    // 1. Get all formateur-learner links
    const { data: links } = await supabase.from("formateur_learners").select("*");
    // 2. Get profiles for formateur names
    const formateurIds = [...new Set((links || []).map((l) => l.formateur_id))];
    const learnerIds = [...new Set((links || []).map((l) => l.learner_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, first_name, last_name")
      .in("user_id", [...formateurIds, ...learnerIds]);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    // 3. Get all module progress
    const { data: progress } = await supabase.from("fle_module_progress").select("*");

    // 4. Get sessions for total hours
    const { data: sessions } = await supabase.from("fle_sessions").select("duration_seconds, user_id");

    // 5. Get modules for sector info
    const { data: modules } = await supabase.from("fle_modules").select("id, sector, category");
    const moduleMap = new Map((modules || []).map((m) => [m.id, m]));

    // Compute KPIs
    setTotalLearners(learnerIds.length);

    const completed = (progress || []).filter((p) => p.completed_at);
    setTotalModulesCompleted(completed.length);

    const totalProg = (progress || []).length;
    setAvgCompletionRate(totalProg > 0 ? Math.round((completed.length / totalProg) * 100) : 0);

    const totalSec = (sessions || []).reduce((s, r) => s + (r.duration_seconds || 0), 0);
    setTotalHours(Math.round(totalSec / 3600));

    // Sector chart
    const sectorMap: Record<string, number> = {};
    completed.forEach((p) => {
      const mod = moduleMap.get(p.module_id);
      const sector = mod?.sector || mod?.category || "Autre";
      sectorMap[sector] = (sectorMap[sector] || 0) + 1;
    });
    setSectorData(
      Object.entries(sectorMap)
        .map(([sector, count]) => ({ sector, count }))
        .sort((a, b) => b.count - a.count)
    );

    // Formateur table
    const rows: FormateurRow[] = formateurIds.map((fId) => {
      const profile = profileMap.get(fId);
      const name = profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || fId.slice(0, 8);
      const myLearners = (links || []).filter((l) => l.formateur_id === fId).map((l) => l.learner_id);
      const learnerProgress = (progress || []).filter((p) => myLearners.includes(p.user_id));
      const completedCount = learnerProgress.filter((p) => p.completed_at).length;
      const scores = learnerProgress.filter((p) => p.score != null).map((p) => p.score!);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      return {
        id: fId,
        name,
        learnerCount: myLearners.length,
        completedModules: completedCount,
        avgScore: avg,
      };
    });
    setFormateurs(rows);
    setLoading(false);
  }

  function exportCSV() {
    const header = "Formateur,Apprenants,Modules complétés,Score moyen";
    const lines = formateurs.map((f) => `"${f.name}",${f.learnerCount},${f.completedModules},${f.avgScore}%`);
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-directeur-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <DemoBanner />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord Directeur</h1>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Users className="h-4 w-4" /> Apprenants
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalLearners}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <BookOpen className="h-4 w-4" /> Modules complétés
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalModulesCompleted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <TrendingUp className="h-4 w-4" /> Taux complétion
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{avgCompletionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Clock className="h-4 w-4" /> Heures totales
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalHours}h</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar chart by sector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Modules complétés par secteur</CardTitle>
        </CardHeader>
        <CardContent>
          {sectorData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Pas encore de données</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sectorData}>
                <XAxis dataKey="sector" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Complétés" radius={[6, 6, 0, 0]}>
                  {sectorData.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Formateur table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suivi par formateur</CardTitle>
        </CardHeader>
        <CardContent>
          {formateurs.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun formateur trouvé</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formateur</TableHead>
                  <TableHead className="text-center">Apprenants</TableHead>
                  <TableHead className="text-center">Modules complétés</TableHead>
                  <TableHead className="text-center">Score moyen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formateurs.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{f.learnerCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{f.completedModules}</TableCell>
                    <TableCell className="text-center">{f.avgScore}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
