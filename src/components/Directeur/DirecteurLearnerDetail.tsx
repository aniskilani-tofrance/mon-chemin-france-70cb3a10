import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2, User, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LearnerDetail {
  learner_id: string;
  full_name: string | null;
  email: string | null;
  french_level_cecrl: string | null;
  city: string | null;
  formateur_name: string;
  modules: ModuleProgress[];
  total_xp: number;
  estimated_level: string | null;
}

interface ModuleProgress {
  module_id: string;
  module_title: string;
  category: string;
  cecrl_level: string;
  score: number | null;
  exercises_done: number;
  exercises_total: number;
  completed_at: string | null;
  started_at: string | null;
}

export function DirecteurLearnerDetail() {
  const [learners, setLearners] = useState<LearnerDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedFormateur, setSelectedFormateur] = useState<string>("all");

  const formateurOptions = useMemo(() => {
    const map = new Map<string, string>();
    learners.forEach((l) => {
      if (!map.has(l.formateur_name)) map.set(l.formateur_name, l.formateur_name);
    });
    return Array.from(map.keys()).sort();
  }, [learners]);

  const filteredLearners = useMemo(() => {
    if (selectedFormateur === "all") return learners;
    return learners.filter((l) => l.formateur_name === selectedFormateur);
  }, [learners, selectedFormateur]);

  useEffect(() => {
    fetchLearners();
  }, []);

  async function fetchLearners() {
    setLoading(true);

    const { data: links } = await supabase.from("formateur_learners").select("*");
    const formateurIds = [...new Set((links || []).map((l) => l.formateur_id))];
    const learnerIds = [...new Set((links || []).map((l) => l.learner_id))];

    if (!learnerIds.length) {
      setLoading(false);
      return;
    }

    const [profilesRes, progressRes, modulesRes, userProgressRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, email, french_level_cecrl, city").in("user_id", [...formateurIds, ...learnerIds]),
      supabase.from("fle_module_progress").select("*").in("user_id", learnerIds),
      supabase.from("fle_modules").select("id, title, category, cecrl_level"),
      supabase.from("fle_user_progress").select("user_id, total_xp, estimated_level").in("user_id", learnerIds),
    ]);

    const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p]));
    const moduleMap = new Map((modulesRes.data || []).map((m) => [m.id, m]));
    const userProgMap = new Map((userProgressRes.data || []).map((p) => [p.user_id, p]));

    const result: LearnerDetail[] = learnerIds.map((lid) => {
      const profile = profileMap.get(lid);
      const link = (links || []).find((l) => l.learner_id === lid);
      const formateurProfile = link ? profileMap.get(link.formateur_id) : null;
      const userProg = userProgMap.get(lid);

      const modules: ModuleProgress[] = (progressRes.data || [])
        .filter((p) => p.user_id === lid)
        .map((p) => {
          const mod = moduleMap.get(p.module_id);
          return {
            module_id: p.module_id,
            module_title: mod?.title || "Module inconnu",
            category: mod?.category || "—",
            cecrl_level: mod?.cecrl_level || "—",
            score: p.score,
            exercises_done: p.exercises_done || 0,
            exercises_total: p.exercises_total || 0,
            completed_at: p.completed_at,
            started_at: p.started_at,
          };
        })
        .sort((a, b) => (a.started_at || "").localeCompare(b.started_at || ""));

      return {
        learner_id: lid,
        full_name: profile?.full_name || null,
        email: profile?.email || null,
        french_level_cecrl: profile?.french_level_cecrl || null,
        city: profile?.city || null,
        formateur_name: formateurProfile?.full_name || "—",
        modules,
        total_xp: userProg?.total_xp || 0,
        estimated_level: userProg?.estimated_level || null,
      };
    });

    setLearners(result);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categoryLabel: Record<string, string> = {
    quotidien: "Vie quotidienne",
    professionnel: "Professionnel",
    certification: "Certification",
    culture: "Culture civique",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Détail des apprenants ({learners.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {learners.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucun apprenant trouvé</p>
        ) : (
          learners.map((l) => {
            const isExpanded = expandedId === l.learner_id;
            const completedCount = l.modules.filter((m) => m.completed_at).length;
            return (
              <div key={l.learner_id} className="border rounded-lg">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-4 h-auto"
                  onClick={() => setExpandedId(isExpanded ? null : l.learner_id)}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{l.full_name || "Sans nom"}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.email} · Formateur : {l.formateur_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{(l.estimated_level || l.french_level_cecrl || "—").toUpperCase()}</Badge>
                    <span className="text-sm text-muted-foreground">{l.total_xp} XP</span>
                    <Badge variant="secondary">{completedCount}/{l.modules.length} modules</Badge>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </Button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {l.city && <span>📍 {l.city}</span>}
                      {l.french_level_cecrl && <span>Niveau profil : {l.french_level_cecrl.toUpperCase()}</span>}
                    </div>

                    {l.modules.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">Aucun module commencé</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Module</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Avancement</TableHead>
                            <TableHead className="text-center">Score</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {l.modules.map((m) => {
                            const pct = m.exercises_total > 0
                              ? Math.round((m.exercises_done / m.exercises_total) * 100)
                              : 0;
                            return (
                              <TableRow key={m.module_id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                    {m.module_title}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {categoryLabel[m.category] || m.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>{m.cecrl_level.toUpperCase()}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 min-w-[120px]">
                                    <Progress value={pct} className="h-2 flex-1" />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                      {m.exercises_done}/{m.exercises_total}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {m.score != null ? `${m.score}%` : "—"}
                                </TableCell>
                                <TableCell>
                                  {m.completed_at ? (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                      Complété
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary">En cours</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
