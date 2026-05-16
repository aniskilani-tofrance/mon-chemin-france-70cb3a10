import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, UserCog, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormateurRow {
  id: string;
  name: string;
  email: string | null;
  learnerCount: number;
  completedModules: number;
  avgScore: number;
}

export function DirecteurFormateursOverview() {
  const [rows, setRows] = useState<FormateurRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: links } = await supabase.from("formateur_learners").select("*");
    const formateurIds = [...new Set((links || []).map((l) => l.formateur_id))];
    const learnerIds = [...new Set((links || []).map((l) => l.learner_id))];

    const [profilesRes, progressRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, full_name, email, first_name, last_name")
        .in("user_id", [...formateurIds, ...learnerIds]),
      supabase.from("fle_module_progress").select("user_id, completed_at, score"),
    ]);

    const profileMap = new Map(
      (profilesRes.data || []).map((p) => [p.user_id, p]),
    );
    const progress = progressRes.data || [];

    const computed: FormateurRow[] = formateurIds.map((fId) => {
      const profile = profileMap.get(fId);
      const name =
        profile?.full_name ||
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
        `Formateur ${fId.slice(0, 6)}`;
      const myLearners = (links || [])
        .filter((l) => l.formateur_id === fId)
        .map((l) => l.learner_id);
      const learnerProgress = progress.filter((p) =>
        myLearners.includes(p.user_id),
      );
      const completedCount = learnerProgress.filter((p) => p.completed_at).length;
      const scores = learnerProgress
        .filter((p) => p.score != null)
        .map((p) => p.score!);
      const avg =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;
      return {
        id: fId,
        name,
        email: profile?.email ?? null,
        learnerCount: myLearners.length,
        completedModules: completedCount,
        avgScore: avg,
      };
    });

    computed.sort((a, b) => b.completedModules - a.completedModules);
    setRows(computed);
    setLoading(false);
  }

  function exportCSV() {
    const header = "Formateur,Email,Apprenants,Modules complétés,Score moyen";
    const lines = rows.map(
      (f) =>
        `"${f.name}","${f.email || ""}",${f.learnerCount},${f.completedModules},${f.avgScore}%`,
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formateurs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Suivi par formateur ({filtered.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rechercher…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[220px] h-9"
            />
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aucun formateur trouvé
          </p>
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
              {filtered.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <div className="font-medium">{f.name}</div>
                    {f.email && (
                      <div className="text-xs text-muted-foreground">{f.email}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{f.learnerCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {f.completedModules}
                  </TableCell>
                  <TableCell className="text-center">{f.avgScore}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
